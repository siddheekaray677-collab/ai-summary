import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

import { useAuth as useClerkAuth, useUser as useClerkUser, useClerk } from '@clerk/clerk-react';

// Clerk Wrapper Component
const ClerkAuthWrapper = ({ children }) => {
  const { isLoaded, userId, getToken } = useClerkAuth();
  const { user: clerkUser } = useClerkUser();
  const { signOut } = useClerk();

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('meetmind_theme') || 'dark');
  const [settings, setSettings] = useState(null);
  const [syncFailed, setSyncFailed] = useState(false);

  const API_URL = 'http://localhost:5000/api/auth';

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('meetmind_theme', theme);
  }, [theme]);

  // Safety watchdog timer to prevent token/sync hangs (e.g. cookie blockages in local dev)
  useEffect(() => {
    if (isLoaded && userId && !user) {
      const timer = setTimeout(() => {
        console.warn('Clerk session profile synchronization timed out. Activating fallback portal access.');
        setSyncFailed(true);
        setLoading(false);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [isLoaded, userId, user]);

  useEffect(() => {
    const syncClerkUser = async () => {
      if (!isLoaded) return;

      if (userId && clerkUser) {
        try {
          const sessionToken = await getToken();
          setToken(sessionToken);

          // Sync authenticated session with SQLite DB profiles
          const res = await fetch(`${API_URL}/profile`, {
            headers: {
              'Authorization': `Bearer ${sessionToken}`
            }
          });

          if (res.ok) {
            const data = await res.json();
            setUser(data.user);
            setSettings(data.settings);
            setIsAuthenticated(true);
            setSyncFailed(false);
            if (data.settings?.theme) {
              setTheme(data.settings.theme);
            }
          } else {
            console.error('Failed to sync Clerk with backend database, status:', res.status);
            setSyncFailed(true);
          }
        } catch (err) {
          console.error('Failed to sync Clerk credentials with API database:', err);
          setSyncFailed(true);
        } finally {
          setLoading(false);
        }
      } else {
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
        setLoading(false);
      }
    };

    syncClerkUser();
  }, [isLoaded, userId, clerkUser]);

  const logout = () => {
    signOut();
  };

  const updateProfile = async (name, email) => {
    const res = await fetch(`${API_URL}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name, email })
    });
    return res.json();
  };

  const updateSettings = async (newSettings) => {
    const res = await fetch(`${API_URL}/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(newSettings)
    });
    const data = await res.json();
    setSettings(data.settings);
    if (newSettings.theme) setTheme(newSettings.theme);
    return data;
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    updateSettings({ theme: nextTheme });
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      getToken,
      isAuthenticated,
      loading: !isLoaded || loading,
      theme,
      settings,
      logout,
      updateProfile,
      updateSettings,
      toggleTheme,
      isClerkActive: true,
      clerkAuthenticated: !!userId,
      syncFailed
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Local JWT Authentication Wrapper
const LocalAuthWrapper = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('meetmind_token') || null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('meetmind_theme') || 'dark');
  const [settings, setSettings] = useState(null);

  const API_URL = 'http://localhost:5000/api/auth';

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('meetmind_theme', theme);
  }, [theme]);

  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setSettings(data.settings);
          setIsAuthenticated(true);
          if (data.settings?.theme) {
            setTheme(data.settings.theme);
          }
        } else {
          logout();
        }
      } catch (err) {
        console.error('Failed to load user session:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      localStorage.setItem('meetmind_token', data.token);
      setToken(data.token);
      setUser({ id: data.id, name: data.name, email: data.email, role: data.role });
      setIsAuthenticated(true);
      return data;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('meetmind_token', data.token);
      setToken(data.token);
      setUser({ id: data.id, name: data.name, email: data.email, role: data.role });
      setIsAuthenticated(true);
      return data;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const resetPassword = async (email, newPassword) => {
    try {
      const res = await fetch(`${API_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Reset password failed');
      }

      return data;
    } catch (err) {
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('meetmind_token');
    setToken(null);
    setUser(null);
    setSettings(null);
    setIsAuthenticated(false);
  };

  const updateProfile = async (name, email, password) => {
    try {
      const body = { name, email };
      if (password) body.password = password;

      const res = await fetch(`${API_URL}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Profile update failed');
      }

      setUser({ id: data.id, name: data.name, email: data.email, role: data.role });
      return data;
    } catch (err) {
      throw err;
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      const res = await fetch(`${API_URL}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newSettings)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Settings update failed');
      }

      setSettings(data.settings);
      if (newSettings.theme) {
        setTheme(newSettings.theme);
      }
      return data;
    } catch (err) {
      throw err;
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    updateSettings({ theme: nextTheme });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        getToken: () => token,
        isAuthenticated,
        loading,
        theme,
        settings,
        register,
        login,
        resetPassword,
        logout,
        updateProfile,
        updateSettings,
        toggleTheme,
        isClerkActive: false
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const AuthProvider = ({ children }) => {
  // Read dynamically from Vite env variables configuration
  const isClerkConfigured = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

  if (isClerkConfigured) {
    return <ClerkAuthWrapper>{children}</ClerkAuthWrapper>;
  } else {
    return <LocalAuthWrapper>{children}</LocalAuthWrapper>;
  }
};
