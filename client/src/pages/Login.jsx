import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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
    
    const result = await login(username, password);
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
            <h1>Connexion</h1>
            <p>Accédez à votre espace membre pour gérer le contenu du site</p>
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
              <h2 className="text-primary mt-0 text-center">Se connecter</h2>
              
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
                    placeholder="Votre nom d'utilisateur"
                    required
                  />
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
                    placeholder="Votre mot de passe"
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
                      Connexion...
                    </>
                  ) : (
                    'Se connecter'
                  )}
                </button>
              </form>

              <div style={{ 
                textAlign: 'center', 
                marginTop: 'var(--spacing-xl)', 
                paddingTop: 'var(--spacing-xl)', 
                borderTop: '1px solid var(--card-border)' 
              }}>
                <p className="text-muted">Pas encore de compte ?</p>
                <Link to="/register" className="btn secondary">
                  Créer un compte
                </Link>
              </div>
            </div>
          </div>

          <div style={{ maxWidth: '600px', margin: '0 auto', padding: '0 var(--spacing-md)' }}>
            <div className={`info-card ${pageReady ? 'slide-up' : ''}`} style={{ animationDelay: '0.4s' }}>
              <h3>💡 Informations</h3>
              <p>
                La connexion vous permet d'accéder aux fonctionnalités d'administration 
                pour gérer les actualités, événements, clubs et consulter les messages reçus.
              </p>
            </div>
          </div>
        </div>
      </>
    </div>
  );
};

export default Login;