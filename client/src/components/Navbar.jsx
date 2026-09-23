import React from 'react';
import { GraduationCap, Sparkles, MessageCircle } from 'lucide-react';

export default function Navbar({ onLogoClick }) {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        backgroundColor: 'rgba(10, 11, 22, 0.8)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '0.9rem 1.5rem',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        {/* Brand / Logo */}
        <div
          onClick={onLogoClick}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(168, 85, 247, 0.4)',
            }}
          >
            <GraduationCap size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em', color: '#ffffff' }}>
                MCA FEST 2026
              </span>
              <span className="badge badge-purple" style={{ padding: '0.15rem 0.45rem', fontSize: '0.7rem' }}>
                <Sparkles size={11} /> Fresher &amp; Farewell
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Two Batches • One Celebration
            </p>
          </div>
        </div>

        {/* Right Action: WhatsApp CTA only */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <a
            href="https://chat.whatsapp.com/BtrQQGn4MrxEF0zioEeE67"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-whatsapp"
            style={{
              padding: '0.6rem 1.1rem',
              fontSize: '0.88rem',
              borderRadius: '10px',
            }}
          >
            <MessageCircle size={16} />
            <span>Join WhatsApp Group</span>
          </a>
        </div>
      </div>
    </header>
  );
}
