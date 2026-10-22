import React from 'react';
import {
  BookOpen,
  Database,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Layers,
  HelpCircle,
} from 'lucide-react';

export default function KnowledgeBaseView({ categories = [], kbInfo = {} }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header Info Banner */}
      <div className="glass-card" style={{ padding: '2rem' }}>
        <div className="card-header-row" style={{ marginBottom: '1rem' }}>
          <div className="card-title-group">
            <BookOpen size={22} color="#6366f1" />
            <h2>Research Taxonomy & Annotation Framework</h2>
          </div>
          <div className="status-badge">
            <CheckCircle2 size={14} />
            <span>Standardized Framework</span>
          </div>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.94rem', maxWidth: '850px' }}>
          This system operationalizes a strictly defined computational linguistics rubric to categorize
          social media posts. Predictions are grounded on explicit textual statements extracted by dense
          semantic search from Chroma Vector Store.
        </p>
      </div>

      {/* Vector Store Diagnostics Card */}
      <div className="glass-card" style={{ padding: '1.75rem' }}>
        <div className="card-header-row" style={{ marginBottom: '1.25rem' }}>
          <div className="card-title-group">
            <Database size={20} color="#38bdf8" />
            <h3>Chroma Vector Database Diagnostic Status</h3>
          </div>
        </div>

        <div className="batch-metrics-grid">
          <div className="glass-card metric-card">
            <div
              className="metric-icon-wrap"
              style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}
            >
              <Database size={22} />
            </div>
            <div className="metric-info">
              <span className="metric-value">{kbInfo.chunk_count || 3}</span>
              <span className="metric-label">Indexed Vector Chunks</span>
            </div>
          </div>

          <div className="glass-card metric-card">
            <div
              className="metric-icon-wrap"
              style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}
            >
              <Cpu size={22} />
            </div>
            <div className="metric-info">
              <span className="metric-value" style={{ fontSize: '1.2rem', paddingTop: '4px' }}>
                {kbInfo.embedding_model || 'text-embedding-3-small'}
              </span>
              <span className="metric-label">Embedding Engine</span>
            </div>
          </div>

          <div className="glass-card metric-card">
            <div
              className="metric-icon-wrap"
              style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}
            >
              <Layers size={22} />
            </div>
            <div className="metric-info">
              <span className="metric-value" style={{ fontSize: '1.2rem', paddingTop: '4px' }}>
                {kbInfo.llm_model || 'gpt-4o-mini'}
              </span>
              <span className="metric-label">Chat Reasoning Model</span>
            </div>
          </div>
        </div>
      </div>

      {/* 6 Core Categories Grid */}
      <div>
        <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1.25rem', color: '#fff' }}>
          Core Classification Dimensions ({categories.length})
        </h3>
        <div className="kb-grid">
          {categories.map((cat, idx) => (
            <div key={idx} className="glass-card category-card">
              <div className="category-card-header">
                <h4 className="category-card-title">{cat.name}</h4>
                <span
                  style={{
                    fontSize: '0.74rem',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-subtle)',
                  }}
                >
                  CAT-0{idx + 1}
                </span>
              </div>

              <p className="category-card-desc">{cat.description}</p>

              <div className="category-criteria-box">
                <strong style={{ color: '#93c5fd', display: 'block', marginBottom: '0.25rem' }}>
                  Text Criteria:
                </strong>
                {cat.criteria}
              </div>

              {cat.examples && cat.examples.length > 0 && (
                <div style={{ marginTop: '0.25rem' }}>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                    }}
                  >
                    Exemplar Post Snippets:
                  </span>
                  <ul
                    style={{
                      paddingLeft: '1.1rem',
                      marginTop: '0.35rem',
                      fontSize: '0.78rem',
                      color: '#cbd5e1',
                    }}
                  >
                    {cat.examples.map((ex, i) => (
                      <li key={i} style={{ marginBottom: '0.2rem' }}>
                        "{ex}"
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Guidelines & Research Protocols */}
      <div className="glass-card" style={{ padding: '2rem' }}>
        <div className="card-header-row" style={{ marginBottom: '1rem' }}>
          <div className="card-title-group">
            <ShieldCheck size={20} color="#10b981" />
            <h3>Ethical Protocols & Extraction Invariants</h3>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '1rem', borderRadius: '10px' }}>
            <h5 style={{ color: '#a5b4fc', marginBottom: '0.4rem', fontSize: '0.92rem' }}>
              1. Non-Diagnostic Invariant
            </h5>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
              The model is barred from asserting clinical psychiatric diagnoses (e.g. major depressive disorder, clinical PTSD).
              It observes language indicators only.
            </p>
          </div>

          <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '1rem', borderRadius: '10px' }}>
            <h5 style={{ color: '#a5b4fc', marginBottom: '0.4rem', fontSize: '0.92rem' }}>
              2. Strict Grounding Protocol
            </h5>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
              Relevant phrases must be extracted verbatim from the original post text. If no factor is explicitly stated,
              the post must be classified as "No Reason".
            </p>
          </div>

          <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '1rem', borderRadius: '10px' }}>
            <h5 style={{ color: '#a5b4fc', marginBottom: '0.4rem', fontSize: '0.92rem' }}>
              3. Vector RAG Contextual Retrieval
            </h5>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
              Chroma similarity search retrieves relevant guidelines on distress language, relationship conflict,
              and medication evidence before prompt inference.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
