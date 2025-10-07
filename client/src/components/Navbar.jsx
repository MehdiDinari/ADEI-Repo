import React, { useContext, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

const Navbar = () => {
  const { token, logout, user, isAdmin, isAdherent } = useContext(AuthContext);
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthDropdownOpen, setIsAuthDropdownOpen] = useState(false);

  const username = user?.username || 'Invité';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Close menus when route changes
    setIsMobileMenuOpen(false);
    setIsAuthDropdownOpen(false);
    window.scrollTo(0, 0);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.auth-dropdown')) {
        setIsAuthDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    setIsAuthDropdownOpen(false);
  };

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-content">
        {/* Logo */}
        <Link to="/" className="navbar-brand" onClick={() => setIsMobileMenuOpen(false)}>
          <img 
            src="/images/ADEI.png" 
            alt="ADEI" 
            style={{ 
              height: '55px', 
              width: 'auto',
              filter: 'brightness(0) invert(1)',
              transition: 'transform 0.2s ease'
            }}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'inline';
            }}
          />
          <span style={{ display: 'none', fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>
            ADEI
          </span>
        </Link>

        {/* Mobile toggle */}
        <button 
          className="navbar-mobile-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile menu"
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>

        {/* Links */}
        <div className={`navbar-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <Link to="/" className={`navbar-link ${isActive('/') ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>Accueil</Link>
          <Link to="/news" className={`navbar-link ${isActive('/news') ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>Actualités</Link>
          <Link to="/events" className={`navbar-link ${isActive('/events') ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>Événements</Link>
          <Link to="/clubs" className={`navbar-link ${isActive('/clubs') ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>Clubs</Link>
          <Link to="/ensa" className={`navbar-link ${isActive('/ensa') ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>ENSA</Link>
          <Link to="/adei" className={`navbar-link ${isActive('/adei') ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>ADEI</Link>
          {isAdherent && (
            <Link to="/feedback" className={`navbar-link ${isActive('/feedback') ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>Avis et Réclamations</Link>
          )}
        </div>

        {/* Auth Dropdown */}
        <div className="navbar-auth">
          <div className="auth-dropdown">
            <button 
              className="auth-dropdown-toggle"
              onClick={() => setIsAuthDropdownOpen(!isAuthDropdownOpen)}
              aria-expanded={isAuthDropdownOpen}
            >
              {token ? `${username} ▾` : 'Connexion ▾'}
            </button>
            <div className={`auth-dropdown-menu ${isAuthDropdownOpen ? 'open' : ''}`}>
              {token ? (
                <>
                  {isAdmin && (
                    <>
                      <Link 
                        to="/messages" 
                        className="auth-dropdown-item"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Avis et Réclamations
                      </Link>
                      <Link 
                        to="/admin/users" 
                        className="auth-dropdown-item"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Gestion des utilisateurs
                      </Link>
                    </>
                  )}
                  
                  {isAdherent && (
                    <Link 
                      to="/adherent/profile" 
                      className="auth-dropdown-item"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Mon profil
                    </Link>
                  )}
                  
                  <button 
                    onClick={handleLogout} 
                    className="auth-dropdown-item"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="auth-dropdown-item"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Se connecter
                  </Link>
                  <Link 
                    to="/register" 
                    className="auth-dropdown-item"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    S'inscrire
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
