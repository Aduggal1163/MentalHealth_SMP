import React, { useState } from 'react';
import {
  Clock,
  Trash2,
  Search,
  ArrowRight,
  Download,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

export default function HistoryView({
  history = [],
  onClearHistory,
  onSelectHistoryItem,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFactor, setSelectedFactor] = useState('ALL');

  const filtered = history.filter((item) => {
    const matchesSearch =
      item.post.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.explanation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFactor =
      selectedFactor === 'ALL' || item.contributing_factor === selectedFactor;
    return matchesSearch && matchesFactor;
  });

  const handleExportAllJSON = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `mindpulse-history-${Date.now()}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="glass-card" style={{ padding: '1.75rem' }}>
      <div
        className="card-header-row"
        style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}
      >
        <div className="card-title-group">
          <Clock size={20} color="#6366f1" />
          <h2>Analysis Session History ({history.length})</h2>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {history.length > 0 && (
            <>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleExportAllJSON}
                id="btn-export-history-json"
              >
                <Download size={14} />
                <span>Export History</span>
              </button>

              <button
                type="button"
                className="btn-secondary"
                onClick={onClearHistory}
                style={{ color: '#fb7185', borderColor: 'rgba(244, 63, 94, 0.3)' }}
                id="btn-clear-history"
              >
                <Trash2 size={14} />
                <span>Clear All</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          marginBottom: '1.25rem',
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            flex: 1,
            minWidth: '240px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '12px',
              color: 'var(--text-subtle)',
            }}
          />
          <input
            type="text"
            placeholder="Search past posts or explanations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.55rem 1rem 0.55rem 2.2rem',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-card)',
              borderRadius: '8px',
              color: 'var(--text-main)',
              fontSize: '0.85rem',
              outline: 'none',
            }}
            id="input-search-history"
          />
        </div>

        <select
          value={selectedFactor}
          onChange={(e) => setSelectedFactor(e.target.value)}
          style={{
            background: 'var(--bg-input)',
            border: '1px solid var(--border-card)',
            color: 'var(--text-main)',
            borderRadius: '8px',
            padding: '0.55rem 0.85rem',
            fontSize: '0.82rem',
            outline: 'none',
          }}
          id="select-history-factor"
        >
          <option value="ALL">All Categories</option>
          <option value="Jobs/Career">Jobs/Career</option>
          <option value="Relationship">Relationship</option>
          <option value="Bias/Abuse">Bias/Abuse</option>
          <option value="Medication">Medication</option>
          <option value="Alienation">Alienation</option>
          <option value="No Reason">No Reason</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '3rem 1rem',
            color: 'var(--text-muted)',
            fontSize: '0.9rem',
          }}
        >
          {history.length === 0
            ? 'No analyses recorded yet in this session. Analyze posts to view past history here!'
            : 'No analyses matched your search criteria.'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {filtered.map((item) => (
            <div
              key={item.id}
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px',
                padding: '1rem 1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem',
                transition: 'background 0.2s',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <span
                    className="category-tag none"
                    style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
                  >
                    {item.contributing_factor}
                  </span>
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
                    style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
                  >
                    {item.mental_health_related ? `Distress: ${item.distress_level}` : 'No Distress'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', fontFamily: 'var(--font-mono)' }}>
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <p style={{ fontSize: '0.88rem', color: '#e2e8f0', lineHeight: 1.4 }}>
                  "{item.post.length > 130 ? item.post.slice(0, 130) + '...' : item.post}"
                </p>

                {item.relevant_phrases?.[0] && (
                  <span style={{ fontSize: '0.78rem', color: '#f87171' }}>
                    Evidence: "{item.relevant_phrases[0]}"
                  </span>
                )}
              </div>

              <button
                type="button"
                className="btn-secondary"
                onClick={() => onSelectHistoryItem(item)}
                style={{ padding: '0.5rem 0.85rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                title="Load full analysis result"
              >
                <span>View Full</span>
                <ArrowRight size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
