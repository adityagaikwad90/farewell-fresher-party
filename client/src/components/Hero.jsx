import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowDown, IndianRupee, Clock } from 'lucide-react';

export default function Hero({ onScrollToForm, onScrollToWorkflow }) {
  // Target celebratory date: October 2, 2026 at 12:00 PM
  const calculateTimeLeft = () => {
    const currentYear = new Date().getFullYear();
    const targetDate = new Date(currentYear, 9, 2, 12, 0, 0); // Month 9 is October (0-indexed)
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
    <section className="py-12 md:py-16 px-4 sm:px-6 relative z-10">
      <div className="max-w-[960px] mx-auto text-center">
        
        {/* Event Announcement Chip */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-pink-500/20 to-violet-500/20 border border-amber-400/40 text-amber-300 text-xs sm:text-sm font-black tracking-wider uppercase mb-5 shadow-lg shadow-amber-500/10 backdrop-blur-md animate-pulse-glow">
          <span>🎉🔥 FRESHERS × FAREWELL 2026 — THE CELEBRATION AWAITS! 🔥🎉</span>
        </div>

        {/* Main Title */}
        <h1 className="text-[2.3rem] sm:text-[3.4rem] md:text-[4.2rem] font-black leading-[1.12] mb-4 tracking-tight font-display">
          <span className="block text-xs sm:text-sm md:text-base font-bold tracking-[0.25em] text-slate-300 uppercase mb-2">
            MCA DEPARTMENT PRESENTS
          </span>
          <span className="bg-gradient-to-r from-violet-400 via-fuchsia-300 to-amber-300 bg-clip-text text-transparent drop-shadow-[0_2px_25px_rgba(124,58,237,0.4)]">
            FRESHERS × FAREWELL
          </span>
          <br />
          <span className="text-white drop-shadow-md">
            CELEBRATION 2026! 🥳✨
          </span>
        </h1>

        {/* Dynamic Tagline */}
        <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-[780px] mx-auto leading-relaxed mb-6 font-medium">
          Get ready for an afternoon packed with <span className="text-amber-300 font-bold">fun</span>, <span className="text-pink-300 font-bold">food</span>, <span className="text-cyan-300 font-bold">music</span>, <span className="text-emerald-300 font-bold">games</span>, <span className="text-purple-300 font-bold">performances</span> and <span className="text-white font-bold">unforgettable memories!</span> 🥳❤️
        </p>

        {/* Quick Highlights Strip */}
        <div className="flex items-center justify-center gap-2.5 sm:gap-4 flex-wrap mb-7">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-slate-200 text-xs sm:text-sm font-semibold shadow-sm backdrop-blur-md">
            <Clock size={15} className="text-cyan-400" />
            <span>⏰ 12:00 PM – 6:00 PM</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm font-bold shadow-sm backdrop-blur-md">
            <IndianRupee size={15} className="text-emerald-400" />
            <span>₹600 All-Inclusive Pass</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-500/15 border border-pink-500/30 text-pink-300 text-xs sm:text-sm font-semibold shadow-sm backdrop-blur-md">
            <Sparkles size={15} className="text-pink-400" />
            <span>Juniors × Seniors United</span>
          </div>
        </div>

        {/* Animated Countdown Timer */}
        <div className="my-6 md:my-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-slate-300 text-xs font-semibold uppercase tracking-wider mb-4 shadow-sm backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <Clock size={14} className="text-slate-400" />
            <span>Countdown to Celebration • 2nd October 2026 • 12:00 PM</span>
          </div>

          <div className="flex items-center justify-center gap-2.5 sm:gap-3.5 flex-wrap">
          {[
            { label: 'Days', val: timeLeft.days },
            { label: 'Hours', val: timeLeft.hours },
            { label: 'Minutes', val: timeLeft.minutes },
            { label: 'Seconds', val: timeLeft.seconds }
          ].map((item, idx) => (
            <div
              key={idx}
              className="glass-panel py-2.5 sm:py-3 px-3 sm:px-4 min-w-[72px] sm:min-w-[84px] text-center rounded-2xl border border-white/10 bg-[#0B1020]/75 hover:border-violet-500/40 hover:-translate-y-1 hover:shadow-[0_10px_25px_-5px_rgba(124,58,237,0.25)] transition-all duration-300"
            >
              <div className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white font-display tracking-tight">
                {String(item.val).padStart(2, '0')}
              </div>
              <div className="text-[0.65rem] sm:text-[0.68rem] text-slate-400 uppercase tracking-wider font-bold mt-0.5">
                {item.label}
              </div>
            </div>
          ))}
          </div>
        </div>

        {/* Welcoming Letter Card */}
        <div className="glass-panel p-6 sm:p-9 text-left my-8 relative rounded-3xl border border-white/10 bg-[#0B1020]/80 shadow-2xl shadow-black/50 hover:border-violet-500/30 transition-all duration-300 overflow-hidden">
          {/* Subtle festive gradient top line */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-violet-600 via-fuchsia-500 to-amber-400" />

          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-xl shrink-0 shadow-inner">
              🎓
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight font-display">
              Dear MCA 1st &amp; 2nd Year Students,
            </h3>
          </div>

          <p className="text-slate-300 text-[0.95rem] sm:text-base leading-relaxed mb-4">
            A grand milestone brings our department together! To our <strong className="text-violet-300 font-bold">MCA 1st Year juniors</strong>, a warm and enthusiastic welcome to the MCA family! 🎓✨
          </p>
          <p className="text-slate-300 text-[0.95rem] sm:text-base leading-relaxed mb-4">
            At the same time, we celebrate the remarkable journey, accomplishments, and cherished bonds of our <strong className="text-amber-300 font-bold">MCA 2nd Year seniors</strong> as they get ready for their next big chapter in life! 🌟
          </p>
          <p className="text-slate-300 text-[0.95rem] sm:text-base leading-relaxed mb-5">
            So, this year, we are uniting both batches for one monumental celebration — <strong className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-amber-300 bg-clip-text text-transparent font-extrabold">FRESHERS × FAREWELL 2026! 🥳🔥</strong>
          </p>
          <p className="text-slate-400 text-sm sm:text-[0.94rem] leading-relaxed mb-6">
            Confirm your presence, explore what we have planned for you, pick your performance slots, and get ready for an afternoon that you will remember forever!
          </p>

          {/* Slogan Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-violet-950/40 via-fuchsia-950/30 to-violet-950/40 border border-violet-500/30 text-center flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 shadow-lg shadow-violet-950/20">
            <span className="font-extrabold text-sm sm:text-base text-white tracking-wide font-display">
              🎓 Freshers. Seniors. One Celebration. One Unforgettable Day. ❤️🔥
            </span>
            <span className="text-xs sm:text-sm text-amber-300 font-bold">
              👉 Come participate. Come have fun. Come make memories!
            </span>
          </div>
        </div>

        {/* CTA buttons */}
        <div className="flex items-center justify-center gap-3.5 flex-wrap pt-2">
          <button
            onClick={onScrollToForm}
            className="btn btn-primary px-8 py-3.5 text-base rounded-full font-bold shadow-xl shadow-violet-600/30 hover:shadow-violet-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 group inline-flex items-center gap-2"
          >
            <span>Fill Out Registration Form</span>
            <ArrowDown size={18} className="transition-transform duration-200 group-hover:translate-y-0.5" />
          </button>

          <button
            onClick={onScrollToWorkflow}
            className="btn px-6 py-3.5 text-sm sm:text-base rounded-full font-bold bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 border border-white/10 hover:border-violet-400/40 transition-all duration-200 inline-flex items-center gap-2"
          >
            <span>View Event Flow</span>
            <ArrowDown size={16} className="text-violet-400" />
          </button>
        </div>

      </div>
    </section>
  );
}
