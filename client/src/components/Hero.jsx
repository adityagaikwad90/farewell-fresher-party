import React, { useState, useEffect } from 'react';
import { Sparkles, Heart, Flame, ArrowDown, MessageCircle, IndianRupee, Clock } from 'lucide-react';

export default function Hero({ onScrollToForm }) {
  // Target celebratory date: October 2, 2026 at 10:00 AM (Approx 1st - 2nd October)
  const calculateTimeLeft = () => {
    const currentYear = new Date().getFullYear();
    const targetDate = new Date(currentYear, 9, 2, 10, 0, 0); // Month 9 is October (0-indexed)
    const now = new Date();
    const diff = Math.max(0, targetDate - now);

    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / 1000 / 60) % 60),
      seconds: Math.floor((diff / 1000) % 60)
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const updateTimer = () => {
      setTimeLeft(calculateTimeLeft());
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section style={{ padding: '3rem 1.5rem 2rem', position: 'relative', zIndex: 1 }}>
      <div style={{ maxWidth: '920px', margin: '0 auto', textAlign: 'center' }}>
        
        {/* Main Title */}
        <h1
          style={{
            fontSize: 'clamp(2.2rem, 5.5vw, 3.8rem)',
            fontWeight: 900,
            lineHeight: 1.15,
            marginBottom: '1.25rem',
          }}
        >
          WELCOME TO THE <br />
          <span className="text-gradient">MCA FRESHER &amp; FAREWELL</span>
          <br />
          CELEBRATION 2026! ✨
        </h1>

        {/* Animated Countdown Timer */}
        <div style={{ margin: '1rem 0 2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.85rem' }}>
            <Clock size={15} color="#c084fc" />
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#e2e8f0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Countdown to Celebration • 1st – 2nd October 2026
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              flexWrap: 'wrap',
            }}
          >
          {[
            { label: 'Days', val: timeLeft.days },
            { label: 'Hours', val: timeLeft.hours },
            { label: 'Minutes', val: timeLeft.minutes },
            { label: 'Seconds', val: timeLeft.seconds }
          ].map((item, idx) => (
            <div
              key={idx}
              className="glass-panel"
              style={{
                padding: '0.65rem 1rem',
                minWidth: '72px',
                textAlign: 'center',
                borderRadius: '12px',
                border: '1px solid rgba(168, 85, 247, 0.25)',
                background: 'rgba(20, 24, 52, 0.7)',
              }}
            >
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-display)' }}>
                {String(item.val).padStart(2, '0')}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                {item.label}
              </div>
            </div>
          ))}
          </div>
        </div>

        {/* Welcoming Letter Card */}
        <div
          className="glass-panel"
          style={{
            padding: '2.2rem 2rem',
            textAlign: 'left',
            margin: '1rem 0 2rem',
            position: 'relative',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            background: 'linear-gradient(180deg, rgba(25, 30, 68, 0.8) 0%, rgba(13, 16, 38, 0.9) 100%)',
            boxShadow: '0 15px 40px rgba(0, 0, 0, 0.4), 0 0 25px rgba(168, 85, 247, 0.15)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '1.35rem' }}>🎓</span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc' }}>
              Dear MCA First Year Students,
            </h3>
          </div>

          <p style={{ color: '#cbd5e1', fontSize: '0.96rem', marginBottom: '1rem', lineHeight: 1.7 }}>
            A new journey has begun for you, and we, the <strong style={{ color: '#e2e8f0' }}>MCA 2nd Year students</strong>, are excited to welcome you to the MCA family! 🎓❤️
          </p>
          <p style={{ color: '#cbd5e1', fontSize: '0.96rem', marginBottom: '1rem', lineHeight: 1.7 }}>
            At the same time, we are also celebrating the journey, memories, friendships, and achievements of our <strong style={{ color: '#e2e8f0' }}>MCA 2nd Year outgoing students</strong> as they take their next step toward a new chapter. 🌟
          </p>
          <p style={{ color: '#cbd5e1', fontSize: '0.96rem', marginBottom: '1.25rem', lineHeight: 1.7 }}>
            So, this year, we are bringing everyone together for one special celebration — <strong style={{ color: '#f472b6' }}>FRESHER + FAREWELL 2026! 🥳</strong>
          </p>
          <p style={{ color: '#94a3b8', fontSize: '0.92rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            This portal is specially created for MCA First Year students to collect your basic information and know your interests, preferences, and participation for the event. This is not just another college event. It is a chance to <strong style={{ color: '#f8fafc' }}>meet new people, celebrate friendships, appreciate our seniors</strong>, and create memories that we'll carry with us long after college. ❤️
          </p>

          {/* Slogan Banner */}
          <div
            style={{
              padding: '1.1rem 1.25rem',
              borderRadius: '14px',
              background: 'linear-gradient(90deg, rgba(236, 72, 153, 0.18) 0%, rgba(168, 85, 247, 0.18) 100%)',
              border: '1px solid rgba(236, 72, 153, 0.35)',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6rem',
              flexWrap: 'wrap',
              boxShadow: '0 4px 20px rgba(236, 72, 153, 0.15)',
            }}
          >
            <Flame size={20} color="#f97316" />
            <span style={{ fontWeight: 800, fontSize: '1rem', color: '#fef08a', letterSpacing: '0.02em' }}>
              One Department. Two Batches. One Celebration. Countless Memories.
            </span>
            <Flame size={20} color="#f97316" />
          </div>
        </div>

        {/* Entry Fee Information Card */}
        <div style={{ maxWidth: '440px', margin: '1.5rem auto 2.2rem' }}>
          <div
            className="glass-panel"
            style={{
              padding: '1.25rem 1.4rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1.1rem',
              borderLeft: '4px solid #f59e0b',
              textAlign: 'left',
              background: 'rgba(20, 24, 52, 0.75)',
            }}
          >
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'rgba(245, 158, 11, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <IndianRupee size={24} color="#fbbf24" />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#fbbf24', letterSpacing: '0.06em' }}>
                Estimated Entry Fee
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ffffff' }}>
                ₹500 - ₹700
              </div>
              <div style={{ fontSize: '0.76rem', color: '#94a3b8' }}>
                *According to the strength of attendees, fee may vary.
              </div>
            </div>
          </div>
        </div>

        {/* Scroll CTA button */}
        <button
          onClick={onScrollToForm}
          className="btn btn-primary animate-float"
          style={{
            padding: '1rem 2.4rem',
            fontSize: '1.05rem',
            borderRadius: '999px',
            boxShadow: '0 8px 30px rgba(168, 85, 247, 0.45)',
          }}
        >
          <span>Fill Out Registration Form</span>
          <ArrowDown size={18} />
        </button>

      </div>
    </section>
  );
}
