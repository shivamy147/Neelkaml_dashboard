import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Set axios default authorization header
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/auth/me`);
          if (response.data.success) {
            setUser(response.data.user);
          } else {
            logout();
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/auth/signin`, {
        email,
        password
      });

      if (response.data.success) {
        const { user: userData, token: tokenData } = response.data;
        setUser(userData);
        setToken(tokenData.access_token);
        localStorage.setItem('token', tokenData.access_token);
        toast.success('Login successful!');
        return { success: true };
      } else {
        toast.error('Login failed');
        return { success: false, error: 'Login failed' };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Login failed';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const register = async (email, password, fullName) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/auth/signup`, {
        email,
        password,
        full_name: fullName
      });

      if (response.data.success) {
        toast.success('Registration successful! Please log in.');
        return { success: true };
      } else {
        toast.error('Registration failed');
        return { success: false, error: 'Registration failed' };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Registration failed';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    toast.info('Logged out successfully');
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};