# MindPulse AI — Social Media Mental Health & Distress Language Analyzer

[![Python](https://img.shields.io/badge/Python-3.9%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18%2B-61DAFB.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6%2B-646CFF.svg)](https://vitejs.dev/)
[![LangChain](https://img.shields.io/badge/LangChain-RAG-white.svg)](https://www.langchain.com/)
[![Chroma](https://img.shields.io/badge/Chroma-Vector_DB-orange.svg)](https://www.trychroma.com/)

**MindPulse AI** is a computational linguistics research platform designed to analyze unstructured social media posts, detect subtle markers of emotional distress, extract verbatim textual evidence, and categorize contributing factors across standardized psychological dimensions.

---

## 📌 Project Architecture

```
MentalHealth/
├── backend/
│   ├── __init__.py
│   ├── config.py             # System configuration, paths, environment variables
│   ├── models.py             # Pydantic request & response schemas
│   ├── analyzer.py           # Core RAG engine with ChromaDB & structured LLM inference
│   ├── main.py               # FastAPI application with REST endpoints & CORS
│   └── test_api.py           # Comprehensive automated API test suite
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js     # API client for backend communication
│   │   ├── components/
│   │   │   ├── Navbar.jsx    # Top navigation, status indicator & crisis modal trigger
│   │   │   ├── HeroBanner.jsx# Academic disclaimer & research context
│   │   │   ├── PostAnalyzer.jsx       # Single post input, word counters, benchmark presets
│   │   │   ├── AnalysisResultCard.jsx # Dynamic result card with evidence highlights & export
│   │   │   ├── BatchAnalyzer.jsx      # Multi-post batch processor with aggregate metrics
│   │   │   ├── KnowledgeBaseView.jsx  # Research taxonomy & Chroma diagnostics
│   │   │   ├── HistoryView.jsx        # Session history, search, and JSON export
│   │   │   └── HelplineModal.jsx      # 24/7 crisis support hotline directory
│   │   ├── App.jsx           # Master application coordinator
│   │   └── index.css         # Modern, responsive glassmorphic design system
│   ├── index.html            # Application entry with SEO and typography
│   ├── vite.config.js        # Vite dev server and proxy configuration
│   └── package.json          # Frontend dependencies
├── rag_db/                   # Chroma vector database storage
├── llm.py                    # Standalone CLI interface (interactive terminal mode)
├── requirements.txt          # Python dependencies
├── run.sh                    # One-command runner script for backend + frontend
└── README.md                 # Complete documentation
```

---

## 🔬 Classification Framework

The system analyzes post text without speculation, strictly mapping explicit language into one of six mutually exclusive dimensions:

1. **Jobs/Career**: Workplace pressure, unemployment, extreme overtime, manager friction, burnout, or academic deadlines.
2. **Relationship**: Breakups, divorce, romantic grief, domestic betrayal, or severe family conflict.
3. **Bias/Abuse**: Bullying, cyberbullying, physical threats, discrimination, or domestic violence.
4. **Medication**: Explicit references to psychiatric prescriptions, dosage alterations, or adverse side effects.
5. **Alienation**: Chronic isolation, perceived invisibility, detachment, and lack of social connection.
6. **No Reason**: Used when emotional distress is expressed without an identifiable cause, OR when the post is neutral/positive.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Python 3.9+
- Node.js 18+ and npm
- An OpenAI API Key (`OPENAI_API_KEY`)

### 2. Environment Configuration
Create or update `.env` in the root directory:
```env
OPENAI_API_KEY=your_openai_api_key_here
EMBEDDING_MODEL=text-embedding-3-small
LLM_MODEL=gpt-4o-mini
LLM_TEMPERATURE=0.0
```

### 3. Launching Both Backend & Frontend (One Command)
Run the automated runner script:
```bash
./run.sh
```
- **Frontend App**: [http://localhost:5173](http://localhost:5173)
- **FastAPI Backend**: [http://localhost:8000](http://localhost:8000)
- **Interactive Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🛠️ Manual Installation & Execution

### Backend (FastAPI)
```bash
# Activate virtual environment
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run backend test suite
PYTHONPATH=. python backend/test_api.py

# Start FastAPI server
PYTHONPATH=. uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

### Frontend (React + Vite)
```bash
cd frontend

# Install packages
npm install

# Start Vite dev server
npm run dev
```

### Standalone CLI Mode
If you prefer running the analyzer directly in your terminal:
```bash
source .venv/bin/activate
python llm.py
```

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Diagnostic status of backend and Chroma vector store |
| `GET` | `/api/categories` | Complete taxonomy definitions and empirical criteria |
| `GET` | `/api/samples` | Pre-curated benchmark posts across all categories |
| `GET` | `/api/knowledge-base` | Vector store chunk counts and model metadata |
| `POST` | `/api/analyze` | Single post linguistic analysis with RAG evidence quotes |
| `POST` | `/api/analyze/batch` | Batch post analysis with aggregate metrics (max 25) |
| `GET` | `/api/history` | Retrieve recent session analyses |
| `DELETE` | `/api/history` | Clear session analysis history |

---

## ⚠️ Academic & Clinical Disclaimer

> **IMPORTANT**: This software is developed strictly for **computational linguistics and academic NLP research**. It does **not** provide clinical diagnosis, psychiatric assessment, or therapeutic advice. Social media text alone cannot reliably determine clinical mental health status. Individuals experiencing emotional distress or suicidal thoughts should contact professional crisis support services immediately (e.g., dial **988** in the US/Canada, or refer to the in-app Crisis Directory).
