import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const AdherentRoute = ({ children }) => {
  const { token, isAdherent } = useContext(AuthContext);

  if (!token) {
    // Rediriger vers la page de connexion si pas connecté
    return <Navigate to="/login" replace />;
  }

  if (!isAdherent) {
    // Rediriger vers l'accueil si pas adhérent
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdherentRoute;