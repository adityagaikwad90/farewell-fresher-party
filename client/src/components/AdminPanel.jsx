import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Download,
  Trash2,
  Eye,
  RefreshCw,
  LogOut,
  Sparkles,
  Lock,
  IndianRupee,
  CheckCircle2,
  GraduationCap
} from 'lucide-react';
import { API_BASE } from '../config';

export default function AdminPanel({ onBackToForm }) {
  const [passcode, setPasscode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDiv, setSelectedDiv] = useState('ALL');
  const [selectedTalent, setSelectedTalent] = useState('ALL');

  useEffect(() => {
    const savedToken = sessionStorage.getItem('mca_admin_passcode');
    if (savedToken) {
      setPasscode(savedToken);
      verifyAndFetch(savedToken);
    }
  }, []);

  const verifyAndFetch = async (tokenToUse) => {
    setLoading(true);
    setAuthError('');
    try {
      // Test login
      const loginRes = await fetch(`${API_BASE}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: tokenToUse })
      });

      if (!loginRes.ok) {
        throw new Error('Incorrect Admin Passcode. Please try again.');
      }

      sessionStorage.setItem('mca_admin_passcode', tokenToUse);
      setIsAuthenticated(true);

      // Fetch responses
      await loadResponses(tokenToUse);
      await loadStats(tokenToUse);
    } catch (err) {
      setAuthError(err.message || 'Authentication error.');
      setIsAuthenticated(false);
      sessionStorage.removeItem('mca_admin_passcode');
    } finally {
      setLoading(false);
    }
  };

  const loadResponses = async (token) => {
    const res = await fetch(`${API_BASE}/api/responses`, {
      headers: { 'x-admin-passcode': token || passcode }
    });
    if (res.ok) {
      const json = await res.json();
      setData(json.data || []);
    }
  };

  const loadStats = async (token) => {
    const res = await fetch(`${API_BASE}/api/stats`, {
      headers: { 'x-admin-passcode': token || passcode }
    });
    if (res.ok) {
      const json = await res.json();
      setStats(json);
    }
  };



  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setAuthError('Please enter the passcode.');
      return;
    }
    verifyAndFetch(passcode.trim());
  };

  const handleLogout = () => {
    sessionStorage.removeItem('mca_admin_passcode');
    setIsAuthenticated(false);
    setPasscode('');
    setData([]);
    if (onBackToForm) {
      onBackToForm();
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete the registration for "${name}"?`)) {
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/responses/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-passcode': passcode }
      });
      if (res.ok) {
        setData(prev => prev.filter(item => item.id !== id));
        loadStats(passcode);
      }
    } catch (err) {
      alert('Failed to delete response.');
    }
  };

  const handleExportCsv = () => {
    window.location.href = `${API_BASE}/api/export?passcode=${encodeURIComponent(passcode)}`;
  };

  // Filtered Data
  const filteredData = data.filter(item => {
    const matchesSearch =
      (item.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.contact || '').includes(searchTerm) ||
      (item.regNumber || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDiv = selectedDiv === 'ALL' || item.div === selectedDiv;

    let matchesTalent = true;
    if (selectedTalent !== 'ALL') {
      const t = (item.talent || '').toUpperCase();
      if (selectedTalent === 'SINGING') matchesTalent = t.includes('SINGING');
      else if (selectedTalent === 'DANCING') matchesTalent = t.includes('DANCING');
      else if (selectedTalent === 'COMEDY') matchesTalent = t.includes('COMEDY') || t.includes('STAND UP');
      else if (selectedTalent === 'OTHER') matchesTalent = t.startsWith('OTHER');
      else if (selectedTalent === 'NONE') matchesTalent = !t || t === 'NONE';
    }

    return matchesSearch && matchesDiv && matchesTalent;
  });

  // If not authenticated, show passcode login screen
  if (!isAuthenticated) {
    return (
      <div className="py-16 md:py-24 px-4 sm:px-6 min-h-[70vh] flex items-center justify-center relative z-10">
        <div className="glass-panel w-full max-w-[440px] p-7 sm:p-9 text-center border border-violet-500/30 bg-[#0B1020]/90 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_35px_rgba(124,58,237,0.15)] relative overflow-hidden">
          
          {/* Subtle decorative top gradient line */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-violet-600 via-fuchsia-500 to-amber-400" />

          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-violet-600/35 border border-white/20">
            <Lock size={26} color="#ffffff" />
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-1.5 font-display tracking-tight">
            Admin Portal Access
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mb-6 leading-relaxed">
            Enter your organizer passcode to access structured responses and event analytics.
          </p>

          {authError && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs sm:text-sm mb-5 animate-fadeIn">
              {authError}
            </div>
          )}

          <form onSubmit={handleLoginSubmit}>
            <div className="mb-4">
              <input
                type="password"
                className="form-input text-center tracking-wider"
                placeholder="Enter Admin Passcode"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-3.5 text-sm sm:text-base font-bold rounded-xl shadow-lg shadow-violet-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 justify-center"
            >
              {loading ? 'Authenticating...' : 'Unlock Admin Dashboard'}
            </button>
          </form>

          <div className="mt-5">
            <button
              type="button"
              onClick={onBackToForm}
              className="btn btn-secondary w-full py-2.5 text-xs sm:text-sm rounded-xl font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 justify-center"
            >
              Back to Registration Form
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Admin Dashboard
  return (
    <div className="py-8 md:py-12 px-4 sm:px-6 relative z-10 pb-20">
      <div className="max-w-[1240px] mx-auto">

        {/* Top Header */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-7">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
                Event Management Dashboard
              </h1>
              <span className="badge badge-emerald">
                <CheckCircle2 size={12} /> Live
              </span>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
              Structured registration submissions for MCA Fresher &amp; Farewell 2026
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => { loadResponses(passcode); loadStats(passcode); }}
              className="btn btn-secondary px-3.5 py-2 text-xs sm:text-sm rounded-xl font-semibold inline-flex items-center gap-1.5"
              title="Refresh"
            >
              <RefreshCw size={15} />
              <span>Refresh</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="btn btn-primary px-4 py-2 text-xs sm:text-sm rounded-xl font-bold shadow-md shadow-violet-600/25 inline-flex items-center gap-1.5"
            >
              <Download size={15} />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleLogout}
              className="btn btn-secondary px-3.5 py-2 text-xs sm:text-sm rounded-xl font-semibold inline-flex items-center gap-1.5"
              title="Log out"
            >
              <LogOut size={15} />
              <span>Logout</span>
            </button>
          </div>
        </div>



        {/* Metric Overview Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
            {/* Total Registrations */}
            <div className="glass-panel p-5 rounded-2xl bg-[#0B1020]/75 border-white/10 hover:border-violet-500/40 hover:-translate-y-1 transition-all duration-300 shadow-xl shadow-black/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[0.72rem] text-slate-400 font-bold uppercase tracking-wider">
                  Total Registrations
                </span>
                <div className="w-8 h-8 rounded-lg bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-400">
                  <Users size={16} />
                </div>
              </div>
              <div className="text-3xl font-black text-white font-display">
                {stats.total}
              </div>
              <div className="text-xs text-violet-300 mt-1 font-medium">
                First-year MCA attendees
              </div>
            </div>

            {/* Division A vs B */}
            <div className="glass-panel p-5 rounded-2xl bg-[#0B1020]/75 border-white/10 hover:border-cyan-500/40 hover:-translate-y-1 transition-all duration-300 shadow-xl shadow-black/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[0.72rem] text-slate-400 font-bold uppercase tracking-wider">
                  Divisions Breakdown
                </span>
                <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <GraduationCap size={16} />
                </div>
              </div>
              <div className="flex items-baseline gap-3">
                <div>
                  <span className="text-2xl font-black text-white font-display">{stats.divStats.A}</span>
                  <span className="text-xs text-slate-400 ml-1 font-semibold">Div A</span>
                </div>
                <div className="text-white/20">|</div>
                <div>
                  <span className="text-2xl font-black text-white font-display">{stats.divStats.B}</span>
                  <span className="text-xs text-slate-400 ml-1 font-semibold">Div B</span>
                </div>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full mt-3 overflow-hidden flex">
                <div style={{ width: `${stats.total > 0 ? (stats.divStats.A / stats.total) * 100 : 50}%` }} className="bg-violet-500" />
                <div style={{ width: `${stats.total > 0 ? (stats.divStats.B / stats.total) * 100 : 50}%` }} className="bg-fuchsia-500" />
              </div>
            </div>

            {/* Talent Registrations */}
            <div className="glass-panel p-5 rounded-2xl bg-[#0B1020]/75 border-white/10 hover:border-pink-500/40 hover:-translate-y-1 transition-all duration-300 shadow-xl shadow-black/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[0.72rem] text-slate-400 font-bold uppercase tracking-wider">
                  Performers &amp; Talents
                </span>
                <div className="w-8 h-8 rounded-lg bg-pink-500/15 border border-pink-500/30 flex items-center justify-center text-pink-400">
                  <Sparkles size={16} />
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                <span className="badge badge-pink text-[0.72rem]">🎤 {stats.talentStats.SINGING} Singing</span>
                <span className="badge badge-purple text-[0.72rem]">💃 {stats.talentStats.DANCING} Dance</span>
                <span className="badge badge-amber text-[0.72rem]">🎭 {stats.talentStats['STAND UP COMEDY']} Comedy</span>
                {stats.talentStats.OTHER > 0 && <span className="badge badge-emerald text-[0.72rem]">✨ {stats.talentStats.OTHER} Other</span>}
              </div>
            </div>

            {/* Estimated Fee Pool */}
            <div className="glass-panel p-5 rounded-2xl bg-[#0B1020]/75 border-white/10 hover:border-amber-500/40 hover:-translate-y-1 transition-all duration-300 shadow-xl shadow-black/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[0.72rem] text-slate-400 font-bold uppercase tracking-wider">
                  Fee Pool Projection
                </span>
                <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <IndianRupee size={16} />
                </div>
              </div>
              <div className="text-2xl font-black text-amber-300 font-display">
                ₹{stats.estimatedFeePool.min.toLocaleString()} - ₹{stats.estimatedFeePool.max.toLocaleString()}
              </div>
              <div className="text-xs text-slate-400 mt-1 font-medium">
                @ ₹500 - ₹700 per person
              </div>
            </div>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="glass-panel p-4 mb-5 flex items-center justify-between flex-wrap gap-3.5 rounded-2xl border-white/10 bg-[#0B1020]/75">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[260px] max-w-[420px]">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              className="form-input pl-10 text-xs sm:text-sm py-2.5 rounded-xl"
              placeholder="Search by name, contact, email, pass ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Division Selector Tabs */}
          <div className="flex items-center gap-1.5">
            {['ALL', 'A', 'B'].map(divOpt => (
              <button
                key={divOpt}
                onClick={() => setSelectedDiv(divOpt)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  selectedDiv === divOpt
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30 border border-violet-500'
                    : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] border border-white/10'
                }`}
              >
                {divOpt === 'ALL' ? 'All Divisions' : `Div ${divOpt}`}
              </button>
            ))}
          </div>

          {/* Talent Filter */}
          <div className="flex items-center gap-2">
            <Filter size={15} className="text-slate-400" />
            <select
              className="form-select text-xs py-2 px-3 rounded-xl w-auto cursor-pointer"
              value={selectedTalent}
              onChange={(e) => setSelectedTalent(e.target.value)}
            >
              <option value="ALL">All Talents</option>
              <option value="SINGING">Singing</option>
              <option value="DANCING">Dancing</option>
              <option value="COMEDY">Stand Up Comedy</option>
              <option value="OTHER">Other Custom Act</option>
              <option value="NONE">General Attendee (None)</option>
            </select>
          </div>
        </div>

        {/* Structured Data Table */}
        <div className="glass-panel overflow-x-auto p-0 rounded-2xl border-white/10 bg-[#0B1020]/75 shadow-2xl shadow-black/40">
          <table className="w-full border-collapse text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02]">
                <th className="p-3.5 text-slate-400 font-bold uppercase tracking-wider text-[0.7rem]">Pass ID</th>
                <th className="p-3.5 text-slate-400 font-bold uppercase tracking-wider text-[0.7rem]">Student Name</th>
                <th className="p-3.5 text-slate-400 font-bold uppercase tracking-wider text-[0.7rem]">Div</th>
                <th className="p-3.5 text-slate-400 font-bold uppercase tracking-wider text-[0.7rem]">Contact Info</th>
                <th className="p-3.5 text-slate-400 font-bold uppercase tracking-wider text-[0.7rem]">Talent / Performance</th>
                <th className="p-3.5 text-slate-400 font-bold uppercase tracking-wider text-[0.7rem]">Party Suggestions</th>
                <th className="p-3.5 text-slate-400 font-bold uppercase tracking-wider text-[0.7rem]">Registered</th>
                <th className="p-3.5 text-slate-400 font-bold uppercase tracking-wider text-[0.7rem] text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400">
                    No registration records found.
                  </td>
                </tr>
              ) : (
                filteredData.map((item, idx) => (
                  <tr
                    key={item.id || idx}
                    className="border-b border-white/5 hover:bg-white/[0.03] transition-colors duration-150"
                  >
                    <td className="p-3.5 font-mono font-bold text-violet-400">
                      {item.regNumber || `MCA-${idx + 1}`}
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-white">{item.fullName}</div>
                    </td>
                    <td className="p-3.5">
                      <span className={`badge ${item.div === 'A' ? 'badge-purple' : 'badge-pink'}`}>
                        Div {item.div}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="text-slate-200">{item.contact}</div>
                      <div className="text-[0.75rem] text-slate-400">{item.email}</div>
                    </td>
                    <td className="p-3.5">
                      {item.talent && item.talent !== 'None' ? (
                        <span className="badge badge-amber max-w-[170px] truncate block">
                          {item.talent}
                        </span>
                      ) : (
                        <span className="text-slate-500 text-xs">None</span>
                      )}
                    </td>
                    <td className="p-3.5 max-w-[200px]">
                      <div className="text-xs text-slate-300 truncate">
                        {item.partyWishes || item.gameSuggestion || '-'}
                      </div>
                    </td>
                    <td className="p-3.5 text-xs text-slate-400 whitespace-nowrap">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recent'}
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="inline-flex gap-1.5">
                        <button
                          onClick={() => setSelectedItem(item)}
                          className="btn btn-secondary p-2 rounded-lg"
                          title="View Details"
                        >
                          <Eye size={15} className="text-cyan-400" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.fullName)}
                          className="btn btn-secondary p-2 rounded-lg"
                          title="Delete Response"
                        >
                          <Trash2 size={15} className="text-rose-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal: Full View Details */}
        {selectedItem && (
          <div className="fixed inset-0 z-50 bg-[#070A13]/85 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
            <div className="glass-panel w-full max-w-[600px] p-6 sm:p-8 rounded-3xl border border-violet-500/40 bg-[#0B1020]/95 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_35px_rgba(124,58,237,0.15)] relative overflow-hidden">
              
              <div className="flex items-center justify-between mb-5 border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white font-display">
                    {selectedItem.fullName}
                  </h3>
                  <span className="text-xs text-violet-400 font-mono">
                    {selectedItem.regNumber || selectedItem.id}
                  </span>
                </div>
                <span className={`badge ${selectedItem.div === 'A' ? 'badge-purple' : 'badge-pink'}`}>
                  Division {selectedItem.div}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                  <div className="text-[0.7rem] text-slate-400 font-bold uppercase tracking-wider">CONTACT NUMBER</div>
                  <div className="text-white font-semibold mt-0.5">{selectedItem.contact}</div>
                </div>
                <div>
                  <div className="text-[0.7rem] text-slate-400 font-bold uppercase tracking-wider">EMAIL ADDRESS</div>
                  <div className="text-white font-semibold mt-0.5 truncate">{selectedItem.email}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-[0.7rem] text-slate-400 font-bold uppercase tracking-wider">TALENT &amp; EVENT PARTICIPATION</div>
                  <div className="text-amber-300 font-bold mt-0.5">
                    {selectedItem.talent || 'General Attendee'}
                  </div>
                </div>
              </div>

              <div className="mb-4 bg-white/[0.03] border border-white/5 p-4 rounded-xl">
                <div className="text-xs text-violet-400 font-bold mb-1">
                  What would you like to see at the Fresher Party?
                </div>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                  {selectedItem.partyWishes || <em className="text-slate-500">No response provided.</em>}
                </p>
              </div>

              <div className="mb-6 bg-white/[0.03] border border-white/5 p-4 rounded-xl">
                <div className="text-xs text-fuchsia-400 font-bold mb-1">
                  Suggest a fun activity/game for the party:
                </div>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                  {selectedItem.gameSuggestion || <em className="text-slate-500">No response provided.</em>}
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="btn btn-secondary px-6 py-2.5 text-sm rounded-xl font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
