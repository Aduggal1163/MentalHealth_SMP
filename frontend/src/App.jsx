import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import PostAnalyzer from './components/PostAnalyzer';
import BatchAnalyzer from './components/BatchAnalyzer';
import KnowledgeBaseView from './components/KnowledgeBaseView';
import HistoryView from './components/HistoryView';
import HelplineModal from './components/HelplineModal';
import { api } from './api/client';

export default function App() {
  const [activeTab, setActiveTab] = useState('single');
  const [health, setHealth] = useState(null);
  const [samples, setSamples] = useState([]);
  const [categories, setCategories] = useState([]);
  const [kbInfo, setKbInfo] = useState({});
  const [history, setHistory] = useState([]);
  const [currentResult, setCurrentResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [batchLoading, setBatchLoading] = useState(false);
  const [error, setError] = useState('');
  const [isHelplineOpen, setIsHelplineOpen] = useState(false);

  // Initial data loading
  useEffect(() => {
    async function loadInitialData() {
      try {
        const [healthRes, samplesRes, categoriesRes, kbRes, historyRes] =
          await Promise.allSettled([
            api.getHealth(),
            api.getSamples(),
            api.getCategories(),
            api.getKnowledgeBase(),
            api.getHistory(),
          ]);

        if (healthRes.status === 'fulfilled') setHealth(healthRes.value);
        if (samplesRes.status === 'fulfilled') setSamples(samplesRes.value);
        if (categoriesRes.status === 'fulfilled') setCategories(categoriesRes.value);
        if (kbRes.status === 'fulfilled') setKbInfo(kbRes.value);
        if (historyRes.status === 'fulfilled') {
          setHistory(historyRes.value);
          if (historyRes.value.length > 0 && !currentResult) {
            setCurrentResult(historyRes.value[0]);
          }
        }
      } catch (err) {
        console.warn('Initial load encountered errors:', err);
      }
    }

    loadInitialData();
  }, []);

  // Single post analysis handler
  const handleAnalyzePost = async (postText) => {
    setLoading(true);
    setError('');
    try {
      const response = await api.analyzePost(postText);
      setCurrentResult(response);
      setHistory((prev) => [response, ...prev.slice(0, 99)]);
    } catch (err) {
      setError(
        err.message || 'Analysis failed. Please ensure the backend is running and OPENAI_API_KEY is configured.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Batch post analysis handler
  const handleAnalyzeBatch = async (posts) => {
    setBatchLoading(true);
    try {
      const response = await api.analyzeBatch(posts);
      if (response?.results) {
        setHistory((prev) => [...response.results, ...prev].slice(0, 100));
      }
      return response;
    } catch (err) {
      alert(`Batch processing error: ${err.message}`);
      return null;
    } finally {
      setBatchLoading(false);
    }
  };

  // Clear history handler
  const handleClearHistory = async () => {
    try {
      await api.clearHistory();
      setHistory([]);
    } catch (err) {
      console.error('Failed to clear history:', err);
    }
  };

  // Select item from history to load into single analyzer
  const handleSelectHistoryItem = (item) => {
    setCurrentResult(item);
    setActiveTab('single');
  };

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        health={health}
        onOpenHelplines={() => setIsHelplineOpen(true)}
      />

      <main className="main-content">
        {/* Research Hero Banner */}
        <HeroBanner />

        {/* Tab 1: Single Post Analyzer */}
        {activeTab === 'single' && (
          <PostAnalyzer
            samples={samples}
            onAnalyze={handleAnalyzePost}
            loading={loading}
            currentResult={currentResult}
            error={error}
          />
        )}

        {/* Tab 2: Batch Analysis */}
        {activeTab === 'batch' && (
          <BatchAnalyzer
            onAnalyzeBatch={handleAnalyzeBatch}
            loading={batchLoading}
          />
        )}

        {/* Tab 3: Knowledge Base & Taxonomy */}
        {activeTab === 'kb' && (
          <KnowledgeBaseView categories={categories} kbInfo={kbInfo} />
        )}

        {/* Tab 4: History & Analytics */}
        {activeTab === 'history' && (
          <HistoryView
            history={history}
            onClearHistory={handleClearHistory}
            onSelectHistoryItem={handleSelectHistoryItem}
          />
        )}
      </main>

      {/* Emergency Crisis Support Modal */}
      <HelplineModal
        isOpen={isHelplineOpen}
        onClose={() => setIsHelplineOpen(false)}
      />

      {/* Modern Academic Footer */}
      <footer className="footer">
        <div className="footer-inner">
          <div>
            <strong>MindPulse AI</strong> &bull; Social Media Linguistic & Emotional Distress Analyzer
          </div>
          <div>
            Computational Research System built with FastAPI, LangChain, Chroma RAG, and React
          </div>
          <div style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: '#64748b' }}>
            Designed strictly for NLP research and linguistic pattern observation. Not for clinical diagnostic use.
          </div>
        </div>
      </footer>
    </div>
  );
}
