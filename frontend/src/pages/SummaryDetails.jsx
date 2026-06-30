import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, Download, Clipboard, Check, Trash2, 
  Sparkles, FileText, CheckCircle, AlertTriangle, Shield, User, Clock, Award
} from 'lucide-react';

export default function SummaryDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, getToken } = useAuth();

  const [loading, setLoading] = useState(true);
  const [meeting, setMeeting] = useState(null);
  const [transcript, setTranscript] = useState(null);
  const [summary, setSummary] = useState(null);
  const [actionItems, setActionItems] = useState([]);
  
  const [activeTab, setActiveTab] = useState('summary');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const fetchDetails = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/meetings/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMeeting(data.meeting);
        setTranscript(data.transcript);
        setSummary(data.summary);
        setActionItems(data.actionItems);
      } else {
        setError('Failed to retrieve meeting records from server.');
      }
    } catch (err) {
      console.error('Error fetching meeting details:', err);
      setError('An error occurred connecting to the backend services.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id, token]);

  const handleCopyClipboard = () => {
    if (!summary) return;
    
    let copyText = `MEETING AI SUMMARY: ${meeting.title}\n\n`;
    copyText += `Executive Brief:\n${summary.executiveSummary}\n\n`;
    copyText += `Key points:\n${summary.keyPoints.map((k, i) => `- ${k}`).join('\n')}\n\n`;
    copyText += `Decisions:\n${summary.decisions.map((d, i) => `- ${d}`).join('\n')}\n\n`;
    copyText += `Productivity Score: ${summary.productivityScore}/100\nSentiment: ${summary.sentiment}`;

    navigator.clipboard.writeText(copyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportFile = async (format) => {
    let activeToken = token;
    if (typeof getToken === 'function') {
      try {
        activeToken = await getToken();
      } catch (err) {
        console.error('Failed to get fresh auth token:', err);
      }
    }

    const downloadUrl = `http://localhost:5000/api/reports/export/${id}/${format}`;
    
    if (format === 'pdf') {
      // Open printable view in a new tab, passing the token via query param
      window.open(`${downloadUrl}?token=${activeToken}`, '_blank');
    } else {
      const link = document.createElement('a');
      
      fetch(downloadUrl, {
        headers: { 'Authorization': `Bearer ${activeToken}` }
      })
      .then(res => {
        if (!res.ok) {
          return res.json().then(err => {
            throw new Error(err.message || 'Export failed');
          });
        }
        return res.blob();
      })
      .then(blob => {
        const blobUrl = window.URL.createObjectURL(blob);
        link.href = blobUrl;
        link.download = `MeetMind_${meeting.title.replace(/\s+/g, '_')}.${format === 'docx' ? 'doc' : 'txt'}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      })
      .catch(err => {
        console.error('Download export failed:', err);
        alert(`Export failed: ${err.message}`);
      });
    }
  };

  const handleDeleteMeeting = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this meeting and all its transcripts, summaries, and action items? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/meetings/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        navigate('/history');
      } else {
        alert('Failed to delete meeting. Try again.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div style={{ color: 'var(--theme-text-muted)', fontSize: '15px' }}>Loading analysis records...</div>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px 0', border: '1px solid var(--theme-danger)' }}>
        <h3 style={{ color: 'var(--theme-danger)', marginBottom: '8px' }}>Auditing Failure</h3>
        <p style={{ color: 'var(--theme-text-muted)', marginBottom: '16px' }}>{error || 'Meeting records not found.'}</p>
        <button className="btn btn-secondary" onClick={() => navigate('/history')}><ArrowLeft size={16} /> Back to History</button>
      </div>
    );
  }

  return (
    <div>
      {/* Detail header tools */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <button className="btn btn-secondary" onClick={() => navigate('/history')} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <ArrowLeft size={16} /> Back to History
        </button>

        <div style={{ display: 'flex', gap: '12px' }}>
          {meeting && meeting.status === 'completed' && (
            <>
              <button className="btn btn-secondary" onClick={handleCopyClipboard} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                {copied ? <Check size={16} color="var(--theme-success)" /> : <Clipboard size={16} />}
                {copied ? 'Copied Summary!' : 'Copy Summary'}
              </button>
              
              {/* Export selections */}
              <button className="btn btn-secondary" onClick={() => handleExportFile('txt')} title="Download plain text file">
                <Download size={16} /> Export TXT
              </button>
              <button className="btn btn-secondary" onClick={() => handleExportFile('docx')} title="Download MS Word document">
                <Download size={16} /> Export Word
              </button>
              <button className="btn btn-primary" onClick={() => handleExportFile('pdf')} title="Open Print View to Save PDF">
                <Download size={16} /> Export PDF
              </button>
            </>
          )}

          <button className="btn btn-danger" onClick={handleDeleteMeeting} title="Delete meeting log">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Meeting Brief card */}
      <div className="card" style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '11px', background: 'var(--theme-accent-light)', color: 'var(--theme-accent)', padding: '4px 10px', borderRadius: '4px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px', display: 'inline-block' }}>
              {meeting.category}
            </span>
            <h1 style={{ fontSize: '24px', marginBottom: '8px' }}>{meeting.title}</h1>
            <p style={{ color: 'var(--theme-text-muted)', fontSize: '14.5px', maxWidth: '800px', lineHeight: '1.6' }}>
              {meeting.description || 'No description provided.'}
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13.5px', color: 'var(--theme-text-muted)', borderLeft: '1px solid var(--theme-border)', paddingLeft: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Clock size={16} /> <strong>Duration:</strong> {Math.floor(meeting.duration / 60)} mins</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><User size={16} /> <strong>Audited:</strong> {formatDate(meeting.createdAt)}</div>
            {summary && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Award size={16} /> <strong>Sentiment:</strong> <span style={{ color: 'var(--theme-accent)', fontWeight: '600' }}>{summary.sentiment}</span></div>
            )}
          </div>
        </div>
      </div>

      {/* Dual Column Layout (Interactive Transcript vs AI summaries tabs) */}
      <div className="split-container">
        
        {/* Left: Dialogue Transcript */}
        <div className="panel-col">
          <div className="panel-header">
            <h3 style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><FileText size={18} /> Interactive Transcript</h3>
            <span style={{ fontSize: '12px', color: 'var(--theme-text-muted)', fontWeight: '500' }}>Click bubbles to select text</span>
          </div>
          <div className="panel-body">
            {transcript && transcript.segments && transcript.segments.length > 0 ? (
              transcript.segments.map((seg, idx) => (
                <div key={idx} className="transcript-bubble">
                  <div className="transcript-speaker">
                    <span>{seg.speaker}</span>
                    <span className="transcript-time">{formatTime(seg.start)}</span>
                  </div>
                  <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--theme-text-muted)' }}>
                    {seg.text}
                  </p>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--theme-text-muted)' }}>
                No dialogue transcript details available.
              </div>
            )}
          </div>
        </div>

        {/* Right: AI Summaries panel */}
        <div className="panel-col">
          <div className="tabs" style={{ background: 'var(--theme-bg-alt)', padding: '0 8px', borderBottom: '1px solid var(--theme-border)' }}>
            <button className={`tab-btn ${activeTab === 'summary' ? 'active' : ''}`} onClick={() => setActiveTab('summary')}>Summary</button>
            <button className={`tab-btn ${activeTab === 'points' ? 'active' : ''}`} onClick={() => setActiveTab('points')}>Discussion</button>
            <button className={`tab-btn ${activeTab === 'decisions' ? 'active' : ''}`} onClick={() => setActiveTab('decisions')}>Decisions & Risks</button>
            <button className={`tab-btn ${activeTab === 'tasks' ? 'active' : ''}`} onClick={() => setActiveTab('tasks')}>Action Items ({actionItems.length})</button>
          </div>

          <div className="panel-body">
            {summary ? (
              <>
                {/* TAB: SUMMARY */}
                {activeTab === 'summary' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div>
                      <h4 style={{ fontSize: '15px', color: 'var(--theme-text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Executive Brief</h4>
                      <p style={{ fontSize: '15px', lineHeight: '1.6' }}>{summary.executiveSummary}</p>
                    </div>

                    <hr style={{ borderColor: 'var(--theme-border)' }} />

                    {/* Productivity score gauge */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                      <div style={{ width: '80px', height: '80px', position: 'relative', flexShrink: 0 }}>
                        <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%' }}>
                          <path
                            className="gauge-bg"
                            style={{ strokeWidth: 3 }}
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className="gauge-fill"
                            style={{ strokeWidth: 3, strokeDasharray: `${summary.productivityScore}, 100` }}
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontWeight: '800', fontSize: '16px', fontFamily: 'var(--font-display)' }}>
                          {summary.productivityScore}
                        </div>
                      </div>
                      <div>
                        <h4 style={{ fontSize: '16px', color: 'var(--theme-text)' }}>Meeting Productivity Index</h4>
                        <p style={{ fontSize: '13px', color: 'var(--theme-text-muted)', marginTop: '4px' }}>
                          Calculated using speech pace, dialogue participation indices, and action item ratios.
                        </p>
                      </div>
                    </div>

                    {/* Speaker speaking duration breakdowns */}
                    {summary.speakerInsights && summary.speakerInsights.length > 0 && (
                      <div>
                        <h4 style={{ fontSize: '15px', color: 'var(--theme-text-muted)', marginBottom: '12px', textTransform: 'uppercase' }}>Speaker Contribution Analysis</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {summary.speakerInsights.map((insight, idx) => (
                            <div key={idx} style={{ fontSize: '13.5px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span style={{ fontWeight: '600' }}>{insight.name}</span>
                                <span style={{ color: 'var(--theme-text-muted)' }}>{insight.ratio}% ({insight.speakTime}s)</span>
                              </div>
                              <div style={{ height: '6px', background: 'var(--theme-border)', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ width: `${insight.ratio}%`, height: '100%', background: 'var(--theme-accent)' }}></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB: DISCUSSION POINTS */}
                {activeTab === 'points' && (
                  <div>
                    <h4 style={{ fontSize: '15px', color: 'var(--theme-text-muted)', marginBottom: '16px', textTransform: 'uppercase' }}>Key Discussion Threads</h4>
                    <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14.5px', lineHeight: '1.6' }}>
                      {summary.keyPoints.map((point, idx) => (
                        <li key={idx} style={{ paddingLeft: '4px' }}>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* TAB: DECISIONS & RISKS */}
                {activeTab === 'decisions' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div>
                      <h4 style={{ fontSize: '15px', color: 'var(--theme-text-muted)', marginBottom: '12px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle size={16} color="var(--theme-success)" /> Resolutions & Decisions
                      </h4>
                      {summary.decisions.length === 0 ? (
                        <p style={{ color: 'var(--theme-text-muted)', fontSize: '13.5px' }}>No formal decisions recorded during sync.</p>
                      ) : (
                        <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
                          {summary.decisions.map((dec, idx) => (
                            <li key={idx}><strong>Approved:</strong> {dec}</li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <hr style={{ borderColor: 'var(--theme-border)' }} />

                    <div>
                      <h4 style={{ fontSize: '15px', color: 'var(--theme-text-muted)', marginBottom: '12px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <AlertTriangle size={16} color="var(--theme-danger)" /> Risks & Bottlenecks
                      </h4>
                      {summary.risks.length === 0 ? (
                        <p style={{ color: 'var(--theme-text-muted)', fontSize: '13.5px' }}>No clear process risks identified.</p>
                      ) : (
                        <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
                          {summary.risks.map((risk, idx) => (
                            <li key={idx} style={{ color: 'var(--theme-text)' }}>{risk}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB: ACTION ITEMS */}
                {activeTab === 'tasks' && (
                  <div>
                    <h4 style={{ fontSize: '15px', color: 'var(--theme-text-muted)', marginBottom: '16px', textTransform: 'uppercase' }}>Extracted Deliverables</h4>
                    {actionItems.length === 0 ? (
                      <div style={{ color: 'var(--theme-text-muted)', fontSize: '13.5px', textAlign: 'center', padding: '24px 0' }}>
                        No target action items found in meeting transcripts.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {actionItems.map((item, idx) => (
                          <div key={item.id} className="action-item-card" style={{ cursor: 'default' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '8px' }}>
                              <span style={{ fontWeight: '600', fontSize: '14px' }}>{item.title}</span>
                              <span className={`badge-status ${item.status}`} style={{ fontSize: '10px' }}>
                                {item.status}
                              </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--theme-text-muted)' }}>
                              <span>Owner: <strong>{item.owner}</strong></span>
                              <span>Due Date: {item.dueDate}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--theme-text-muted)' }}>
                AI Summary components loading or unavailable.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
