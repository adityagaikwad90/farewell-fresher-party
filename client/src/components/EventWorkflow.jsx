import React from 'react';
import { Clock, IndianRupee, MapPin, Sparkles, ExternalLink, Navigation } from 'lucide-react';
import { VENUE_NAME, VENUE_MAPS_URL } from '../config';

export default function EventWorkflow() {
  const steps = [
    {
      num: '01',
      title: 'GRAND WELCOME',
      emoji: '👑',
      desc: 'We kick things off with a grand welcome for our freshers & seniors! 🎓✨',
      badge: 'Red Carpet Entry'
    },
    {
      num: '02',
      title: 'WELCOME DRINKS',
      emoji: '🥤',
      desc: 'Start the celebration with a refreshing welcome drink! 🍹',
      badge: 'Chilled & Refreshing'
    },
    {
      num: '03',
      title: 'STARTERS',
      emoji: '🍽️',
      desc: 'Time to grab some delicious starters and get ready for the fun ahead! 😋',
      badge: 'Hot Appetizers'
    },
    {
      num: '04',
      title: 'FUN ACTIVITIES & GAMES',
      emoji: '🎯',
      desc: 'Challenge your friends, compete, laugh and make some amazing memories! 🔥😂',
      badge: 'Interactive Fun'
    },
    {
      num: '05',
      title: 'PERFORMANCES',
      emoji: '🎤',
      desc: 'Music, dance and amazing performances to keep the energy high! 💃🕺🎶',
      badge: 'Live Stage'
    },
    {
      num: '06',
      title: 'DJ HALL — LET’S DANCE!',
      emoji: '🎧',
      desc: 'Turn up the music and show us your moves! 🔥🎶',
      badge: 'Dance Floor Hype'
    },
    {
      num: '07',
      title: 'RAMP WALK',
      emoji: '👠✨',
      desc: 'Bring out your style, confidence and personality! 😎🔥',
      badge: 'Fashion & Style'
    },
    {
      num: '08',
      title: 'MR. & MISS FRESHER',
      emoji: '👑',
      desc: 'Who will take the crown? 🏆 Walk the ramp, show your personality and make your mark! 👑✨',
      badge: 'The Crowning'
    },
    {
      num: '09',
      title: 'LUNCH & FINAL CELEBRATION',
      emoji: '🍱',
      desc: 'End the day with great food, great people and even better memories! ❤️',
      badge: 'Grand Feast'
    }
  ];

  return (
    <section id="workflow" className="py-12 sm:py-16 px-4 sm:px-6 relative z-10">
      <div className="max-w-[850px] mx-auto">
        
        {/* Simple Section Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles size={13} className="text-amber-400" />
            <span>Celebration Flow</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white font-display tracking-tight mb-2">
            ✨ Here’s What We Have Planned For You:
          </h2>
          <p className="text-sm sm:text-base text-slate-300">
            Get ready for an afternoon packed with <strong className="text-white font-semibold">fun, food, music, games, performances and unforgettable memories!</strong> 🥳❤️
          </p>
        </div>

        {/* Clean, Simple 9-Step Timeline List */}
        <div className="glass-panel p-5 sm:p-7 rounded-3xl border border-white/10 bg-[#0B1020]/80 shadow-2xl shadow-black/50 mb-6">
          <div className="divide-y divide-white/5">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="py-3.5 first:pt-0 last:pb-0 flex items-start gap-3.5 sm:gap-4 hover:bg-white/[0.02] px-2 rounded-xl transition-colors duration-150"
              >
                {/* Number & Emoji Icon */}
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center shrink-0 text-xl shadow-inner mt-0.5">
                  <span>{step.emoji}</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-0.5">
                    <h3 className="text-sm sm:text-base font-extrabold text-white font-display tracking-tight">
                      {step.title}
                    </h3>
                    <span className="text-[0.68rem] font-bold text-violet-400 uppercase tracking-wider bg-violet-500/10 px-2 py-0.5 rounded-full border border-violet-500/20">
                      {step.badge}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Event Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <a
            href={VENUE_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-panel p-4 rounded-2xl border border-violet-500/30 bg-[#0B1020]/75 flex items-center gap-3 hover:border-violet-400 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 group"
          >
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center shrink-0 group-hover:bg-violet-500/30 transition-colors">
              <MapPin size={20} className="text-violet-400" />
            </div>
            <div className="min-w-0">
              <div className="text-[0.68rem] uppercase font-bold text-violet-400 tracking-wider flex items-center gap-1">
                <span>Venue</span>
                <ExternalLink size={10} />
              </div>
              <div className="text-sm font-extrabold text-white font-display truncate">
                {VENUE_NAME}
              </div>
            </div>
          </a>

          <div className="glass-panel p-4 rounded-2xl border border-white/10 bg-[#0B1020]/75 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center shrink-0">
              <Clock size={20} className="text-cyan-300" />
            </div>
            <div>
              <div className="text-[0.68rem] uppercase font-bold text-slate-400 tracking-wider">Event Time</div>
              <div className="text-sm font-extrabold text-white font-display">12:00 PM – 6:00 PM</div>
            </div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-emerald-500/25 bg-[#0B1020]/75 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <IndianRupee size={20} className="text-emerald-300" />
            </div>
            <div>
              <div className="text-[0.68rem] uppercase font-bold text-emerald-400 tracking-wider">Entry Fee</div>
              <div className="text-sm font-extrabold text-white font-display">₹600 All-Inclusive</div>
            </div>
          </div>
        </div>

        {/* Venue Navigation Banner */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-violet-950/40 via-[#0B1020]/90 to-fuchsia-950/30 border border-violet-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Navigation size={20} className="text-amber-400" />
            </div>
            <div>
              <div className="text-xs uppercase font-bold text-amber-300 tracking-wider">
                Event Location &amp; Directions
              </div>
              <div className="text-sm sm:text-base font-extrabold text-white font-display">
                {VENUE_NAME}
              </div>
            </div>
          </div>

          <a
            href={VENUE_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-violet-600/30 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 inline-flex items-center gap-2 whitespace-nowrap"
          >
            <MapPin size={15} />
            <span>Open in Google Maps</span>
            <ExternalLink size={13} />
          </a>
        </div>

      </div>
    </section>
  );
}
