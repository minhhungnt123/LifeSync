import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, LoginRequest, RegisterRequest } from '../types/auth';
import { authApi } from '../api/authApi';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await authApi.getCurrentUser();
        if (response.success) {
          setUser(response.data);
        } else {
          logout();
        }
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, [token]);

  const login = async (data: LoginRequest) => {
    const response = await authApi.login(data);
    if (response.success) {
      localStorage.setItem('token', response.data.token);
      setToken(response.data.token);
      setUser(response.data.user);
    }
  };

  const register = async (data: RegisterRequest) => {
    const response = await authApi.register(data);
    if (response.success) {
      localStorage.setItem('token', response.data.token);
      setToken(response.data.token);
      setUser(response.data.user);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được sử dụng bên trong AuthProvider');
  }
  return context;
};
