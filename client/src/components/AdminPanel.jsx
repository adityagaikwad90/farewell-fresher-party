import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
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
  Database,
  CheckCircle2,
  AlertTriangle,
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
  const [dbInfo, setDbInfo] = useState(null);
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
      await loadHealth();
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

  const loadHealth = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/health`);
      if (res.ok) {
        const json = await res.json();
        setDbInfo(json.database);
      }
    } catch (e) {
      console.warn('Could not fetch db status');
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
      <div style={{ padding: '4rem 1.5rem', minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div
          className="glass-panel"
          style={{
            width: '100%',
            maxWidth: '440px',
            padding: '2.5rem',
            textAlign: 'center',
            border: '1px solid rgba(168, 85, 247, 0.35)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #9333ea, #ec4899)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)',
            }}
          >
            <Lock size={28} color="#ffffff" />
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.4rem' }}>
            Admin Portal Access
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.75rem' }}>
            Enter your organizer passcode to access structured responses and event analytics.
          </p>

          {authError && (
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#fca5a5',
                fontSize: '0.85rem',
                marginBottom: '1.25rem',
              }}
            >
              {authError}
            </div>
          )}

          <form onSubmit={handleLoginSubmit}>
            <div style={{ marginBottom: '1.25rem' }}>
              <input
                type="password"
                className="form-input"
                placeholder="Enter Admin Passcode (default: mca2026admin)"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem' }}
            >
              {loading ? 'Authenticating...' : 'Unlock Admin Dashboard'}
            </button>
          </form>

          <div style={{ marginTop: '1.25rem' }}>
            <button
              type="button"
              onClick={onBackToForm}
              className="btn btn-secondary"
              style={{ width: '100%', fontSize: '0.85rem' }}
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
    <div style={{ padding: '2rem 1.5rem 5rem', position: 'relative', zIndex: 1 }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>

        {/* Top Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.75rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff' }}>
                Event Management Dashboard
              </h1>
              <span className="badge badge-emerald">
                <CheckCircle2 size={12} /> Live
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
              Structured registration submissions for MCA Fresher &amp; Farewell 2026
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => { loadResponses(passcode); loadStats(passcode); }}
              className="btn btn-secondary"
              style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}
              title="Refresh"
            >
              <RefreshCw size={15} />
              <span>Refresh</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="btn btn-primary"
              style={{ padding: '0.6rem 1.1rem', fontSize: '0.85rem' }}
            >
              <Download size={15} />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleLogout}
              className="btn btn-secondary"
              style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}
              title="Log out"
            >
              <LogOut size={15} />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Database Status Banner */}
        {dbInfo && (
          <div
            className="glass-panel"
            style={{
              padding: '0.75rem 1.25rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.5rem',
              fontSize: '0.82rem',
              borderColor: dbInfo.isFirebaseActive ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Database size={16} color={dbInfo.isFirebaseActive ? '#10b981' : '#f59e0b'} />
              <span>
                <strong>Storage Provider:</strong> {dbInfo.storageType}
              </span>
            </div>
            {!dbInfo.isFirebaseActive && (
              <span style={{ color: 'var(--text-secondary)' }}>
                To connect to Cloud Firestore, place your Firebase credentials in <code>server/serviceAccountKey.json</code> or set <code>FIREBASE_</code> in <code>.env</code>.
              </span>
            )}
          </div>
        )}

        {/* Metric Overview Cards */}
        {stats && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem',
              marginBottom: '1.75rem',
            }}
          >
            {/* Total Registrations */}
            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Total Registrations
                </span>
                <Users size={18} color="#a855f7" />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff' }}>
                {stats.total}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#c084fc', marginTop: '0.2rem' }}>
                First-year MCA attendees
              </div>
            </div>

            {/* Division A vs B */}
            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Divisions Breakdown
                </span>
                <GraduationCap size={18} color="#06b6d4" />
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
                <div>
                  <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff' }}>{stats.divStats.A}</span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: '0.3rem' }}>Div A</span>
                </div>
                <div style={{ color: 'rgba(255,255,255,0.2)' }}>|</div>
                <div>
                  <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff' }}>{stats.divStats.B}</span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: '0.3rem' }}>Div B</span>
                </div>
              </div>
              <div style={{ height: '5px', background: 'rgba(255,255,255,0.1)', borderRadius: '999px', marginTop: '0.65rem', overflow: 'hidden', display: 'flex' }}>
                <div style={{ width: `${stats.total > 0 ? (stats.divStats.A / stats.total) * 100 : 50}%`, background: '#a855f7' }} />
                <div style={{ width: `${stats.total > 0 ? (stats.divStats.B / stats.total) * 100 : 50}%`, background: '#ec4899' }} />
              </div>
            </div>

            {/* Talent Registrations */}
            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Performers &amp; Talents
                </span>
                <Sparkles size={18} color="#ec4899" />
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.3rem' }}>
                <span className="badge badge-pink">🎤 {stats.talentStats.SINGING} Singing</span>
                <span className="badge badge-purple">💃 {stats.talentStats.DANCING} Dance</span>
                <span className="badge badge-amber">🎭 {stats.talentStats['STAND UP COMEDY']} Comedy</span>
                {stats.talentStats.OTHER > 0 && <span className="badge badge-emerald">✨ {stats.talentStats.OTHER} Other</span>}
              </div>
            </div>

            {/* Estimated Fee Pool */}
            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Fee Pool Projection
                </span>
                <IndianRupee size={18} color="#fbbf24" />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fbbf24' }}>
                ₹{stats.estimatedFeePool.min.toLocaleString()} - ₹{stats.estimatedFeePool.max.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                @ ₹500 - ₹700 per person
              </div>
            </div>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div
          className="glass-panel"
          style={{
            padding: '1rem 1.25rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: '420px' }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.5rem', fontSize: '0.88rem' }}
              placeholder="Search by name, contact, email, pass ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Division Selector Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            {['ALL', 'A', 'B'].map(divOpt => (
              <button
                key={divOpt}
                onClick={() => setSelectedDiv(divOpt)}
                style={{
                  padding: '0.45rem 0.85rem',
                  borderRadius: '8px',
                  border: selectedDiv === divOpt ? '1px solid #a855f7' : '1px solid rgba(255,255,255,0.1)',
                  background: selectedDiv === divOpt ? 'rgba(168, 85, 247, 0.25)' : 'rgba(255,255,255,0.04)',
                  color: selectedDiv === divOpt ? '#ffffff' : '#cbd5e1',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {divOpt === 'ALL' ? 'All Divisions' : `Div ${divOpt}`}
              </button>
            ))}
          </div>

          {/* Talent Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={15} color="#94a3b8" />
            <select
              className="form-select"
              style={{ padding: '0.45rem 0.8rem', fontSize: '0.82rem', width: 'auto' }}
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
        <div className="glass-panel" style={{ overflowX: 'auto', padding: '0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(255, 255, 255, 0.02)' }}>
                <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600 }}>Pass ID</th>
                <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600 }}>Student Name</th>
                <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600 }}>Div</th>
                <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600 }}>Contact Info</th>
                <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600 }}>Talent / Performance</th>
                <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600 }}>Party Suggestions</th>
                <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600 }}>Registered</th>
                <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '3rem 1rem', textAlign: 'center', color: '#94a3b8' }}>
                    No registration records found.
                  </td>
                </tr>
              ) : (
                filteredData.map((item, idx) => (
                  <tr
                    key={item.id || idx}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '0.9rem 1rem', fontFamily: 'monospace', fontWeight: 700, color: '#c084fc' }}>
                      {item.regNumber || `MCA-${idx + 1}`}
                    </td>
                    <td style={{ padding: '0.9rem 1rem' }}>
                      <div style={{ fontWeight: 700, color: '#f8fafc' }}>{item.fullName}</div>
                    </td>
                    <td style={{ padding: '0.9rem 1rem' }}>
                      <span className={`badge ${item.div === 'A' ? 'badge-purple' : 'badge-pink'}`}>
                        Div {item.div}
                      </span>
                    </td>
                    <td style={{ padding: '0.9rem 1rem' }}>
                      <div style={{ color: '#cbd5e1' }}>{item.contact}</div>
                      <div style={{ fontSize: '0.76rem', color: '#94a3b8' }}>{item.email}</div>
                    </td>
                    <td style={{ padding: '0.9rem 1rem' }}>
                      {item.talent && item.talent !== 'None' ? (
                        <span className="badge badge-amber" style={{ maxWidth: '170px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.talent}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>None</span>
                      )}
                    </td>
                    <td style={{ padding: '0.9rem 1rem', maxWidth: '200px' }}>
                      <div style={{ fontSize: '0.8rem', color: '#cbd5e1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.partyWishes || item.gameSuggestion || '-'}
                      </div>
                    </td>
                    <td style={{ padding: '0.9rem 1rem', fontSize: '0.78rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recent'}
                    </td>
                    <td style={{ padding: '0.9rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button
                          onClick={() => setSelectedItem(item)}
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.55rem', borderRadius: '6px' }}
                          title="View Details"
                        >
                          <Eye size={15} color="#38bdf8" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.fullName)}
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.55rem', borderRadius: '6px' }}
                          title="Delete Response"
                        >
                          <Trash2 size={15} color="#f43f5e" />
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
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 100,
              backgroundColor: 'rgba(5, 6, 15, 0.85)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem',
            }}
          >
            <div
              className="glass-panel"
              style={{
                width: '100%',
                maxWidth: '600px',
                padding: '2rem',
                border: '1px solid rgba(168, 85, 247, 0.4)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff' }}>
                    {selectedItem.fullName}
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: '#c084fc', fontFamily: 'monospace' }}>
                    {selectedItem.regNumber || selectedItem.id}
                  </span>
                </div>
                <span className={`badge ${selectedItem.div === 'A' ? 'badge-purple' : 'badge-pink'}`}>
                  Division {selectedItem.div}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>CONTACT NUMBER</div>
                  <div style={{ color: '#f8fafc', fontWeight: 600 }}>{selectedItem.contact}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>EMAIL ADDRESS</div>
                  <div style={{ color: '#f8fafc', fontWeight: 600 }}>{selectedItem.email}</div>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>TALENT &amp; EVENT PARTICIPATION</div>
                  <div style={{ color: '#fbbf24', fontWeight: 700, marginTop: '0.2rem' }}>
                    {selectedItem.talent || 'General Attendee'}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px' }}>
                <div style={{ fontSize: '0.78rem', color: '#a855f7', fontWeight: 700, marginBottom: '0.3rem' }}>
                  What would you like to see at the Fresher Party?
                </div>
                <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                  {selectedItem.partyWishes || <em>No response provided.</em>}
                </p>
              </div>

              <div style={{ marginBottom: '1.5rem', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px' }}>
                <div style={{ fontSize: '0.78rem', color: '#ec4899', fontWeight: 700, marginBottom: '0.3rem' }}>
                  Suggest a fun activity/game for the party:
                </div>
                <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                  {selectedItem.gameSuggestion || <em>No response provided.</em>}
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="btn btn-secondary"
                  style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}
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
