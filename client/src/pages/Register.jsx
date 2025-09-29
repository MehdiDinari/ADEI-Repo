import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageReady, setPageReady] = useState(false);

  useEffect(() => {
    // Simulate loading time for consistency
    const timer = setTimeout(() => setPageReady(true), 200);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }
    
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      setLoading(false);
      return;
    }
    
    const result = await register(username, password);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className={`page-container ${pageReady ? 'fade-in' : ''}`}>
      <>
        <div
          className="hero"
          style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/images/hero-login.png)` }}
        >
          <div className={`hero-content ${pageReady ? 'slide-up' : ''}`}>
            <h1>Créer un compte</h1>
            <p>Rejoignez la communauté ADEI et accédez aux fonctionnalités d'administration</p>
          </div>
        </div>

        <div className={`content ${pageReady ? 'fade-in' : ''}`} style={{ animationDelay: '0.2s' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            minHeight: '60vh',
            padding: '0 var(--spacing-md)' 
          }}>
            <div className={`auth-card ${pageReady ? 'zoom-in' : ''}`} style={{ animationDelay: '0.3s' }}>
              <h2 className="text-primary mt-0 text-center">Inscription</h2>
              
              {error && (
                <div className="message error">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">
                    Nom d'utilisateur
                  </label>
                  <input
                    name="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="form-input"
                    placeholder="Choisissez un nom d'utilisateur"
                    required
                    minLength="3"
                  />
                  <small className="text-muted">Au moins 3 caractères</small>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input"
                    placeholder="Choisissez un mot de passe sécurisé"
                    required
                    minLength="6"
                  />
                  <small className="text-muted">Au moins 6 caractères</small>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Confirmer le mot de passe
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="form-input"
                    placeholder="Répétez votre mot de passe"
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn" 
                  disabled={loading}
                  style={{ width: '100%' }}
                >
                  {loading ? (
                    <>
                      <div className="spinner" style={{ width: '16px', height: '16px' }}></div>
                      Création du compte...
                    </>
                  ) : (
                    'Créer le compte'
                  )}
                </button>
              </form>

              <div style={{ 
                textAlign: 'center', 
                marginTop: 'var(--spacing-xl)', 
                paddingTop: 'var(--spacing-xl)', 
                borderTop: '1px solid var(--card-border)' 
              }}>
                <p className="text-muted">Déjà un compte ?</p>
                <Link to="/login" className="btn secondary">
                  Se connecter
                </Link>
              </div>
            </div>
          </div>

          <div style={{ maxWidth: '600px', margin: '0 auto', padding: '0 var(--spacing-md)' }}>
            <div className={`info-card ${pageReady ? 'slide-up' : ''}`} style={{ animationDelay: '0.4s' }}>
              <h3>🛡️ Sécurité</h3>
              <p>
                Votre compte vous permettra de gérer le contenu du site ADEI. 
                Choisissez un mot de passe fort et gardez vos identifiants confidentiels.
              </p>
            </div>
          </div>
        </div>
      </>
    </div>
  );
};

export default Register;