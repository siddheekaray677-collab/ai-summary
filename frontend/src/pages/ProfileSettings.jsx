import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Shield, Info, CheckCircle, Sparkles, Bell, HelpCircle } from 'lucide-react';

export default function ProfileSettings() {
  const { user, settings, updateProfile, updateSettings } = useAuth();

  // Profile fields state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Settings preferences state
  const [themePref, setThemePref] = useState(settings?.theme || 'dark');
  const [notifications, setNotifications] = useState(settings?.emailNotifications ?? true);
  const [aiModel, setAiModel] = useState(settings?.aiModel || 'MeetMind Premium v2');
  const [language, setLanguage] = useState(settings?.language || 'English');

  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [settingsError, setSettingsError] = useState('');

  // Sync state with settings when loaded from API
  useEffect(() => {
    if (settings) {
      setThemePref(settings.theme);
      setNotifications(settings.emailNotifications);
      setAiModel(settings.aiModel);
      setLanguage(settings.language);
    }
  }, [settings]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    if (password && password !== confirmPassword) {
      return setProfileError('Passwords do not match.');
    }

    try {
      await updateProfile(name, email, password);
      setProfileSuccess('Account profile details updated successfully.');
      setPassword('');
      setConfirmPassword('');
      setTimeout(() => setProfileSuccess(''), 4000);
    } catch (err) {
      setProfileError(err.message || 'Profile update failed.');
    }
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    setSettingsError('');
    setSettingsSuccess('');

    try {
      await updateSettings({
        theme: themePref,
        emailNotifications: notifications,
        aiModel,
        language
      });
      setSettingsSuccess('Application system preferences saved successfully.');
      setTimeout(() => setSettingsSuccess(''), 4000);
    } catch (err) {
      setSettingsError(err.message || 'Settings update failed.');
    }
  };

  return (
    <div>
      <h1 className="page-title">Account Settings</h1>
      <p className="page-subtitle">Configure your profile details, default AI summarization parameters, and telemetry toggles.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }} className="admin-grid">
        
        {/* Left Column: Account Profile Details */}
        <div className="card" style={{ alignSelf: 'flex-start' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={18} color="var(--theme-accent)" /> Personal Profile
          </h3>

          {profileSuccess && (
            <div style={{ background: 'var(--theme-success-light)', color: 'var(--theme-success)', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '20px' }}>
              <CheckCircle size={14} style={{ display: 'inline', marginRight: '6px' }} /> {profileSuccess}
            </div>
          )}

          {profileError && (
            <div style={{ background: 'var(--theme-danger-light)', color: 'var(--theme-danger)', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '20px' }}>
              <Info size={14} style={{ display: 'inline', marginRight: '6px' }} /> {profileError}
            </div>
          )}

          <form onSubmit={handleProfileSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input 
                type="text" 
                className="form-control" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Work Email Address</label>
              <input 
                type="email" 
                className="form-control" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>

            <hr style={{ borderColor: 'var(--theme-border)', margin: '24px 0' }} />
            <h4 style={{ fontSize: '14px', color: 'var(--theme-text-muted)', marginBottom: '16px', textTransform: 'uppercase' }}>Change Password</h4>

            <div className="form-group">
              <label className="form-label">New Password (leave empty to keep current)</label>
              <input 
                type="password" 
                className="form-control" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input 
                type="password" 
                className="form-control" 
                placeholder="••••••••" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '12px' }}>
              Save Profile Updates
            </button>
          </form>
        </div>

        {/* Right Column: App Settings & Custom LLM Configurations */}
        <div className="card" style={{ alignSelf: 'flex-start' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={18} color="var(--theme-accent)" /> Application Preferences
          </h3>

          {settingsSuccess && (
            <div style={{ background: 'var(--theme-success-light)', color: 'var(--theme-success)', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '20px' }}>
              <CheckCircle size={14} style={{ display: 'inline', marginRight: '6px' }} /> {settingsSuccess}
            </div>
          )}

          {settingsError && (
            <div style={{ background: 'var(--theme-danger-light)', color: 'var(--theme-danger)', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '20px' }}>
              <Info size={14} style={{ display: 'inline', marginRight: '6px' }} /> {settingsError}
            </div>
          )}

          <form onSubmit={handleSettingsSubmit}>
            <div className="form-group">
              <label className="form-label">User Interface Theme</label>
              <select 
                className="form-control" 
                value={themePref}
                onChange={(e) => setThemePref(e.target.value)}
              >
                <option value="dark">Dark Theme (Default SaaS)</option>
                <option value="light">Light Theme (Corporate Clean)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Default LLM Summarizer Model</label>
              <select 
                className="form-control" 
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value)}
              >
                <option value="MeetMind Premium v2">MeetMind Premium v2 (Accurate, slow)</option>
                <option value="MeetMind Standard v1">MeetMind Standard v1 (Fast, balanced)</option>
                <option value="GPT-4o Integration (Connected)">GPT-4o Custom Integration API</option>
                <option value="Gemini 1.5 Pro (Connected)">Gemini 1.5 Pro API</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Default Transcription Language</label>
              <select 
                className="form-control" 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="English">English (United States)</option>
                <option value="Spanish">Spanish (Español)</option>
                <option value="German">German (Deutsch)</option>
                <option value="French">French (Français)</option>
                <option value="Japanese">Japanese (日本語)</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">Communication Settings</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0' }}>
                <input 
                  type="checkbox" 
                  id="notif-toggle"
                  style={{ width: '18px', height: '18px', accentColor: 'var(--theme-accent)', cursor: 'pointer' }}
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                />
                <label htmlFor="notif-toggle" style={{ fontSize: '14px', color: 'var(--theme-text)', cursor: 'pointer' }}>
                  Email me automated reports once transcription completes.
                </label>
              </div>
            </div>

            <button type="submit" className="btn btn-primary">
              Save Settings Preferences
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
