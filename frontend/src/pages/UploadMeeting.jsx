import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UploadCloud, FileAudio, FileVideo, FileText, CheckCircle, Info, Sparkles, X } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function UploadMeeting() {
  const navigate = useNavigate();
  const { token } = useAuth();
  
  // Form Metadata
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  
  // File upload state
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  
  const fileInputRef = useRef(null);

  const allowedExtensions = ['.mp3', '.wav', '.m4a', '.mp4'];
  const maxFileSizeBytes = 100 * 1024 * 1024; // 100 MB

  // Handle file validation
  const validateFile = (selectedFile) => {
    setError('');
    
    if (!selectedFile) return false;

    const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
    
    if (!allowedExtensions.includes(fileExtension)) {
      setError(`Unsupported file format. Supported types: ${allowedExtensions.join(', ')}`);
      return false;
    }

    if (selectedFile.size > maxFileSizeBytes) {
      setError('File exceeds the 100 MB maximum size threshold.');
      return false;
    }

    setFile(selectedFile);
    
    // Auto-fill title with filename (without extension) if title is empty
    if (!title) {
      const baseName = selectedFile.name.substring(0, selectedFile.name.lastIndexOf('.'));
      // Clean up names (e.g. replace dashes and underscores with spaces)
      const cleanName = baseName.replace(/[-_]+/g, ' ');
      setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }
    
    return true;
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = (e) => {
    e.stopPropagation();
    setFile(null);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!file) {
      return setError('Please drag-and-drop or select an audio or video file first.');
    }

    setUploading(true);
    setUploadProgress(0);

    // 1. Simulate upload progress loader in UI (smooth animation)
    const uploadDuration = 2500; // 2.5 seconds
    const intervalTime = 100;
    const increment = 100 / (uploadDuration / intervalTime);

    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return Math.round(prev + increment);
      });
    }, intervalTime);

    // 2. Perform backend API multipart request
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);

      const res = await fetch(`${API_BASE_URL}/api/meetings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      clearInterval(progressInterval);

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to upload meeting assets.');
      }

      setUploadProgress(100);
      setSuccess(true);
      
      // Navigate to history page after a brief wait to let user see success state
      setTimeout(() => {
        navigate('/history');
      }, 1500);
    } catch (err) {
      clearInterval(progressInterval);
      setError(err.message || 'An error occurred during file upload.');
      setUploading(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">Upload Meeting</h1>
      <p className="page-subtitle">Queue records for simulated Speech-to-Text translation and summary analysis.</p>

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {error && (
          <div style={{ background: 'var(--theme-danger-light)', color: 'var(--theme-danger)', border: '1px solid var(--theme-danger)', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Info size={16} /> {error}
          </div>
        )}

        {success && (
          <div style={{ background: 'var(--theme-success-light)', color: 'var(--theme-success)', border: '1px solid var(--theme-success)', padding: '16px', borderRadius: '8px', fontSize: '15px', fontWeight: '600', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={18} /> Upload completed successfully! Redirecting to dashboard queue...
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Drag & Drop Area */}
          <div 
            className={`upload-zone ${dragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current.click()}
            style={{ position: 'relative' }}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={handleFileSelect}
              accept=".mp3,.wav,.m4a,.mp4"
            />

            {file ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--theme-accent-light)', padding: '8px 16px', borderRadius: '8px' }}>
                  {file.name.endsWith('.mp4') ? <FileVideo size={24} color="var(--theme-accent)" /> : <FileAudio size={24} color="var(--theme-accent)" />}
                  <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--theme-text)' }}>{file.name}</span>
                  <button className="icon-btn" onClick={handleRemoveFile} style={{ width: '24px', height: '24px', border: 'none', background: 'none', color: 'var(--theme-danger)', marginLeft: '8px' }}>
                    <X size={14} />
                  </button>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--theme-text-muted)' }}>
                  Size: {(file.size / (1024 * 1024)).toFixed(2)} MB
                </div>
              </div>
            ) : (
              <div>
                <div className="upload-icon"><UploadCloud size={48} /></div>
                <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>Drag & drop your meeting file here</h3>
                <p style={{ color: 'var(--theme-text-muted)', fontSize: '13px' }}>
                  Supports MP3, WAV, M4A, or MP4 formats (Max 100 MB)
                </p>
              </div>
            )}

            {uploading && (
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', borderRadius: 'var(--border-radius-lg)', zIndex: 10 }}>
                <Sparkles size={36} color="var(--theme-accent)" className="badge-status processing" style={{ animation: 'spin 4s linear infinite', border: 'none', background: 'none' }} />
                <h4 style={{ fontSize: '16px', marginTop: '16px', marginBottom: '8px' }}>Uploading Asset Data...</h4>
                <div className="progress-container" style={{ width: '80%' }}>
                  <div className="progress-bar" style={{ width: `${uploadProgress}%` }}></div>
                </div>
                <div style={{ fontSize: '13px', fontWeight: '600' }}>{uploadProgress}%</div>
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="form-group">
            <label className="form-label">Meeting Title</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="e.g. Weekly Product Sync" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={uploading}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label">Meeting Category</label>
              <select 
                className="form-control"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={uploading}
              >
                <option value="General">General Sync</option>
                <option value="Marketing">Marketing & Launch</option>
                <option value="Product">Product & Roadmap</option>
                <option value="Finance">Finance & Operations</option>
                <option value="Legal">Legal & Compliance</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Meeting Description (Optional)</label>
            <textarea 
              className="form-control" 
              rows="4" 
              placeholder="Provide a brief context or topics discussed in the meeting to improve AI summarization specificity..." 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={uploading}
              style={{ resize: 'none' }}
            ></textarea>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => navigate('/dashboard')}
              disabled={uploading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={uploading}
            >
              Start AI Processing
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
