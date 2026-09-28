import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import EventWorkflow from './components/EventWorkflow';
import RegistrationForm from './components/RegistrationForm';
import SuccessModal from './components/SuccessModal';
import AdminPanel from './components/AdminPanel';
import BackgroundEffects from './components/BackgroundEffects';
import { Heart, MessageCircle, Instagram, Sparkles, MapPin } from 'lucide-react';
import { INSTAGRAM_URL, WHATSAPP_GROUP_URL, VENUE_NAME, VENUE_MAPS_URL, PAYMENT_FORM_URL } from './config';

export default function App() {
  // Direct route detection from URL (e.g. /admin, #admin, /checkin, #checkin)
  const isInitialCheckIn = () => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    return path === '/checkin' || path.startsWith('/checkin') || hash === '#checkin' || hash === '#venue';
  };

  const isInitialAdmin = () => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    return path === '/admin' || path.startsWith('/admin') || hash === '#admin' || isInitialCheckIn();
  };

  const [currentView, setCurrentView] = useState(isInitialAdmin() ? 'admin' : 'register');
  const [adminDefaultTab, setAdminDefaultTab] = useState(isInitialCheckIn() ? 'checkin' : 'overview');
  const [submittedData, setSubmittedData] = useState(null);

  useEffect(() => {
    // Listen to browser URL changes
    const handlePopState = () => {
      if (isInitialAdmin()) {
        setCurrentView('admin');
        if (isInitialCheckIn()) {
          setAdminDefaultTab('checkin');
        }
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

  const navigateToAdmin = (tab = 'overview') => {
    setAdminDefaultTab(tab);
    window.history.pushState(null, '', tab === 'checkin' ? '#checkin' : '#admin');
    setCurrentView('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScrollToForm = () => {
    if (currentView !== 'register') {
      setCurrentView('register');
      setTimeout(() => {
        const el = document.getElementById('registration-form');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById('registration-form');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleScrollToWorkflow = () => {
    if (currentView !== 'register') {
      setCurrentView('register');
      setTimeout(() => {
        const el = document.getElementById('workflow');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById('workflow');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleSuccess = (record) => {
    setSubmittedData(record);
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-[#070A13] text-[#F8FAFC] selection:bg-violet-600 selection:text-white">
      {/* Background Particle and Aurora Lights */}
      <BackgroundEffects />

      {/* Top Flash Announcement Ticker Bar */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 text-white text-xs sm:text-[0.82rem] font-bold py-2 px-3 sm:px-4 shadow-md relative z-50 text-center flex items-center justify-center flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 bg-black/25 px-2.5 py-0.5 rounded-full text-[0.7rem] uppercase tracking-wider font-extrabold text-amber-200 border border-white/20">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-ping" />
          Limited Seats Available!
        </span>
        <span>Passes are generated &amp; sent over your mail!</span>
        <span className="hidden md:inline">•</span>
        <span className="text-amber-100">For payment confirmation, fill Google Form:</span>
        <a
          href={PAYMENT_FORM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 bg-white text-slate-900 px-2.5 py-0.5 rounded-full text-[0.72rem] font-black hover:bg-amber-100 transition-colors shadow-sm ml-1"
        >
          <span>Fill Form</span>
          <span>↗</span>
        </a>
      </div>

      {/* Navigation Bar (With Event Flow & Register Quick Links) */}
      <Navbar
        onLogoClick={navigateToRegister}
        onWorkflowClick={handleScrollToWorkflow}
        onRegisterClick={handleScrollToForm}
      />

      {/* Main Page View */}
      <main className="flex-1 relative z-10">
        {currentView === 'register' ? (
          <>
            <Hero
              onScrollToForm={handleScrollToForm}
              onScrollToWorkflow={handleScrollToWorkflow}
            />
            <RegistrationForm onSubmitSuccess={handleSuccess} />
            <EventWorkflow />

            {/* Official Community & Socials */}
            <section id="community" className="px-4 sm:px-6 pb-16 relative z-10">
              <div className="max-w-[850px] mx-auto">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
                    <Sparkles size={13} className="text-violet-400" />
                    <span>Stay Connected &amp; Follow Updates</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white font-display">
                    Official Community &amp; Venue
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* WhatsApp Community Card */}
                  <div className="glass-panel p-5 rounded-3xl border border-emerald-500/30 bg-[#0B1020]/80 shadow-[0_10px_35px_rgba(0,0,0,0.5),0_0_25px_rgba(16,185,129,0.1)] hover:border-emerald-500/50 hover:shadow-[0_15px_45px_rgba(0,0,0,0.6),0_0_35px_rgba(16,185,129,0.18)] transition-all duration-300 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3.5 mb-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-600/30 border border-white/20">
                          <MessageCircle size={24} color="#ffffff" />
                        </div>
                        <div>
                          <div className="text-[0.72rem] font-bold uppercase tracking-wider text-emerald-400">
                            Instant Updates
                          </div>
                          <h4 className="text-base sm:text-lg font-extrabold text-white font-display">
                            WhatsApp Community
                          </h4>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-5">
                        Get live announcements for <strong className="text-white font-semibold">{VENUE_NAME}</strong>, party timings, theme dress code &amp; schedules!
                      </p>
                    </div>

                    <a
                      href={WHATSAPP_GROUP_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-whatsapp w-full py-3 text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 inline-flex items-center justify-center gap-2"
                    >
                      <MessageCircle size={18} />
                      <span>Join WhatsApp Group</span>
                    </a>
                  </div>

                  {/* Venue Location Card */}
                  <div className="glass-panel p-5 rounded-3xl border border-violet-500/30 bg-[#0B1020]/80 shadow-[0_10px_35px_rgba(0,0,0,0.5),0_0_25px_rgba(124,58,237,0.1)] hover:border-violet-500/50 hover:shadow-[0_15px_45px_rgba(0,0,0,0.6),0_0_35px_rgba(124,58,237,0.18)] transition-all duration-300 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3.5 mb-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-violet-600/30 border border-white/20">
                          <MapPin size={24} color="#ffffff" />
                        </div>
                        <div>
                          <div className="text-[0.72rem] font-bold uppercase tracking-wider text-violet-400">
                            Party Destination
                          </div>
                          <h4 className="text-base sm:text-lg font-extrabold text-white font-display truncate">
                            {VENUE_NAME}
                          </h4>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-5">
                        Experience our grand celebration at Shankra Banquet Hall with delicious catering &amp; DJ stage!
                      </p>
                    </div>

                    <a
                      href={VENUE_MAPS_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary w-full py-3 text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-violet-600/30 hover:shadow-violet-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 inline-flex items-center justify-center gap-2 text-white"
                    >
                      <MapPin size={18} />
                      <span>Get Maps Directions</span>
                    </a>
                  </div>

                  {/* Instagram Card */}
                  <div className="glass-panel p-5 rounded-3xl border border-pink-500/30 bg-[#0B1020]/80 shadow-[0_10px_35px_rgba(0,0,0,0.5),0_0_25px_rgba(236,72,153,0.1)] hover:border-pink-500/50 hover:shadow-[0_15px_45px_rgba(0,0,0,0.6),0_0_35px_rgba(236,72,153,0.18)] transition-all duration-300 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3.5 mb-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] flex items-center justify-center shrink-0 shadow-lg shadow-pink-600/30 border border-white/20">
                          <Instagram size={24} color="#ffffff" />
                        </div>
                        <div>
                          <div className="text-[0.72rem] font-bold uppercase tracking-wider text-pink-400">
                            Official Page
                          </div>
                          <h4 className="text-base sm:text-lg font-extrabold text-white font-display">
                            Follow @mca_buzz
                          </h4>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-5">
                        Catch exclusive event teasers, student reels, behind-the-scenes glimpses &amp; photo drops!
                      </p>
                    </div>

                    <a
                      href={INSTAGRAM_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-instagram w-full py-3 text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-pink-600/30 hover:shadow-pink-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 inline-flex items-center justify-center gap-2 text-white"
                    >
                      <Instagram size={18} />
                      <span>Follow @mca_buzz</span>
                    </a>
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : (
          <AdminPanel
            onBackToForm={navigateToRegister}
            defaultTab={adminDefaultTab}
          />
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
            Organized with <Heart size={14} className="inline text-rose-500 fill-rose-500 align-middle mx-1" /> for MCA 1st &amp; 2nd Year Students • Two Batches, One Celebration.
          </p>

          <div className="flex items-center justify-center flex-wrap gap-2.5 pt-2">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-pink-500/40 text-slate-300 hover:text-white text-xs font-medium transition-all duration-200"
            >
              <Instagram size={13} className="text-pink-400" />
              <span>Follow <span className="text-pink-300 font-bold">@mca_buzz</span></span>
            </a>

            <a
              href={WHATSAPP_GROUP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-emerald-500/40 text-slate-300 hover:text-white text-xs font-medium transition-all duration-200"
            >
              <MessageCircle size={13} className="text-emerald-400" />
              <span>WhatsApp Community</span>
            </a>

            <button
              onClick={() => navigateToAdmin('overview')}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 text-slate-500 hover:text-slate-300 text-[0.72rem] font-medium transition-all duration-200 cursor-pointer"
            >
              <span>Admin Portal</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
