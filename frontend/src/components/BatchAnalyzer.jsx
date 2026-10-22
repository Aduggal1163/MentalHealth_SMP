import React, { useState } from 'react';
import {
  Layers,
  RotateCcw,
  Download,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export default function BatchAnalyzer({ onAnalyzeBatch, loading }) {
  const [inputText, setInputText] = useState('');
  const [batchResponse, setBatchResponse] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [filterFactor, setFilterFactor] = useState('ALL');

  const defaultBatchSample = `I haven't slept in three days because my startup is collapsing and we can't pay payroll next week.

My girlfriend broke up with me after 4 years together. I'm completely heartbroken and shattered.

Anonymous users on Twitter have been sending me death threats and posting my home address.

Started taking sertraline last month and the physical nausea and brain fog are making me so dizzy.

Living alone in this city feels like being invisible. I go weeks without anyone speaking a word to me.

Just ran my fastest 10km race today! Beautiful weather and great vibes with the running club.`;

  const handleLoadSamples = () => {
    setInputText(defaultBatchSample);
  };

  const handleRunBatch = async (e) => {
    e?.preventDefault();
    // Split input by double newlines or single newlines
    const posts = inputText
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter((p) => p.length >= 3);

    if (posts.length === 0) return;

    const res = await onAnalyzeBatch(posts);
    if (res) {
      setBatchResponse(res);
    }
  };

  const handleExportCSV = () => {
    if (!batchResponse?.results) return;

    const headers = [
      'ID',
      'Post',
      'Mental Health Related',
      'Contributing Factor',
      'Distress Level',
      'Confidence Score',
      'Relevant Phrases',
      'Explanation',
      'Limitations',
    ];

    const rows = batchResponse.results.map((r) => [
      r.id,
      `"${r.post.replace(/"/g, '""')}"`,
      r.mental_health_related ? 'Yes' : 'No',
      r.contributing_factor,
      r.distress_level,
      r.confidence_score,
      `"${(r.relevant_phrases || []).join('; ').replace(/"/g, '""')}"`,
      `"${r.explanation.replace(/"/g, '""')}"`,
      `"${r.limitations.replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `mindpulse-batch-results-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const filteredResults = batchResponse?.results
    ? filterFactor === 'ALL'
      ? batchResponse.results
      : batchResponse.results.filter((r) => r.contributing_factor === filterFactor)
    : [];

  return (
    <div className="batch-container">
      {/* Input Card */}
      <div className="glass-card" style={{ padding: '1.75rem' }}>
        <div className="card-header-row" style={{ marginBottom: '1rem' }}>
          <div className="card-title-group">
            <Layers size={20} color="#8b5cf6" />
            <h2>Batch Social Media Dataset Analysis</h2>
          </div>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleLoadSamples}
            disabled={loading}
            id="btn-load-batch-samples"
          >
            Load Multi-Factor Sample Batch (6 Posts)
          </button>
        </div>

        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          Paste multiple social media posts separated by an <strong>empty blank line</strong> (double newline).
          The RAG analyzer will classify each post, identify exact textual evidence, and aggregate empirical distributions.
        </p>

        <form onSubmit={handleRunBatch}>
          <textarea
            className="post-textarea"
            placeholder="Enter Post 1...&#10;&#10;Enter Post 2...&#10;&#10;Enter Post 3..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={8}
            disabled={loading}
            id="batch-textarea-input"
          />

          <div className="action-buttons-row" style={{ marginTop: '1rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
              {inputText.split(/\n\s*\n/).filter((p) => p.trim().length >= 3).length} posts detected (Max 25)
            </span>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading || !inputText.trim()}
              id="btn-execute-batch"
            >
              {loading ? (
                <>
                  <RotateCcw size={16} className="spin-icon" />
                  <span>Processing Batch...</span>
                </>
              ) : (
                <>
                  <Layers size={16} />
                  <span>Analyze Batch Dataset</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Aggregate Metrics Dashboard */}
      {batchResponse && (
        <>
          <div className="batch-metrics-grid">
            <div className="glass-card metric-card">
              <div
                className="metric-icon-wrap"
                style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}
              >
                <Layers size={22} />
              </div>
              <div className="metric-info">
                <span className="metric-value">{batchResponse.total_posts}</span>
                <span className="metric-label">Total Posts Analyzed</span>
              </div>
            </div>

            <div className="glass-card metric-card">
              <div
                className="metric-icon-wrap"
                style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185' }}
              >
                <AlertTriangle size={22} />
              </div>
              <div className="metric-info">
                <span className="metric-value">{batchResponse.distress_detected_count}</span>
                <span className="metric-label">
                  Distress Cues Detected (
                  {((batchResponse.distress_detected_count / batchResponse.total_posts) * 100).toFixed(0)}%)
                </span>
              </div>
            </div>

            <div className="glass-card metric-card">
              <div
                className="metric-icon-wrap"
                style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}
              >
                <CheckCircle2 size={22} />
              </div>
              <div className="metric-info">
                <span className="metric-value">{batchResponse.non_distress_count}</span>
                <span className="metric-label">Non-Distressed / Neutral</span>
              </div>
            </div>

            <div className="glass-card metric-card">
              <div
                className="metric-icon-wrap"
                style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee' }}
              >
                <TrendingUp size={22} />
              </div>
              <div className="metric-info">
                <span className="metric-value">
                  {Object.keys(batchResponse.factors_distribution || {}).length}
                </span>
                <span className="metric-label">Active Factor Categories</span>
              </div>
            </div>
          </div>

          {/* Results Table Card */}
          <div className="glass-card" style={{ padding: '1.75rem', overflowX: 'auto' }}>
            <div
              className="card-header-row"
              style={{ marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}
            >
              <div className="card-title-group">
                <FileSpreadsheet size={20} color="#38bdf8" />
                <h2>Batch Assessment Results</h2>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <select
                  value={filterFactor}
                  onChange={(e) => setFilterFactor(e.target.value)}
                  style={{
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-card)',
                    color: 'var(--text-main)',
                    borderRadius: '8px',
                    padding: '0.45rem 0.8rem',
                    fontSize: '0.82rem',
                    outline: 'none',
                  }}
                  id="select-factor-filter"
                >
                  <option value="ALL">All Categories</option>
                  <option value="Jobs/Career">Jobs/Career</option>
                  <option value="Relationship">Relationship</option>
                  <option value="Bias/Abuse">Bias/Abuse</option>
                  <option value="Medication">Medication</option>
                  <option value="Alienation">Alienation</option>
                  <option value="No Reason">No Reason</option>
                </select>

                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleExportCSV}
                  id="btn-export-batch-csv"
                >
                  <Download size={14} />
                  <span>Export to CSV</span>
                </button>
              </div>
            </div>

            <table className="batch-table">
              <thead>
                <tr>
                  <th style={{ width: '40%' }}>Social Media Post</th>
                  <th>Contributing Factor</th>
                  <th>Distress Intensity</th>
                  <th>Confidence</th>
                  <th>Key Evidence Quote</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map((item) => {
                  const isExpanded = expandedId === item.id;
                  return (
                    <React.Fragment key={item.id}>
                      <tr>
                        <td style={{ fontSize: '0.86rem', color: '#e2e8f0' }}>
                          "{item.post.length > 120 ? item.post.slice(0, 120) + '...' : item.post}"
                        </td>
                        <td>
                          <span className="category-tag none" style={{ fontSize: '0.75rem' }}>
                            {item.contributing_factor}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`distress-badge ${
                              item.distress_level === 'High'
                                ? 'high'
                                : item.distress_level === 'Moderate'
                                ? 'moderate'
                                : item.distress_level === 'Mild'
                                ? 'mild'
                                : 'none'
                            }`}
                            style={{ fontSize: '0.75rem' }}
                          >
                            {item.distress_level}
                          </span>
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
                          {(item.confidence_score * 100).toFixed(0)}%
                        </td>
                        <td style={{ fontSize: '0.8rem', color: '#f87171' }}>
                          {item.relevant_phrases?.[0] ? `"${item.relevant_phrases[0]}"` : '—'}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn-secondary"
                            style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
                            onClick={() => setExpandedId(isExpanded ? null : item.id)}
                          >
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td
                            colSpan={6}
                            style={{
                              background: 'rgba(0, 0, 0, 0.3)',
                              padding: '1.25rem',
                              borderBottom: '1px solid var(--border-card)',
                            }}
                          >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              <div style={{ fontSize: '0.84rem' }}>
                                <strong>Explanation:</strong> {item.explanation}
                              </div>
                              <div style={{ fontSize: '0.84rem', color: '#94a3b8' }}>
                                <strong>Limitations:</strong> {item.limitations}
                              </div>
                              {item.relevant_phrases?.length > 1 && (
                                <div style={{ fontSize: '0.82rem', color: '#fb7185' }}>
                                  <strong>All Extracted Phrases:</strong>{' '}
                                  {item.relevant_phrases.map((p) => `"${p}"`).join(', ')}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
