import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckSquare, User, Calendar, Edit3, ArrowRight, ArrowLeft, RefreshCw, CheckCircle2, ChevronRight, Play } from 'lucide-react';

export default function ActionItems() {
  const { token } = useAuth();
  
  const [actionItems, setActionItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Edit Modal State
  const [editingItem, setEditingItem] = useState(null);
  const [editOwner, setEditOwner] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editProgress, setEditProgress] = useState(0);
  const [editStatus, setEditStatus] = useState('pending');

  const fetchActionItems = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/action-items', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setActionItems(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchActionItems();
  }, [token]);

  const handleStatusShift = async (item, targetStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/api/action-items/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: targetStatus })
      });

      if (res.ok) {
        // Optimistically update or fetch latest state
        fetchActionItems();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setEditOwner(item.owner);
    setEditDueDate(item.dueDate || '');
    setEditProgress(item.progress);
    setEditStatus(item.status);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      const res = await fetch(`http://localhost:5000/api/action-items/${editingItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          owner: editOwner,
          dueDate: editDueDate,
          progress: Number(editProgress),
          status: editStatus
        })
      });

      if (res.ok) {
        setEditingItem(null);
        fetchActionItems();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchActionItems();
  };

  // Group columns
  const getColItems = (status) => actionItems.filter(item => item.status === status);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div style={{ color: 'var(--theme-text-muted)', fontSize: '15px' }}>Loading tasks board...</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h1 className="page-title">Action Items Board</h1>
        <button className="btn btn-secondary" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw size={14} className={refreshing ? 'spinning' : ''} /> Sync Board
        </button>
      </div>
      <p className="page-subtitle">Track deliverables extracted by machine learning models directly into a progress flow.</p>

      {/* Kanban Board Columns layout */}
      <div className="action-board">
        
        {/* Column 1: Pending */}
        <div className="action-column">
          <div className="column-title">
            <span>Pending Syncs</span>
            <span style={{ fontSize: '12px', background: 'var(--theme-border)', padding: '2px 8px', borderRadius: '12px' }}>
              {getColItems('pending').length}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
            {getColItems('pending').length === 0 ? (
              <div style={{ color: 'var(--theme-text-muted)', fontSize: '12px', textAlign: 'center', padding: '24px 0' }}>Empty column</div>
            ) : (
              getColItems('pending').map(item => (
                <div key={item.id} className="action-item-card">
                  <div style={{ fontSize: '11px', color: 'var(--theme-accent)', fontWeight: '700', marginBottom: '6px' }}>
                    {item.Meeting?.title || 'Unknown Sync'}
                  </div>
                  <h4 style={{ fontSize: '14px', marginBottom: '12px', fontWeight: '600' }}>{item.title}</h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: 'var(--theme-text-muted)', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><User size={12} /> {item.owner}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={12} /> {item.dueDate}</div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--theme-border)', paddingTop: '10px' }}>
                    <button className="icon-btn" style={{ width: '28px', height: '28px' }} onClick={() => handleOpenEdit(item)} title="Edit task details">
                      <Edit3 size={12} />
                    </button>
                    <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => handleStatusShift(item, 'in progress')}>
                      Start <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 2: In Progress */}
        <div className="action-column">
          <div className="column-title">
            <span>In Engineering</span>
            <span style={{ fontSize: '12px', background: 'var(--theme-border)', padding: '2px 8px', borderRadius: '12px' }}>
              {getColItems('in progress').length}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
            {getColItems('in progress').length === 0 ? (
              <div style={{ color: 'var(--theme-text-muted)', fontSize: '12px', textAlign: 'center', padding: '24px 0' }}>Empty column</div>
            ) : (
              getColItems('in progress').map(item => (
                <div key={item.id} className="action-item-card">
                  <div style={{ fontSize: '11px', color: 'var(--theme-accent)', fontWeight: '700', marginBottom: '6px' }}>
                    {item.Meeting?.title || 'Unknown Sync'}
                  </div>
                  <h4 style={{ fontSize: '14px', marginBottom: '12px', fontWeight: '600' }}>{item.title}</h4>

                  {/* Progress bar info */}
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--theme-text-muted)', marginBottom: '4px' }}>
                      <span>Progress</span>
                      <span>{item.progress}%</span>
                    </div>
                    <div style={{ height: '6px', background: 'var(--theme-border)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${item.progress}%`, height: '100%', background: 'var(--theme-accent)' }}></div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: 'var(--theme-text-muted)', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><User size={12} /> {item.owner}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={12} /> {item.dueDate}</div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--theme-border)', paddingTop: '10px' }}>
                    <button className="icon-btn" style={{ width: '28px', height: '28px' }} onClick={() => handleStatusShift(item, 'pending')} title="Move back to Pending">
                      <ArrowLeft size={12} />
                    </button>
                    <button className="icon-btn" style={{ width: '28px', height: '28px' }} onClick={() => handleOpenEdit(item)} title="Edit task details">
                      <Edit3 size={12} />
                    </button>
                    <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '11px', background: 'var(--theme-success-light)', color: 'var(--theme-success)', borderColor: 'transparent', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => handleStatusShift(item, 'completed')}>
                      Done <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 3: Completed */}
        <div className="action-column">
          <div className="column-title">
            <span>Completed Syncs</span>
            <span style={{ fontSize: '12px', background: 'var(--theme-border)', padding: '2px 8px', borderRadius: '12px' }}>
              {getColItems('completed').length}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
            {getColItems('completed').length === 0 ? (
              <div style={{ color: 'var(--theme-text-muted)', fontSize: '12px', textAlign: 'center', padding: '24px 0' }}>Empty column</div>
            ) : (
              getColItems('completed').map(item => (
                <div key={item.id} className="action-item-card" style={{ opacity: 0.8 }}>
                  <div style={{ fontSize: '11px', color: 'var(--theme-text-muted)', fontWeight: '700', marginBottom: '6px' }}>
                    {item.Meeting?.title || 'Unknown Sync'}
                  </div>
                  <h4 style={{ fontSize: '14px', marginBottom: '12px', fontWeight: '600', textDecoration: 'line-through', color: 'var(--theme-text-muted)' }}>{item.title}</h4>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--theme-success)', marginBottom: '12px' }}>
                    <CheckCircle2 size={14} /> Completed
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: 'var(--theme-text-muted)', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><User size={12} /> {item.owner}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={12} /> {item.dueDate}</div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--theme-border)', paddingTop: '10px' }}>
                    <button className="icon-btn" style={{ width: '28px', height: '28px' }} onClick={() => handleStatusShift(item, 'in progress')} title="Reopen task">
                      <ArrowLeft size={12} />
                    </button>
                    <span style={{ fontSize: '11px', color: 'var(--theme-text-muted)' }}>Archive Ready</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Editing Dialog Modal Overlay */}
      {editingItem && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Modify Action Item</h3>
            <form onSubmit={handleSaveEdit}>
              <div className="form-group">
                <label className="form-label">Task Owner (Assignee)</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={editOwner}
                  onChange={(e) => setEditOwner(e.target.value)}
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input 
                  type="date" 
                  className="form-control" 
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Workflow Status</label>
                <select 
                  className="form-control"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="in progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {editStatus === 'in progress' && (
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Percentage Completed</span>
                    <span>{editProgress}%</span>
                  </label>
                  <input 
                    type="range" 
                    min="0" 
                    max="99" 
                    style={{ width: '100%', accentColor: 'var(--theme-accent)', cursor: 'pointer' }}
                    value={editProgress}
                    onChange={(e) => setEditProgress(e.target.value)}
                  />
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setEditingItem(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Save Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
