import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './components/AppLayout';
import { ClerkProvider } from '@clerk/clerk-react';

// Pages
import LandingPage from './pages/LandingPage';
import { Login, Register } from './pages/AuthPages';
import Dashboard from './pages/Dashboard';
import UploadMeeting from './pages/UploadMeeting';
import MeetingHistory from './pages/MeetingHistory';
import SummaryDetails from './pages/SummaryDetails';
import ActionItems from './pages/ActionItems';
import ProfileSettings from './pages/ProfileSettings';
import AdminDashboard from './pages/AdminDashboard';

// Protected Route wrapper component
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, isClerkActive, clerkAuthenticated } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--theme-bg)' }}>
        <div style={{ color: 'var(--theme-text-muted)', fontSize: '15px' }}>Verifying security credentials...</div>
      </div>
    );
  }

  const isUserAuthenticated = isClerkActive ? clerkAuthenticated : isAuthenticated;

  return isUserAuthenticated ? children : <Navigate to="/login" replace />;
}

// Router content wrapped by auth context
function AppRouterContent() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Portal Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <AppLayout>
              <Dashboard />
            </AppLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/upload" element={
          <ProtectedRoute>
            <AppLayout>
              <UploadMeeting />
            </AppLayout>
          </ProtectedRoute>
        } />

        <Route path="/history" element={
          <ProtectedRoute>
            <AppLayout>
              <MeetingHistory />
            </AppLayout>
          </ProtectedRoute>
        } />

        <Route path="/meeting/:id" element={
          <ProtectedRoute>
            <AppLayout>
              <SummaryDetails />
            </AppLayout>
          </ProtectedRoute>
        } />

        <Route path="/action-items" element={
          <ProtectedRoute>
            <AppLayout>
              <ActionItems />
            </AppLayout>
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute>
            <AppLayout>
              <ProfileSettings />
            </AppLayout>
          </ProtectedRoute>
        } />

        <Route path="/admin" element={
          <ProtectedRoute>
            <AppLayout>
              <AdminDashboard />
            </AppLayout>
          </ProtectedRoute>
        } />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

function App() {
  const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

  if (clerkPublishableKey) {
    return (
      <ClerkProvider publishableKey={clerkPublishableKey}>
        <AuthProvider>
          <AppRouterContent />
        </AuthProvider>
      </ClerkProvider>
    );
  }

  return (
    <AuthProvider>
      <AppRouterContent />
    </AuthProvider>
  );
}

export default App;
