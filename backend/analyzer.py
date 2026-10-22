import os
import re
import time
import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional

from langchain_core.documents import Document
from langchain_core.prompts import ChatPromptTemplate
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_chroma import Chroma

from backend.config import (
    DB_DIR,
    COLLECTION_NAME,
    EMBEDDING_MODEL,
    LLM_MODEL,
    LLM_TEMPERATURE,
    OPENAI_API_KEY,
)
from backend.models import (
    MentalHealthStructuredOutput,
    SourceDocument,
    PostAnalysisResponse,
    SamplePost,
    CategoryDefinition,
    KnowledgeBaseInfo,
)

# --------------------------------------------------
# Knowledge Base Reference Document
# --------------------------------------------------
KNOWLEDGE_BASE = """
Mental Health Analysis of Social Media Posts: Research Methodology & Linguistic Framework

Purpose:
Analyze language in social media posts to identify possible signs of emotional distress
and explicitly mentioned contributing factors. This system is designed solely for
computational linguistics and academic research; it does NOT diagnose individuals.

Category 1: Emotional Distress
Expressions of sadness, hopelessness, anxiety, severe stress, worthlessness, despair,
loneliness, panic, or persistent numbness. These linguistic cues alone do not prove a clinical diagnosis.

Category 2: Jobs/Career
Workplace pressure, toxic work environments, abusive management, unemployment, job insecurity,
excessive overtime, burnout, academic failure, and career difficulties when the post connects them with distress.

Category 3: Relationship
Conflict with partners, divorce, breakups, domestic betrayal, rejection, romantic grief, or
severe difficulties with family members and close friends explicitly described in the text.

Category 4: Bias/Abuse
Bullying, cyberbullying, physical harassment, racial or gender discrimination, online threats,
domestic violence, hate speech, and exploitation supported by specific references in the text.

Category 5: Medication
Posts explicitly discussing psychiatric or medical prescriptions, antidepressant side effects,
dosage changes, withdrawal symptoms, or healthcare treatment concerns. Never infer medication without direct textual evidence.

Category 6: Alienation
Expressions of profound social disconnection, chronic exclusion, feeling invisible, having no one to turn to,
or feeling utterly detached from community and society.

Category 7: No Reason
Used when the post indicates emotional distress but no distinct contributing trigger is stated,
OR when the post is entirely neutral/positive and lacks distress indicators. Never speculate or fabricate a cause.

Evidence Extraction Protocol:
Relevant phrases must be extracted verbatim from the original post text. Explanations must strictly distinguish
between explicit statements made by the author and possible interpretive hypotheses.

Ethical & Clinical Limitations:
Social media text cannot establish a clinical psychiatric diagnosis or reliably determine the actual etiology of someone's distress.
"""

SAMPLE_POSTS: List[SamplePost] = [
    SamplePost(
        id="sample-1",
        category="Jobs/Career",
        title="Workplace Overwork & Burnout",
        post="I have been working 75 hours a week at my tech job. My manager keeps threatening to fire me in front of the whole team if I don't meet unreachable deadlines. I can barely sleep or eat anymore, I feel completely broken down.",
        description="Explicit mentions of high workload, manager threats, and severe physical/emotional exhaustion."
    ),
    SamplePost(
        id="sample-2",
        category="Relationship",
        title="Painful Separation & Grief",
        post="My partner of 7 years walked out on me yesterday without warning. The silence in this empty apartment is suffocating and I can't stop crying. I feel like my entire world has crumbled to dust.",
        description="Direct discussion of a sudden romantic breakup leading to acute emotional grief and despair."
    ),
    SamplePost(
        id="sample-3",
        category="Bias/Abuse",
        title="Severe Online Bullying & Harassment",
        post="People at my school made an anonymous group chat specifically to mock my appearance and send me death threats every day. I dread waking up in the morning and feel totally unsafe everywhere I go.",
        description="Clear documentation of targeted cyberbullying, harassment, threats, and resulting terror."
    ),
    SamplePost(
        id="sample-4",
        category="Medication",
        title="Antidepressant Side Effects",
        post="My doctor doubled my dosage of SSRIs last Tuesday, and since then I've had relentless tremors, brain zaps, and terrifying nausea. I feel worse than before I started treatment.",
        description="Specific references to prescription psychiatric medication, dosage escalation, and adverse side effects."
    ),
    SamplePost(
        id="sample-5",
        category="Alienation",
        title="Social Disconnection & Isolation",
        post="I sit in crowded rooms and feel like a ghost that no one can see or hear. I haven't had a real conversation with another human being in months. The detachment from everyone around me is terrifying.",
        description="Profound expressions of emotional isolation, perceived invisibility, and societal disconnection."
    ),
    SamplePost(
        id="sample-6",
        category="No Reason",
        title="Unspecified Heavy Distress",
        post="I woke up today with this overwhelming, heavy pit in my chest. Nothing particularly bad happened, but everything feels gray and pointless today.",
        description="Clear signs of emotional low/distress without any specific external factor identified."
    ),
    SamplePost(
        id="sample-7",
        category="Neutral",
        title="Positive Daily Routine",
        post="Just completed a 5k morning run by the lake and brewed fresh pour-over coffee. Looking forward to coding the new React frontend today!",
        description="Control sample showing positive, healthy, non-distressed language."
    )
]

