import React from 'react';
import { Sparkles, AlertCircle, Database, CheckCircle, ShieldCheck } from 'lucide-react';

export default function HeroBanner() {
  return (
    <div className="glass-card hero-banner">
      <div className="hero-tag">
        <Sparkles size={14} />
        Empirical NLP & RAG Intelligence
      </div>
      <h1 className="hero-title">
        Mental Health & Distress Language Analyzer
      </h1>
      <p className="hero-desc">
        Analyze nuanced social media text using dense vector retrieval (Chroma DB) and
        deep contextual language modeling (OpenAI GPT-4o-mini). Identify emotional distress cues,
        extract explicit textual evidence, and classify contributing factors across six research dimensions.
      </p>

      <div className="hero-disclaimer-pill">
        <AlertCircle size={15} />
        <span>
          <strong>Academic Research Notice:</strong> This computational model performs linguistic observation
          only. It does <u>not</u> provide clinical diagnoses or replace psychiatric consultation.
        </span>
      </div>
    </div>
  );
}
