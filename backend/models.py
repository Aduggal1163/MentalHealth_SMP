from typing import List, Optional, Literal, Dict
from pydantic import BaseModel, Field


class MentalHealthStructuredOutput(BaseModel):
    """Pydantic model for LLM structured output"""
    mental_health_related: bool = Field(
        description="Whether the language in the post appears related to emotional distress."
    )
    contributing_factor: Literal[
        "Jobs/Career", "Relationship", "Bias/Abuse", "Medication", "Alienation", "No Reason"
    ] = Field(
        description="One of the six authorized research categories."
    )
    confidence_score: float = Field(
        default=0.85,
        ge=0.0,
        le=1.0,
        description="Confidence score between 0.0 and 1.0 reflecting how explicit the evidence in the text is."
    )
    distress_level: Literal["None", "Mild", "Moderate", "High"] = Field(
        default="Mild",
        description="Assessed distress intensity level based strictly on the language used."
    )
    relevant_phrases: List[str] = Field(
        default_factory=list,
        description="Exact phrases copied verbatim from the post that support the classification."
    )
    explanation: str = Field(
        description="Concise explanation distinguishing explicit statements from possible interpretations."
    )
    limitations: str = Field(
        description="Clear statement of what cannot be concluded from social media text alone."
    )
    suggested_support_keywords: List[str] = Field(
        default_factory=list,
        description="Non-clinical wellbeing focus topics (e.g. 'Work-Life Balance', 'Mindfulness', 'Peer Support')."
    )


class SourceDocument(BaseModel):
    source: str
    page: Optional[int] = None
    excerpt: str


class AnalyzePostRequest(BaseModel):
    post: str = Field(
        ...,
        min_length=3,
        max_length=10000,
        description="Social media post text to analyze",
        examples=["I have been working 70 hours a week and my manager keeps threatening my job. I can barely get out of bed."]
    )


class PostAnalysisResponse(BaseModel):
    id: str
    post: str
    timestamp: str
    execution_time_ms: float
    mental_health_related: bool
    contributing_factor: str
    confidence_score: float
    distress_level: str
    relevant_phrases: List[str]
    explanation: str
    limitations: str
    suggested_support_keywords: List[str]
    raw_analysis_text: str
    sources: List[SourceDocument]


class BatchAnalyzeRequest(BaseModel):
    posts: List[str] = Field(
        ...,
        min_length=1,
        max_length=25,
        description="List of social media posts to analyze (up to 25 at a time)"
    )


class BatchAnalyzeResponse(BaseModel):
    total_posts: int
    distress_detected_count: int
    non_distress_count: int
    factors_distribution: Dict[str, int]
    distress_levels_distribution: Dict[str, int]
    results: List[PostAnalysisResponse]


class SamplePost(BaseModel):
    id: str
    category: str
    title: str
    post: str
    description: str


class CategoryDefinition(BaseModel):
    name: str
    description: str
    criteria: str
    examples: List[str]


class KnowledgeBaseInfo(BaseModel):
    collection_name: str
    chunk_count: int
    db_directory: str
    embedding_model: str
    llm_model: str
    ready: bool


class HealthResponse(BaseModel):
    status: str
    api_key_configured: bool
    vector_db_ready: bool
    timestamp: str
    version: str
