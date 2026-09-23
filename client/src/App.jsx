import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import RegistrationForm from './components/RegistrationForm';
import SuccessModal from './components/SuccessModal';
import AdminPanel from './components/AdminPanel';
import BackgroundEffects from './components/BackgroundEffects';
import { Heart, MessageCircle } from 'lucide-react';

export default function App() {
  // Direct route detection from URL (e.g. /admin or #admin)
  const isInitialAdmin = () => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    return path === '/admin' || path.startsWith('/admin') || hash === '#admin';
  };

  const [currentView, setCurrentView] = useState(isInitialAdmin() ? 'admin' : 'register');
  const [submittedData, setSubmittedData] = useState(null);

  useEffect(() => {
    // Listen to browser URL changes
    const handlePopState = () => {
      if (isInitialAdmin()) {
        setCurrentView('admin');
      } else {
        setCurrentView('register');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToRegister = () => {
    window.history.pushState(null, '', '/');
    setCurrentView('register');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScrollToForm = () => {
    const el = document.getElementById('registration-form');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSuccess = (record) => {
    setSubmittedData(record);
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Background Particle and Aurora Lights */}
      <BackgroundEffects />

      {/* Navigation Bar (No admin button displayed) */}
      <Navbar onLogoClick={navigateToRegister} />

      {/* Main Page View */}
      <main style={{ flex: 1 }}>
        {currentView === 'register' ? (
          <>
            <Hero onScrollToForm={handleScrollToForm} />
            <RegistrationForm onSubmitSuccess={handleSuccess} />

            {/* Official WhatsApp Community - Single Prominent Placement at Bottom */}
            <section style={{ padding: '0 1.5rem 4rem', position: 'relative', zIndex: 1 }}>
              <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div className="glass-panel whatsapp-bottom-card">
                  <div className="whatsapp-bottom-card-content" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: 1, minWidth: '260px' }}>
                    <div
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: '0 6px 20px rgba(37, 211, 102, 0.45)',
                      }}
                      className="animate-pulse-glow"
                    >
                      <MessageCircle size={32} color="#ffffff" />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: '#4ade80', letterSpacing: '0.06em', marginBottom: '0.2rem' }}>
                        Official Community
                      </div>
                      <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.25rem' }}>
                        Join Official WhatsApp Community
                      </h3>
                      <p style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.45 }}>
                        Get instant announcements on event venue, party timings, theme dress code, and performance schedule!
                      </p>
                    </div>
                  </div>

                  <a
                    href="https://chat.whatsapp.com/BtrQQGn4MrxEF0zioEeE67"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-whatsapp"
                    style={{
                      padding: '0.85rem 1.6rem',
                      fontSize: '1rem',
                      borderRadius: '12px',
                      flexShrink: 0,
                    }}
                  >
                    <MessageCircle size={20} />
                    <span>Join Official WhatsApp</span>
                  </a>
                </div>
              </div>
            </section>
          </>
        ) : (
          <AdminPanel onBackToForm={navigateToRegister} />
        )}
      </main>

      {/* Celebratory Success Modal */}
      {submittedData && (
        <SuccessModal
          data={submittedData}
          onClose={() => setSubmittedData(null)}
          onRegisterAnother={() => setSubmittedData(null)}
        />
      )}

      {/* Clean Footer (Single branding, no duplicate links) */}
      <footer
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: 'rgba(10, 11, 22, 0.92)',
          padding: '2.5rem 1.5rem',
          textAlign: 'center',
          position: 'relative',
          zIndex: 10,
          marginTop: 'auto',
        }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
            <span style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '0.03em', color: '#ffffff' }}>
              MCA FRESHER &amp; FAREWELL CELEBRATION 2026
            </span>
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', margin: 0 }}>
            Organized with <Heart size={14} color="#ec4899" style={{ display: 'inline', verticalAlign: 'middle' }} /> by MCA 2nd Year Students for our juniors and outgoing seniors.
          </p>
        </div>
      </footer>
    </div>
  );
}
