import React, { useEffect, useState, useContext, useRef } from 'react';
import { AuthContext } from '../AuthContext';

const News = () => {
  const { token } = useContext(AuthContext);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageReady, setPageReady] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const formRef = useRef(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    date: new Date().toISOString().split('T')[0]
  });

  const isAdmin = token === 'admin' || (token && token.length > 0);

  // Auto-scroll to form when editing
  useEffect(() => {
    if (showForm && formRef.current) {
      const timer = setTimeout(() => {
        formRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [showForm, editingId]);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/news');
      const data = await response.json();
      setArticles(data);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
      setTimeout(() => setPageReady(true), 100);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (editingId) {
      setArticles(articles.map(article => 
        article.id === editingId 
          ? { ...article, ...formData }
          : article
      ));
    } else {
      const newArticle = {
        id: Date.now(),
        ...formData
      };
      setArticles([newArticle, ...articles]);
    }
    
    resetForm();
  };

  const handleEdit = (article) => {
    setFormData({
      title: article.title,
      content: article.content,
      date: article.date
    });
    setEditingId(article.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      setArticles(articles.filter(article => article.id !== id));
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      date: new Date().toISOString().split('T')[0]
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="loading fade-in">
        <div className="spinner"></div>
        Chargement des actualités...
      </div>
    );
  }

  return (
    <div className={`page-container ${pageReady ? 'fade-in' : ''}`}>
      <>
        <div
          className="hero"
          style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/images/hero-news.png)` }}
        >
          <div className={`hero-content ${pageReady ? 'slide-up' : ''}`}>
            <h1>Actualités</h1>
            <p>Restez informés des dernières nouvelles et annonces de l'ADEI</p>
          </div>
        </div>

        <div className={`content ${pageReady ? 'fade-in' : ''}`} style={{ animationDelay: '0.2s' }}>
          {isAdmin && (
            <div 
              ref={formRef}
              className={`admin-form ${pageReady ? 'zoom-in' : ''} ${editingId ? 'editing' : ''}`}
              style={{ animationDelay: '0.3s' }}
            >
              <div className="admin-form-header">
                <h3>{editingId ? 'Modifier l\'article' : 'Ajouter un article'}</h3>
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="btn secondary"
                >
                  {showForm ? 'Annuler' : 'Nouvel article'}
                </button>
              </div>

              {showForm && (
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label className="form-label">Titre</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Contenu</label>
                    <textarea
                      className="form-textarea"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="Rédigez le contenu de l'actualité..."
                      required
                    />
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                    <button type="submit" className="btn success">
                      {editingId ? 'Mettre à jour' : 'Publier'}
                    </button>
                    <button type="button" onClick={resetForm} className="btn secondary">
                      Annuler
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {articles && articles.length > 0 ? (
            <div className="card-grid">
              {articles.map((article, index) => (
                <article
                  key={article.id}
                  className={`card ${pageReady ? 'slide-up' : ''}`}
                  style={{ animationDelay: pageReady ? `${0.4 + index * 0.1}s` : '0s' }}
                >
                  <h2 className="mt-0">{article.title}</h2>
                  <small className="text-muted">{article.date}</small>
                  <p>{article.content}</p>
                  
                  {isAdmin && (
                    <div className="admin-controls">
                      <button
                        onClick={() => handleEdit(article)}
                        className="btn-icon secondary"
                        title="Modifier"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(article.id)}
                        className="btn-icon danger"
                        title="Supprimer"
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <div className="card text-center">
              <h3>Aucune actualité disponible</h3>
              <p>Les actualités apparaîtront ici dès qu'elles seront publiées.</p>
              {isAdmin && (
                <button
                  onClick={() => setShowForm(true)}
                  className="btn"
                  style={{ marginTop: 'var(--spacing-md)' }}
                >
                  Publier la première actualité
                </button>
              )}
            </div>
          )}
        </div>
      </>
    </div>
  );
};

export default News;