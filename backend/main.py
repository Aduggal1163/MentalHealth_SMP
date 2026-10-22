import logging
from collections import Counter
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import List

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.config import OPENAI_API_KEY
from backend.models import (
    AnalyzePostRequest,
    PostAnalysisResponse,
    BatchAnalyzeRequest,
    BatchAnalyzeResponse,
    SamplePost,
    CategoryDefinition,
    KnowledgeBaseInfo,
    HealthResponse,
)
from backend.analyzer import (
    analyzer,
    SAMPLE_POSTS,
    CATEGORIES,
)

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("mindpulse-api")

# In-memory history buffer (max 100 entries)
ANALYSIS_HISTORY: List[PostAnalysisResponse] = []


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager to initialize resources on startup."""
    logger.info("Initializing MindPulse Mental Health Analyzer Engine...")
    try:
        if OPENAI_API_KEY:
            analyzer.initialize()
            logger.info("Knowledge Base and LLM initialized successfully.")
        else:
            logger.warning("OPENAI_API_KEY not found in environment.")
    except Exception as e:
        logger.error(f"Error during analyzer initialization: {e}")
    yield
    logger.info("MindPulse Analyzer shutting down.")


app = FastAPI(
    title="MindPulse AI - Mental Health & Distress Language Analyzer",
    description="Research-oriented NLP and RAG system for analyzing social media posts for emotional distress indicators and contributing factors.",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend applications
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["General"])
def read_root():
    return {
        "name": "MindPulse AI - Mental Health & Distress Language Analyzer API",
        "status": "online",
        "version": "1.0.0",
        "documentation": "/docs"
    }


@app.get("/api/health", response_model=HealthResponse, tags=["Diagnostics"])
def health_check():
    """Verify backend health, OpenAI connectivity, and vector DB status."""
    return HealthResponse(
        status="healthy" if analyzer.is_ready() else "degraded",
        api_key_configured=bool(OPENAI_API_KEY),
        vector_db_ready=analyzer.is_ready(),
        timestamp=datetime.now(timezone.utc).isoformat(),
        version="1.0.0"
    )


@app.get("/api/categories", response_model=List[CategoryDefinition], tags=["Research Guidelines"])
def get_categories():
    """Retrieve the 6 core research classification categories and evidence criteria."""
    return CATEGORIES


@app.get("/api/samples", response_model=List[SamplePost], tags=["Test Data"])
def get_sample_posts():
    """Get pre-curated benchmark posts across all categories for fast testing."""
    return SAMPLE_POSTS


@app.get("/api/knowledge-base", response_model=KnowledgeBaseInfo, tags=["Diagnostics"])
def get_knowledge_base():
    """Retrieve metadata about the Chroma vector store and chunking configuration."""
    return analyzer.get_kb_info()


@app.post("/api/analyze", response_model=PostAnalysisResponse, tags=["Analysis"])
def analyze_single_post(payload: AnalyzePostRequest):
    """
    Analyze a single social media post using RAG retrieval and structured LLM inference.
    Identifies emotional distress presence, contributing factor, exact evidence quotes, and limitations.
    """
    cleaned_text = payload.post.strip()
    if len(cleaned_text) < 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The input post must contain at least 3 characters."
        )

    try:
        result = analyzer.analyze_post(cleaned_text)
        # Store in recent history (keep most recent 100)
        ANALYSIS_HISTORY.insert(0, result)
        if len(ANALYSIS_HISTORY) > 100:
            ANALYSIS_HISTORY.pop()
        return result
    except ValueError as val_err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(val_err)
        )
    except Exception as exc:
        logger.error(f"Analysis failed: {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference failed: {str(exc)}"
        )


@app.post("/api/analyze/batch", response_model=BatchAnalyzeResponse, tags=["Analysis"])
def analyze_batch_posts(payload: BatchAnalyzeRequest):
    """
    Analyze a batch of up to 25 social media posts in sequence.
    Returns individual analyses alongside aggregate metrics and factor distributions.
    """
    posts = [p.strip() for p in payload.posts if p and len(p.strip()) >= 3]
    if not posts:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Batch contains no valid posts (each must be at least 3 characters)."
        )

    if len(posts) > 25:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Batch limit is 25 posts per request."
        )

    results: List[PostAnalysisResponse] = []
    for post_text in posts:
        try:
            res = analyzer.analyze_post(post_text)
            results.append(res)
            ANALYSIS_HISTORY.insert(0, res)
        except Exception as e:
            logger.warning(f"Error processing item in batch: {e}")

    if len(ANALYSIS_HISTORY) > 100:
        del ANALYSIS_HISTORY[100:]

    distress_count = sum(1 for r in results if r.mental_health_related)
    factors_counter = Counter(r.contributing_factor for r in results)
    distress_levels_counter = Counter(r.distress_level for r in results)

    return BatchAnalyzeResponse(
        total_posts=len(results),
        distress_detected_count=distress_count,
        non_distress_count=len(results) - distress_count,
        factors_distribution=dict(factors_counter),
        distress_levels_distribution=dict(distress_levels_counter),
        results=results
    )


@app.get("/api/history", response_model=List[PostAnalysisResponse], tags=["History"])
def get_history():
    """Retrieve session analysis history."""
    return ANALYSIS_HISTORY[:50]


@app.delete("/api/history", tags=["History"])
def clear_history():
    """Clear session analysis history."""
    ANALYSIS_HISTORY.clear()
    return {"message": "Analysis history cleared successfully."}
