/**
 * API client for MindPulse Mental Health Analyzer
 */

const API_BASE = import.meta.env.VITE_API_BASE ?? '';

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
      let errorMessage = `HTTP error ${response.status}: Backend service unavailable`;
      try {
        const text = await response.text();
        if (text) {
          try {
            const errorData = JSON.parse(text);
            errorMessage = errorData.detail || errorData.message || text;
          } catch {
            errorMessage = text;
          }
        }
      } catch {
        // fallback to default errorMessage
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
