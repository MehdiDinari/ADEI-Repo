import React, { createContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token) {
      try {
        // Decode JWT token to get user information
        const decodedToken = jwtDecode(token);
        setUser({
          id: decodedToken.id,
          username: decodedToken.username,
          email: decodedToken.email,
          role: decodedToken.role
        });
      } catch (error) {
        console.error('Invalid token:', error);
        logout();
      }
    } else {
      setUser(null);
    }
  }, [token]);

  const login = useCallback(async (username, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setToken(data.token);
        localStorage.setItem('token', data.token);
        return { success: true };
      } else {
        return { success: false, message: data.message || 'Échec de connexion' };
      }
    } catch (error) {
      return { success: false, message: 'Erreur de connexion au serveur' };
    }
  }, []);

  const register = useCallback(async (username, email, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, role: 'guest' }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        if (data.token) {
          setToken(data.token);
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

  const createAdherent = useCallback(async (username, email, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/create-adherent', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username, email, password }),
      });
      
      const data = await response.json();
      return { success: data.success, message: data.message };
    } catch (error) {
      return { success: false, message: 'Erreur lors de la création de l\'adhérent' };
    }
  }, [token]);

  const logout = useCallback(async () => {
    try {
      if (token) {
        await fetch('http://localhost:5000/api/auth/logout', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
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
      const response = await fetch('http://localhost:5000/api/feedbacks', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      } else {
        const errorData = await response.json();
        return { success: false, message: errorData.message };
      }
    } catch (error) {
      return { success: false, message: 'Erreur lors du chargement des avis' };
    }
  }, [token]);

  // Check if user has a specific role
  const hasRole = useCallback((requiredRole) => {
    if (!user) return false;
    
    // Admin can access everything
    if (user.role === 'admin') return true;
    
    // Check if user has the required role
    return user.role === requiredRole;
  }, [user]);

  // Check if user is authenticated
  const isAuthenticated = useCallback(() => {
    return !!token && !!user;
  }, [token, user]);

  return (
    <AuthContext.Provider value={{
      token,
      user,
      login,
      register,
      logout,
      fetchMessages,
      createAdherent,
      hasRole,
      isAuthenticated,
      isAdmin: user?.role === 'admin',
      isAdherent: user?.role === 'adherent',
      isGuest: user?.role === 'guest' || !user
    }}>
      {children}
    </AuthContext.Provider>
  );
};