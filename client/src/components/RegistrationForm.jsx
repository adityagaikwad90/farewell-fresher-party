import React, { useState } from 'react';
import {
  User,
  Phone,
  Mail,
  GraduationCap,
  Mic,
  Music,
  Laugh,
  Sparkles,
  PartyPopper,
  Gamepad2,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Send,
  MessageCircle,
  ShieldCheck,
  Ticket,
  Calendar
} from 'lucide-react';
import { API_BASE } from '../config';

export default function RegistrationForm({ onSubmitSuccess }) {
  const initialFormData = {
    fullName: '',
    contact: '',
    email: '',
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
    { id: 'SINGING', label: 'Singing', icon: Mic, color: '#ec4899' },
    { id: 'DANCING', label: 'Dancing', icon: Music, color: '#a855f7' },
    { id: 'STAND UP COMEDY', label: 'Stand Up Comedy', icon: Laugh, color: '#f59e0b' },
    { id: 'Other', label: 'Other Talent', icon: Sparkles, color: '#06b6d4' }
  ];

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required.';
    }
    if (!formData.contact.trim()) {
      newErrors.contact = 'Contact number is required.';
    } else if (!/^[0-9+\s-]{8,15}$/.test(formData.contact.trim())) {
      newErrors.contact = 'Please enter a valid phone number (10 digits).';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
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
      <section id="registration-form" style={{ padding: '1rem 1.5rem 5rem', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <div
            className="glass-panel"
            style={{
              padding: '2.8rem 2.2rem',
              borderRadius: '24px',
              border: '1.5px solid rgba(16, 185, 129, 0.45)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 35px rgba(16, 185, 129, 0.15)',
              textAlign: 'center',
            }}
          >
            {/* Status Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.45rem 1.1rem',
                borderRadius: '999px',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                color: '#34d399',
                fontSize: '0.85rem',
                fontWeight: 700,
                letterSpacing: '0.05em',
                marginBottom: '1.25rem',
                textTransform: 'uppercase',
              }}
            >
              <ShieldCheck size={16} />
              <span>Response Already Submitted</span>
            </div>

            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.6rem' }}>
              You Are Registered! 🎉
            </h2>
            <p style={{ color: '#cbd5e1', fontSize: '1rem', maxWidth: '540px', margin: '0 auto 1.8rem', lineHeight: 1.6 }}>
              Welcome aboard, <strong style={{ color: '#ffffff' }}>{savedPass.fullName}</strong>! Your registration is already confirmed.
              To avoid duplicate entries and data redundancy, multiple submissions are restricted.
            </p>

            {/* Pass Info Box */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '1.5rem',
                marginBottom: '1.8rem',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1.25rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Pass ID</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#a855f7', marginTop: '0.2rem' }}>
                    {savedPass.regNumber || 'MCA26-CONFIRMED'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Division</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', marginTop: '0.2rem' }}>
                    Division {savedPass.div || 'A'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Talent Slot</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f472b6', marginTop: '0.2rem' }}>
                    {savedPass.talent || 'None'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Contact</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#cbd5e1', marginTop: '0.2rem' }}>
                    {savedPass.contact}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxWidth: '420px', margin: '0 auto' }}>
              <button
                type="button"
                onClick={() => onSubmitSuccess(savedPass)}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', justifyContent: 'center' }}
              >
                <Ticket size={18} />
                <span>View Full Digital Pass</span>
              </button>

              <a
                href="https://chat.whatsapp.com/BtrQQGn4MrxEF0zioEeE67"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp"
                style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', justifyContent: 'center', borderRadius: '12px' }}
              >
                <MessageCircle size={18} />
                <span>Join Official WhatsApp Community</span>
              </a>

              <button
                type="button"
                onClick={handleResetSession}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#64748b',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  marginTop: '0.5rem',
                  textDecoration: 'underline',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#94a3b8')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
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
    <section id="registration-form" style={{ padding: '1rem 1.5rem 5rem', position: 'relative', zIndex: 1 }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Form Header Card */}
        <div
          className="glass-panel"
          style={{
            padding: '2rem 2.2rem',
            marginBottom: '1.5rem',
            borderTop: '5px solid #a855f7',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.25rem' }}>
                MCA First Year Student Registration
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Fill in the details below to confirm your spot in the gala event.
              </p>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#f43f5e', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span>* Indicates required question</span>
            </div>
          </div>
        </div>

        {serverError && (
          <div
            style={{
              padding: '1.2rem 1.4rem',
              borderRadius: '16px',
              backgroundColor: conflictData ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              border: `1.5px solid ${conflictData ? 'rgba(245, 158, 11, 0.5)' : 'rgba(239, 68, 68, 0.4)'}`,
              color: conflictData ? '#fde68a' : '#fca5a5',
              marginBottom: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.6rem',
              animation: 'fadeIn 0.3s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <AlertCircle size={22} color={conflictData ? '#f59e0b' : '#ef4444'} style={{ flexShrink: 0 }} />
              <div>
                <strong style={{ display: 'block', fontSize: '1rem', color: '#ffffff', marginBottom: '0.15rem' }}>
                  {conflictData ? '⚠️ Duplicate Submission Blocked' : 'Submission Error'}
                </strong>
                <span style={{ fontSize: '0.92rem', lineHeight: 1.5 }}>{serverError}</span>
              </div>
            </div>

            {conflictData && typeof conflictData === 'object' && conflictData.regNumber && (
              <div
                style={{
                  marginTop: '0.4rem',
                  padding: '0.75rem 1rem',
                  backgroundColor: 'rgba(0, 0, 0, 0.25)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  fontSize: '0.85rem',
                }}
              >
                <span>Existing Pass ID: <strong style={{ color: '#a855f7' }}>{conflictData.regNumber}</strong></span>
                <span>Attendee: <strong style={{ color: '#ffffff' }}>{conflictData.fullName}</strong></span>
                <span>Division: <strong style={{ color: '#38bdf8' }}>{conflictData.div}</strong></span>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Section 1: Basic Information */}
          <div className="glass-panel" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#e2e8f0' }}>
              <User size={18} color="#a855f7" /> Student Identity
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
              />
              {errors.fullName && <p className="form-error">{errors.fullName}</p>}
            </div>

            {/* CONTACT */}
            <div className="form-group">
              <label className="form-label" htmlFor="contact">
                <span>CONTACT NUMBER</span>
                <span className="required-star">*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="contact"
                  type="tel"
                  className="form-input"
                  placeholder="e.g. 9876543210"
                  value={formData.contact}
                  onChange={(e) => handleChange('contact', e.target.value)}
                />
              </div>
              {errors.contact && <p className="form-error">{errors.contact}</p>}
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
              />
              {errors.email && <p className="form-error">{errors.email}</p>}
            </div>

            {/* DIV */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">
                <span>DIVISION (DIV)</span>
                <span className="required-star">*</span>
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginTop: '0.35rem' }}>
                {['A', 'B'].map((division) => (
                  <div
                    key={division}
                    onClick={() => handleChange('div', division)}
                    style={{
                      cursor: 'pointer',
                      padding: '1.1rem',
                      borderRadius: '14px',
                      background: formData.div === division ? 'rgba(168, 85, 247, 0.25)' : 'rgba(13, 16, 38, 0.65)',
                      border: formData.div === division ? '2px solid #a855f7' : '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: formData.div === division ? '0 0 15px rgba(168, 85, 247, 0.35)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          border: formData.div === division ? '6px solid #c084fc' : '2px solid rgba(255, 255, 255, 0.3)',
                          backgroundColor: '#0a0b16',
                          transition: 'all 0.2s ease',
                        }}
                      />
                      <span style={{ fontWeight: 700, fontSize: '1.05rem', color: formData.div === division ? '#ffffff' : '#cbd5e1' }}>
                        Division {division}
                      </span>
                    </div>
                    <GraduationCap size={20} color={formData.div === division ? '#c084fc' : '#64748b'} />
                  </div>
                ))}
              </div>
              {errors.div && <p className="form-error" style={{ marginTop: '0.5rem' }}>{errors.div}</p>}
            </div>
          </div>

          {/* Section 2: Talent & Event Registration */}
          <div className="glass-panel" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#e2e8f0' }}>
                <Sparkles size={18} color="#ec4899" /> Talent &amp; Event Registration !!!
              </h3>
              <span className="badge badge-pink">Showcase Your Passion</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
              Want to take the spotlight on stage? Choose your performance category:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.9rem', marginBottom: '1.25rem' }}>
              {talents.map((item) => {
                const IconComponent = item.icon;
                const isSelected = formData.talent === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleChange('talent', isSelected ? '' : item.id)}
                    style={{
                      cursor: 'pointer',
                      padding: '1.1rem 0.9rem',
                      borderRadius: '14px',
                      background: isSelected ? 'rgba(236, 72, 153, 0.22)' : 'rgba(13, 16, 38, 0.65)',
                      border: isSelected ? '2px solid #ec4899' : '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: isSelected ? '0 0 16px rgba(236, 72, 153, 0.35)' : 'none',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.6rem',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        background: isSelected ? 'linear-gradient(135deg, #ec4899, #a855f7)' : 'rgba(255, 255, 255, 0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <IconComponent size={22} color={isSelected ? '#ffffff' : item.color} />
                    </div>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: isSelected ? '#ffffff' : '#cbd5e1' }}>
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Custom Talent field when Other is selected */}
            {formData.talent === 'Other' && (
              <div
                style={{
                  padding: '1.25rem',
                  borderRadius: '12px',
                  background: 'rgba(6, 182, 212, 0.08)',
                  border: '1px dashed rgba(6, 182, 212, 0.35)',
                  marginTop: '0.75rem',
                }}
              >
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
          <div className="glass-panel" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#e2e8f0' }}>
              <PartyPopper size={18} color="#f59e0b" /> Party Ideas &amp; Suggestions
            </h3>

            {/* What would you like to see at the Fresher Party? */}
            <div className="form-group">
              <label className="form-label" htmlFor="partyWishes">
                <span>What would you like to see at the Fresher Party?</span>
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
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="gameSuggestion">
                <span>Suggest a fun activity / game for the party</span>
              </label>
              <textarea
                id="gameSuggestion"
                className="form-textarea"
                placeholder="e.g. Ramp Walk, Blindfold challenge, Musical chairs, Trivia quiz, Dumb charades..."
                value={formData.gameSuggestion}
                onChange={(e) => handleChange('gameSuggestion', e.target.value)}
              />
            </div>
          </div>

          {/* Section 4: WhatsApp Group Notification Box */}
          <div
            className="glass-panel"
            style={{
              padding: '1.5rem 1.75rem',
              marginBottom: '2rem',
              background: 'linear-gradient(135deg, rgba(37, 211, 102, 0.1) 0%, rgba(18, 140, 126, 0.1) 100%)',
              border: '1px solid rgba(37, 211, 102, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: '#25D366',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 4px 15px rgba(37, 211, 102, 0.4)',
                }}
              >
                <MessageCircle size={26} color="#ffffff" />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: '#4ade80', letterSpacing: '0.06em' }}>
                  DON'T MISS OUT
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>
                  JOIN OUR OFFICIAL WHATSAPP GROUP
                </div>
                <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                  Stay connected with organizers and receive instant updates!
                </div>
              </div>
            </div>

            <a
              href="https://chat.whatsapp.com/BtrQQGn4MrxEF0zioEeE67"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp"
              style={{ padding: '0.75rem 1.25rem', fontSize: '0.9rem' }}
            >
              <MessageCircle size={18} />
              <span>Join Official WhatsApp</span>
            </a>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{
                padding: '0.9rem 2.2rem',
                fontSize: '1.05rem',
                opacity: isSubmitting ? 0.7 : 1,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
              }}
            >
              {isSubmitting ? (
                <>
                  <div
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      border: '2px solid #ffffff',
                      borderTopColor: 'transparent',
                      animation: 'spin 0.8s linear infinite',
                    }}
                  />
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
              className="btn btn-secondary"
              style={{ padding: '0.8rem 1.4rem', fontSize: '0.9rem' }}
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
