import React from 'react';
import { Activity, ShieldAlert, Sparkles, Layers, BookOpen, Clock } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, health, onOpenHelplines }) {
  const isHealthy = health?.status === 'healthy';

  return (
    <header className="navbar">
      <div className="nav-inner">
        <div className="brand-section" onClick={() => setActiveTab('single')}>
          <div className="brand-icon-wrap">
            <Activity size={22} />
          </div>
          <div>
            <div className="brand-title">MindPulse AI</div>
            <div className="brand-subtitle">Distress Linguistic Analyzer</div>
          </div>
        </div>

        <nav className="nav-tabs">
          <button
            className={`nav-tab-btn ${activeTab === 'single' ? 'active' : ''}`}
            onClick={() => setActiveTab('single')}
            id="tab-single-analyzer"
          >
            <Sparkles size={16} />
            Post Analyzer
          </button>
          <button
            className={`nav-tab-btn ${activeTab === 'batch' ? 'active' : ''}`}
            onClick={() => setActiveTab('batch')}
            id="tab-batch-analyzer"
          >
            <Layers size={16} />
            Batch Analysis
          </button>
          <button
            className={`nav-tab-btn ${activeTab === 'kb' ? 'active' : ''}`}
            onClick={() => setActiveTab('kb')}
            id="tab-knowledge-base"
          >
            <BookOpen size={16} />
            Knowledge Base
          </button>
          <button
            className={`nav-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
            id="tab-history"
          >
            <Clock size={16} />
            History
          </button>
        </nav>

        <div className="nav-actions">
          <div
            className={`status-badge ${isHealthy ? '' : 'degraded'}`}
            title={isHealthy ? 'Backend & Chroma DB Online' : 'Backend Connecting or Degraded'}
          >
            <span className="pulse-dot"></span>
            <span>{isHealthy ? 'RAG Engine Online' : 'Connecting...'}</span>
          </div>

          <button
            className="helpline-btn"
            onClick={onOpenHelplines}
            id="btn-helpline-modal"
            title="Crisis Support & Emergency Hotlines"
          >
            <ShieldAlert size={15} />
            <span>Crisis Help</span>
          </button>
        </div>
      </div>
    </header>
  );
}
