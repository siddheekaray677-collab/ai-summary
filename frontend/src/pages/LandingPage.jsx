import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FileAudio, Sparkles, UserCheck, ShieldCheck, 
  ArrowRight, Check, HelpCircle, Mail, MessageSquare, Phone
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [activeFaq, setActiveFaq] = useState(null);
  const [contactSuccess, setContactSuccess] = useState(false);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactSuccess(true);
    setTimeout(() => setContactSuccess(false), 5000);
    e.target.reset();
  };

  return (
    <div style={{ backgroundColor: 'var(--theme-bg)', minHeight: '100vh' }}>
      {/* Navbar */}
      <nav className="landing-navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', fontSize: '20px', fontFamily: 'var(--font-display)' }}>
          <div style={{ background: 'var(--theme-accent)', padding: '6px', borderRadius: '8px', color: 'white', display: 'flex' }}>
            <Sparkles size={20} />
          </div>
          <span>MeetMind<span style={{ color: 'var(--theme-accent)' }}>AI</span></span>
        </div>
        <div className="nav-links">
          <a href="#features" className="sidebar-link" style={{ padding: '4px 12px' }}>Features</a>
          <a href="#workflow" className="sidebar-link" style={{ padding: '4px 12px' }}>Workflow</a>
          <a href="#pricing" className="sidebar-link" style={{ padding: '4px 12px' }}>Pricing</a>
          <a href="#faq" className="sidebar-link" style={{ padding: '4px 12px' }}>FAQ</a>
          <a href="#contact" className="sidebar-link" style={{ padding: '4px 12px' }}>Contact</a>
        </div>
        <div>
          {isAuthenticated ? (
            <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
              Go to Dashboard <ArrowRight size={16} />
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-secondary" onClick={() => navigate('/login')}>Sign In</button>
              <button className="btn btn-primary" onClick={() => navigate('/register')}>Get Started</button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero-section" style={{ borderBottom: '1px solid var(--theme-border)' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--theme-accent-light)', padding: '6px 16px', borderRadius: '9999px', fontSize: '12px', fontWeight: '700', color: 'var(--theme-accent)', marginBottom: '8px' }}>
          <Sparkles size={14} /> NEW: Enterprise Speaker Diarization v2.4
        </div>
        <h1 className="hero-title">
          Turn Meeting Noise into <span>Structured Intelligence</span>
        </h1>
        <p className="hero-description">
          Upload audio or video meetings. Extract executive summaries, decisions, automated action items, speaker logs, and productivity analytics in seconds.
        </p>
        <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
          <button className="btn btn-primary" onClick={() => navigate('/register')} style={{ padding: '14px 28px', fontSize: '16px' }}>
            Start Free Trial <ArrowRight size={18} />
          </button>
          <a href="#workflow" className="btn btn-secondary" style={{ padding: '14px 28px', fontSize: '16px' }}>
            See How It Works
          </a>
        </div>
      </header>

      {/* Features Grid */}
      <section id="features" style={{ borderBottom: '1px solid var(--theme-border)', padding: '80px 0' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '36px', marginBottom: '12px' }}>AI-Powered Meeting Insights</h2>
          <p style={{ color: 'var(--theme-text-muted)', maxWidth: '600px', margin: '0 auto' }}>
            Enterprise-grade modules designed to automate transcription, compliance mapping, and task delegation.
          </p>
        </div>

        <div className="feature-grid">
          <div className="card">
            <div className="stat-icon" style={{ marginBottom: '16px' }}>
              <FileAudio size={24} />
            </div>
            <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Auto Summarization</h3>
            <p style={{ color: 'var(--theme-text-muted)', fontSize: '14px', lineHeight: '1.5' }}>
              Generates executive briefs, core discussion threads, and identifies project barriers without manual note-taking.
            </p>
          </div>

          <div className="card">
            <div className="stat-icon" style={{ marginBottom: '16px' }}>
              <UserCheck size={24} />
            </div>
            <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Speaker Diarization</h3>
            <p style={{ color: 'var(--theme-text-muted)', fontSize: '14px', lineHeight: '1.5' }}>
              Accurately identifies distinct speakers, calculates contribution ratios, and maps dialogue logs chronologically.
            </p>
          </div>

          <div className="card">
            <div className="stat-icon" style={{ marginBottom: '16px' }}>
              <Sparkles size={24} />
            </div>
            <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Action Item Extraction</h3>
            <p style={{ color: 'var(--theme-text-muted)', fontSize: '14px', lineHeight: '1.5' }}>
              Detects commitments in dialogue and compiles them into target tasks with owners, due dates, and tracker logs.
            </p>
          </div>

          <div className="card">
            <div className="stat-icon" style={{ marginBottom: '16px' }}>
              <ShieldCheck size={24} />
            </div>
            <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Enterprise Security</h3>
            <p style={{ color: 'var(--theme-text-muted)', fontSize: '14px', lineHeight: '1.5' }}>
              Guarantees strict privacy with secure token cryptography and compliant SQLite/PostgreSQL database separation.
            </p>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" style={{ borderBottom: '1px solid var(--theme-border)', padding: '80px 0', backgroundColor: 'var(--theme-bg-alt)' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '36px', marginBottom: '12px' }}>Operational Pipeline</h2>
          <p style={{ color: 'var(--theme-text-muted)', maxWidth: '600px', margin: '0 auto' }}>
            How we translate media bytes into actionable enterprise knowledge.
          </p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '32px', maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>
          {[
            { num: '01', title: 'Upload File', desc: 'Drag-and-drop meeting records in MP3, WAV, M4A, or MP4 formats.' },
            { num: '02', title: 'AI Transcript', desc: 'Generate raw dialogues mapped to speakers and timing stamps.' },
            { num: '03', title: 'Extract Insights', desc: 'AI maps action owners, risks, and meeting efficiency indicators.' },
            { num: '04', title: 'Export Reports', desc: 'Download print-ready PDF summaries, Word documents, or plaintext logs.' }
          ].map((step, idx) => (
            <div key={idx} className="card" style={{ flex: '1 1 230px', minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '36px', fontWeight: '800', color: 'var(--theme-accent)', fontFamily: 'var(--font-display)' }}>
                {step.num}
              </div>
              <h3 style={{ fontSize: '18px' }}>{step.title}</h3>
              <p style={{ color: 'var(--theme-text-muted)', fontSize: '14px', lineHeight: '1.5' }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Cards */}
      <section id="pricing" style={{ borderBottom: '1px solid var(--theme-border)', padding: '80px 0' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '36px', marginBottom: '12px' }}>Transparent, Scaling Plans</h2>
          <p style={{ color: 'var(--theme-text-muted)', maxWidth: '600px', margin: '0 auto' }}>
            Choose a level matching your monthly meeting volume. Upgrade or downgrade at any time.
          </p>
        </div>

        <div className="pricing-grid">
          <div className="card pricing-card">
            <h3 style={{ fontSize: '20px' }}>Starter Trial</h3>
            <p style={{ color: 'var(--theme-text-muted)', fontSize: '14px' }}>For individual consultants and developers.</p>
            <div className="price">$0 <span>/ month</span></div>
            <hr style={{ borderColor: 'var(--theme-border)' }} />
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} color="var(--theme-success)" /> 3 Meetings per month</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} color="var(--theme-success)" /> Standard AI Summary</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} color="var(--theme-success)" /> Text transcript download</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--theme-text-muted)' }}>✕ No speaker diarization</li>
            </ul>
            <button className="btn btn-secondary" onClick={() => navigate('/register')} style={{ marginTop: 'auto' }}>Sign Up Free</button>
          </div>

          <div className="card pricing-card premium">
            <div className="pricing-badge">Popular</div>
            <h3 style={{ fontSize: '20px' }}>Professional</h3>
            <p style={{ color: 'var(--theme-text-muted)', fontSize: '14px' }}>For scaling product teams and managers.</p>
            <div className="price">$29 <span>/ month</span></div>
            <hr style={{ borderColor: 'var(--theme-border)' }} />
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} color="var(--theme-success)" /> 50 Meetings per month</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} color="var(--theme-success)" /> Advanced AI diarization</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} color="var(--theme-success)" /> PDF / Word Doc Export</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} color="var(--theme-success)" /> Action items tracking board</li>
            </ul>
            <button className="btn btn-primary" onClick={() => navigate('/register')} style={{ marginTop: 'auto' }}>Get Started</button>
          </div>

          <div className="card pricing-card">
            <h3 style={{ fontSize: '20px' }}>Enterprise</h3>
            <p style={{ color: 'var(--theme-text-muted)', fontSize: '14px' }}>For large organizational and legal teams.</p>
            <div className="price">$199 <span>/ month</span></div>
            <hr style={{ borderColor: 'var(--theme-border)' }} />
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} color="var(--theme-success)" /> Unlimited Meeting records</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} color="var(--theme-success)" /> Multi-language transcription</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} color="var(--theme-success)" /> Dedicated storage encryption</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} color="var(--theme-success)" /> Dedicated Admin Dashboard & API</li>
            </ul>
            <button className="btn btn-secondary" onClick={() => navigate('/register')} style={{ marginTop: 'auto' }}>Contact Sales</button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" style={{ borderBottom: '1px solid var(--theme-border)', padding: '80px 24px', backgroundColor: 'var(--theme-bg-alt)' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '36px', marginBottom: '12px' }}>Frequently Asked Questions</h2>
          <p style={{ color: 'var(--theme-text-muted)' }}>Everything you need to know about our processing pipeline.</p>
        </div>

        <div style={{ maxWidth: '700px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            { q: "What audio/video files are supported?", a: "We support direct uploads of MP3, WAV, M4A audio files and MP4 video recordings. There is an active file upload size limit of 100 MB per meeting." },
            { q: "How accurate is the speaker diarization?", a: "Under normal noise parameters, speaker identification averages 95% accuracy. It isolates speakers based on voice biometrics and segments paragraphs." },
            { q: "Can I host this on-premises or change database parameters?", a: "Yes, MeetMind AI's API architecture uses Sequelize, which can be connected to PostgreSQL or MongoDB by adjusting the backend environment credentials." }
          ].map((faq, index) => (
            <div key={index} className="card" style={{ padding: '20px', cursor: 'pointer' }} onClick={() => toggleFaq(index)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: '600' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <HelpCircle size={18} color="var(--theme-accent)" /> {faq.q}
                </span>
                <span>{activeFaq === index ? '-' : '+'}</span>
              </div>
              {activeFaq === index && (
                <p style={{ color: 'var(--theme-text-muted)', fontSize: '14px', marginTop: '12px', lineHeight: '1.6' }}>
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px' }}>
          <div>
            <h2 style={{ fontSize: '36px', marginBottom: '16px' }}>Connect With Our Engineers</h2>
            <p style={{ color: 'var(--theme-text-muted)', marginBottom: '32px', lineHeight: '1.6' }}>
              Have questions about data isolation, compliance policies, or Custom LLM fine-tuning? Send us a ticket and our security engineers will respond within 4 hours.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: 44, height: 44, background: 'var(--theme-accent-light)', color: 'var(--theme-accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Mail size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--theme-text-muted)' }}>Email Support</div>
                  <div style={{ fontWeight: '600' }}>support@meetmind.ai</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: 44, height: 44, background: 'var(--theme-accent-light)', color: 'var(--theme-accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Phone size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--theme-text-muted)' }}>Enterprise Relations</div>
                  <div style={{ fontWeight: '600' }}>+1 (800) 555-MIND</div>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '20px', marginBottom: '20px' }}>Submit an Inquiry</h3>
            {contactSuccess ? (
              <div style={{ background: 'var(--theme-success-light)', color: 'var(--theme-success)', padding: '16px', borderRadius: '8px', fontSize: '14px', fontWeight: '500' }}>
                Ticket created successfully! An engineer will reach out to you shortly.
              </div>
            ) : (
              <form onSubmit={handleContactSubmit}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input type="text" className="form-control" placeholder="Sarah Jenkins" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Work Email</label>
                  <input type="email" className="form-control" placeholder="jenkins@enterprise.com" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Message</label>
                  <textarea className="form-control" rows="4" placeholder="How can we assist you with MeetMind AI?" required style={{ resize: 'none' }}></textarea>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Send Message</button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--theme-border)', padding: '40px 80px', backgroundColor: 'var(--theme-bg-alt)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '32px', maxWidth: '1200px', margin: '0 auto' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', fontSize: '18px' }}>
              <Sparkles size={18} color="var(--theme-accent)" /> MeetMind AI
            </div>
            <p style={{ color: 'var(--theme-text-muted)', fontSize: '13px', marginTop: '12px', maxWidth: '250px' }}>
              Government-grade security and automated intelligence for meeting records.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '64px' }}>
            <div>
              <h4 style={{ fontSize: '14px', marginBottom: '16px' }}>Legal</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: 'var(--theme-text-muted)' }}>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Use</a></li>
                <li><a href="#">GDPR Compliance</a></li>
              </ul>
            </div>
            <div>
              <h4 style={{ fontSize: '14px', marginBottom: '16px' }}>Product</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: 'var(--theme-text-muted)' }}>
                <li><a href="#features">Features</a></li>
                <li><a href="#pricing">Pricing Plans</a></li>
                <li><a href="/login">API Console</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--theme-text-muted)', marginTop: '40px' }}>
          © {new Date().getFullYear()} MeetMind AI. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
