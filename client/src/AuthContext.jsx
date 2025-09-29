import React, { createContext, useState, useEffect, useCallback } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token) {
      // In a real app, you'd decode the token or fetch user data
      // For now, we'll just set a default user object
      setUser({ username: 'Admin' });
    } else {
      setUser(null);
    }
  }, [token]);

  const login = useCallback(async (username, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setToken(data.token);
        setUser({ username });
        localStorage.setItem('token', data.token);
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      return { success: false, message: 'Erreur de connexion' };
    }
  }, []);

  const register = useCallback(async (username, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        if (data.token) {
          setToken(data.token);
          setUser({ username });
          localStorage.setItem('token', data.token);
        }
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      return { success: false, message: 'Erreur lors de la création du compte' };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      if (token) {
        await fetch('http://localhost:5000/api/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('token');
    }
  }, [token]);

  const fetchMessages = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/api/messages', {
        headers: { Authorization: token },
      });
      
      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      } else {
        const errorData = await response.json();
        return { success: false, message: errorData.message };
      }
    } catch (error) {
      return { success: false, message: 'Erreur lors du chargement des messages' };
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{
      token,
      user,
      login,
      register,
      logout,
      fetchMessages
    }}>
      {children}
    </AuthContext.Provider>
  );
};