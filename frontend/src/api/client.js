/**
 * API client for MindPulse Mental Health Analyzer
 */

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      let errorMessage = `HTTP error ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch {
        const text = await response.text();
        if (text) errorMessage = text;
      }
      throw new Error(errorMessage);
    }
    return await response.json();
  } catch (err) {
    console.error(`API Request failed for ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  getHealth: () => request('/api/health'),
  getCategories: () => request('/api/categories'),
  getSamples: () => request('/api/samples'),
  getKnowledgeBase: () => request('/api/knowledge-base'),
  analyzePost: (post) =>
    request('/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ post }),
    }),
  analyzeBatch: (posts) =>
    request('/api/analyze/batch', {
      method: 'POST',
      body: JSON.stringify({ posts }),
    }),
  getHistory: () => request('/api/history'),
  clearHistory: () =>
    request('/api/history', {
      method: 'DELETE',
    }),
};