CATEGORIES: List[CategoryDefinition] = [
    CategoryDefinition(
        name="Jobs/Career",
        description="Distress arising from professional life, workload, employment, or academic strain.",
        criteria="Must explicitly connect workplace pressure, manager friction, unemployment, or academic deadlines to distress.",
        examples=[
            "Working 80hr weeks and facing layoffs.",
            "My boss screams at me and I can't take the stress anymore."
        ]
    ),
    CategoryDefinition(
        name="Relationship",
        description="Distress tied to romantic partners, marriage, family members, or close friendships.",
        criteria="Requires direct mention of breakups, divorce, betrayal, domestic estrangement, or acute conflict.",
        examples=[
            "My fiancé called off the wedding and I feel completely empty.",
            "My parents disowned me after an argument."
        ]
    ),
    CategoryDefinition(
        name="Bias/Abuse",
        description="Distress linked to harassment, discrimination, bullying, violence, or exploitation.",
        criteria="Must present evidence of interpersonal cruelty, cyberbullying, hate speech, threats, or abusive dynamics.",
        examples=[
            "Being targeted daily with cruel insults and anonymous threats.",
            "Experiencing discrimination at work that makes me feel unsafe."
        ]
    ),
    CategoryDefinition(
        name="Medication",
        description="Distress concerning pharmaceuticals, psychiatric medications, or treatment side effects.",
        criteria="Only applied when the author explicitly mentions medications, dosage modifications, or adverse medical reactions.",
        examples=[
            "Experiencing unbearable brain zaps and insomnia after tapering my antidepressants.",
            "The side effects of my new prescription make me feel detached."
        ]
    ),
    CategoryDefinition(
        name="Alienation",
        description="Distress stemming from profound social detachment, loneliness, or chronic exclusion.",
        criteria="Evidenced by expressions of feeling invisible, isolated from human connection, or fundamentally abandoned by society.",
        examples=[
            "Living like a ghost among people who don't notice I exist.",
            "Haven't had anyone to talk to in months and the loneliness hurts."
        ]
    ),
    CategoryDefinition(
        name="No Reason",
        description="Distress with no identifiable external trigger, or neutral/positive posts.",
        criteria="Applied when distress exists but no cause is cited, or when no distress is detected at all. No speculation permitted.",
        examples=[
            "Feeling utterly hopeless today for no particular reason.",
            "Enjoying a sunny afternoon with friends (No distress)."
        ]
    )
]


