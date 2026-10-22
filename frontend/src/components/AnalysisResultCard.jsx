import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Download,
  Database,
  Tag,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

export default function AnalysisResultCard({ result, onSaveHistory }) {
  const [copied, setCopied] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(false);

  if (!result) {
    return (
      <div className="glass-card result-card">
        <div className="result-placeholder">
          <div className="placeholder-icon">
            <Sparkles size={28} />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '0.4rem' }}>
            Ready for Analysis
          </h3>
          <p style={{ maxWidth: '340px', fontSize: '0.88rem' }}>
            Enter a social media post on the left or select a sample preset to generate a full linguistic RAG analysis.
          </p>
        </div>
      </div>
    );
  }

  const {
    post,
    mental_health_related,
    contributing_factor,
    confidence_score,
    distress_level,
    relevant_phrases = [],
    explanation,
    limitations,
    suggested_support_keywords = [],
    sources = [],
    execution_time_ms,
    raw_analysis_text,
  } = result;

  // Determine category badge class
  const getCategoryClass = (factor) => {
    switch (factor) {
      case 'Jobs/Career':
        return 'job';
      case 'Relationship':
        return 'relationship';
      case 'Bias/Abuse':
        return 'abuse';
      case 'Medication':
        return 'medication';
      case 'Alienation':
        return 'alienation';
      default:
        return 'none';
    }
  };

  // Determine distress badge class
  const getDistressClass = (level) => {
    switch (level?.toLowerCase()) {
      case 'high':
        return 'high';
      case 'moderate':
        return 'moderate';
      case 'mild':
        return 'mild';
      default:
        return 'none';
    }
  };

  const handleCopyReport = () => {
    const report = `==============================
MINDPULSE AI ANALYSIS REPORT
==============================
Post: "${post}"

Mental-Health Related: ${mental_health_related ? 'Yes' : 'No'}
Contributing Factor: ${contributing_factor}
Distress Intensity: ${distress_level}
Confidence Score: ${(confidence_score * 100).toFixed(1)}%

Key Evidence Phrases:
${relevant_phrases.map((p) => `- "${p}"`).join('\n') || 'None'}

Explanation:
${explanation}

Limitations:
${limitations}

Suggested Wellness Topics:
${suggested_support_keywords.join(', ') || 'N/A'}

Execution Latency: ${execution_time_ms} ms
Timestamp: ${result.timestamp}
==============================`;

    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleDownloadJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(result, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `mindpulse-analysis-${result.id || 'report'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Render post text with highlighted phrases
  const renderHighlightedPost = () => {
    if (!relevant_phrases || relevant_phrases.length === 0) {
      return <span>"{post}"</span>;
    }

    try {
      // Escape regex special chars in phrases
      const escaped = relevant_phrases
        .map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .filter((p) => p.length > 2);

      if (escaped.length === 0) return <span>"{post}"</span>;

      const regex = new RegExp(`(${escaped.join('|')})`, 'gi');
      const parts = post.split(regex);

      return (
        <span>
          "
          {parts.map((part, i) => {
            const isMatch = escaped.some((e) => new RegExp(`^${e}$`, 'i').test(part));
            return isMatch ? (
              <mark key={i} className="evidence-highlight" title="Verbatim Text Evidence">
                {part}
              </mark>
            ) : (
              <span key={i}>{part}</span>
            );
          })}
          "
        </span>
      );
    } catch {
      return <span>"{post}"</span>;
    }
  };

  return (
    <div className="glass-card result-card" id="analysis-result-card">
      {/* Header Badges */}
      <div className="card-header-row">
        <div className="card-title-group">
          <FileText size={20} color="#818cf8" />
          <h2>Linguistic Assessment</h2>
        </div>
        <div className="meta-stats">{execution_time_ms ? `${execution_time_ms} ms` : ''}</div>
      </div>

      <div className="result-badges-row">
        <div className={`category-tag ${getCategoryClass(contributing_factor)}`}>
          <Tag size={14} />
          <span>Factor: {contributing_factor}</span>
        </div>

        <div className={`distress-badge ${getDistressClass(distress_level)}`}>
          {mental_health_related ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
          <span>
            {mental_health_related ? `Distress: ${distress_level}` : 'No Distress Detected'}
          </span>
        </div>
      </div>

      {/* Confidence Meter */}
      <div className="confidence-bar-wrap">
        <div className="confidence-label-row">
          <span>Model Empirical Confidence</span>
          <span>{(confidence_score * 100).toFixed(1)}%</span>
        </div>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${Math.min(100, confidence_score * 100)}%` }}
          />
        </div>
      </div>

      {/* Highlighted Evidence in Post */}
      <div className="detail-block">
        <div className="detail-label">
          <span>Analyzed Post with Evidence Highlights</span>
        </div>
        <div className="highlighted-post-box">{renderHighlightedPost()}</div>
      </div>

      {/* Extracted Verbatim Phrases */}
      {relevant_phrases && relevant_phrases.length > 0 && (
        <div className="detail-block">
          <div className="detail-label">
            <span>Verbatim Evidence Quotes ({relevant_phrases.length})</span>
          </div>
          <div className="phrases-list">
            {relevant_phrases.map((phrase, idx) => (
              <span key={idx} className="phrase-tag">
                "{phrase}"
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Concise Explanation */}
      <div className="detail-block">
        <div className="detail-label">
          <span>Reasoning & Explanation</span>
        </div>
        <div className="detail-text">{explanation}</div>
      </div>

      {/* Methodological Limitations */}
      <div className="detail-block">
        <div className="detail-label">
          <ShieldAlert size={14} color="#f59e0b" />
          <span>Research Limitations</span>
        </div>
        <div className="detail-text" style={{ color: '#94a3b8', fontSize: '0.86rem' }}>
          {limitations}
        </div>
      </div>

      {/* Non-Clinical Support Topics */}
      {suggested_support_keywords && suggested_support_keywords.length > 0 && (
        <div className="detail-block">
          <div className="detail-label">
            <span>Suggested Wellbeing Focus Areas</span>
          </div>
          <div className="keywords-list">
            {suggested_support_keywords.map((kw, idx) => (
              <span key={idx} className="keyword-tag">
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* RAG Sources Accordion */}
      {sources && sources.length > 0 && (
        <div className="sources-collapsible">
          <div
            className="sources-header"
            onClick={() => setSourcesOpen(!sourcesOpen)}
            id="toggle-rag-sources"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Database size={15} color="#38bdf8" />
              <span>Chroma Vector Store Context ({sources.length} Chunks Retrieved)</span>
            </div>
            {sourcesOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>

          {sourcesOpen && (
            <div className="sources-content">
              {sources.map((src, i) => (
                <div key={i} className="source-item">
                  <div className="source-title">
                    Reference {i + 1}: {src.source}
                  </div>
                  <div className="source-excerpt">"{src.excerpt}..."</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Footer Export & Share Actions */}
      <div className="result-footer-actions">
        <div className="meta-stats">
          ID: {result.id?.slice(0, 8)}... | {new Date(result.timestamp).toLocaleTimeString()}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="btn-secondary"
            onClick={handleCopyReport}
            id="btn-copy-report"
            title="Copy formatted markdown report"
          >
            {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
            <span>{copied ? 'Copied!' : 'Copy Report'}</span>
          </button>

          <button
            className="btn-secondary"
            onClick={handleDownloadJSON}
            id="btn-download-json"
            title="Download complete JSON result"
          >
            <Download size={14} />
            <span>JSON</span>
          </button>
        </div>
      </div>
    </div>
  );
}
