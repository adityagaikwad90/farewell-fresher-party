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
    <div className="relative min-h-screen flex flex-col bg-[#070A13] text-[#F8FAFC] selection:bg-violet-600 selection:text-white">
      {/* Background Particle and Aurora Lights */}
      <BackgroundEffects />

      {/* Navigation Bar (No admin button displayed) */}
      <Navbar onLogoClick={navigateToRegister} />

      {/* Main Page View */}
      <main className="flex-1 relative z-10">
        {currentView === 'register' ? (
          <>
            <Hero onScrollToForm={handleScrollToForm} />
            <RegistrationForm onSubmitSuccess={handleSuccess} />

            {/* Official WhatsApp Community - Single Prominent Placement at Bottom */}
            <section className="px-4 sm:px-6 pb-16 relative z-10">
              <div className="max-w-[800px] mx-auto">
                <div className="glass-panel whatsapp-bottom-card rounded-3xl border border-emerald-500/30 bg-[#0B1020]/80 shadow-[0_10px_35px_rgba(0,0,0,0.5),0_0_25px_rgba(16,185,129,0.1)] hover:border-emerald-500/50 hover:shadow-[0_15px_45px_rgba(0,0,0,0.6),0_0_35px_rgba(16,185,129,0.18)] transition-all duration-300">
                  <div className="whatsapp-bottom-card-content flex items-center gap-5 flex-1 min-w-[260px]">
                    <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-600/30 border border-white/20">
                      <MessageCircle size={28} color="#ffffff" />
                    </div>
                    <div>
                      <div className="text-[0.72rem] sm:text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
                        Official Community
                      </div>
                      <h3 className="text-lg sm:text-xl font-extrabold text-white mb-1 font-display">
                        Join Official WhatsApp Community
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        Get instant announcements on event venue, party timings, theme dress code, and performance schedule!
                      </p>
                    </div>
                  </div>

                  <a
                    href="https://chat.whatsapp.com/BtrQQGn4MrxEF0zioEeE67"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-whatsapp px-6 py-3.5 text-sm sm:text-base font-bold rounded-xl shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shrink-0 inline-flex items-center gap-2"
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
      <footer className="border-t border-white/10 bg-[#070A13]/90 backdrop-blur-xl py-9 px-4 sm:px-6 text-center relative z-10 mt-auto">
        <div className="max-w-[800px] mx-auto">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="font-extrabold text-sm sm:text-base tracking-wider text-white font-display">
              MCA FRESHER &amp; FAREWELL CELEBRATION 2026
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-400 m-0">
            Organized with <Heart size={14} className="inline text-rose-500 fill-rose-500 align-middle mx-1" /> by MCA 2nd Year Students for our juniors and outgoing seniors.
          </p>
        </div>
      </footer>
    </div>
  );
}
