import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, MessageCircle, X, Sparkles, MapPin, ExternalLink, Mail, AlertTriangle, FileText } from 'lucide-react';
import { WHATSAPP_GROUP_URL, VENUE_NAME, VENUE_MAPS_URL, PAYMENT_FORM_URL } from '../config';

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
      colors: ['#7C3AED', '#A855F7', '#06B6D4']
    });
    fire(0.2, {
      spread: 60,
      colors: ['#06B6D4', '#10B981', '#F472B6']
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
    <div className="fixed inset-0 z-50 bg-[#070A13]/85 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div className="glass-panel w-full max-w-[520px] p-6 sm:p-9 relative border border-white/15 bg-[#0B1020]/95 rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.8),0_0_40px_rgba(124,58,237,0.15)] text-center overflow-hidden">
        
        {/* Subtle festive gradient top accent */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-500 via-violet-500 to-amber-400" />

        {/* Close icon button in top right */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-white/[0.06] hover:bg-white/[0.12] text-slate-400 hover:text-white rounded-full w-8 h-8 flex items-center justify-center transition-all duration-200 border border-white/10"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Success Icon with Glowing Ripple */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center mx-auto mb-5 shadow-[0_0_30px_rgba(16,185,129,0.4)] border-2 border-white/20 animate-pulse-glow">
          <CheckCircle2 size={38} color="#ffffff" />
        </div>

        {/* Headline */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles size={14} className="text-emerald-400" />
          <span>Submission Confirmed</span>
          <Sparkles size={14} className="text-emerald-400" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 leading-tight font-display">
          Registration Successful! 🎉
        </h2>

        <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-4 px-1">
          Thank you, <strong className="text-white font-bold">{data?.fullName || 'Student'}</strong>!
          Your registration for the <strong className="text-violet-300 font-bold">MCA Fresher &amp; Farewell Celebration 2026</strong> has been successfully recorded.
        </p>

        {/* Quick summary badges */}
        <div className="flex items-center justify-center gap-2 mb-5 flex-wrap">
          <a
            href={VENUE_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="badge badge-purple text-xs py-1 px-3 hover:scale-105 transition-transform inline-flex items-center gap-1 text-violet-200"
            title="Open Shankra Banquet Hall on Google Maps"
          >
            <MapPin size={12} className="text-violet-400" />
            <span>📍 {VENUE_NAME}</span>
            <ExternalLink size={10} />
          </a>
          <span className="badge badge-purple text-xs py-1 px-3">
            🎓 {data?.year || '1st Year'}
          </span>
          <span className="badge badge-pink text-xs py-1 px-3">
            Div {data?.div || 'A'}
          </span>
          <span className="badge badge-emerald text-xs py-1 px-3 font-bold">
            Fee: ₹600
          </span>
        </div>

        {/* Urgent Flash Notice Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-500/15 via-rose-500/10 to-violet-500/15 border border-amber-400/50 shadow-[0_0_25px_rgba(245,158,11,0.2)] mb-5 text-left relative overflow-hidden">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-1.5 text-amber-300 font-extrabold text-xs uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
              <span>⚡ Important Notice</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[0.7rem] font-black uppercase tracking-wide">
              ⚠️ Limited Seats Available!
            </span>
          </div>

          <div className="space-y-2 mb-3.5 text-xs sm:text-sm text-slate-200">
            <div className="flex items-start gap-2">
              <Mail size={16} className="text-cyan-400 shrink-0 mt-0.5" />
              <p>
                <strong>Passes are generated and sent over your mail!</strong> Please check your registered email inbox.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <FileText size={16} className="text-amber-400 shrink-0 mt-0.5" />
              <p>
                <strong className="text-amber-200">For payment confirmation, please fill this Google Form:</strong>
              </p>
            </div>
          </div>

          <a
            href={PAYMENT_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn w-full py-3 text-xs sm:text-sm font-black rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 text-slate-950 shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 inline-flex items-center justify-center gap-2"
          >
            <FileText size={16} />
            <span>Fill Payment Confirmation Form</span>
            <ExternalLink size={14} />
          </a>
        </div>

        {/* WhatsApp Group Box */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#070A13]/80 border border-emerald-500/30 shadow-inner mb-6 text-left">
          <div className="text-sm font-bold text-white mb-1">
            Next Step: Join the WhatsApp Group
          </div>
          <p className="text-xs text-slate-400 mb-3.5 leading-relaxed">
            Stay updated with event timings, dress code, <strong className="text-slate-200">{VENUE_NAME}</strong> directions &amp; performance slots!
          </p>

          <a
            href={WHATSAPP_GROUP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-whatsapp w-full py-3 text-sm sm:text-base font-bold rounded-xl shadow-lg shadow-emerald-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 inline-flex items-center justify-center gap-2"
          >
            <MessageCircle size={18} />
            <span>Join Official WhatsApp Group</span>
          </a>
        </div>

        {/* Action button */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={onClose}
            className="btn btn-primary w-full py-3 text-sm sm:text-base font-bold rounded-xl shadow-lg shadow-violet-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 justify-center"
          >
            <span>Done / View Registration</span>
          </button>
          <div className="text-[0.72rem] sm:text-xs text-slate-400 flex items-center justify-center gap-1.5 mt-1">
            <span>🔒 Entry recorded • Duplicate submissions are restricted</span>
          </div>
        </div>

      </div>
    </div>
  );
}
