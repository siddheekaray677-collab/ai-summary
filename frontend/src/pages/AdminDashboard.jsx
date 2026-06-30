import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Users, HardDrive, ShieldAlert, Cpu, 
  Database, Activity, RefreshCw, BarChart2 
} from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function AdminDashboard() {
  const { token, user } = useAuth();
  
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchAdminData = async () => {
    try {
      const statsRes = await fetch(`${API_BASE_URL}/api/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const usersRes = await fetch(`${API_BASE_URL}/api/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const meetingsRes = await fetch(`${API_BASE_URL}/api/admin/meetings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (statsRes.ok && usersRes.ok && meetingsRes.ok) {
        const statsData = await statsRes.ok ? await statsRes.json() : null;
        const usersData = await usersRes.ok ? await usersRes.json() : [];
        const meetingsData = await meetingsRes.ok ? await meetingsRes.json() : [];
        
        setStats(statsData);
        setUsers(usersData);
        setMeetings(meetingsData);
      } else {
        setError('Authorization failed. Access restricted to administrator accounts.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred connecting to administrative API ports.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [token]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAdminData();
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  if (user?.role !== 'admin') {
    return (
      <div className="card" style={{ textAlign: 'center', border: '1px solid var(--theme-danger)', padding: '40px' }}>
        <ShieldAlert size={48} color="var(--theme-danger)" style={{ margin: '0 auto 16px' }} />
        <h3 style={{ fontSize: '20px', color: 'var(--theme-danger)', marginBottom: '8px' }}>Security Violation</h3>
        <p style={{ color: 'var(--theme-text-muted)' }}>This area is restricted. Only authorized system administrator credentials can access database statistics.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div style={{ color: 'var(--theme-text-muted)', fontSize: '15px' }}>Loading system metrics...</div>
      </div>
    );
  }

  const metrics = stats?.metrics || {
    totalUsers: 0,
    totalMeetings: 0,
    totalSummaries: 0,
    pendingActionItems: 0,
    avgProductivity: 0,
    totalStorageMb: 0
  };

  // Storage utilization calculation (limit: 1000 MB)
  const maxStorageLimit = 1000;
  const storagePercentage = Math.min(Math.round((metrics.totalStorageMb / maxStorageLimit) * 100), 100);
  const strokeDashArray = `${storagePercentage}, 100`;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h1 className="page-title">Admin Console</h1>
        <button className="btn btn-secondary" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw size={14} className={refreshing ? 'spinning' : ''} /> Refresh System
        </button>
      </div>
      <p className="page-subtitle">Administrative oversight of user accounts, database allocations, and storage logs.</p>

      {error && (
        <div style={{ background: 'var(--theme-danger-light)', color: 'var(--theme-danger)', padding: '16px', borderRadius: '8px', marginBottom: '24px', fontWeight: '600' }}>
          {error}
        </div>
      )}

      {/* Admin Stats Grid */}
      <div className="stats-grid">
        <div className="card stat-card">
          <div>
            <div className="stat-label">Total Subscribed Users</div>
            <div className="stat-value">{metrics.totalUsers}</div>
            <div style={{ fontSize: '12px', color: 'var(--theme-text-muted)' }}>Registered database profiles</div>
          </div>
          <div className="stat-icon" style={{ background: 'var(--theme-accent-light)', color: 'var(--theme-accent)' }}>
            <Users size={22} />
          </div>
        </div>

        <div className="card stat-card">
          <div>
            <div className="stat-label">Total Audio Hours</div>
            <div className="stat-value">{Number(((metrics.totalMeetings * 12) / 60).toFixed(1))}h</div>
            <div style={{ fontSize: '12px', color: 'var(--theme-text-muted)' }}>Processing pipeline throughput</div>
          </div>
          <div className="stat-icon">
            <Activity size={22} />
          </div>
        </div>

        <div className="card stat-card">
          <div>
            <div className="stat-label">Productivity Average</div>
            <div className="stat-value">{metrics.avgProductivity}%</div>
            <div style={{ fontSize: '12px', color: 'var(--theme-text-muted)' }}>Team collaboration index</div>
          </div>
          <div className="stat-icon" style={{ background: 'var(--theme-success-light)', color: 'var(--theme-success)' }}>
            <Cpu size={22} />
          </div>
        </div>

        <div className="card stat-card">
          <div>
            <div className="stat-label">AI Execution Calls</div>
            <div className="stat-value">{metrics.totalSummaries}</div>
            <div style={{ fontSize: '12px', color: 'var(--theme-text-muted)' }}>Summarization trigger cycles</div>
          </div>
          <div className="stat-icon">
            <Database size={22} />
          </div>
        </div>
      </div>

      {/* Storage and Usage analytics charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px', marginBottom: '32px' }} className="admin-grid">
        
        {/* Left Card: System Performance activity log */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart2 size={18} color="var(--theme-accent)" /> Weekly Token Logs (AI Usage)
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--theme-text-muted)', marginBottom: '24px' }}>
            Tokens utilized for NLP model parsing and dialogue transcription.
          </p>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '180px', padding: '0 16px', borderLeft: '2px solid var(--theme-border)', borderBottom: '2px solid var(--theme-border)', position: 'relative' }}>
            {/* Grid Line Guides */}
            <div style={{ position: 'absolute', left: 0, right: 0, top: '25%', borderTop: '1px dashed rgba(255,255,255,0.05)', height: 0 }}></div>
            <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', borderTop: '1px dashed rgba(255,255,255,0.05)', height: 0 }}></div>
            <div style={{ position: 'absolute', left: 0, right: 0, top: '75%', borderTop: '1px dashed rgba(255,255,255,0.05)', height: 0 }}></div>

            {/* Custom SVG Columns representing data activity chart */}
            {[
              { label: 'Mon', val: 14200, pct: 40 },
              { label: 'Tue', val: 18900, pct: 55 },
              { label: 'Wed', val: 24000, pct: 75 },
              { label: 'Thu', val: 16100, pct: 48 },
              { label: 'Fri', val: 28500, pct: 90 },
              { label: 'Sat', val: 8900, pct: 25 },
              { label: 'Sun', val: 11000, pct: 32 }
            ].map((d, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '40px', zIndex: 1 }}>
                <div style={{ fontSize: '10px', color: 'var(--theme-text-muted)', fontWeight: '600' }}>{(d.val / 1000).toFixed(1)}k</div>
                <div 
                  style={{ 
                    height: `${d.pct * 1.3}px`, 
                    width: '18px', 
                    background: 'linear-gradient(180deg, var(--theme-accent) 0%, var(--theme-accent-light) 100%)', 
                    borderRadius: '4px',
                    transition: 'height 0.3s ease'
                  }}
                  title={`Token logs: ${d.val}`}
                ></div>
                <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--theme-text-muted)' }}>{d.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Card: Storage occupied meter */}
        <div className="card storage-meter" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '8px', alignSelf: 'flex-start' }}>Storage Audits</h3>
          <p style={{ fontSize: '13px', color: 'var(--theme-text-muted)', marginBottom: '24px', alignSelf: 'flex-start' }}>Allocation limits of 1000 MB.</p>

          <div style={{ position: 'relative', width: '150px', height: '150px', marginBottom: '16px' }}>
            <svg viewBox="0 0 36 36" className="gauge-svg" style={{ width: '100%', height: '100%' }}>
              <path
                className="gauge-bg"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="gauge-fill"
                style={{ strokeDasharray: strokeDashArray }}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '800', fontFamily: 'var(--font-display)', color: 'var(--theme-text)' }}>
                {storagePercentage}%
              </div>
              <div style={{ fontSize: '10px', color: 'var(--theme-text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Used</div>
            </div>
          </div>

          <div style={{ fontSize: '13.5px', color: 'var(--theme-text-muted)', textAlign: 'center' }}>
            <strong>{metrics.totalStorageMb} MB</strong> of {maxStorageLimit} MB occupied
          </div>
        </div>
      </div>

      {/* Grid listing all user accounts */}
      <div className="card" style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={18} color="var(--theme-accent)" /> Audited Enterprise Users
        </h3>
        <div className="table-container" style={{ margin: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Profile Name</th>
                <th>Registered Email</th>
                <th>System Role</th>
                <th>Created Date</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight: '600' }}>{u.name}</td>
                  <td style={{ color: 'var(--theme-text-muted)' }}>{u.email}</td>
                  <td>
                    <span 
                      style={{ 
                        fontSize: '11px', 
                        fontWeight: '700', 
                        padding: '2px 8px', 
                        borderRadius: '4px',
                        background: u.role === 'admin' ? 'var(--theme-danger-light)' : 'var(--theme-border)',
                        color: u.role === 'admin' ? 'var(--theme-danger)' : 'var(--theme-text-muted)',
                        textTransform: 'uppercase'
                      }}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td style={{ color: 'var(--theme-text-muted)' }}>{formatDate(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grid listing all system meetings logs */}
      <div className="card">
        <h3 style={{ fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Database size={18} color="var(--theme-accent)" /> Global Meeting Records
        </h3>
        <div className="table-container" style={{ margin: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Meeting Title</th>
                <th>Owner (Uploader)</th>
                <th>Category</th>
                <th>Upload Date</th>
                <th>State</th>
              </tr>
            </thead>
            <tbody>
              {meetings.map(m => (
                <tr key={m.id}>
                  <td style={{ fontWeight: '600' }}>{m.title}</td>
                  <td>
                    <div style={{ fontWeight: '500' }}>{m.User?.name || 'Unknown'}</div>
                    <small style={{ color: 'var(--theme-text-muted)' }}>{m.User?.email}</small>
                  </td>
                  <td>
                    <span style={{ fontSize: '11px', background: 'var(--theme-accent-light)', color: 'var(--theme-accent)', padding: '2px 6px', borderRadius: '4px' }}>
                      {m.category}
                    </span>
                  </td>
                  <td style={{ color: 'var(--theme-text-muted)' }}>{formatDate(m.createdAt)}</td>
                  <td>
                    <span className={`badge-status ${m.status}`}>
                      {m.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .spinning {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
