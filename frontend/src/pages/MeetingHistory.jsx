import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, Eye, Filter, RefreshCw, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function MeetingHistory() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const fetchMeetings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/meetings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMeetings(data);
      }
    } catch (err) {
      console.error('Error fetching meetings list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, [token]);

  // Derived filter categories and items
  const filteredMeetings = meetings.filter(meeting => {
    const matchesSearch = meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (meeting.description && meeting.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'All' || meeting.status === statusFilter;
    const matchesCategory = categoryFilter === 'All' || meeting.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const categories = ['All', ...new Set(meetings.map(m => m.category))];
  const statuses = ['All', 'pending', 'processing', 'completed', 'failed'];

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '--:--';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h1 className="page-title">Meeting History</h1>
        <button className="btn btn-secondary" onClick={fetchMeetings} disabled={loading} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <RefreshCw size={14} className={loading ? 'spinning' : ''} /> Refresh Queue
        </button>
      </div>
      <p className="page-subtitle">Administrative audit logs of all uploaded media formats and processing states.</p>

      {/* Filter panel */}
      <div className="card" style={{ marginBottom: '24px', padding: '16px' }}>
        <div className="filter-bar" style={{ margin: 0 }}>
          <div className="search-input-wrapper">
            <span className="search-icon"><Search size={16} /></span>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Search by title, description..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', color: 'var(--theme-text-muted)', fontWeight: '500' }}>Category:</span>
              <select 
                className="form-control" 
                style={{ width: '140px', padding: '8px 12px' }}
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', color: 'var(--theme-text-muted)', fontWeight: '500' }}>Status:</span>
              <select 
                className="form-control" 
                style={{ width: '140px', padding: '8px 12px' }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {statuses.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Grid List Table */}
      <div className="card">
        {loading && meetings.length === 0 ? (
          <div style={{ padding: '60px 0', textPosition: 'center', textAlign: 'center', color: 'var(--theme-text-muted)' }}>
            Loading database files...
          </div>
        ) : filteredMeetings.length === 0 ? (
          <div style={{ padding: '60px 0', textPosition: 'center', textAlign: 'center', color: 'var(--theme-text-muted)' }}>
            No meeting records found matching current query parameters.
          </div>
        ) : (
          <div className="table-container" style={{ margin: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Meeting Details</th>
                  <th>Date & Time</th>
                  <th>Duration</th>
                  <th>Topic Group</th>
                  <th>Pipeline Status</th>
                  <th>Audit Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredMeetings.map(meeting => (
                  <tr key={meeting.id}>
                    <td>
                      <div style={{ fontWeight: '700', fontSize: '15px', color: 'var(--theme-text)' }}>{meeting.title}</div>
                      <div style={{ fontSize: '13px', color: 'var(--theme-text-muted)', marginTop: '4px', maxWidth: '350px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {meeting.description || 'No description provided.'}
                      </div>
                    </td>
                    <td style={{ color: 'var(--theme-text-muted)' }}>{formatDate(meeting.createdAt)}</td>
                    <td style={{ color: 'var(--theme-text-muted)', fontWeight: '500' }}>{formatDuration(meeting.duration)}</td>
                    <td>
                      <span style={{ background: 'var(--theme-accent-light)', color: 'var(--theme-accent)', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>
                        {meeting.category}
                      </span>
                    </td>
                    <td>
                      <span className={`badge-status ${meeting.status}`}>
                        {meeting.status}
                      </span>
                    </td>
                    <td>
                      {meeting.status === 'completed' ? (
                        <button 
                          className="btn btn-primary" 
                          style={{ padding: '8px 14px', fontSize: '13px' }}
                          onClick={() => navigate(`/meeting/${meeting.id}`)}
                        >
                          <Eye size={14} /> Open Review
                        </button>
                      ) : meeting.status === 'processing' ? (
                        <div style={{ color: 'var(--theme-warning)', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span className="badge-status processing" style={{ padding: 0 }}></span> transcribing...
                        </div>
                      ) : meeting.status === 'pending' ? (
                        <span style={{ color: 'var(--theme-text-muted)', fontSize: '13px' }}>queued</span>
                      ) : (
                        <div style={{ color: 'var(--theme-danger)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <AlertCircle size={14} /> pipeline error
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
