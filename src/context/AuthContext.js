import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Generate a simple session token
  const generateSessionToken = (email) => {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2);
    return `${btoa(email)}.${timestamp}.${randomStr}`;
  };

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    try {
      const sessionData = localStorage.getItem('adminSession');
      if (sessionData) {
        const session = JSON.parse(sessionData);
        const now = Date.now();
        
        // Check if session is expired
        if (session.expiresAt && now < session.expiresAt) {
          setIsAuthenticated(true);
          setUser(session.user);
        } else {
          // Session expired, clear it
          localStorage.removeItem('adminSession');
          setIsAuthenticated(false);
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      localStorage.removeItem('adminSession');
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = (email, password) => {
    // Validate credentials against environment variables
    const validEmail = process.env.REACT_APP_ADMIN_EMAIL;
    const validPassword = process.env.REACT_APP_ADMIN_PASSWORD;

    if (email === validEmail && password === validPassword) {
      const sessionToken = generateSessionToken(email);
      const expiresAt = Date.now() + (12 * 60 * 60 * 1000); // 12 hours
      
      const sessionData = {
        token: sessionToken,
        user: {
          email: email,
          name: 'Admin User'
        },
        createdAt: new Date().toISOString(),
        expiresAt: expiresAt
      };

      localStorage.setItem('adminSession', JSON.stringify(sessionData));
      setIsAuthenticated(true);
      setUser(sessionData.user);
      
      return { success: true };
    }

    return { 
      success: false, 
      error: 'Invalid credentials. Please check your email and password.' 
    };
  };

  const logout = () => {
    localStorage.removeItem('adminSession');
    setIsAuthenticated(false);
    setUser(null);
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
