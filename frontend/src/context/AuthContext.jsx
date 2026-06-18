import { createContext, useContext, useEffect, useState } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('ugscholar_token'));
  const [loading, setLoading] = useState(true);

  // AuthContext keeps the logged-in user available to every component.
  // This avoids passing user data through many layers of props.
  useEffect(() => {
    async function loadUserFromToken() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await authService.getCurrentUser();
        setUser(response.data);
      } catch (error) {
        localStorage.removeItem('ugscholar_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadUserFromToken();
  }, [token]);

  async function login(credentials) {
    const response = await authService.login(credentials);
    localStorage.setItem('ugscholar_token', response.data.token);
    setToken(response.data.token);
    setUser(response.data.user);
    return response.data.user;
  }

  async function register(data) {
    const response = await authService.register(data);
    localStorage.setItem('ugscholar_token', response.data.token);
    setToken(response.data.token);
    setUser(response.data.user);
    return response.data.user;
  }

  function logout() {
    localStorage.removeItem('ugscholar_token');
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAuthenticated: Boolean(user) }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
