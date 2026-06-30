import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FileAudio, Sparkles, AlertCircle, TrendingUp, CheckSquare, 
  Search, UploadCloud, ArrowRight, Play, Eye
} from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function Dashboard() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [actionItems, setActionItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const meetingsRes = await fetch(`${API_BASE_URL}/api/meetings`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const actionItemsRes = await fetch(`${API_BASE_URL}/api/action-items`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (meetingsRes.ok && actionItemsRes.ok) {
          const meetingsData = await meetingsRes.json();
          const actionItemsData = await actionItemsRes.json();
          setMeetings(meetingsData);
          setActionItems(actionItemsData);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  // Derived statistics metrics
  const totalMeetings = meetings.length;
  const completedMeetings = meetings.filter(m => m.status === 'completed').length;
  const pendingActionItems = actionItems.filter(a => a.status !== 'completed').length;
  const completedActionItems = actionItems.filter(a => a.status === 'completed').length;
  const totalDurationMin = meetings.reduce((sum, m) => sum + Math.floor(m.duration / 60), 0);

  // Filtering recent meetings list
  const filteredMeetings = meetings.filter(meeting => {
    const matchesSearch = meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (meeting.description && meeting.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'All' || meeting.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const categories = ['All', ...new Set(meetings.map(m => m.category))];

  // Helper to format timestamps nicely
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '--:--';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div style={{ color: 'var(--theme-text-muted)', fontSize: '15px' }}>Loading Portal Metrics...</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h1 className="page-title">Enterprise Dashboard</h1>
        <button className="btn btn-primary" onClick={() => navigate('/upload')}>
          <UploadCloud size={16} /> New Meeting Upload
        </button>
      </div>
      <p className="page-subtitle">Acoustic signals processed and translated into actionable task items.</p>

      {/* Stats Cards Row */}
      <div className="stats-grid">
        <div className="card stat-card">
          <div>
            <div className="stat-label">Total Meetings</div>
            <div className="stat-value">{totalMeetings}</div>
            <div className="stat-change positive">
              <TrendingUp size={12} /> {totalDurationMin} mins cumulative duration
            </div>
          </div>
          <div className="stat-icon">
            <FileAudio size={22} />
          </div>
        </div>

        <div className="card stat-card">
          <div>
            <div className="stat-label">Summaries Generated</div>
            <div className="stat-value">{completedMeetings}</div>
            <div className="stat-change positive">
              <TrendingUp size={12} /> {totalMeetings > 0 ? Math.round((completedMeetings / totalMeetings) * 100) : 0}% success rate
            </div>
          </div>
          <div className="stat-icon" style={{ background: 'var(--theme-success-light)', color: 'var(--theme-success)' }}>
            <Sparkles size={22} />
          </div>
        </div>

        <div className="card stat-card">
          <div>
            <div className="stat-label">Action Items Pending</div>
            <div className="stat-value">{pendingActionItems}</div>
            <div className="stat-change" style={{ color: 'var(--theme-text-muted)' }}>
              Completed: {completedActionItems}
            </div>
          </div>
          <div className="stat-icon" style={{ background: 'var(--theme-warning-light)', color: 'var(--theme-warning)' }}>
            <CheckSquare size={22} />
          </div>
        </div>

        <div className="card stat-card">
          <div>
            <div className="stat-label">AI Processing Runs</div>
            <div className="stat-value">{meetings.filter(m => m.status !== 'failed').length}</div>
            <div className="stat-change positive">
              <TrendingUp size={12} /> Active NLP Pipeline v2.4
            </div>
          </div>
          <div className="stat-icon">
            <Sparkles size={22} />
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Activity & Action items sync */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.1fr', gap: '32px' }} className="admin-grid">
        {/* Recent Meetings Table Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Recent Meeting Audits</h3>

          {/* Search and filter bar */}
          <div className="filter-bar">
            <div className="search-input-wrapper">
              <span className="search-icon"><Search size={16} /></span>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Search meeting titles..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select 
              className="form-control" 
              style={{ width: '150px' }}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="table-container">
            {filteredMeetings.length === 0 ? (
              <div style={{ padding: '40px 0', textPosition: 'center', color: 'var(--theme-text-muted)', textAlign: 'center' }}>
                No meeting logs found matching current parameters.
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Meeting Title</th>
                    <th>Date</th>
                    <th>Duration</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMeetings.slice(0, 5).map(meeting => (
                    <tr key={meeting.id}>
                      <td>
                        <div style={{ fontWeight: '600', color: 'var(--theme-text)' }}>{meeting.title}</div>
                        <span style={{ fontSize: '11px', background: 'var(--theme-accent-light)', color: 'var(--theme-accent)', padding: '2px 6px', borderRadius: '4px', marginTop: '4px', display: 'inline-block' }}>
                          {meeting.category}
                        </span>
                      </td>
                      <td style={{ color: 'var(--theme-text-muted)' }}>{formatDate(meeting.createdAt)}</td>
                      <td style={{ color: 'var(--theme-text-muted)' }}>{formatDuration(meeting.duration)}</td>
                      <td>
                        <span className={`badge-status ${meeting.status}`}>
                          {meeting.status}
                        </span>
                      </td>
                      <td>
                        {meeting.status === 'completed' ? (
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                            onClick={() => navigate(`/meeting/${meeting.id}`)}
                          >
                            <Eye size={12} /> View Summary
                          </button>
                        ) : meeting.status === 'processing' ? (
                          <div style={{ fontSize: '12px', color: 'var(--theme-warning)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span className="badge-status processing" style={{ padding: 0 }}></span> Analysing...
                          </div>
                        ) : (
                          <span style={{ fontSize: '12px', color: 'var(--theme-text-muted)' }}>Unavailable</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          
          <button 
            className="btn btn-secondary" 
            style={{ marginTop: '16px', alignSelf: 'flex-start' }}
            onClick={() => navigate('/history')}
          >
            Show All Logs <ArrowRight size={14} />
          </button>
        </div>

        {/* Sidebar Mini Action Items Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '6px' }}>Pending Deliverables</h3>
          <p style={{ fontSize: '13px', color: 'var(--theme-text-muted)', marginBottom: '20px' }}>Urgent action items extracted by AI models.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, overflowY: 'auto', maxHeight: '380px' }}>
            {actionItems.filter(item => item.status !== 'completed').length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--theme-text-muted)', padding: '40px 0', fontSize: '13.5px' }}>
                ✓ No pending tasks! All action items completed.
              </div>
            ) : (
              actionItems.filter(item => item.status !== 'completed').slice(0, 5).map(item => (
                <div 
                  key={item.id} 
                  className="action-item-card" 
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate('/action-items')}
                >
                  <div style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--theme-text)', marginBottom: '8px' }}>
                    {item.title}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--theme-text-muted)' }}>
                    <span>Assignee: <strong>{item.owner}</strong></span>
                    <span style={{ color: 'var(--theme-danger)' }}>Due: {item.dueDate}</span>
                  </div>
                  
                  {/* Progress slider bar mock */}
                  <div style={{ height: '4px', background: 'var(--theme-border)', borderRadius: '2px', marginTop: '10px', overflow: 'hidden' }}>
                    <div style={{ width: `${item.progress}%`, height: '100%', background: 'var(--theme-accent)' }}></div>
                  </div>
                </div>
              ))
            )}
          </div>

          <button 
            className="btn btn-secondary" 
            style={{ marginTop: '16px' }}
            onClick={() => navigate('/action-items')}
          >
            Manage Action Board <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
