import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, UploadCloud, History, CheckSquare, 
  User, Settings, ShieldAlert, LogOut, Sun, Moon, Menu, X, Sparkles
} from 'lucide-react';

export default function AppLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, theme, toggleTheme } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Upload Meeting', path: '/upload', icon: UploadCloud },
    { name: 'Meeting History', path: '/history', icon: History },
    { name: 'Action Items', path: '/action-items', icon: CheckSquare },
    { name: 'Profile & Settings', path: '/profile', icon: User }
  ];

  // Display admin link only if role is admin
  if (user?.role === 'admin') {
    menuItems.push({ name: 'Admin Console', path: '/admin', icon: ShieldAlert });
  }

  // Generate breadcrumb titles
  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path === '/dashboard') return ['Portal', 'Dashboard'];
    if (path === '/upload') return ['Portal', 'Upload New Meeting'];
    if (path === '/history') return ['Portal', 'Meeting History'];
    if (path === '/action-items') return ['Portal', 'Action Items Plan'];
    if (path === '/profile') return ['Account', 'Settings & Profile'];
    if (path === '/admin') return ['System', 'Admin Statistics Panel'];
    if (path.startsWith('/meeting/')) return ['Portal', 'History', 'Summary Details'];
    return ['MeetMind AI'];
  };

  const breadcrumbs = getBreadcrumbs();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="app-container">
      {/* Mobile Menu button */}
      <div style={{ position: 'fixed', top: '16px', right: '16px', zIndex: 1000 }} className="no-print">
        <button 
          className="icon-btn" 
          style={{ display: 'none', width: '44px', height: '44px' }} // Controlled by media queries class helper or display: flex on mobile
          onClick={() => setMobileOpen(!mobileOpen)}
          id="mobile-menu-trigger"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar Drawer */}
      <aside 
        className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}
        style={{
          display: 'flex',
          transform: mobileOpen ? 'translateX(0)' : undefined
        }}
      >
        <div className="sidebar-logo">
          <div style={{ background: 'var(--theme-accent)', padding: '6px', borderRadius: '8px', color: 'white', display: 'flex' }}>
            <Sparkles size={18} />
          </div>
          <span>MeetMind<span>AI</span></span>
        </div>

        <nav className="sidebar-menu">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
              (item.path === '/history' && location.pathname.startsWith('/meeting/'));

            return (
              <Link 
                key={item.name} 
                to={item.path} 
                className={`sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile-badge" onClick={() => navigate('/profile')}>
            <div className="avatar">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--theme-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name || 'User Profile'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--theme-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.email || 'email@company.com'}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="main-content">
        <header className="app-header no-print">
          {/* Breadcrumbs */}
          <div className="breadcrumbs">
            {breadcrumbs.map((bc, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="breadcrumb-separator">/</span>}
                <span className={idx === breadcrumbs.length - 1 ? 'breadcrumb-active' : ''}>
                  {bc}
                </span>
              </React.Fragment>
            ))}
          </div>

          {/* Action Header controls */}
          <div className="header-actions">
            {/* Theme switcher */}
            <button 
              className="icon-btn" 
              onClick={toggleTheme} 
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Logout button */}
            <button 
              className="icon-btn" 
              onClick={handleLogout} 
              title="Logout session"
              style={{ color: 'var(--theme-danger)' }}
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* Dynamic Page content */}
        <main className="page-body">
          {children}
        </main>
      </div>

      {/* CSS overrides specifically for Mobile sidebar handles */}
      <style>{`
        @media (max-width: 768px) {
          #mobile-menu-trigger {
            display: flex !important;
          }
          .sidebar {
            position: fixed;
            top: 0;
            left: 0;
            bottom: 0;
            z-index: 999;
            transform: translateX(-100%);
            box-shadow: var(--shadow-lg);
          }
          .sidebar.mobile-open {
            transform: translateX(0);
          }
          .app-header {
            padding: 0 16px;
          }
        }
      `}</style>
    </div>
  );
}
