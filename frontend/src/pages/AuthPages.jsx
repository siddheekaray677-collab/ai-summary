import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Mail, Lock, User, ArrowRight, ArrowLeft, Info } from 'lucide-react';
import { SignIn, SignUp } from '@clerk/clerk-react';

export function Login() {
  const navigate = useNavigate();
  const { login, resetPassword, isClerkActive } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Reset Password Modal State
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');
    setResetLoading(true);

    try {
      await resetPassword(resetEmail, newPassword);
      setResetSuccess('Password updated successfully. You can now log in.');
      setResetEmail('');
      setNewPassword('');
    } catch (err) {
      setResetError(err.message || 'Password reset failed');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--theme-bg)' }}>
      {/* Back button */}
      <div style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 10 }}>
        <button onClick={() => navigate('/')} className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <ArrowLeft size={16} /> Back to Site
        </button>
      </div>

      {/* Main Credentials Panel */}
      <div style={{ flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 40px', maxWidth: '520px', margin: '0 auto', position: 'relative' }}>
        {isClerkActive ? (
          <div style={{ display: 'flex', justifyContent: 'center', margin: 'auto 0' }}>
            <SignIn redirectUrl="/dashboard" signUpUrl="/register" />
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', fontSize: '24px', fontFamily: 'var(--font-display)', marginBottom: '32px' }}>
              <div style={{ background: 'var(--theme-accent)', padding: '6px', borderRadius: '8px', color: 'white', display: 'flex' }}>
                <Sparkles size={20} />
              </div>
              <span>MeetMind<span style={{ color: 'var(--theme-accent)' }}>AI</span></span>
            </div>

            <h2 style={{ fontSize: '32px', marginBottom: '8px' }}>Welcome Back</h2>
            <p style={{ color: 'var(--theme-text-muted)', fontSize: '14px', marginBottom: '32px' }}>
              Enter your enterprise credentials to access your meeting intelligence.
            </p>

            {error && (
              <div style={{ background: 'var(--theme-danger-light)', color: 'var(--theme-danger)', border: '1px solid var(--theme-danger)', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Info size={16} /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="search-input-wrapper">
                  <span className="search-icon"><Mail size={18} /></span>
                  <input 
                    type="email" 
                    className="form-control" 
                    placeholder="email@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '8px' }}>
                <label className="form-label">Password</label>
                <div className="search-input-wrapper">
                  <span className="search-icon"><Lock size={18} /></span>
                  <input 
                    type="password" 
                    className="form-control" 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div style={{ textAlign: 'right', marginBottom: '24px' }}>
                <button 
                  type="button" 
                  onClick={() => { setShowResetModal(true); setResetError(''); setResetSuccess(''); }}
                  style={{ fontSize: '13px', color: 'var(--theme-accent)', fontWeight: '500', cursor: 'pointer' }}
                >
                  Forgot your password?
                </button>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={loading}
                style={{ width: '100%', padding: '12px', fontSize: '15px' }}
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>

            <p style={{ marginTop: '24px', fontSize: '14px', textAlign: 'center', color: 'var(--theme-text-muted)' }}>
              Don't have an account? <Link to="/register" style={{ color: 'var(--theme-accent)', fontWeight: '600' }}>Register here</Link>
            </p>

            {/* Demo credentials helper alert */}
            <div style={{ marginTop: '32px', background: 'var(--theme-bg-alt)', padding: '16px', borderRadius: '12px', border: '1px solid var(--theme-border)', fontSize: '13px' }}>
              <div style={{ fontWeight: '700', marginBottom: '6px', color: 'var(--theme-text)' }}>🔑 Quick Access Demo Accounts:</div>
              <div style={{ color: 'var(--theme-text-muted)', marginBottom: '4px' }}><strong>Admin:</strong> admin@meetmind.ai / admin123</div>
              <div style={{ color: 'var(--theme-text-muted)' }}><strong>User:</strong> user@meetmind.ai / user123</div>
            </div>
          </>
        )}
      </div>

      {/* Decorative Brand Panel */}
      <div style={{ flex: '1.2', background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '80px', borderLeft: '1px solid var(--theme-border)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(99,102,241,0) 70%)' }}></div>
        <div style={{ zIndex: 1, maxWidth: '500px' }}>
          <h3 style={{ fontSize: '40px', fontWeight: '800', lineHeight: '1.2', marginBottom: '24px', color: '#f8fafc' }}>
            Meeting Intelligence, Automated.
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '16px', lineHeight: '1.6', marginBottom: '40px' }}>
            MeetMind AI converts raw corporate video and audio feeds into compliant executive summaries, key decisions, speaker time breakdowns, and action schedules.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {[
              "95%+ transcription word accuracy",
              "Biometric-based speaker diarization",
              "Automated tracking task extraction",
              "Downloadable Word and PDF formats"
            ].map((text, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#e2e8f0', fontSize: '14px', fontWeight: '500' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--theme-success)', color: 'white', display: 'flex', alignItems: 'center', justifyContext: 'center', fontSize: '12px', flexShrink: 0 }}>
                  <span style={{ margin: 'auto' }}>✓</span>
                </div>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Password Reset Modal Overlay */}
      {showResetModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>Reset Account Password</h3>
            <p style={{ color: 'var(--theme-text-muted)', fontSize: '13.5px', marginBottom: '20px' }}>
              Specify the email registered to your account, and set your new desired password.
            </p>

            {resetSuccess && (
              <div style={{ background: 'var(--theme-success-light)', color: 'var(--theme-success)', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
                {resetSuccess}
              </div>
            )}
            
            {resetError && (
              <div style={{ background: 'var(--theme-danger-light)', color: 'var(--theme-danger)', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
                {resetError}
              </div>
            )}

            <form onSubmit={handleResetPassword}>
              <div className="form-group">
                <label className="form-label">Account Email</label>
                <input 
                  type="email" 
                  className="form-control" 
                  placeholder="admin@meetmind.ai" 
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input 
                  type="password" 
                  className="form-control" 
                  placeholder="••••••••" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required 
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  style={{ flex: 1 }}
                  onClick={() => setShowResetModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ flex: 1 }}
                  disabled={resetLoading}
                >
                  {resetLoading ? 'Resetting...' : 'Submit Reset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export function Register() {
  const navigate = useNavigate();
  const { register, isClerkActive } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);

    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--theme-bg)' }}>
      {/* Back button */}
      <div style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 10 }}>
        <button onClick={() => navigate('/')} className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <ArrowLeft size={16} /> Back to Site
        </button>
      </div>

      {/* Main Register Form Panel */}
      <div style={{ flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 40px', maxWidth: '520px', margin: '0 auto' }}>
        {isClerkActive ? (
          <div style={{ display: 'flex', justifyContent: 'center', margin: 'auto 0' }}>
            <SignUp redirectUrl="/dashboard" signInUrl="/login" />
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', fontSize: '24px', fontFamily: 'var(--font-display)', marginBottom: '24px' }}>
              <div style={{ background: 'var(--theme-accent)', padding: '6px', borderRadius: '8px', color: 'white', display: 'flex' }}>
                <Sparkles size={20} />
              </div>
              <span>MeetMind<span style={{ color: 'var(--theme-accent)' }}>AI</span></span>
            </div>

            <h2 style={{ fontSize: '32px', marginBottom: '8px' }}>Create Account</h2>
            <p style={{ color: 'var(--theme-text-muted)', fontSize: '14px', marginBottom: '24px' }}>
              Register now to unlock AI-powered diarizations and automated tasks.
            </p>

            {error && (
              <div style={{ background: 'var(--theme-danger-light)', color: 'var(--theme-danger)', border: '1px solid var(--theme-danger)', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Info size={16} /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div className="search-input-wrapper">
                  <span className="search-icon"><User size={18} /></span>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Sarah Jenkins" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="search-input-wrapper">
                  <span className="search-icon"><Mail size={18} /></span>
                  <input 
                    type="email" 
                    className="form-control" 
                    placeholder="jenkins@company.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="search-input-wrapper">
                  <span className="search-icon"><Lock size={18} /></span>
                  <input 
                    type="password" 
                    className="form-control" 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Confirm Password</label>
                <div className="search-input-wrapper">
                  <span className="search-icon"><Lock size={18} /></span>
                  <input 
                    type="password" 
                    className="form-control" 
                    placeholder="••••••••" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={loading}
                style={{ width: '100%', padding: '12px', fontSize: '15px' }}
              >
                {loading ? 'Generating Account...' : 'Register'}
              </button>
            </form>

            <p style={{ marginTop: '24px', fontSize: '14px', textAlign: 'center', color: 'var(--theme-text-muted)' }}>
              Already have an account? <Link to="/login" style={{ color: 'var(--theme-accent)', fontWeight: '600' }}>Sign In here</Link>
            </p>
          </>
        )}
      </div>

      {/* Decorative Brand Panel */}
      <div style={{ flex: '1.2', background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '80px', borderLeft: '1px solid var(--theme-border)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(99,102,241,0) 70%)' }}></div>
        <div style={{ zIndex: 1, maxWidth: '500px' }}>
          <h3 style={{ fontSize: '40px', fontWeight: '800', lineHeight: '1.2', marginBottom: '24px', color: '#f8fafc' }}>
            Enterprise Meeting Workflows.
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '16px', lineHeight: '1.6', marginBottom: '40px' }}>
            Empower your team with a clear tracking index of who said what, which deadlines were set, and when to expect completion.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {[
              "Collaborative action item assignment board",
              "Dynamic export reports in PDF, DOC, and TXT",
              "Automated sentiment and productivity scoring",
              "Admin storage monitoring gauges"
            ].map((text, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#e2e8f0', fontSize: '14px', fontWeight: '500' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--theme-success)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', flexShrink: 0 }}>
                  <span style={{ margin: 'auto' }}>✓</span>
                </div>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
