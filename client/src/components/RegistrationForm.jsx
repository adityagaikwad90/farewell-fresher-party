import React, { useState } from 'react';
import {
  User,
  GraduationCap,
  Mic,
  Music,
  Laugh,
  Sparkles,
  PartyPopper,
  AlertCircle,
  RotateCcw,
  Send,
  ShieldCheck,
  Ticket
} from 'lucide-react';
import { API_BASE } from '../config';

export default function RegistrationForm({ onSubmitSuccess }) {
  const initialFormData = {
    fullName: '',
    contact: '',
    email: '',
    year: '',
    div: '',
    talent: '',
    otherTalent: '',
    partyWishes: '',
    gameSuggestion: ''
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [conflictData, setConflictData] = useState(null);

  // Check if this attendee has already submitted from this device
  const [savedPass, setSavedPass] = useState(() => {
    try {
      const stored = localStorage.getItem('mca2026_attendee_pass');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });

  const talents = [
    { id: 'SINGING', label: 'Singing', icon: Mic, color: '#A78BFA', bgClass: 'from-violet-500/20 to-purple-500/10' },
    { id: 'DANCING', label: 'Dancing', icon: Music, color: '#F472B6', bgClass: 'from-pink-500/20 to-fuchsia-500/10' },
    { id: 'STAND UP COMEDY', label: 'Stand Up Comedy', icon: Laugh, color: '#FBBF24', bgClass: 'from-amber-500/20 to-yellow-500/10' },
    { id: 'Other', label: 'Other Talent', icon: Sparkles, color: '#38BDF8', bgClass: 'from-cyan-500/20 to-blue-500/10' }
  ];

  const validateField = (field, value) => {
    const trimmedValue = value.trim();

    if (field === 'fullName') {
      if (!trimmedValue) return 'Full Name is required.';
      if (!/^[A-Za-z][A-Za-z\s.'-]{1,49}$/.test(trimmedValue)) {
        return 'Name must contain only letters, spaces, apostrophes, periods, or hyphens.';
      }
    }

    if (field === 'contact') {
      if (!trimmedValue) return 'Contact number is required.';
      if (!/^[6-9]\d{9}$/.test(trimmedValue)) {
        return 'Please enter a valid 10-digit mobile number.';
      }
    }

    if (field === 'email') {
      if (!trimmedValue) return 'Email address is required.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmedValue)) {
        return 'Please enter a valid email address.';
      }
    }

    return '';
  };

  const validate = () => {
    const newErrors = {};
    ['fullName', 'contact', 'email'].forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });
    if (!formData.year) {
      newErrors.year = 'Please select your Academic Year (1st Year or 2nd Year).';
    }
    if (!formData.div) {
      newErrors.div = 'Please select your Division (A or B).';
    }
    if (formData.talent === 'Other' && !formData.otherTalent.trim()) {
      newErrors.otherTalent = 'Please specify your talent or performance details.';
    }
    return newErrors;
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    setServerError('');
    setConflictData(null);
  };

  const handleBlur = (field) => {
    const error = validateField(field, formData[field]);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear the form?')) {
      setFormData(initialFormData);
      setErrors({});
      setServerError('');
      setConflictData(null);
    }
  };

  const handleResetSession = () => {
    if (window.confirm('Are you sure you want to clear your local session to fill a new form?')) {
      localStorage.removeItem('mca2026_attendee_pass');
      setSavedPass(null);
      setFormData(initialFormData);
      setServerError('');
      setConflictData(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      window.scrollTo({ top: 380, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    setServerError('');
    setConflictData(null);

    try {
      const response = await fetch(`${API_BASE}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 409 || result.conflict) {
          setConflictData(result.existing || true);
          throw new Error(result.error || 'A registration with this email or contact already exists.');
        }
        throw new Error(result.error || 'Failed to submit registration');
      }

      // Save pass locally so this user cannot submit again
      try {
        localStorage.setItem('mca2026_attendee_pass', JSON.stringify(result.data));
      } catch (err) {
        console.warn('LocalStorage save failed:', err);
      }

      setSavedPass(result.data);
      setFormData(initialFormData);
      onSubmitSuccess(result.data);
    } catch (err) {
      console.error(err);
      setServerError(err.message || 'Network error occurred. Please try again.');
      window.scrollTo({ top: 380, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // If the user already registered, display the "Already Registered" confirmation view
  if (savedPass) {
    return (
      <section id="registration-form" className="py-6 sm:py-8 px-4 sm:px-6 relative z-10 pb-20">
        <div className="max-w-[740px] mx-auto">
          <div className="glass-panel p-7 sm:p-11 rounded-3xl border border-emerald-500/40 bg-[#0B1020]/85 shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_35px_rgba(16,185,129,0.15)] text-center relative overflow-hidden">
            
            {/* Ambient emerald subtle glow */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs sm:text-sm font-bold tracking-wider mb-5 uppercase shadow-sm">
              <ShieldCheck size={16} />
              <span>Response Already Submitted</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 tracking-tight font-display">
              You Are Registered! 🎉
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-[540px] mx-auto mb-7 leading-relaxed">
              Welcome aboard, <strong className="text-white font-bold">{savedPass.fullName}</strong>! Your registration is already confirmed.
              To avoid duplicate entries and data redundancy, multiple submissions are restricted.
            </p>

            {/* Pass Info Box */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 sm:p-6 mb-7 text-left shadow-inner">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
                <div>
                  <div className="text-[0.7rem] sm:text-xs text-slate-400 uppercase font-bold tracking-wider">Pass ID</div>
                  <div className="text-base sm:text-lg font-black text-violet-400 mt-1 font-display">
                    {savedPass.regNumber || 'MCA26-CONFIRMED'}
                  </div>
                </div>
                <div>
                  <div className="text-[0.7rem] sm:text-xs text-slate-400 uppercase font-bold tracking-wider">Year &amp; Div</div>
                  <div className="text-base sm:text-lg font-bold text-white mt-1">
                    {savedPass.year || '1st Year'} • Div {savedPass.div || 'A'}
                  </div>
                </div>
                <div>
                  <div className="text-[0.7rem] sm:text-xs text-slate-400 uppercase font-bold tracking-wider">Talent Slot</div>
                  <div className="text-base sm:text-lg font-bold text-fuchsia-300 mt-1 truncate">
                    {savedPass.talent || 'None'}
                  </div>
                </div>
                <div>
                  <div className="text-[0.7rem] sm:text-xs text-slate-400 uppercase font-bold tracking-wider">Entry Fee</div>
                  <div className="text-base sm:text-lg font-bold text-emerald-400 mt-1 font-display">
                    ₹600
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3.5 max-w-[380px] mx-auto">
              <button
                type="button"
                onClick={() => onSubmitSuccess(savedPass)}
                className="btn btn-primary w-full py-3.5 text-base justify-center shadow-lg shadow-violet-600/30"
              >
                <Ticket size={18} />
                <span>View Full Digital Pass</span>
              </button>

              <button
                type="button"
                onClick={handleResetSession}
                className="bg-transparent border-0 text-slate-500 text-xs sm:text-sm cursor-pointer mt-1 underline hover:text-slate-400 transition-colors duration-200"
              >
                Registering for another person on this shared device? Click here
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="registration-form" className="py-6 sm:py-8 px-4 sm:px-6 relative z-10 pb-20">
      <div className="max-w-[800px] mx-auto">
        
        {/* Form Header Card */}
        <div className="glass-panel form-panel border-t-[3px] border-t-violet-500 rounded-3xl bg-[#0B1020]/80 shadow-2xl shadow-black/40">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-1 tracking-tight font-display">
                MCA 1st &amp; 2nd Year Student Registration
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm">
                Fill in the details below to confirm your spot in the celebration event • Entry fee: <strong className="text-emerald-400 font-bold">₹600</strong>
              </p>
            </div>
            <div className="text-xs text-rose-400 font-semibold flex items-center gap-1">
              <span>* Indicates required question</span>
            </div>
          </div>
        </div>

        {serverError && (
          <div
            className={`p-4 sm:p-5 rounded-2xl mb-6 flex flex-col gap-2.5 animate-fadeIn border ${
              conflictData
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-200'
                : 'bg-rose-500/15 border-rose-500/40 text-rose-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <AlertCircle size={22} className={conflictData ? 'text-amber-400' : 'text-rose-400'} style={{ flexShrink: 0 }} />
              <div>
                <strong className="block text-base text-white font-bold mb-0.5">
                  {conflictData ? '⚠️ Duplicate Submission Blocked' : 'Submission Error'}
                </strong>
                <span className="text-sm leading-relaxed">{serverError}</span>
              </div>
            </div>

            {conflictData && typeof conflictData === 'object' && conflictData.regNumber && (
              <div className="mt-1 p-3 bg-black/30 rounded-xl flex items-center justify-between flex-wrap gap-2 text-xs sm:text-sm border border-white/5">
                <span>Existing Pass ID: <strong className="text-violet-400">{conflictData.regNumber}</strong></span>
                <span>Attendee: <strong className="text-white">{conflictData.fullName}</strong></span>
                <span>Year: <strong className="text-amber-300">{conflictData.year || '1st Year'}</strong></span>
                <span>Division: <strong className="text-cyan-400">{conflictData.div}</strong></span>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Section 1: Basic Information */}
          <div className="glass-panel form-panel rounded-3xl bg-[#0B1020]/80 shadow-2xl shadow-black/40">
            <h3 className="text-lg sm:text-xl font-bold mb-5 flex items-center gap-2.5 text-slate-100 font-display">
              <span className="w-8 h-8 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-violet-400 shrink-0">
                <User size={16} />
              </span>
              <span>Student Identity</span>
            </h3>

            {/* FULL NAME */}
            <div className="form-group">
              <label className="form-label" htmlFor="fullName">
                <span>FULL NAME</span>
                <span className="required-star">*</span>
              </label>
              <input
                id="fullName"
                type="text"
                className="form-input"
                placeholder="e.g. Rahul Sharma"
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                onBlur={() => handleBlur('fullName')}
                aria-invalid={Boolean(errors.fullName)}
                aria-describedby={errors.fullName ? 'fullName-error' : undefined}
              />
              {errors.fullName && <p id="fullName-error" className="form-error">{errors.fullName}</p>}
            </div>

            {/* CONTACT */}
            <div className="form-group">
              <label className="form-label" htmlFor="contact">
                <span>CONTACT NUMBER</span>
                <span className="required-star">*</span>
              </label>
              <div className="relative">
                <input
                  id="contact"
                  type="tel"
                  className="form-input"
                  placeholder="e.g. 9876543210"
                  value={formData.contact}
                  onChange={(e) => handleChange('contact', e.target.value)}
                  onBlur={() => handleBlur('contact')}
                  inputMode="numeric"
                  maxLength={10}
                  aria-invalid={Boolean(errors.contact)}
                  aria-describedby={errors.contact ? 'contact-error' : undefined}
                />
              </div>
              {errors.contact && <p id="contact-error" className="form-error">{errors.contact}</p>}
            </div>

            {/* EMAIL ID */}
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                <span>EMAIL ID</span>
                <span className="required-star">*</span>
              </label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="e.g. rahul.sharma@college.edu"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {errors.email && <p id="email-error" className="form-error">{errors.email}</p>}
            </div>

            {/* ACADEMIC YEAR */}
            <div className="form-group">
              <label className="form-label">
                <span>ACADEMIC YEAR</span>
                <span className="required-star">*</span>
              </label>
              <div className="division-grid">
                {[
                  { id: '1st Year', title: '1st Year', subtitle: 'Fresher Batch', icon: Sparkles },
                  { id: '2nd Year', title: '2nd Year', subtitle: 'Senior / Outgoing Batch', icon: GraduationCap }
                ].map((yr) => {
                  const isSelected = formData.year === yr.id;
                  const YrIcon = yr.icon;
                  return (
                    <div
                      key={yr.id}
                      onClick={() => handleChange('year', yr.id)}
                      className={`division-option ${
                        isSelected
                          ? 'bg-violet-600/15 border-violet-500 shadow-lg shadow-violet-500/15 ring-1 ring-violet-500/40'
                          : 'bg-[#070A13]/60 border-white/10 hover:border-white/20'
                      } border cursor-pointer`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 overflow-hidden">
                        <div
                          className={`w-[18px] h-[18px] rounded-full shrink-0 transition-all duration-200 ${
                            isSelected
                              ? 'border-[5px] border-violet-500 bg-[#070A13]'
                              : 'border-2 border-white/25 bg-transparent'
                          }`}
                        />
                        <div className="truncate">
                          <span className={`font-bold text-sm sm:text-base block ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                            {yr.title}
                          </span>
                          <span className="text-[0.68rem] text-slate-400 font-medium block">
                            {yr.subtitle}
                          </span>
                        </div>
                      </div>
                      <YrIcon size={18} className={isSelected ? 'text-violet-400 shrink-0' : 'text-slate-500 shrink-0'} />
                    </div>
                  );
                })}
              </div>
              {errors.year && <p className="form-error mt-2">{errors.year}</p>}
            </div>

            {/* DIV */}
            <div className="form-group mb-0">
              <label className="form-label">
                <span>DIVISION (DIV)</span>
                <span className="required-star">*</span>
              </label>
              <div className="division-grid">
                {['A', 'B'].map((division) => {
                  const isSelected = formData.div === division;
                  return (
                    <div
                      key={division}
                      onClick={() => handleChange('div', division)}
                      className={`division-option ${
                        isSelected
                          ? 'bg-violet-600/15 border-violet-500 shadow-lg shadow-violet-500/15 ring-1 ring-violet-500/40'
                          : 'bg-[#070A13]/60 border-white/10 hover:border-white/20'
                      } border`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 overflow-hidden">
                        <div
                          className={`w-[18px] h-[18px] rounded-full shrink-0 transition-all duration-200 ${
                            isSelected
                              ? 'border-[5px] border-violet-500 bg-[#070A13]'
                              : 'border-2 border-white/25 bg-transparent'
                          }`}
                        />
                        <span className={`font-bold text-sm sm:text-base whitespace-nowrap ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                          Division {division}
                        </span>
                      </div>
                      <GraduationCap size={18} className={isSelected ? 'text-violet-400 shrink-0' : 'text-slate-500 shrink-0'} />
                    </div>
                  );
                })}
              </div>
              {errors.div && <p className="form-error mt-2">{errors.div}</p>}
            </div>
          </div>

          {/* Section 2: Talent & Event Registration */}
          <div className="glass-panel form-panel rounded-3xl bg-[#0B1020]/80 shadow-2xl shadow-black/40">
            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
              <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2.5 text-slate-100 font-display">
                <span className="w-8 h-8 rounded-lg bg-fuchsia-500/20 border border-fuchsia-500/30 flex items-center justify-center text-fuchsia-400 shrink-0">
                  <Sparkles size={16} />
                </span>
                <span>Talent &amp; Event Registration</span>
              </h3>
              <span className="badge badge-purple">Optional Showcase</span>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm mb-5">
              Want to take the spotlight on stage? Choose your performance category:
            </p>

            <div className="talent-grid">
              {talents.map((item) => {
                const IconComponent = item.icon;
                const isSelected = formData.talent === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleChange('talent', isSelected ? '' : item.id)}
                    className={`talent-card border transition-all duration-200 ${
                      isSelected
                        ? 'bg-violet-600/15 border-violet-500 shadow-xl shadow-violet-500/20 ring-1 ring-violet-500/40 -translate-y-1'
                        : 'bg-[#070A13]/60 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center transition-transform duration-200 ${
                        isSelected ? 'bg-violet-500/25 scale-105 shadow-inner' : 'bg-white/[0.04]'
                      }`}
                    >
                      <IconComponent size={20} color={isSelected ? '#FFFFFF' : item.color} />
                    </div>
                    <span className={`text-xs sm:text-sm font-bold tracking-tight ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Custom Talent field when Other is selected */}
            {formData.talent === 'Other' && (
              <div className="p-4 sm:p-5 rounded-2xl bg-cyan-500/[0.06] border border-cyan-500/30 mt-3 animate-fadeIn">
                <label className="form-label" htmlFor="otherTalent">
                  <span>Please describe your talent / performance:</span>
                  <span className="required-star">*</span>
                </label>
                <input
                  id="otherTalent"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Magic show, Poetry, Instrumental (Guitar/Keyboard), Beatboxing..."
                  value={formData.otherTalent}
                  onChange={(e) => handleChange('otherTalent', e.target.value)}
                />
                {errors.otherTalent && <p className="form-error">{errors.otherTalent}</p>}
              </div>
            )}
          </div>

          {/* Section 3: Party Vibes & Ideas */}
          <div className="glass-panel form-panel rounded-3xl bg-[#0B1020]/80 shadow-2xl shadow-black/40">
            <h3 className="text-lg sm:text-xl font-bold mb-5 flex items-center gap-2.5 text-slate-100 font-display">
              <span className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <PartyPopper size={16} />
              </span>
              <span>Party Ideas &amp; Suggestions</span>
            </h3>

            {/* What would you like to see at the Fresher & Farewell Party? */}
            <div className="form-group">
              <label className="form-label" htmlFor="partyWishes">
                <span>What would you like to see at the Fresher &amp; Farewell Party?</span>
              </label>
              <textarea
                id="partyWishes"
                className="form-textarea"
                placeholder="Share your music preferences, DJ expectations, themes, decor ideas, special moments..."
                value={formData.partyWishes}
                onChange={(e) => handleChange('partyWishes', e.target.value)}
              />
            </div>

            {/* Suggest a fun activity/game for the party */}
            <div className="form-group mb-0">
              <label className="form-label" htmlFor="gameSuggestion">
                <span>Suggest a fun activity / game for the party</span>
              </label>
              <textarea
                id="gameSuggestion"
                className="form-textarea"
                placeholder="e.g. Ramp Walk, Senior-Junior interactive games, Blindfold challenge, Musical chairs, Trivia quiz, Dumb charades..."
                value={formData.gameSuggestion}
                onChange={(e) => handleChange('gameSuggestion', e.target.value)}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="form-actions flex items-center justify-between flex-wrap gap-4 mt-8">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary px-8 py-3.5 text-base rounded-xl font-bold shadow-xl shadow-violet-600/30 hover:shadow-violet-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 inline-flex items-center gap-2"
              style={{
                opacity: isSubmitting ? 0.7 : 1,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
              }}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Submitting Response...</span>
                </>
              ) : (
                <>
                  <Send size={18} />
                  <span>Submit Registration</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleClear}
              className="btn btn-secondary px-6 py-3 text-sm rounded-xl font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 inline-flex items-center gap-2"
            >
              <RotateCcw size={16} />
              <span>Clear form</span>
            </button>
          </div>
        </form>

      </div>
    </section>
  );
}
