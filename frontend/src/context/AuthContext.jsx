import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const token = localStorage.getItem('bizlink_token');
      const savedUser = localStorage.getItem('bizlink_user');
      return (token && savedUser) ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [businesses, setBusinesses] = useState([]);
  const [activeBusiness, setActiveBusinessState] = useState(null);
  const [loading, setLoading] = useState(() => {
    // If token exists in storage, keep loading true until verified with backend
    return !!localStorage.getItem('bizlink_token');
  });

  const fetchUserBusinesses = useCallback(async () => {
    try {
      const response = await api.get('/businesses/user/me');
      const list = response.data || [];
      setBusinesses(list);

      // Restore previously selected active business or default to first
      const savedActiveId = localStorage.getItem('bizlink_active_biz_id');
      const found = list.find(b => String(b.business_id) === String(savedActiveId));
      if (found) {
        setActiveBusinessState(found);
      } else if (list.length > 0) {
        setActiveBusinessState(list[0]);
        localStorage.setItem('bizlink_active_biz_id', list[0].business_id);
      }
    } catch (err) {
      console.warn('Could not load user businesses:', err);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('bizlink_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get('/auth/me');
      // res is { success: true, data: user } because response interceptor unwraps response.data
      const userData = res.data?.user || res.data;
      if (userData && (userData.userId || userData.user_id || userData.email)) {
        setUser(userData);
        localStorage.setItem('bizlink_user', JSON.stringify(userData));
        await fetchUserBusinesses();
      } else {
        throw new Error('Invalid user payload');
      }
    } catch (err) {
      console.warn('Session check failed:', err);
      // Only clear session on actual 401 or token expiration
      if (err.statusCode === 401 || err.code === 'TOKEN_EXPIRED' || err.code === 'INVALID_TOKEN') {
        localStorage.removeItem('bizlink_token');
        localStorage.removeItem('bizlink_user');
        localStorage.removeItem('bizlink_active_biz_id');
        setUser(null);
        setBusinesses([]);
        setActiveBusinessState(null);
      }
    } finally {
      setLoading(false);
    }
  }, [fetchUserBusinesses]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, user: loggedUser } = res.data;

    localStorage.setItem('bizlink_token', token);
    localStorage.setItem('bizlink_user', JSON.stringify(loggedUser));
    setUser(loggedUser);

    await fetchUserBusinesses();
    return loggedUser;
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    const { token, user: registeredUser } = res.data;

    localStorage.setItem('bizlink_token', token);
    localStorage.setItem('bizlink_user', JSON.stringify(registeredUser));
    setUser(registeredUser);

    await fetchUserBusinesses();
    return registeredUser;
  };

  const logout = () => {
    localStorage.removeItem('bizlink_token');
    localStorage.removeItem('bizlink_user');
    localStorage.removeItem('bizlink_active_biz_id');
    setUser(null);
    setBusinesses([]);
    setActiveBusinessState(null);
    window.location.href = '/login';
  };

  const setActiveBusiness = (biz) => {
    setActiveBusinessState(biz);
    if (biz?.business_id) {
      localStorage.setItem('bizlink_active_biz_id', biz.business_id);
    } else {
      localStorage.removeItem('bizlink_active_biz_id');
    }
  };

  const isAdmin = user?.role === 'ADMIN';
  const isOperations = user?.role === 'OPERATIONS';
  const isInternal = isAdmin || isOperations;

  const value = {
    user,
    businesses,
    activeBusiness,
    setActiveBusiness,
    loading,
    login,
    register,
    logout,
    refreshUser,
    isAuthenticated: !!user,
    isAdmin,
    isOperations,
    isInternal
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
