import React, { useEffect, useState, useContext, useRef } from 'react';
import { AuthContext } from '../AuthContext';

const Events = () => {
  const { token } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [pageReady, setPageReady] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const formRef = useRef(null);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    category: '',
    description: ''
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
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/events');
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
      setTimeout(() => setPageReady(true), 100);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (editingId) {
      setEvents(events.map(event => 
        event.id === editingId 
          ? { ...event, ...formData }
          : event
      ));
    } else {
      const newEvent = {
        id: Date.now(),
        ...formData
      };
      setEvents([...events, newEvent]);
    }
    
    resetForm();
  };

  const handleEdit = (event) => {
    setFormData({
      title: event.title,
      date: event.date,
      time: event.time,
      location: event.location,
      category: event.category || '',
      description: event.description
    });
    setEditingId(event.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      setEvents(events.filter(event => event.id !== id));
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      date: '',
      time: '',
      location: '',
      category: '',
      description: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  const filteredEvents = events.filter((event) =>
    event.title.toLowerCase().includes(search.toLowerCase()) ||
    (event.category && event.category.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="loading fade-in">
        <div className="spinner"></div>
        Chargement des événements...
      </div>
    );
  }

  return (
    <div className={`page-container ${pageReady ? 'fade-in' : ''}`}>
      <>
        <div
          className="hero"
          style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/images/hero-home.png)` }}
        >
          <div className={`hero-content ${pageReady ? 'slide-up' : ''}`}>
            <h1>Événements</h1>
            <p>Découvrez nos activités passionnantes et rejoignez la communauté ADEI</p>
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
                <h3>{editingId ? 'Modifier l\'événement' : 'Ajouter un événement'}</h3>
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="btn secondary"
                >
                  {showForm ? 'Annuler' : 'Nouvel événement'}
                </button>
              </div>

              {showForm && (
                <form onSubmit={handleSubmit}>
                  <div className="form-row">
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
                      <label className="form-label">Catégorie</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        placeholder="ex: académique, sport, social"
                      />
                    </div>
                  </div>
                  <div className="form-row">
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
                      <label className="form-label">Heure</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        placeholder="ex: 14:00 - 16:00"
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Lieu</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-textarea"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Décrivez l'événement en détail..."
                      required
                    />
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                    <button type="submit" className="btn success">
                      {editingId ? 'Mettre à jour' : 'Créer l\'événement'}
                    </button>
                    <button type="button" onClick={resetForm} className="btn secondary">
                      Annuler
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          <div className="search-bar">
            <div className="search-icon">🔍</div>
            <input
              type="text"
              className="search-input"
              placeholder="Rechercher un événement ou une catégorie..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {filteredEvents && filteredEvents.length > 0 ? (
            <div className="card-grid">
              {filteredEvents.map((event, index) => (
                <div
                  key={event.id}
                  className={`card ${pageReady ? 'slide-up' : ''}`}
                  style={{ animationDelay: pageReady ? `${0.5 + index * 0.1}s` : '0s' }}
                >
                  <h2 className="mt-0">{event.title}</h2>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 'var(--spacing-md)', 
                    marginBottom: 'var(--spacing-md)',
                    flexWrap: 'wrap'
                  }}>
                    <small className="text-muted">📅 {event.date}</small>
                    <small className="text-muted">🕐 {event.time}</small>
                  </div>
                  <p><strong>Lieu :</strong> {event.location}</p>
                  <p>{event.description}</p>
                  {event.category && (
                    <span className="category-tag">
                      {event.category}
                    </span>
                  )}
                  
                  {isAdmin && (
                    <div className="admin-controls">
                      <button
                        onClick={() => handleEdit(event)}
                        className="btn-icon secondary"
                        title="Modifier"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="btn-icon danger"
                        title="Supprimer"
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="card text-center">
              <h3>
                {search ? 'Aucun événement trouvé' : 'Aucun événement disponible'}
              </h3>
              <p>
                {search 
                  ? `Aucun événement ne correspond à "${search}"`
                  : 'Les événements apparaîtront ici dès qu\'ils seront programmés.'
                }
              </p>
              {isAdmin && !search && (
                <button
                  onClick={() => setShowForm(true)}
                  className="btn"
                  style={{ marginTop: 'var(--spacing-md)' }}
                >
                  Créer le premier événement
                </button>
              )}
            </div>
          )}
        </div>
      </>
    </div>
  );
};

export default Events;