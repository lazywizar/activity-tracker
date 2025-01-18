import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');

      if (token && storedUser) {
        if (isTokenExpired(token)) {
          console.error('Token expired during initialization');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('user');
          delete axios.defaults.headers.common['Authorization'];
          setLoading(false);
          return;
        }

        try {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          await axios.get(`${process.env.REACT_APP_API_URL}/auth/verify`);
          console.log('Token verified successfully');

          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error verifying token:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('user');
          delete axios.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, []);

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('user');
          setUser(null);
          setIsAuthenticated(false);
          navigate('/login');
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [navigate]);

  const login = async (email, password, rememberMe) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/login`, {
        email,
        password
      });

      const { token, user } = response.data;

      if (isTokenExpired(token)) {
        return {
          success: false,
          error: 'Invalid token received'
        };
      }

      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');

      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('token', token);
      storage.setItem('user', JSON.stringify(user));

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      setIsAuthenticated(true);
      navigate('/dashboard');
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed'
      };
    }
  };

  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (token && isTokenExpired(token)) {
        logout();
      }
    };

    const interval = setInterval(checkToken, 60000); 
    return () => clearInterval(interval);
  }, []);

  const register = async (email, password) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/register`, {
        email,
        password
      });

      const { token, user } = response.data;

      if (isTokenExpired(token)) {
        return {
          success: false,
          error: 'Invalid token received'
        };
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      setIsAuthenticated(true);
      navigate('/dashboard'); 
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  const isTokenExpired = (token) => {
    try {
      const decoded = jwtDecode(token);
      if (!decoded.exp) {
        console.error('Token has no expiration');
        return true;
      }
      const currentTime = Date.now() / 1000;
      const isExpired = decoded.exp < currentTime;
      if (isExpired) {
        console.error('Token is expired');
      }
      return isExpired;
    } catch (error) {
      console.error('Error decoding token:', error);
      return true;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      loading,
      isAuthenticated
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};