import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Ticket,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  RefreshCw,
  UserCheck,
  Sparkles,
  Phone,
  Mail,
  GraduationCap,
  MapPin,
  X,
  AlertCircle,
  Download,
  ArrowLeft
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { API_BASE, VENUE_NAME } from '../config';
import { INITIAL_FFP_STUDENTS } from '../data/confirmedStudents';

export default function VenueCheckIn({
  onBackToDashboard,
  onBackToHome,
  adminPasscode,
  sharedAttendees,
  onAttendeeCheckInChange,
  onDataFetched
}) {
  const isSameStudent = (a, b) => {
    if (!a || !b) return false;
    if (a.id && b.id && a.id === b.id) return true;
    const aPass = String(a.passId || a.regNumber || '').toLowerCase().trim();
    const bPass = String(b.passId || b.regNumber || '').toLowerCase().trim();
    if (aPass && bPass && aPass === bPass) return true;
    const aClean = aPass.replace(/^(ffp26-|mca26-|ffp-|mca-)/i, '').trim();
    const bClean = bPass.replace(/^(ffp26-|mca26-|ffp-|mca-)/i, '').trim();
    if (aClean && bClean && aClean === bClean) return true;
    return false;
  };

  const [attendees, setAttendees] = useState(() => {
    // Initial state from sharedAttendees, or bundled confirmed students + local check-in overrides
    try {
      const storedCheckIns = JSON.parse(localStorage.getItem('mca2026_ffp_checkins') || '{}');
      const ffpShared = (sharedAttendees && sharedAttendees.length > 0)
        ? sharedAttendees.filter(s => String(s.passId || s.regNumber || '').toUpperCase().startsWith('FFP'))
        : [];
      const baseList = ffpShared.length > 0 ? ffpShared : INITIAL_FFP_STUDENTS;
      return baseList.map(student => {
        const key = student.passId || student.regNumber || student.id;
        const locallyChecked = Boolean(storedCheckIns[key]);
        const isChecked = typeof student.checkedIn === 'boolean'
          ? student.checkedIn
          : locallyChecked;

        return {
          ...student,
          passId: student.passId || student.regNumber || student.id,
          checkedIn: isChecked,
          checkedInAt: student.checkedInAt || (isChecked && storedCheckIns[key] ? storedCheckIns[key].checkedInAt : null)
        };
      });
    } catch (e) {
      return INITIAL_FFP_STUDENTS;
    }
  });

  const [loading, setLoading] = useState(false);
  const [quickPassInput, setQuickPassInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL'); // ALL, PENDING, CHECKED_IN
  const [filterDiv, setFilterDiv] = useState('ALL'); // ALL, A, B
  const [filterYear, setFilterYear] = useState('ALL'); // ALL, 1st Year, 2nd Year
  const [lastCheckedStudent, setLastCheckedStudent] = useState(null);
  const [actionMessage, setActionMessage] = useState('');

  const quickInputRef = useRef(null);

  // Sync when sharedAttendees from parent AdminPanel updates
  useEffect(() => {
    if (sharedAttendees && Array.isArray(sharedAttendees) && sharedAttendees.length > 0) {
      const ffpShared = sharedAttendees.filter(s => String(s.passId || s.regNumber || '').toUpperCase().startsWith('FFP'));
      if (ffpShared.length === 0) return;
      const storedCheckIns = JSON.parse(localStorage.getItem('mca2026_ffp_checkins') || '{}');
      setAttendees(prev => {
        return ffpShared.map(item => {
          const match = prev.find(p => isSameStudent(p, item));
          const key = item.passId || item.regNumber || item.id;
          const locallyChecked = storedCheckIns[key];
          const isChecked = typeof item.checkedIn === 'boolean'
            ? item.checkedIn
            : (match && typeof match.checkedIn === 'boolean' ? match.checkedIn : Boolean(locallyChecked));

          return {
            ...item,
            passId: item.passId || item.regNumber || item.id,
            checkedIn: isChecked,
            checkedInAt: item.checkedInAt || (match && match.checkedInAt) || (isChecked && locallyChecked ? locallyChecked.checkedInAt : null)
          };
        });
      });
    }
  }, [sharedAttendees]);

  // Fetch live from server on mount
  useEffect(() => {
    fetchLiveAttendees();
  }, []);

  const fetchLiveAttendees = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/venue/ffp-attendees`);
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          const ffpList = json.data.filter(item => String(item.passId || item.regNumber || '').toUpperCase().startsWith('FFP'));
          const storedCheckIns = JSON.parse(localStorage.getItem('mca2026_ffp_checkins') || '{}');
          const merged = ffpList.map(item => {
            const key = item.passId || item.regNumber || item.id;
            const locallyChecked = storedCheckIns[key];
            const isChecked = typeof item.checkedIn === 'boolean'
              ? item.checkedIn
              : Boolean(locallyChecked);

            return {
              ...item,
              passId: item.passId || item.regNumber || item.id,
              checkedIn: isChecked,
              checkedInAt: item.checkedInAt || (isChecked && locallyChecked ? locallyChecked.checkedInAt : null)
            };
          });
          setAttendees(merged);

          if (onDataFetched) {
            onDataFetched(merged);
          }

          // Keep localStorage aligned with authoritative server state
          const newStoredCheckIns = {};
          merged.forEach(m => {
            if (m.checkedIn) {
              const k = m.passId || m.regNumber || m.id;
              newStoredCheckIns[k] = { checkedInAt: m.checkedInAt, studentName: m.fullName };
            }
          });
          localStorage.setItem('mca2026_ffp_checkins', JSON.stringify(newStoredCheckIns));
        }
      }
    } catch (err) {
      console.warn('Could not fetch live from backend, using local fallback data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Toggle Check-in status
  const handleToggleCheckIn = async (student, shouldCheckIn = true) => {
    const key = student.passId || student.regNumber || student.id;
    const nowIso = new Date().toISOString();
    const effectivePasscode = adminPasscode || sessionStorage.getItem('mca_admin_passcode') || 'mca2026admin';

    // 1. Optimistic local state update
    const updatedAttendees = attendees.map(item => {
      if (isSameStudent(item, student)) {
        return {
          ...item,
          checkedIn: shouldCheckIn,
          checkedInAt: shouldCheckIn ? nowIso : null
        };
      }
      return item;
    });

    setAttendees(updatedAttendees);

    // 2. Notify parent AdminPanel immediately so other tabs stay in sync
    if (onAttendeeCheckInChange) {
      onAttendeeCheckInChange({
        ...student,
        checkedIn: shouldCheckIn,
        checkedInAt: shouldCheckIn ? nowIso : null
      });
    }

    // 3. Persist in localStorage
    try {
      const storedCheckIns = JSON.parse(localStorage.getItem('mca2026_ffp_checkins') || '{}');
      if (shouldCheckIn) {
        storedCheckIns[key] = { checkedInAt: nowIso, studentName: student.fullName };
      } else {
        delete storedCheckIns[key];
      }
      localStorage.setItem('mca2026_ffp_checkins', JSON.stringify(storedCheckIns));
    } catch (e) {
      console.warn('Failed to update localStorage check-ins:', e);
    }

    if (shouldCheckIn) {
      setLastCheckedStudent({ ...student, checkedInAt: nowIso });
      setActionMessage(`✅ ${student.fullName} (${student.passId || student.regNumber}) checked in successfully!`);
      
      // Trigger festive sparkle confetti blast
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#10B981', '#7C3AED', '#F59E0B']
        });
      } catch (e) {}
    } else {
      setActionMessage(`↩️ Check-in undone for ${student.fullName}.`);
      if (lastCheckedStudent && isSameStudent(lastCheckedStudent, student)) {
        setLastCheckedStudent(null);
      }
    }

    setTimeout(() => {
      setActionMessage('');
    }, 4000);

    // 4. Send update to backend API
    try {
      const res = await fetch(`${API_BASE}/api/checkin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(effectivePasscode ? { 'x-admin-passcode': effectivePasscode } : {})
        },
        body: JSON.stringify({
          id: student.id,
          passId: student.passId || student.regNumber,
          checkedIn: shouldCheckIn,
          passcode: effectivePasscode
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }

      const resData = await res.json();
      console.log('✅ Check-in persisted in database successfully:', resData);

      if (resData && resData.data) {
        setAttendees(prev => prev.map(item => isSameStudent(item, resData.data) ? { ...item, ...resData.data } : item));
        if (onAttendeeCheckInChange) {
          onAttendeeCheckInChange(resData.data);
        }
      }
    } catch (err) {
      console.error('Failed to sync check-in with backend API:', err);
      setActionMessage(`⚠️ Saved locally, but database sync warning: ${err.message}`);
    }
  };

  // Quick scanner direct match (supports searching with or without FFP26- prefix)
  const quickMatchedStudent = useMemo(() => {
    const raw = quickPassInput.trim().toLowerCase();
    if (!raw || raw.length < 2) return null;

    const cleanRaw = raw.replace(/^(ffp26-|mca26-|ffp-|mca-)/i, '').trim();

    return attendees.find(student => {
      const passId = (student.passId || student.regNumber || '').toLowerCase();
      const cleanPassId = passId.replace(/^(ffp26-|mca26-|ffp-|mca-)/i, '').trim();
      const name = (student.fullName || '').toLowerCase();
      const phone = (student.contact || '').replace(/\D/g, '');
      const rawDigits = raw.replace(/\D/g, '');

      return (
        passId === raw ||
        cleanPassId === cleanRaw ||
        passId.includes(raw) ||
        (cleanRaw.length >= 2 && cleanPassId.includes(cleanRaw)) ||
        (cleanRaw.length >= 2 && cleanPassId.startsWith(cleanRaw)) ||
        (rawDigits.length >= 4 && phone.includes(rawDigits)) ||
        (name.length >= 2 && name.includes(raw))
      );
    });
  }, [quickPassInput, attendees]);

  // Metrics computation
  const totalCount = attendees.length;
  const checkedInCount = attendees.filter(s => Boolean(s.checkedIn)).length;
  const pendingCount = totalCount - checkedInCount;
  const percentage = totalCount > 0 ? Math.round((checkedInCount / totalCount) * 100) : 0;

  const divAChecked = attendees.filter(s => s.div === 'A' && s.checkedIn).length;
  const divATotal = attendees.filter(s => s.div === 'A').length;
  const divBChecked = attendees.filter(s => s.div === 'B' && s.checkedIn).length;
  const divBTotal = attendees.filter(s => s.div === 'B').length;

  // Filtered List
  const filteredAttendees = useMemo(() => {
    return attendees.filter(student => {
      // Status filter
      if (filterStatus === 'CHECKED_IN' && !student.checkedIn) return false;
      if (filterStatus === 'PENDING' && student.checkedIn) return false;

      // Division filter
      if (filterDiv !== 'ALL' && student.div !== filterDiv) return false;

      // Year filter
      if (filterYear !== 'ALL') {
        const studentYear = student.year || '1st Year';
        if (filterYear === '1st Year' && !studentYear.includes('1')) return false;
        if (filterYear === '2nd Year' && !studentYear.includes('2')) return false;
      }

      // Search term (searches with or without FFP26- prefix)
      if (searchTerm.trim()) {
        const q = searchTerm.trim().toLowerCase();
        const cleanQ = q.replace(/^(ffp26-|mca26-|ffp-|mca-)/i, '').trim();
        const passId = (student.passId || student.regNumber || '').toLowerCase();
        const cleanPassId = passId.replace(/^(ffp26-|mca26-|ffp-|mca-)/i, '').trim();
        const name = (student.fullName || '').toLowerCase();
        const contact = (student.contact || '').toLowerCase();
        const email = (student.email || '').toLowerCase();

        return (
          passId.includes(q) ||
          (cleanQ && cleanPassId.includes(cleanQ)) ||
          name.includes(q) ||
          contact.includes(q) ||
          email.includes(q)
        );
      }

      return true;
    });
  }, [attendees, filterStatus, filterDiv, filterYear, searchTerm]);

  // Export Check-in status list to CSV
  const handleExportAttendance = () => {
    const headers = [
      'Pass ID',
      'Student Name',
      'Academic Year',
      'Division',
      'Contact',
      'Email',
      'Check-In Status',
      'Checked-In Timestamp'
    ];

    const escapeCsv = (str) => {
      if (!str) return '""';
      const clean = String(str).replace(/"/g, '""').replace(/\r?\n/g, ' ');
      return `"${clean}"`;
    };

    const rows = attendees.map(s => [
      escapeCsv(s.passId || s.regNumber),
      escapeCsv(s.fullName),
      escapeCsv(s.year || '1st Year'),
      escapeCsv(s.div),
      escapeCsv(s.contact),
      escapeCsv(s.email),
      escapeCsv(s.checkedIn ? 'CHECKED_IN' : 'PENDING'),
      escapeCsv(s.checkedInAt ? new Date(s.checkedInAt).toLocaleString('en-IN') : 'N/A')
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `FFP_Pass_Attendance_Shankra_Banquet_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="py-6 sm:py-10 px-4 sm:px-6 relative z-10 pb-24 text-slate-100">
      <div className="max-w-[1240px] mx-auto">
        
        {/* Top Navigation & Header */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/20 border border-violet-400/40 text-violet-300 text-xs font-black uppercase tracking-wider">
                <MapPin size={12} className="text-amber-400" />
                <span>{VENUE_NAME} • Gate Desk</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Verifier</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white font-display tracking-tight">
              🎫 Venue Pass Verification &amp; Check-In
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
              Verify attendee Pass IDs, check in students, and monitor real-time arrivals.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {onBackToDashboard && (
              <button
                onClick={onBackToDashboard}
                className="btn btn-secondary px-3.5 py-2 text-xs sm:text-sm rounded-xl font-semibold inline-flex items-center gap-1.5"
              >
                <ArrowLeft size={15} />
                <span>Back to All Responses</span>
              </button>
            )}

            <button
              onClick={fetchLiveAttendees}
              disabled={loading}
              className="btn btn-secondary px-3.5 py-2 text-xs sm:text-sm rounded-xl font-semibold inline-flex items-center gap-1.5"
              title="Refresh attendee records"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
              <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
            </button>

            <button
              onClick={handleExportAttendance}
              className="btn btn-primary px-4 py-2 text-xs sm:text-sm rounded-xl font-bold shadow-md shadow-violet-600/30 inline-flex items-center gap-1.5"
              title="Export check-in attendance report"
            >
              <Download size={15} />
              <span>Export Attendance</span>
            </button>

            {onBackToHome && (
              <button
                onClick={onBackToHome}
                className="btn btn-secondary px-3 py-2 text-xs sm:text-sm rounded-xl font-semibold"
              >
                Home
              </button>
            )}
          </div>
        </div>

        {/* Action notification banner */}
        {actionMessage && (
          <div className="p-3.5 sm:p-4 rounded-2xl mb-6 bg-gradient-to-r from-emerald-500/20 via-teal-500/15 to-violet-500/20 border border-emerald-400/50 shadow-lg text-emerald-200 text-xs sm:text-sm font-bold flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
              <span>{actionMessage}</span>
            </div>
            <button
              onClick={() => setActionMessage('')}
              className="text-emerald-400 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Live Metrics Grid — Prominently shows total record number! */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 mb-7">
          {/* Card 1: Total Records */}
          <div className="glass-panel p-4 sm:p-5 rounded-2xl bg-[#0B1020]/80 border-violet-500/30 shadow-xl shadow-black/40 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[0.7rem] sm:text-xs text-slate-400 font-bold uppercase tracking-wider">
                Total Registrations
              </span>
              <div className="w-8 h-8 rounded-lg bg-violet-500/20 border border-violet-500/40 flex items-center justify-center text-violet-300">
                <Ticket size={16} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl md:text-4xl font-black text-white font-display">
              {totalCount}
            </div>
            <div className="text-[0.7rem] sm:text-xs text-violet-300 font-semibold mt-1">
              Confirmed Pass Holders
            </div>
          </div>

          {/* Card 2: Checked In Count */}
          <div className="glass-panel p-4 sm:p-5 rounded-2xl bg-[#0B1020]/80 border-emerald-500/40 shadow-xl shadow-black/40 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[0.7rem] sm:text-xs text-emerald-400 font-bold uppercase tracking-wider">
                Checked In at Venue
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
                <UserCheck size={16} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl md:text-4xl font-black text-emerald-400 font-display">
              {checkedInCount}
            </div>
            <div className="text-[0.7rem] sm:text-xs text-emerald-300/80 font-medium mt-1">
              {percentage}% of attendees arrived
            </div>
          </div>

          {/* Card 3: Pending Entry */}
          <div className="glass-panel p-4 sm:p-5 rounded-2xl bg-[#0B1020]/80 border-amber-500/30 shadow-xl shadow-black/40 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[0.7rem] sm:text-xs text-amber-400 font-bold uppercase tracking-wider">
                Pending Arrival
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
                <Clock size={16} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl md:text-4xl font-black text-amber-300 font-display">
              {pendingCount}
            </div>
            <div className="text-[0.7rem] sm:text-xs text-slate-400 font-medium mt-1">
              Awaiting entry at banquet hall
            </div>
          </div>

          {/* Card 4: Division Breakdown */}
          <div className="glass-panel p-4 sm:p-5 rounded-2xl bg-[#0B1020]/80 border-cyan-500/30 shadow-xl shadow-black/40 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[0.7rem] sm:text-xs text-cyan-400 font-bold uppercase tracking-wider">
                Div A &amp; B Check-In
              </span>
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
                <GraduationCap size={16} />
              </div>
            </div>
            <div className="flex items-baseline gap-2.5">
              <div>
                <span className="text-xl sm:text-2xl font-black text-white">{divAChecked}/{divATotal}</span>
                <span className="text-[0.68rem] text-violet-300 ml-1 font-bold">Div A</span>
              </div>
              <div className="text-white/20">|</div>
              <div>
                <span className="text-xl sm:text-2xl font-black text-white">{divBChecked}/{divBTotal}</span>
                <span className="text-[0.68rem] text-pink-300 ml-1 font-bold">Div B</span>
              </div>
            </div>
            {/* Arrival progress line */}
            <div className="w-full bg-white/10 rounded-full h-1.5 mt-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 h-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* ⚡ Quick Pass Verifier & Scanner Box */}
        <div className="glass-panel p-5 sm:p-7 rounded-3xl bg-[#0B1020]/90 border border-violet-500/40 shadow-2xl shadow-violet-950/30 mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-violet-500 via-emerald-400 to-amber-400" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs uppercase font-extrabold tracking-wider text-amber-300 mb-1">
                <Sparkles size={14} className="text-amber-400" />
                <span>Instant Pass ID Verifier</span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white font-display">
                Check Pass ID with Student at Venue
              </h2>
            </div>

            <div className="text-xs text-slate-400">
              💡 Tip: Just enter code (e.g. <strong className="text-violet-300 font-mono">uXJMhpjh</strong>) or student name — no need to type FFP26-!
            </div>
          </div>

          <div className="relative">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-400 pointer-events-none" />
            <input
              ref={quickInputRef}
              type="text"
              value={quickPassInput}
              onChange={(e) => setQuickPassInput(e.target.value)}
              placeholder="Enter pass code (e.g. uXJMhpjh) or student name..."
              className="form-input pl-12 pr-10 py-3.5 text-sm sm:text-base font-mono rounded-2xl bg-black/40 border-violet-500/40 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/30 text-white placeholder:text-slate-500"
            />
            {quickPassInput && (
              <button
                onClick={() => setQuickPassInput('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Quick Matched Result Card */}
          {quickMatchedStudent && (
            <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-violet-950/40 border-2 border-violet-500/60 shadow-xl animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                    <span className="font-mono font-black text-sm sm:text-base px-3 py-1 rounded-xl bg-violet-500/30 border border-violet-400/50 text-violet-200">
                      🎫 {quickMatchedStudent.passId || quickMatchedStudent.regNumber}
                    </span>
                    <span className="badge badge-purple text-xs">
                      🎓 {quickMatchedStudent.year || '1st Year'}
                    </span>
                    <span className="badge badge-pink text-xs">
                      Div {quickMatchedStudent.div || 'A'}
                    </span>
                    <span className="badge badge-emerald text-xs font-bold">
                      Fee: ₹600 Paid
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-white font-display">
                    {quickMatchedStudent.fullName}
                  </h3>

                  <div className="flex items-center gap-3 text-xs text-slate-300 mt-1 flex-wrap">
                    {quickMatchedStudent.contact && (
                      <span className="flex items-center gap-1">
                        <Phone size={12} className="text-slate-400" />
                        <span>{quickMatchedStudent.contact}</span>
                      </span>
                    )}
                    {quickMatchedStudent.email && (
                      <span className="flex items-center gap-1">
                        <Mail size={12} className="text-slate-400" />
                        <span>{quickMatchedStudent.email}</span>
                      </span>
                    )}
                    {quickMatchedStudent.talent && quickMatchedStudent.talent !== 'None' && (
                      <span className="text-fuchsia-300 font-semibold">
                        🎤 {quickMatchedStudent.talent}
                      </span>
                    )}
                  </div>
                </div>

                {/* Check In Action Button */}
                <div className="flex items-center gap-2">
                  {quickMatchedStudent.checkedIn ? (
                    <div className="flex flex-col sm:items-end gap-1.5">
                      <div className="px-4 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-extrabold text-sm inline-flex items-center gap-2">
                        <CheckCircle2 size={18} className="text-emerald-400" />
                        <span>Checked In at Venue ✅</span>
                      </div>
                      <button
                        onClick={() => handleToggleCheckIn(quickMatchedStudent, false)}
                        className="text-xs text-rose-400 hover:text-rose-300 underline font-semibold transition-colors"
                      >
                        Undo Check-In
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleToggleCheckIn(quickMatchedStudent, true)}
                      className="btn w-full sm:w-auto px-6 py-3 rounded-xl font-black text-sm sm:text-base bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/50 hover:scale-105 active:scale-95 transition-all duration-200 inline-flex items-center justify-center gap-2"
                    >
                      <UserCheck size={18} />
                      <span>Confirm &amp; Check In Now</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {quickPassInput.trim().length >= 4 && !quickMatchedStudent && (
            <div className="mt-3 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>No attendee found with ID or name matching "<strong>{quickPassInput}</strong>". Please verify the pass ID.</span>
            </div>
          )}
        </div>

        {/* Filter & Search Bar */}
        <div className="glass-panel p-4 mb-5 rounded-2xl border-white/10 bg-[#0B1020]/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5">
          {/* Table Search */}
          <div className="relative flex-1 min-w-[220px]">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search table by name or pass ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input pl-10 text-xs sm:text-sm py-2 rounded-xl"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: 'ALL', label: `All (${totalCount})` },
              { id: 'PENDING', label: `Pending (${pendingCount})` },
              { id: 'CHECKED_IN', label: `Checked In (${checkedInCount})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  filterStatus === tab.id
                    ? tab.id === 'CHECKED_IN'
                      ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/30'
                      : tab.id === 'PENDING'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/30'
                      : 'bg-violet-600 text-white font-black shadow-md shadow-violet-600/30'
                    : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] border border-white/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Division Filter */}
          <div className="flex items-center gap-1.5">
            {['ALL', 'A', 'B'].map(divOpt => (
              <button
                key={divOpt}
                onClick={() => setFilterDiv(divOpt)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  filterDiv === divOpt
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30 border border-violet-500'
                    : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] border border-white/10'
                }`}
              >
                {divOpt === 'ALL' ? 'All Divs' : `Div ${divOpt}`}
              </button>
            ))}
          </div>

          {/* Year Filter */}
          <div className="flex items-center gap-1.5">
            {['ALL', '1st Year', '2nd Year'].map(yrOpt => (
              <button
                key={yrOpt}
                onClick={() => setFilterYear(yrOpt)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  filterYear === yrOpt
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                    : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] border border-white/10'
                }`}
              >
                {yrOpt === 'ALL' ? 'All Years' : yrOpt}
              </button>
            ))}
          </div>
        </div>

        {/* Total Records Counter Row */}
        <div className="flex items-center justify-between text-xs text-slate-400 mb-3 px-1">
          <div>
            Showing <strong className="text-white">{filteredAttendees.length}</strong> of <strong className="text-violet-300">{totalCount}</strong> Attendees
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span>Green = Checked In</span>
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-400 ml-2" />
            <span>Amber = Pending</span>
          </div>
        </div>

        {/* Attendees List Table - 3 Columns: Name, IDs, Check-In */}
        <div className="glass-panel overflow-x-auto p-0 rounded-2xl border-white/10 bg-[#0B1020]/75 shadow-2xl shadow-black/40">
          <table className="w-full border-collapse text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02]">
                <th className="p-3.5 text-slate-400 font-bold uppercase tracking-wider text-[0.75rem]">Name</th>
                <th className="p-3.5 text-slate-400 font-bold uppercase tracking-wider text-[0.75rem]">IDs</th>
                <th className="p-3.5 text-slate-400 font-bold uppercase tracking-wider text-[0.75rem] text-right">Check-In</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendees.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-12 text-center text-slate-400">
                    No matching attendee records found.
                  </td>
                </tr>
              ) : (
                filteredAttendees.map((student, idx) => {
                  const passId = student.passId || student.regNumber || student.id;
                  const isCheckedIn = Boolean(student.checkedIn);

                  return (
                    <tr
                      key={student.id || passId || idx}
                      className={`border-b border-white/5 transition-colors duration-150 ${
                        isCheckedIn ? 'bg-emerald-500/[0.04] hover:bg-emerald-500/[0.08]' : 'hover:bg-white/[0.03]'
                      }`}
                    >
                      {/* Column 1: Name */}
                      <td className="p-3.5">
                        <div className="font-bold text-white text-sm sm:text-base">
                          {student.fullName}
                        </div>
                        <div className="text-[0.7rem] text-slate-400 font-medium mt-0.5 sm:hidden">
                          {student.year || '1st Year'} • Div {student.div || 'A'}
                        </div>
                      </td>

                      {/* Column 2: IDs */}
                      <td className="p-3.5 font-mono font-bold text-violet-300 whitespace-nowrap">
                        <span className="bg-violet-500/15 border border-violet-500/30 px-2.5 py-1 rounded-lg inline-block">
                          {passId}
                        </span>
                      </td>

                      {/* Column 3: Check-In */}
                      <td className="p-3.5 text-right whitespace-nowrap">
                        {isCheckedIn ? (
                          <button
                            onClick={() => handleToggleCheckIn(student, false)}
                            className="btn px-3.5 py-1.5 text-xs font-bold rounded-xl bg-emerald-500/20 hover:bg-rose-500/20 text-emerald-300 hover:text-rose-300 border border-emerald-500/40 hover:border-rose-500/40 transition-all duration-200 inline-flex items-center gap-1.5 cursor-pointer shadow-sm shadow-emerald-500/10"
                            title="Click to Undo Check-In"
                          >
                            <CheckCircle2 size={15} className="text-emerald-400" />
                            <span>Checked In ✓</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleCheckIn(student, true)}
                            className="btn px-4 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white shadow-md shadow-emerald-600/30 hover:scale-105 active:scale-95 transition-all duration-200 inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <UserCheck size={15} />
                            <span>Check In</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
