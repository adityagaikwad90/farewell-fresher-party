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

      {/* Clean Footer (No admin links exposed) */}
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

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginBottom: '1.25rem' }}>
            Organized with <Heart size={14} color="#ec4899" style={{ display: 'inline', verticalAlign: 'middle' }} /> by MCA 2nd Year Students for our juniors and outgoing seniors.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
            <a
              href="https://chat.whatsapp.com/BtrQQGn4MrxEF0zioEeE67"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#4ade80', textDecoration: 'none', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}
            >
              <MessageCircle size={16} /> Join Official WhatsApp Group
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
