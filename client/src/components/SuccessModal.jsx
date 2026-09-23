import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, MessageCircle, RotateCcw, X, Sparkles, Heart } from 'lucide-react';

export default function SuccessModal({ data, onClose, onRegisterAnother }) {
  useEffect(() => {
    // Celebration confetti cannon
    const count = 180;
    const defaults = {
      origin: { y: 0.65 },
      zIndex: 9999
    };

    function fire(particleRatio, opts) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio)
      });
    }

    fire(0.25, {
      spread: 30,
      startVelocity: 55,
      colors: ['#6366f1', '#818cf8', '#38bdf8']
    });
    fire(0.2, {
      spread: 60,
      colors: ['#38bdf8', '#10b981', '#cbd5e1']
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 30,
      decay: 0.92,
      scalar: 1.2
    });
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        backgroundColor: 'rgba(5, 6, 15, 0.85)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '520px',
          padding: '2.5rem 2rem',
          position: 'relative',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7)',
          textAlign: 'center',
          borderRadius: '24px',
        }}
      >
        {/* Close icon button in top right */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'rgba(255, 255, 255, 0.08)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#94a3b8',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
        >
          <X size={18} />
        </button>

        {/* Success Icon with Glowing Ripple */}
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            boxShadow: '0 0 24px rgba(16, 185, 129, 0.4)',
            border: '3px solid rgba(255, 255, 255, 0.15)',
          }}
          className="animate-pulse-glow"
        >
          <CheckCircle2 size={40} color="#ffffff" />
        </div>

        {/* Headline */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
          <Sparkles size={16} color="#34d399" />
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Submission Confirmed
          </span>
          <Sparkles size={16} color="#34d399" />
        </div>

        <h2
          style={{
            fontSize: '1.85rem',
            fontWeight: 800,
            color: '#ffffff',
            marginBottom: '0.75rem',
            lineHeight: 1.25,
          }}
        >
          Registration Successful! 🎉
        </h2>

        <p style={{ color: '#cbd5e1', fontSize: '0.98rem', lineHeight: 1.6, marginBottom: '1.5rem', padding: '0 0.5rem' }}>
          Thank you, <strong style={{ color: '#f8fafc', fontWeight: 700 }}>{data?.fullName || 'Student'}</strong>!
          Your registration for the <strong style={{ color: '#c7d2fe' }}>MCA Fresher &amp; Farewell Celebration 2026</strong> has been successfully recorded.
        </p>

        {/* WhatsApp Group Box */}
        <div
          style={{
            padding: '1.25rem',
            borderRadius: '16px',
            background: 'rgba(17, 24, 39, 0.75)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.25rem' }}>
            Next Step: Join the WhatsApp Group
          </div>
          <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.9rem' }}>
            Stay updated with event timings, dress code, venue announcements &amp; performance slots!
          </p>

          <a
            href="https://chat.whatsapp.com/BtrQQGn4MrxEF0zioEeE67"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-whatsapp"
            style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem', borderRadius: '12px' }}
          >
            <MessageCircle size={18} />
            <span>Join Official WhatsApp Group</span>
          </a>
        </div>

        {/* Action button */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <button
            onClick={onClose}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem', justifyContent: 'center' }}
          >
            <span>Done / View Registration</span>
          </button>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '0.25rem' }}>
            <span>🔒 Entry recorded • Duplicate submissions are restricted</span>
          </div>
        </div>

      </div>
    </div>
  );
}
