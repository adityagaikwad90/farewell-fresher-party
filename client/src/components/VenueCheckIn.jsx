import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Ticket,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  RefreshCw,
  UserCheck,
  UserX,
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

export default function VenueCheckIn({ onBackToDashboard, onBackToHome, adminPasscode }) {
  const [attendees, setAttendees] = useState(() => {
    // Initial state from bundled confirmed students + local check-in overrides
    try {
      const storedCheckIns = JSON.parse(localStorage.getItem('mca2026_ffp_checkins') || '{}');
      return INITIAL_FFP_STUDENTS.map(student => {
        const key = student.passId || student.regNumber || student.id;
        if (storedCheckIns[key]) {
          return {
            ...student,
            checkedIn: true,
            checkedInAt: storedCheckIns[key].checkedInAt || student.checkedInAt || new Date().toISOString()
          };
        }
        return student;
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
          // Merge with any local check-ins
          const storedCheckIns = JSON.parse(localStorage.getItem('mca2026_ffp_checkins') || '{}');
          const merged = json.data.map(item => {
            const key = item.passId || item.regNumber || item.id;
            const locallyChecked = storedCheckIns[key];
            return {
              ...item,
              passId: item.passId || item.regNumber,
              checkedIn: item.checkedIn || (locallyChecked ? true : false),
              checkedInAt: item.checkedInAt || (locallyChecked ? locallyChecked.checkedInAt : null)
            };
          });
          setAttendees(merged);
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

    // 1. Optimistic local state update
    const updatedAttendees = attendees.map(item => {
      const itemKey = item.passId || item.regNumber || item.id;
      if (itemKey === key) {
        return {
          ...item,
          checkedIn: shouldCheckIn,
          checkedInAt: shouldCheckIn ? nowIso : null
        };
      }
      return item;
    });

    setAttendees(updatedAttendees);

    // 2. Persist in localStorage
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
      if (lastCheckedStudent && (lastCheckedStudent.passId === key || lastCheckedStudent.id === key)) {
        setLastCheckedStudent(null);
      }
    }

    setTimeout(() => {
      setActionMessage('');
    }, 4000);

    // 3. Send update to backend API
    try {
      await fetch(`${API_BASE}/api/checkin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(adminPasscode ? { 'x-admin-passcode': adminPasscode } : {})
        },
        body: JSON.stringify({
          id: student.id,
          passId: student.passId || student.regNumber,
          checkedIn: shouldCheckIn,
          passcode: adminPasscode
        })
      });
    } catch (err) {
      console.warn('Failed to sync check-in with backend API:', err);
    }
  };

  // Quick scanner direct match
  const quickMatchedStudent = useMemo(() => {
    const raw = quickPassInput.trim().toLowerCase();
    if (!raw || raw.length < 3) return null;

    return attendees.find(student => {
      const passId = (student.passId || student.regNumber || '').toLowerCase();
      const name = (student.fullName || '').toLowerCase();
      const phone = (student.contact || '').replace(/\D/g, '');
      const rawDigits = raw.replace(/\D/g, '');

      return passId === raw ||
             passId.includes(raw) ||
             (rawDigits.length >= 4 && phone.includes(rawDigits)) ||
             (name.length >= 3 && name.includes(raw));
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

      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.trim().toLowerCase();
        const passId = (student.passId || student.regNumber || '').toLowerCase();
        const name = (student.fullName || '').toLowerCase();
        const contact = (student.contact || '').toLowerCase();
        const email = (student.email || '').toLowerCase();

        return passId.includes(q) || name.includes(q) || contact.includes(q) || email.includes(q);
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
              🎫 FFP Pass Verification &amp; Check-In
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
              Verify attendee Pass IDs starting with <strong className="text-violet-300 font-mono">FFP</strong>, check in students, and monitor real-time arrivals.
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
              title="Refresh FFP records"
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
          {/* Card 1: Total FFP Records */}
          <div className="glass-panel p-4 sm:p-5 rounded-2xl bg-[#0B1020]/80 border-violet-500/30 shadow-xl shadow-black/40 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[0.7rem] sm:text-xs text-slate-400 font-bold uppercase tracking-wider">
                Total FFP Records
              </span>
              <div className="w-8 h-8 rounded-lg bg-violet-500/20 border border-violet-500/40 flex items-center justify-center text-violet-300">
                <Ticket size={16} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl md:text-4xl font-black text-white font-display">
              {totalCount}
            </div>
            <div className="text-[0.7rem] sm:text-xs text-violet-300 font-semibold mt-1">
              Confirmed FFP Pass Holders
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
              💡 Tip: Type or scan full pass ID like <strong className="text-violet-300 font-mono">FFP26-qSEA60ak</strong> or student name
            </div>
          </div>

          <div className="relative">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-400 pointer-events-none" />
            <input
              ref={quickInputRef}
              type="text"
              value={quickPassInput}
              onChange={(e) => setQuickPassInput(e.target.value)}
              placeholder="Enter student pass ID (e.g. FFP26-...) or name..."
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
              placeholder="Search table by name, pass ID, contact..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input pl-10 text-xs sm:text-sm py-2 rounded-xl"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: 'ALL', label: `All FFP (${totalCount})` },
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
            Showing <strong className="text-white">{filteredAttendees.length}</strong> of <strong className="text-violet-300">{totalCount}</strong> FFP Records
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span>Green = Checked In</span>
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-400 ml-2" />
            <span>Amber = Pending</span>
          </div>
        </div>

        {/* FFP Attendees List Table */}
        <div className="glass-panel overflow-x-auto p-0 rounded-2xl border-white/10 bg-[#0B1020]/75 shadow-2xl shadow-black/40">
          <table className="w-full border-collapse text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02]">
                <th className="p-3.5 text-slate-400 font-bold uppercase tracking-wider text-[0.7rem]">#</th>
                <th className="p-3.5 text-slate-400 font-bold uppercase tracking-wider text-[0.7rem]">Pass ID</th>
                <th className="p-3.5 text-slate-400 font-bold uppercase tracking-wider text-[0.7rem]">Student Name</th>
                <th className="p-3.5 text-slate-400 font-bold uppercase tracking-wider text-[0.7rem]">Year &amp; Div</th>
                <th className="p-3.5 text-slate-400 font-bold uppercase tracking-wider text-[0.7rem]">Contact</th>
                <th className="p-3.5 text-slate-400 font-bold uppercase tracking-wider text-[0.7rem]">Talent / Act</th>
                <th className="p-3.5 text-slate-400 font-bold uppercase tracking-wider text-[0.7rem]">Status</th>
                <th className="p-3.5 text-slate-400 font-bold uppercase tracking-wider text-[0.7rem] text-right">Venue Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400">
                    No matching FFP attendee records found.
                  </td>
                </tr>
              ) : (
                filteredAttendees.map((student, idx) => {
                  const passId = student.passId || student.regNumber;
                  const isCheckedIn = Boolean(student.checkedIn);

                  return (
                    <tr
                      key={student.id || passId || idx}
                      className={`border-b border-white/5 transition-colors duration-150 ${
                        isCheckedIn ? 'bg-emerald-500/[0.04] hover:bg-emerald-500/[0.08]' : 'hover:bg-white/[0.03]'
                      }`}
                    >
                      <td className="p-3.5 text-slate-500 font-mono text-xs">
                        {idx + 1}
                      </td>

                      {/* Pass ID */}
                      <td className="p-3.5">
                        <span className="font-mono font-bold text-violet-300 bg-violet-500/15 border border-violet-500/30 px-2.5 py-1 rounded-lg">
                          {passId}
                        </span>
                      </td>

                      {/* Full Name */}
                      <td className="p-3.5">
                        <div className="font-bold text-white text-sm">
                          {student.fullName}
                        </div>
                        <div className="text-[0.7rem] text-slate-400 truncate max-w-[200px]">
                          {student.email}
                        </div>
                      </td>

                      {/* Year & Division */}
                      <td className="p-3.5 whitespace-nowrap">
                        <span className={`badge ${(student.year || '1st Year').includes('1') ? 'badge-purple' : 'badge-amber'} mr-1.5`}>
                          {student.year || '1st Year'}
                        </span>
                        <span className={`badge ${student.div === 'A' ? 'badge-purple' : 'badge-pink'}`}>
                          Div {student.div}
                        </span>
                      </td>

                      {/* Contact */}
                      <td className="p-3.5 text-slate-300 font-mono text-xs">
                        {student.contact ? (
                          <a href={`tel:${student.contact}`} className="hover:text-violet-300">
                            {student.contact}
                          </a>
                        ) : (
                          <span className="text-slate-500 italic">None</span>
                        )}
                      </td>

                      {/* Talent */}
                      <td className="p-3.5 text-xs text-slate-300">
                        {student.talent && student.talent !== 'None' ? (
                          <span className="text-fuchsia-300 font-semibold">{student.talent}</span>
                        ) : (
                          <span className="text-slate-500">None</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-3.5 whitespace-nowrap">
                        {isCheckedIn ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs shadow-sm shadow-emerald-500/10">
                            <CheckCircle2 size={13} className="text-emerald-400" />
                            <span>Checked In ✅</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-semibold text-xs">
                            <Clock size={13} className="text-amber-400" />
                            <span>Pending Entry</span>
                          </div>
                        )}
                      </td>

                      {/* Action */}
                      <td className="p-3.5 text-right whitespace-nowrap">
                        {isCheckedIn ? (
                          <button
                            onClick={() => handleToggleCheckIn(student, false)}
                            className="btn px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/[0.04] hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-white/10 hover:border-rose-500/40 transition-all duration-200"
                            title="Undo check-in"
                          >
                            <UserX size={13} />
                            <span>Undo</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleCheckIn(student, true)}
                            className="btn px-3.5 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 hover:scale-105 active:scale-95 transition-all duration-200 inline-flex items-center gap-1.5"
                          >
                            <UserCheck size={14} />
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