class MentalHealthRAGAnalyzer:
    """Production-grade singleton engine for Mental Health RAG & NLP Analysis."""

    def __init__(self):
        self._vector_store: Optional[Chroma] = None
        self._retriever = None
        self._llm = None
        self._structured_llm = None
        self._embedding_model = None

    def initialize(self):
        """Initialize Chroma, Embedding model, and Chat model."""
        if not OPENAI_API_KEY:
            raise ValueError(
                "OPENAI_API_KEY is not configured. Please set it in your .env file."
            )

        os.environ["OPENAI_API_KEY"] = OPENAI_API_KEY

        # Initialize Embedding model
        self._embedding_model = OpenAIEmbeddings(model=EMBEDDING_MODEL)

        # Initialize or load Chroma
        self._vector_store = self._load_or_create_vector_store()
        self._retriever = self._vector_store.as_retriever(
            search_type="similarity",
            search_kwargs={"k": 3}
        )

        # Initialize LLM models
        self._llm = ChatOpenAI(
            model=LLM_MODEL,
            temperature=LLM_TEMPERATURE
        )
        self._structured_llm = self._llm.with_structured_output(
            MentalHealthStructuredOutput
        )

    def _load_or_create_vector_store(self) -> Chroma:
        """Create or load the persistent Chroma vector store."""
        os.makedirs(DB_DIR, exist_ok=True)

        try:
            vector_store = Chroma(
                collection_name=COLLECTION_NAME,
                embedding_function=self._embedding_model,
                persist_directory=DB_DIR
            )
            # Verify count
            count = vector_store._collection.count()
            if count > 0:
                return vector_store
        except Exception:
            pass

        # Split and index KNOWLEDGE_BASE
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=50
        )
        document = Document(
            page_content=KNOWLEDGE_BASE.strip(),
            metadata={"source": "mental_health_research_framework"}
        )
        chunks = splitter.split_documents([document])

        vector_store = Chroma.from_documents(
            documents=chunks,
            embedding=self._embedding_model,
            collection_name=COLLECTION_NAME,
            persist_directory=DB_DIR
        )
        return vector_store

    def is_ready(self) -> bool:
        return (
            self._vector_store is not None
            and self._structured_llm is not None
            and bool(OPENAI_API_KEY)
        )

    def get_kb_info(self) -> KnowledgeBaseInfo:
        """Retrieve Knowledge Base diagnostic metadata."""
        count = 0
        if self._vector_store is not None:
            try:
                count = self._vector_store._collection.count()
            except Exception:
                count = 0

        return KnowledgeBaseInfo(
            collection_name=COLLECTION_NAME,
            chunk_count=count,
            db_directory=DB_DIR,
            embedding_model=EMBEDDING_MODEL,
            llm_model=LLM_MODEL,
            ready=self.is_ready()
        )

    def analyze_post(self, post_text: str) -> PostAnalysisResponse:
        """Execute RAG retrieval and structured inference on a social media post."""
        if not self.is_ready():
            self.initialize()

        cleaned_post = post_text.strip()
        if not cleaned_post:
            raise ValueError("Input post text cannot be empty.")

        start_time = time.perf_counter()

        # 1. Retrieve RAG context documents
        retrieved_docs = self._retriever.invoke(cleaned_post)
        sources: List[SourceDocument] = [
            SourceDocument(
                source=doc.metadata.get("source", "mental_health_knowledge_base"),
                page=doc.metadata.get("page"),
                excerpt=doc.page_content[:350].strip()
            )
            for doc in retrieved_docs
        ]

        context_string = "\n\n".join(
            f"SOURCE: {doc.metadata.get('source', 'Reference')}\nCONTENT: {doc.page_content}"
            for doc in retrieved_docs
        )

        prompt_text = f"""
You are an expert NLP researcher analyzing social media language for signs of emotional distress and contributing factors.

INSTRUCTIONS:
1. Ground your knowledge in the RETRIEVED CONTEXT below.
2. Use the SOCIAL MEDIA POST as the primary empirical evidence.
3. Classify the post into EXACTLY ONE contributing factor:
   - Jobs/Career
   - Relationship
   - Bias/Abuse
   - Medication
   - Alienation
   - No Reason
4. Decide if the language indicates emotional distress (mental_health_related: true/false).
   - If positive, neutral, or non-distressed, set mental_health_related=false and contributing_factor="No Reason".
5. Extract verbatim quotes from the post into relevant_phrases.
6. Provide a concise explanation distinguishing explicit text evidence from interpretation.
7. Emphasize research limitations (social media text cannot be used for clinical diagnosis).
8. Never speculate or diagnose the author.

RETRIEVED CONTEXT:
{context_string}

SOCIAL MEDIA POST:
{cleaned_post}
"""

        # 2. Invoke structured LLM with fallback
        structured_result: MentalHealthStructuredOutput
        try:
            structured_result = self._structured_llm.invoke(prompt_text)
        except Exception:
            # Fallback to standard text invocation + regex parser
            fallback_prompt = ChatPromptTemplate.from_template(
                """
                You analyze language in social media posts for emotional distress.
                Context: {context}
                Post: {question}

                Return your answer in this exact format:
                Mental-health-related: Yes/No
                Predicted contributing factor: [Jobs/Career, Relationship, Bias/Abuse, Medication, Alienation, No Reason]
                Relevant phrases: [comma separated verbatim phrases]
                Explanation: [concise explanation]
                Limitations: [what cannot be concluded]
                """
            )
            chain = fallback_prompt | self._llm
            response_msg = chain.invoke({"context": context_string, "question": cleaned_post})
            raw_content = response_msg.content if hasattr(response_msg, "content") else str(response_msg)
            structured_result = self._parse_text_fallback(raw_content, cleaned_post)

        execution_time_ms = round((time.perf_counter() - start_time) * 1000, 2)

        # Synthesize raw formatted text for display/export
        raw_text = (
            f"Mental-health-related: {'Yes' if structured_result.mental_health_related else 'No'}\n"
            f"Predicted contributing factor: {structured_result.contributing_factor}\n"
            f"Distress Level: {structured_result.distress_level}\n"
            f"Confidence: {round(structured_result.confidence_score * 100, 1)}%\n"
            f"Relevant phrases: {', '.join(structured_result.relevant_phrases) if structured_result.relevant_phrases else 'None'}\n"
            f"Explanation: {structured_result.explanation}\n"
            f"Limitations: {structured_result.limitations}"
        )

        return PostAnalysisResponse(
            id=str(uuid.uuid4()),
            post=cleaned_post,
            timestamp=datetime.now(timezone.utc).isoformat(),
            execution_time_ms=execution_time_ms,
            mental_health_related=structured_result.mental_health_related,
            contributing_factor=structured_result.contributing_factor,
            confidence_score=structured_result.confidence_score,
            distress_level=structured_result.distress_level,
            relevant_phrases=structured_result.relevant_phrases,
            explanation=structured_result.explanation,
            limitations=structured_result.limitations,
            suggested_support_keywords=structured_result.suggested_support_keywords or [
                "Mental Wellbeing",
                "Emotional Health",
                "Linguistic Analysis"
            ],
            raw_analysis_text=raw_text,
            sources=sources
        )

    def _parse_text_fallback(self, text: str, post: str) -> MentalHealthStructuredOutput:
        """Resilient fallback parser for free-text model outputs."""
        is_related = bool(re.search(r"Mental-health-related:\s*Yes", text, re.IGNORECASE))

        factor = "No Reason"
        factor_match = re.search(
            r"Predicted contributing factor:\s*([A-Za-z/ ]+)", text, re.IGNORECASE
        )
        if factor_match:
            cand = factor_match.group(1).strip()
            valid_factors = [
                "Jobs/Career", "Relationship", "Bias/Abuse", "Medication", "Alienation", "No Reason"
            ]
            for vf in valid_factors:
                if vf.lower() in cand.lower():
                    factor = vf
                    break

        phrases: List[str] = []
        phrases_match = re.search(r"Relevant phrases:\s*(.+)", text, re.IGNORECASE)
        if phrases_match:
            raw_phrases = phrases_match.group(1).split(",")
            phrases = [p.strip().strip('"').strip("'") for p in raw_phrases if p.strip()]

        explanation_match = re.search(
            r"Explanation:\s*(.+?)(?=Limitations:|$)", text, re.IGNORECASE | re.DOTALL
        )
        explanation = (
            explanation_match.group(1).strip()
            if explanation_match
            else "Analysis conducted based on linguistic patterns in the post."
        )

        limitations_match = re.search(r"Limitations:\s*(.+)", text, re.IGNORECASE | re.DOTALL)
        limitations = (
            limitations_match.group(1).strip()
            if limitations_match
            else "This computational analysis cannot establish a clinical psychiatric diagnosis."
        )

        return MentalHealthStructuredOutput(
            mental_health_related=is_related,
            contributing_factor=factor,  # type: ignore
            confidence_score=0.85,
            distress_level="Moderate" if is_related else "None",
            relevant_phrases=phrases,
            explanation=explanation,
            limitations=limitations,
            suggested_support_keywords=["Wellness Guidance", "Linguistic Context"]
        )


# Singleton instance
analyzer = MentalHealthRAGAnalyzer()
