import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import RegistrationForm from './components/RegistrationForm';
import SuccessModal from './components/SuccessModal';
import AdminPanel from './components/AdminPanel';
import BackgroundEffects from './components/BackgroundEffects';
import { Heart, MessageCircle, Instagram, Sparkles } from 'lucide-react';
import { INSTAGRAM_URL, WHATSAPP_GROUP_URL } from './config';

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

      {/* Navigation Bar (With @mca_buzz Instagram follow link) */}
      <Navbar onLogoClick={navigateToRegister} />

      {/* Main Page View */}
      <main className="flex-1 relative z-10">
        {currentView === 'register' ? (
          <>
            <Hero onScrollToForm={handleScrollToForm} />
            <RegistrationForm onSubmitSuccess={handleSuccess} />

            {/* Official Community & Socials */}
            <section className="px-4 sm:px-6 pb-16 relative z-10">
              <div className="max-w-[850px] mx-auto">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
                    <Sparkles size={13} className="text-violet-400" />
                    <span>Stay Connected &amp; Follow Updates</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white font-display">
                    Official Community &amp; Socials
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* WhatsApp Community Card */}
                  <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-emerald-500/30 bg-[#0B1020]/80 shadow-[0_10px_35px_rgba(0,0,0,0.5),0_0_25px_rgba(16,185,129,0.1)] hover:border-emerald-500/50 hover:shadow-[0_15px_45px_rgba(0,0,0,0.6),0_0_35px_rgba(16,185,129,0.18)] transition-all duration-300 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3.5 mb-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-600/30 border border-white/20">
                          <MessageCircle size={24} color="#ffffff" />
                        </div>
                        <div>
                          <div className="text-[0.72rem] font-bold uppercase tracking-wider text-emerald-400">
                            Instant Updates
                          </div>
                          <h4 className="text-lg font-extrabold text-white font-display">
                            WhatsApp Community
                          </h4>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-5">
                        Get live announcements on event venue, party timings, theme dress code, and performance schedule!
                      </p>
                    </div>

                    <a
                      href={WHATSAPP_GROUP_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-whatsapp w-full py-3.5 text-sm sm:text-base font-bold rounded-xl shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 inline-flex items-center justify-center gap-2"
                    >
                      <MessageCircle size={19} />
                      <span>Join WhatsApp Group</span>
                    </a>
                  </div>

                  {/* Instagram Card */}
                  <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-pink-500/30 bg-[#0B1020]/80 shadow-[0_10px_35px_rgba(0,0,0,0.5),0_0_25px_rgba(236,72,153,0.1)] hover:border-pink-500/50 hover:shadow-[0_15px_45px_rgba(0,0,0,0.6),0_0_35px_rgba(236,72,153,0.18)] transition-all duration-300 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3.5 mb-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] flex items-center justify-center shrink-0 shadow-lg shadow-pink-600/30 border border-white/20">
                          <Instagram size={24} color="#ffffff" />
                        </div>
                        <div>
                          <div className="text-[0.72rem] font-bold uppercase tracking-wider text-pink-400">
                            Official Page
                          </div>
                          <h4 className="text-lg font-extrabold text-white font-display">
                            Follow @mca_buzz
                          </h4>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-5">
                        Catch exclusive event teasers, student reels, behind-the-scenes glimpses, and celebration photo drops!
                      </p>
                    </div>

                    <a
                      href={INSTAGRAM_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-instagram w-full py-3.5 text-sm sm:text-base font-bold rounded-xl shadow-lg shadow-pink-600/30 hover:shadow-pink-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 inline-flex items-center justify-center gap-2 text-white"
                    >
                      <Instagram size={19} />
                      <span>Follow @mca_buzz on Instagram</span>
                    </a>
                  </div>
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

      {/* Clean Footer */}
      <footer className="border-t border-white/10 bg-[#070A13]/90 backdrop-blur-xl py-8 px-4 sm:px-6 text-center relative z-10 mt-auto">
        <div className="max-w-[800px] mx-auto flex flex-col items-center gap-3">
          <div className="flex items-center justify-center gap-2">
            <span className="font-extrabold text-sm sm:text-base tracking-wider text-white font-display">
              MCA FRESHER &amp; FAREWELL CELEBRATION 2026
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-400 m-0">
            Organized with <Heart size={14} className="inline text-rose-500 fill-rose-500 align-middle mx-1" /> by MCA 2nd Year Students for our juniors and outgoing seniors.
          </p>

          <div className="flex items-center justify-center flex-wrap gap-2.5 pt-2">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-pink-500/40 text-slate-300 hover:text-white text-xs font-medium transition-all duration-200"
            >
              <Instagram size={13} className="text-pink-400" />
              <span>Follow <span className="text-pink-300 font-bold">@mca_buzz</span> on Instagram</span>
            </a>

            <a
              href={WHATSAPP_GROUP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-emerald-500/40 text-slate-300 hover:text-white text-xs font-medium transition-all duration-200"
            >
              <MessageCircle size={13} className="text-emerald-400" />
              <span>Official WhatsApp Community</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
