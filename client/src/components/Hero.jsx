import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowDown, IndianRupee, Clock } from 'lucide-react';

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
    <section className="py-12 md:py-16 px-4 sm:px-6 relative z-10">
      <div className="max-w-[920px] mx-auto text-center">
        
        {/* Main Title */}
        <h1 className="text-[2.2rem] sm:text-[3.2rem] md:text-[3.8rem] font-black leading-[1.15] mb-5 tracking-tight font-display">
          <span className="block text-xs sm:text-sm md:text-base font-bold tracking-[0.2em] text-slate-300 uppercase mb-2">
            WELCOME TO THE
          </span>
          <span className="bg-gradient-to-r from-violet-400 via-fuchsia-300 to-amber-300 bg-clip-text text-transparent drop-shadow-[0_2px_20px_rgba(124,58,237,0.35)]">
            MCA FRESHER &amp; FAREWELL
          </span>
          <br />
          <span className="text-white drop-shadow-md">
            CELEBRATION 2026! ✨
          </span>
        </h1>

        {/* Animated Countdown Timer */}
        <div className="my-6 md:my-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-slate-300 text-xs font-semibold uppercase tracking-wider mb-4 shadow-sm backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <Clock size={14} className="text-slate-400" />
            <span>Countdown to Celebration • 1st – 2nd October 2026</span>
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
            A grand milestone brings our department together! To our <strong className="text-violet-300 font-bold">MCA 1st Year juniors</strong>, a warm and enthusiastic welcome to the MCA family! 🎓❤️
          </p>
          <p className="text-slate-300 text-[0.95rem] sm:text-base leading-relaxed mb-4">
            At the same time, we celebrate the remarkable journey, accomplishments, and cherished bonds of our <strong className="text-amber-300 font-bold">MCA 2nd Year seniors</strong> as they get ready for their next big chapter in life! 🌟
          </p>
          <p className="text-slate-300 text-[0.95rem] sm:text-base leading-relaxed mb-5">
            So, this year, we are uniting both batches for one monumental celebration — <strong className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-amber-300 bg-clip-text text-transparent font-extrabold">FRESHER + FAREWELL 2026! 🥳</strong>
          </p>
          <p className="text-slate-400 text-sm sm:text-[0.94rem] leading-relaxed mb-6">
            This registration portal is specially created for <strong className="text-slate-200 font-semibold">both MCA First Year and Second Year students</strong> to confirm your presence, select your performance interests, and share your thoughts to make this celebration truly extraordinary. Let's <strong className="text-slate-200 font-semibold">celebrate friendships, honor our seniors, welcome our juniors</strong>, and make memories that will stay with us forever! ❤️
          </p>

          {/* Slogan Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-violet-950/40 via-fuchsia-950/30 to-violet-950/40 border border-violet-500/30 text-center flex items-center justify-center gap-3 flex-wrap shadow-lg shadow-violet-950/20">
            <Sparkles size={18} className="text-violet-400 shrink-0 animate-pulse" />
            <span className="font-bold text-sm sm:text-base text-slate-100 tracking-wide font-display">
              One Department. Two Batches. One Celebration. Countless Memories.
            </span>
            <Sparkles size={18} className="text-violet-400 shrink-0 animate-pulse" />
          </div>
        </div>

        {/* Entry Fee Information Card */}
        <div className="max-w-[450px] mx-auto my-6 sm:my-8">
          <div className="glass-panel p-4 sm:p-5 flex items-center gap-4 text-left rounded-2xl border-l-4 border-l-violet-500 border-white/10 bg-[#0B1020]/75 hover:border-violet-400/40 hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-950/30 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/10 border border-violet-500/30 flex items-center justify-center shrink-0 shadow-inner">
              <IndianRupee size={22} className="text-violet-300" />
            </div>
            <div>
              <div className="text-[0.72rem] font-bold uppercase tracking-wider text-violet-300">
                Registration / Entry Fee
              </div>
              <div className="text-2xl font-black text-white font-display tracking-tight">
                ₹600
              </div>
              <div className="text-xs text-slate-400">
                Entry fee per student (1st &amp; 2nd Year)
              </div>
            </div>
          </div>
        </div>

        {/* Scroll CTA button */}
        <button
          onClick={onScrollToForm}
          className="btn btn-primary px-8 py-3.5 text-base rounded-full font-bold shadow-xl shadow-violet-600/30 hover:shadow-violet-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 group inline-flex items-center gap-2"
        >
          <span>Fill Out Registration Form</span>
          <ArrowDown size={18} className="transition-transform duration-200 group-hover:translate-y-0.5" />
        </button>

      </div>
    </section>
  );
}
