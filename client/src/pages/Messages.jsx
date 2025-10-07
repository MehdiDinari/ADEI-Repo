import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

const Messages = () => {
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [pageReady, setPageReady] = useState(false);
  const [filter, setFilter] = useState('tous');
  const [searchTerm, setSearchTerm] = useState('');
  const [responseText, setResponseText] = useState('');
  const [respondingTo, setRespondingTo] = useState(null);
  
  // Vérifier si l'utilisateur est admin
  const isAdmin = user && user.role === 'admin';

  useEffect(() => {
    // Vérifier si l'utilisateur est authentifié et a les droits d'accès
    if (!token) {
      navigate('/login');
      return;
    }
    
    // Vérifier si l'utilisateur est admin
    if (!isAdmin) {
      navigate('/');
      return;
    }
    
    loadFeedbacks();
  }, [token, navigate, isAdmin]);

  const loadFeedbacks = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/feedbacks', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setFeedbacks(data.feedbacks || []);
        setFilteredFeedbacks(data.feedbacks || []);
      } else {
        setError(data.message || 'Erreur lors du chargement des messages');
      }
    } catch (error) {
      setError('Erreur de connexion au serveur');
    }
    
    setLoading(false);
    setTimeout(() => setPageReady(true), 100);
  };

  // Appliquer les filtres
  useEffect(() => {
    let result = [...feedbacks];
    
    // Filtrer par type
    if (filter !== 'tous') {
      result = result.filter(feedback => feedback.type === filter);
    }
    
    // Filtrer par terme de recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(feedback => 
        feedback.name.toLowerCase().includes(term) || 
        feedback.email.toLowerCase().includes(term) || 
        feedback.message.toLowerCase().includes(term) ||
        (feedback.response && feedback.response.text && feedback.response.text.toLowerCase().includes(term))
      );
    }
    
    setFilteredFeedbacks(result);
  }, [feedbacks, filter, searchTerm]);

  const deleteFeedback = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/feedbacks/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        
        if (data.success) {
          setFeedbacks(feedbacks.filter(feedback => feedback._id !== id));
        } else {
          setError(data.message || 'Erreur lors de la suppression');
        }
      } catch (error) {
        setError('Erreur de connexion au serveur');
      }
    }
  };

  const markAsRead = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/feedbacks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'en_traitement' })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setFeedbacks(feedbacks.map(feedback => 
          feedback._id === id ? { ...feedback, status: 'en_traitement' } : feedback
        ));
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
    }
  };
  
  const handleRespond = (id) => {
    setRespondingTo(id);
    setResponseText('');
  };
  
  const submitResponse = async () => {
    if (!responseText.trim()) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:5000/api/feedbacks/${respondingTo}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: responseText })
      });
      
      const data = await response.json();
      
      if (data.success && data.feedback) {
        // Mettre à jour la liste des feedbacks
        setFeedbacks(feedbacks.map(feedback => 
          feedback._id === respondingTo ? data.feedback : feedback
        ));
        setRespondingTo(null);
        setResponseText('');
      } else {
        setError(data.message || 'Erreur lors de l\'envoi de la réponse');
      }
    } catch (error) {
      setError('Erreur de connexion au serveur');
    }
  };

  const handleLike = async (feedbackId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/feedbacks/${feedbackId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success && data.feedback) {
        // Mettre à jour la liste des feedbacks
        setFeedbacks(feedbacks.map(feedback => 
          feedback._id === feedbackId ? data.feedback : feedback
        ));
      } else {
        setError(data.message || 'Erreur lors du like');
      }
    } catch (error) {
      setError('Erreur de connexion au serveur');
    }
  };

  if (loading) {
    return (
      <div className="loading fade-in">
        <div className="spinner"></div>
        Chargement des avis et réclamations...
      </div>
    );
  }

  return (
    <div className={`page-container ${pageReady ? 'fade-in' : ''}`}>
      <>
        <div
          className="hero"
          style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/images/hero-messages.png)` }}
        >
          <div className={`hero-content ${pageReady ? 'slide-up' : ''}`}>
            <h1>Avis et Réclamations</h1>
            <p>Consultez et gérez les avis et réclamations envoyés par les visiteurs du site</p>
          </div>
        </div>

        <div className={`content ${pageReady ? 'fade-in' : ''}`} style={{ animationDelay: '0.2s' }}>
          {error && (
            <div className="message error">
              {error}
            </div>
          )}

          <div className={`section-header ${pageReady ? 'slide-up' : ''}`} style={{ animationDelay: '0.3s' }}>
            <h2>
              📬 Avis et Réclamations ({filteredFeedbacks.length})
            </h2>
            <div className="search-filters" style={{ 
              display: 'flex', 
              gap: 'var(--spacing-md)', 
              alignItems: 'center', 
              flexWrap: 'wrap',
              marginBottom: 'var(--spacing-lg)'
            }}>
              <input
                type="text"
                className="search-input"
                placeholder="Rechercher par nom, email, message ou réponse..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  flex: '1',
                  minWidth: '300px',
                  padding: 'var(--spacing-sm)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--font-size-sm)'
                }}
              />
              
              <select 
                className="filter-select"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                style={{
                  padding: 'var(--spacing-sm)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--font-size-sm)',
                  minWidth: '150px'
                }}
              >
                <option value="tous">Tous les types</option>
                <option value="avis">Avis</option>
                <option value="reclamation">Réclamations</option>
                <option value="autre">Autre</option>
              </select>
            </div>
          </div>

          {filteredFeedbacks && filteredFeedbacks.length > 0 ? (
            <div className="card-grid">
              {filteredFeedbacks.filter(msg => msg && msg._id).map((msg, index) => (
                <div
                  key={msg._id}
                  className={`card ${pageReady ? 'slide-up' : ''} ${msg.status === 'nouveau' ? 'unread' : ''}`}
                  style={{ 
                    animationDelay: pageReady ? `${0.4 + index * 0.1}s` : '0s',
                    border: msg.status === 'nouveau' ? '2px solid var(--primary)' : undefined
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    marginBottom: 'var(--spacing-md)',
                    flexWrap: 'wrap',
                    gap: 'var(--spacing-sm)'
                  }}>
                    <h3 className="mt-0 text-primary">👤 {msg.name}</h3>
                    {msg.status === 'nouveau' && (
                      <span style={{
                        background: 'var(--primary)',
                        color: 'white',
                        padding: 'var(--spacing-xs) var(--spacing-sm)',
                        borderRadius: 'var(--radius-xl)',
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: 'bold'
                      }}>
                        NOUVEAU
                      </span>
                    )}
                  </div>
                  
                  <div style={{ marginBottom: 'var(--spacing-md)' }}>
                    <p>
                      <strong>📧 Email :</strong>{' '}
                      <a href={`mailto:${msg.email}`} className="text-primary">
                        {msg.email}
                      </a>
                    </p>
                    <small className="text-muted">
                      📅 {new Date(msg.createdAt || msg.timestamp).toLocaleString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </small>
                  </div>
                  
                  <div style={{ 
                    background: 'var(--bg-secondary)', 
                    padding: 'var(--spacing-md)', 
                    borderRadius: 'var(--radius-lg)',
                    marginBottom: 'var(--spacing-md)'
                  }}>
                    <p style={{ marginBottom: 0, whiteSpace: 'pre-wrap' }}>
                      {msg.message}
                    </p>
                  </div>
                  
                  {/* Afficher la réponse si elle existe */}
                  {msg.response && msg.response.text && (
                    <div style={{ 
                      background: 'var(--bg-primary)', 
                      padding: 'var(--spacing-md)', 
                      borderRadius: 'var(--radius-lg)',
                      marginBottom: 'var(--spacing-md)',
                      borderLeft: '3px solid var(--primary)'
                    }}>
                      <h4>Réponse:</h4>
                      <p style={{ marginBottom: 0, whiteSpace: 'pre-wrap' }}>
                        {msg.response.text}
                      </p>
                    </div>
                  )}
                  
                  {/* Formulaire de réponse */}
                  {respondingTo === msg._id && (
                    <div className="response-form" style={{ marginBottom: 'var(--spacing-md)' }}>
                      <textarea
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        placeholder="Votre réponse..."
                        className="form-textarea"
                        rows={4}
                        style={{ width: '100%', marginBottom: 'var(--spacing-sm)' }}
                      />
                      <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                        <button 
                          className="btn" 
                          onClick={submitResponse}
                          disabled={!responseText.trim()}
                        >
                          Envoyer
                        </button>
                        <button 
                          className="btn secondary" 
                          onClick={() => setRespondingTo(null)}
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <div className="admin-controls">
                    {/* Bouton de like et badge */}
                    <button
                      onClick={() => handleLike(msg._id)}
                      className="btn-icon secondary"
                      title="Aimer ce message"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      ❤️ {msg.likes || 0}
                    </button>
                    
                    {msg.status === 'nouveau' && (
                      <button
                        onClick={() => markAsRead(msg._id)}
                        className="btn-icon success"
                        title="Marquer comme lu"
                      >
                        ✅
                      </button>
                    )}
                    <button
                      onClick={() => handleRespond(msg._id)}
                      className="btn-icon secondary"
                      title="Répondre au message"
                    >
                      💬
                    </button>
                    <button
                      onClick={() => deleteFeedback(msg._id)}
                      className="btn-icon danger"
                      title="Supprimer"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card text-center">
              <h3>📭 Aucun message</h3>
              <p>
                Les messages envoyés via le formulaire de contact apparaîtront ici. 
                Encouragez les visiteurs à vous contacter !
              </p>
              <a href="/contact" className="btn" style={{ marginTop: 'var(--spacing-md)' }}>
                Voir le formulaire de contact
              </a>
            </div>
          )}

          {feedbacks.length > 0 && (
            <div className={`info-card text-center ${pageReady ? 'zoom-in' : ''}`} style={{ 
              marginTop: 'var(--spacing-3xl)',
              animationDelay: '0.6s'
            }}>
              <h3>💡 Conseil</h3>
              <p>
                N'oubliez pas de répondre rapidement aux messages pour maintenir 
                une bonne relation avec votre communauté. Un délai de réponse de 24-48h 
                est généralement apprécié.
              </p>
            </div>
          )}
        </div>
      </>
    </div>
  );
};

export default Messages;