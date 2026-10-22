import React, { useState } from 'react';
import {
  Sparkles,
  Clipboard,
  RotateCcw,
  Send,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';
import AnalysisResultCard from './AnalysisResultCard';

export default function PostAnalyzer({
  samples = [],
  onAnalyze,
  loading,
  currentResult,
  error,
}) {
  const [postText, setPostText] = useState('');

  const wordCount = postText.trim() ? postText.trim().split(/\s+/).length : 0;
  const charCount = postText.length;

  const handleSelectSample = (sample) => {
    setPostText(sample.post);
  };

  const handleClear = () => {
    setPostText('');
  };

  const handlePaste = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText) setPostText(clipText);
    } catch {
      // Fallback if permission denied
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!postText.trim() || loading) return;
    onAnalyze(postText);
  };

  return (
    <div className="analyzer-grid">
      {/* Left Column: Input and Sample Controls */}
      <div className="glass-card analyzer-input-card">
        <div className="card-header-row">
          <div className="card-title-group">
            <Sparkles size={20} color="#6366f1" />
            <h2>Social Media Post Input</h2>
          </div>
          <span className="samples-toolbar-label">
            {samples.length} Benchmark Presets
          </span>
        </div>

        {/* Preset Chips */}
        <div className="samples-toolbar">
          <div className="samples-toolbar-label">
            <Lightbulb size={13} color="#f59e0b" />
            <span>Click any preset to test specific contributing factors:</span>
          </div>
          <div className="samples-chips-wrap">
            {samples.map((s) => (
              <button
                key={s.id}
                className="sample-chip"
                onClick={() => handleSelectSample(s)}
                id={`btn-sample-${s.id}`}
                title={s.description}
                type="button"
              >
                {s.category}: {s.title}
              </button>
            ))}
          </div>
        </div>

        {/* Text Input Area */}
        <form onSubmit={handleSubmit} className="textarea-wrap">
          <textarea
            className="post-textarea"
            placeholder="Type or paste a social media post, tweet, or forum comment here to evaluate emotional distress and contributing factors..."
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            id="post-input-textarea"
            rows={7}
            disabled={loading}
          />

          <div className="textarea-footer">
            <span>
              {wordCount} words &bull; {charCount} characters
            </span>
            <span>Max 10,000 chars</span>
          </div>

          {error && (
            <div
              style={{
                marginTop: '1rem',
                padding: '0.75rem 1rem',
                background: 'rgba(244, 63, 94, 0.12)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                borderRadius: '8px',
                color: '#fb7185',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="action-buttons-row" style={{ marginTop: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={handlePaste}
                disabled={loading}
                id="btn-paste-clipboard"
                title="Paste from clipboard"
              >
                <Clipboard size={14} />
                <span>Paste</span>
              </button>

              <button
                type="button"
                className="btn-secondary"
                onClick={handleClear}
                disabled={loading || !postText}
                id="btn-clear-text"
                title="Clear input"
              >
                <RotateCcw size={14} />
                <span>Clear</span>
              </button>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading || postText.trim().length < 3}
              id="btn-analyze-submit"
            >
              {loading ? (
                <>
                  <RotateCcw size={16} className="spin-icon" />
                  <span>Analyzing Post...</span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  <span>Analyze Post</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Right Column: Dynamic Assessment Result */}
      <AnalysisResultCard result={currentResult} />
    </div>
  );
}
