import React from 'react';
import { GraduationCap, Sparkles } from 'lucide-react';

export default function Navbar({ onLogoClick }) {
  return (
    <header className="sticky top-0 z-50 bg-[#070A13]/75 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/30 transition-all duration-300 py-3.5 px-4 md:px-6">
      <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4">
        {/* Brand / Logo */}
        <div
          onClick={onLogoClick}
          className="group flex items-center gap-3 cursor-pointer select-none transition-transform duration-200 hover:scale-[1.01]"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 flex items-center justify-center shadow-md shadow-violet-600/30 group-hover:shadow-violet-600/50 group-hover:scale-105 transition-all duration-300 border border-white/20">
            <GraduationCap size={22} color="#ffffff" className="transition-transform duration-300 group-hover:rotate-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-[1.1rem] tracking-tight text-white group-hover:text-violet-200 transition-colors duration-200 font-display">
                MCA FEST 2026
              </span>
              <span className="badge badge-purple py-0.5 px-2 text-[0.7rem] shadow-sm">
                <Sparkles size={11} className="text-violet-300" /> Fresher &amp; Farewell
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium tracking-wide">
              Two Batches • One Celebration
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
