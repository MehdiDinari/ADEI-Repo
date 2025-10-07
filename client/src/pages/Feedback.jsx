import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/theme.css';

const Feedback = () => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [pageReady, setPageReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [myFeedbacks, setMyFeedbacks] = useState([]);
  
  const [formData, setFormData] = useState({
    type: 'avis',
    message: ''
  });

  useEffect(() => {
    // Rediriger si l'utilisateur n'est pas authentifié ou n'est pas un adhérent
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (user && user.role === 'guest') {
      navigate('/');
      return;
    }

    // Animation delay
    setTimeout(() => {
      setPageReady(true);
    }, 100);
    
    // Charger les feedbacks de l'utilisateur
    fetchUserFeedbacks();
  }, [isAuthenticated, user, navigate]);

  const fetchUserFeedbacks = async () => {
    if (!user || !user.id) {
      setLoadingFeedbacks(false);
      return;
    }
    
    setLoadingFeedbacks(true);
    try {
      const response = await axios.get('http://localhost:5000/api/feedbacks', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.success) {
        // Filtrer les feedbacks pour ne montrer que ceux de l'utilisateur connecté
        const userFeedbacks = response.data.feedbacks.filter(feedback => 
          feedback.userId === user.id || feedback.email === user.email
        );
        setMyFeedbacks(userFeedbacks);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des feedbacks:', err);
      setError('Impossible de charger vos messages.');
    } finally {
      setLoadingFeedbacks(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');

    try {
      const feedbackData = {
        ...formData,
        name: user.username,
        email: user.email,
        userId: user.id
      };
      
      await axios.post('http://localhost:5000/api/feedbacks', feedbackData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      setSuccess('Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.');
      setFormData({
        type: 'avis',
        message: ''
      });
      // Recharger les feedbacks après l'envoi
      fetchUserFeedbacks();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setError('Une erreur est survenue lors de l\'envoi de votre message. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleLike = async (feedbackId) => {
    try {
      await axios.post(`/api/feedbacks/${feedbackId}/like`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      // Mettre à jour la liste des feedbacks
      fetchUserFeedbacks();
    } catch (error) {
      console.error('Erreur lors du like:', error);
      setError('Impossible d\'aimer ce message. Veuillez réessayer.');
    }
  };

  return (
    <div className={`page-container ${pageReady ? 'fade-in' : ''}`}>
      <>
        <div
          className="hero"
          style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/images/hero-contact.png)` }}
        >
          <div className={`hero-content ${pageReady ? 'slide-up' : ''}`}>
            <h1>Avis et Réclamations</h1>
            <p>Nous sommes à votre écoute pour tous vos avis, suggestions et réclamations</p>
          </div>
        </div>

        <div className={`content ${pageReady ? 'fade-in' : ''}`} style={{ animationDelay: '0.2s' }}>
          <div style={{ 
            display: 'grid', 
            gap: 'var(--spacing-3xl)', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' 
          }}>
            {/* Feedback Form */}
            <div className={`card ${pageReady ? 'zoom-in' : ''}`} style={{ animationDelay: '0.3s' }}>
              <h2 className="text-primary mt-0">Partagez votre avis ou réclamation</h2>
              
              {success && (
                <div className={`message ${success.includes('erreur') ? 'error' : 'success'}`}>
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">
                    Connecté en tant que: <strong>{user?.username}</strong> ({user?.email})
                  </label>
                </div>

                <div className="form-group">
                  <label htmlFor="type" className="form-label">
                    Type
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="form-input"
                    required
                  >
                    <option value="avis">Avis / Suggestion</option>
                    <option value="reclamation">Réclamation</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="message" className="form-label">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className="form-textarea"
                    placeholder="Décrivez votre avis, suggestion ou réclamation en détail..."
                    required
                    style={{ height: '200px', width: '100%' }}
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
                      Envoi en cours...
                    </>
                  ) : (
                    'Envoyer'
                  )}
                </button>
              </form>
            </div>

            {/* Information */}
            <div className={`card ${pageReady ? 'zoom-in' : ''}`} style={{ animationDelay: '0.4s' }}>
              <h2 className="text-primary mt-0">Comment ça fonctionne</h2>
              
              <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h3>📝 Soumettez votre avis ou réclamation</h3>
                <p>
                  Remplissez le formulaire avec vos coordonnées et décrivez votre avis ou réclamation 
                  de manière détaillée pour nous permettre de mieux comprendre votre demande.
                </p>
              </div>

              <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h3>⏱️ Délai de traitement</h3>
                <p>
                  Nous nous engageons à traiter votre demande dans un délai de 48 heures ouvrables.
                </p>
              </div>

              <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h3>📧 Suivi</h3>
                <p>
                  Vous recevrez une réponse par email concernant le traitement de votre demande.
                </p>
              </div>

              <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h3>🔒 Confidentialité</h3>
                <p>
                  Vos informations personnelles sont traitées de manière confidentielle et ne seront 
                  utilisées que dans le cadre du traitement de votre demande.
                </p>
              </div>

              <div className="info-card">
                <h4>💡 Conseil</h4>
                <p>
                  Pour un traitement plus rapide, n'hésitez pas à fournir des détails précis 
                  et des exemples concrets dans votre message.
                </p>
              </div>
            </div>
          </div>

          {/* Mes Messages */}
          <div className={`card ${pageReady ? 'zoom-in' : ''}`} style={{ 
            marginTop: 'var(--spacing-3xl)',
            animationDelay: '0.6s'
          }}>
            <h2 className="text-primary mt-0">📬 Mes Messages ({myFeedbacks.length})</h2>
            
            {error && (
              <div className="message error">
                {error}
              </div>
            )}
            
            {loadingFeedbacks ? (
              <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
                <div className="spinner" style={{ width: '32px', height: '32px', margin: '0 auto' }}></div>
                <p>Chargement de vos messages...</p>
              </div>
            ) : myFeedbacks.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                {myFeedbacks.map((feedback, index) => (
                  <div 
                    key={feedback._id} 
                    className="card"
                    style={{ 
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--background-light)'
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: 'var(--spacing-md)'
                    }}>
                      <span className="badge" style={{
                        backgroundColor: feedback.type === 'avis' ? 'var(--success)' : 
                                       feedback.type === 'reclamation' ? 'var(--warning)' : 'var(--info)',
                        color: 'white',
                        padding: 'var(--spacing-xs) var(--spacing-sm)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: 'var(--font-size-xs)'
                      }}>
                        {feedback.type.toUpperCase()}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                        {feedback.likes > 0 && (
                          <span style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '4px',
                            color: 'var(--primary)'
                          }}>
                            ❤️ {feedback.likes}
                          </span>
                        )}
                        <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
                          {new Date(feedback.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <p style={{ marginBottom: 'var(--spacing-md)' }}>
                      {feedback.message}
                    </p>
                    
                    {feedback.response && feedback.response.text && (
                      <div style={{
                        backgroundColor: 'var(--primary-light)',
                        padding: 'var(--spacing-md)',
                        borderRadius: 'var(--radius-md)',
                        borderLeft: '4px solid var(--primary)'
                      }}>
                        <h4 style={{ margin: '0 0 var(--spacing-sm) 0', color: 'var(--primary)' }}>
                          💬 Réponse de l'administration
                        </h4>
                        <p style={{ margin: 0 }}>
                          {feedback.response.text}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
                <p>Vous n'avez encore envoyé aucun message.</p>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
                  Utilisez le formulaire ci-dessus pour envoyer votre premier message.
                </p>
              </div>
            )}
          </div>

          {/* Call to Action */}
          <div className={`card text-center highlight-card ${pageReady ? 'slide-up' : ''}`} style={{ 
            marginTop: 'var(--spacing-3xl)',
            animationDelay: '0.7s'
          }}>
            <h2 className="text-primary">Vous êtes étudiant à l'ENSAF ?</h2>
            <p style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-xl)' }}>
              Découvrez comment vous pouvez vous impliquer dans la vie associative 
              et profiter de toutes les opportunités qu'offre l'ADEI.
            </p>
            <div style={{ 
              display: 'flex', 
              gap: 'var(--spacing-md)', 
              justifyContent: 'center', 
              flexWrap: 'wrap' 
            }}>
              <a href="/clubs" className="btn">
                Rejoindre un club
              </a>
              <a href="/events" className="btn secondary">
                Voir les événements
              </a>
            </div>
          </div>
        </div>
      </>
    </div>
  );
};

export default Feedback;