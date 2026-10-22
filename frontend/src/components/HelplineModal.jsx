import React from 'react';
import { ShieldAlert, X, Phone, Globe, Heart } from 'lucide-react';

export default function HelplineModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const hotlines = [
    {
      country: 'Global / International',
      name: 'Befrienders Worldwide',
      contact: 'befrienders.org',
      note: 'Confidential emotional support worldwide across 32 countries.',
    },
    {
      country: 'United States & Canada',
      name: 'Suicide & Crisis Lifeline',
      contact: 'Call / Text 988',
      note: 'Free, confidential 24/7 support for anyone in distress.',
    },
    {
      country: 'United States & UK',
      name: 'Crisis Text Line',
      contact: 'Text HOME to 741741',
      note: '24/7 text-based crisis intervention by trained specialists.',
    },
    {
      country: 'India',
      name: 'AASRA Suicide Prevention',
      contact: '+91-9820466726',
      note: '24/7 free helpline providing professional non-judgmental counseling.',
    },
    {
      country: 'India',
      name: 'Vandrevala Foundation Helpline',
      contact: '+91 9999 666 555',
      note: 'Free 24x7 psychological counseling and distress intervention.',
    },
    {
      country: 'United Kingdom',
      name: 'NHS Mental Health Services',
      contact: 'Call 111',
      note: 'Immediate NHS mental health clinical assessment and triage.',
    },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShieldAlert size={22} color="#fb7185" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Emergency Crisis & Support</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} id="btn-close-helpline-modal">
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          If you or someone you know is going through a difficult emotional crisis, experiencing suicidal thoughts,
          or facing severe trauma, compassionate and confidential support is available 24/7:
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {hotlines.map((h, i) => (
            <div key={i} className="hotline-card">
              <div>
                <div style={{ fontSize: '0.74rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                  {h.country}
                </div>
                <div className="hotline-name">{h.name}</div>
                <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>{h.note}</div>
              </div>
              <div className="hotline-number">{h.contact}</div>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: '0.5rem',
            padding: '0.75rem',
            background: 'rgba(99, 102, 241, 0.08)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            borderRadius: '10px',
            fontSize: '0.8rem',
            color: '#c7d2fe',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Heart size={16} color="#818cf8" />
          <span>You do not have to carry heavy burdens alone. Reaching out is a courageous step.</span>
        </div>
      </div>
    </div>
  );
}
