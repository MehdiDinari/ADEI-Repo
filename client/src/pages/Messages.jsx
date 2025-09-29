import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

const Messages = () => {
  const { token, fetchMessages } = useContext(AuthContext);
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [pageReady, setPageReady] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    
    const loadMessages = async () => {
      const result = await fetchMessages();
      if (result.success) {
        setMessages(result.data);
      } else {
        setError(result.message);
      }
      setLoading(false);
      setTimeout(() => setPageReady(true), 100);
    };
    
    loadMessages();
  }, [token, fetchMessages, navigate]);

  const deleteMessage = (index) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) {
      setMessages(messages.filter((_, i) => i !== index));
    }
  };

  const markAsRead = (index) => {
    const updatedMessages = [...messages];
    updatedMessages[index] = { ...updatedMessages[index], read: true };
    setMessages(updatedMessages);
  };

  if (loading) {
    return (
      <div className="loading fade-in">
        <div className="spinner"></div>
        Chargement des messages...
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
            <h1>Messages reçus</h1>
            <p>Consultez et gérez les messages envoyés par les visiteurs du site</p>
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
              📬 Messages ({messages.length})
            </h2>
            {messages.length > 0 && (
              <div className="text-muted">
                {messages.filter(msg => !msg.read).length} non lus
              </div>
            )}
          </div>

          {messages && messages.length > 0 ? (
            <div className="card-grid">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`card ${pageReady ? 'slide-up' : ''} ${!msg.read ? 'unread' : ''}`}
                  style={{ 
                    animationDelay: pageReady ? `${0.4 + index * 0.1}s` : '0s',
                    border: !msg.read ? '2px solid var(--primary)' : undefined
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
                    {!msg.read && (
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
                      📅 {new Date(msg.timestamp).toLocaleString('fr-FR', {
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
                  
                  <div className="admin-controls">
                    {!msg.read && (
                      <button
                        onClick={() => markAsRead(index)}
                        className="btn-icon success"
                        title="Marquer comme lu"
                      >
                        ✅
                      </button>
                    )}
                    <a
                      href={`mailto:${msg.email}?subject=Re: Votre message sur le site ADEI&body=Bonjour ${msg.name},%0D%0A%0D%0AMerci pour votre message :%0D%0A"${msg.message}"%0D%0A%0D%0A`}
                      className="btn-icon secondary"
                      title="Répondre par email"
                    >
                      📧
                    </a>
                    <button
                      onClick={() => deleteMessage(index)}
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

          {messages.length > 0 && (
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