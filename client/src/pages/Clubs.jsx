import React, { useEffect, useState, useContext, useCallback, useMemo, useRef } from 'react';
import { AuthContext } from '../AuthContext';

const Clubs = () => {
  const { token } = useContext(AuthContext);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageReady, setPageReady] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const formRef = useRef(null);
  const [formData, setFormData] = useState({
    club: '',
    president: '',
    annees_etude: '',
    tel: '',
    email: '',
    website: '',
    image: null,
    imagePreview: '',
    observations: ''
  });

  const isAdmin = useMemo(() => token === 'admin' || (token && token.length > 0), [token]);

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
  }, [showForm, editingIndex]);

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/api/clubs');
      const data = await response.json();
      setClubs(data);
    } catch (error) {
      console.error('Error fetching clubs:', error);
    } finally {
      setLoading(false);
      setTimeout(() => setPageReady(true), 100);
    }
  }, []);

  const handleImageChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData((prev) => ({
          ...prev,
          image: file,
          imagePreview: event.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  }, []);


  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    // Create a copy of formData with imagePreview as the image URL for display
    const clubData = {
      ...formData,
      image: formData.imagePreview || formData.image
    };
    
    if (editingIndex !== null) {
      const updatedClubs = [...clubs];
      updatedClubs[editingIndex] = clubData;
      setClubs(updatedClubs);
    } else {
      setClubs([...clubs, clubData]);
    }
    
    resetForm();
  }, [formData, editingIndex, clubs]);

  const handleEdit = useCallback((club, index) => {
    setFormData({
      club: club.club,
      president: club.president,
      annees_etude: club.annees_etude,
      tel: club.tel,
      email: club.email,
      website: club.website || '',
      image: null,
      imagePreview: club.image || '',
      observations: club.observations || ''
    });
    setEditingIndex(index);
    setShowForm(true);
  }, []);

  const handleDelete = useCallback((index) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce club ?')) {
      setClubs(prev => prev.filter((_, i) => i !== index));
    }
  }, []);

  const resetForm = useCallback(() => {
    setFormData({
      club: '',
      president: '',
      annees_etude: '',
      tel: '',
      email: '',
      website: '',
      image: null,
      imagePreview: '',
      observations: ''
    });
    setEditingIndex(null);
    setShowForm(false);
  }, []);

  if (loading) {
    return (
      <div className="loading fade-in">
        <div className="spinner"></div>
        Chargement des clubs...
      </div>
    );
  }

  return (
    <div className={`page-container ${pageReady ? 'fade-in' : ''}`}>
      <div
        className="hero"
        style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/images/hero-clubs.png)` }}
      >
        <div className={`hero-content ${pageReady ? 'slide-up' : ''}`}>
          <h1>Clubs Étudiants</h1>
          <p>Découvrez nos associations dynamiques et rejoignez la communauté qui vous correspond</p>
        </div>
      </div>

      <div className={`content ${pageReady ? 'fade-in' : ''}`} style={{ animationDelay: '0.2s' }}>
        {isAdmin && (
          <div 
            ref={formRef}
            className={`admin-form ${pageReady ? 'zoom-in' : ''} ${editingIndex !== null ? 'editing' : ''}`}
            style={{ animationDelay: '0.3s' }}
          >
            <div className="admin-form-header">
              <h3>{editingIndex !== null ? 'Modifier le club' : 'Ajouter un club'}</h3>
              <button
                onClick={() => setShowForm(!showForm)}
                className="btn secondary"
              >
                {showForm ? 'Annuler' : 'Nouveau club'}
              </button>
            </div>

            {showForm && (
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Nom du club</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.club}
                      onChange={(e) => setFormData({ ...formData, club: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Président</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.president}
                      onChange={(e) => setFormData({ ...formData, president: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Année d'étude</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.annees_etude}
                      onChange={(e) => setFormData({ ...formData, annees_etude: e.target.value })}
                      placeholder="ex: G.INFO 2"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Téléphone</label>
                    <input
                      type="tel"
                      className="form-input"
                      value={formData.tel}
                      onChange={(e) => setFormData({ ...formData, tel: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-input"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Site web</label>
                    <input
                      type="url"
                      className="form-input"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Image du club</label>
                  <div className="file-upload-container">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="file-upload-input"
                      id="club-image-upload"
                    />
                    <label 
                      htmlFor="club-image-upload" 
                      className={`file-upload-button ${formData.image || formData.imagePreview ? 'has-file' : ''}`}
                    >
                      {formData.image || formData.imagePreview ? (
                        <>
                          <span>✅</span>
                          <span>Image sélectionnée</span>
                        </>
                      ) : (
                        <>
                          <span>📁</span>
                          <span>Choisir une image</span>
                        </>
                      )}
                    </label>
                  </div>
                  {formData.imagePreview && (
                    <div style={{ marginTop: 'var(--spacing-md)' }}>
                      <img 
                        src={formData.imagePreview} 
                        alt="Aperçu" 
                        style={{ 
                          width: '100px', 
                          height: '100px', 
                          objectFit: 'cover', 
                          borderRadius: 'var(--radius-lg)',
                          border: '2px solid var(--card-border)'
                        }} 
                      />
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">Observations (optionnel)</label>
                  <textarea
                    className="form-textarea"
                    value={formData.observations}
                    onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                    placeholder="Informations supplémentaires sur le club..."
                    rows="4"
                    style={{ minHeight: '100px', maxHeight: '200px' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                  <button type="submit" className="btn btn-small success">
                    {editingIndex !== null ? 'Mettre à jour' : 'Ajouter le club'}
                  </button>
                  <button type="button" onClick={resetForm} className="btn btn-small secondary">
                    Annuler
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {clubs && clubs.length > 0 ? (
          <div className="card-grid">
            {clubs.map((club, index) => (
              <div
                key={index}
                className={`club-card ${pageReady ? 'slide-up' : ''}`}
                style={{ animationDelay: pageReady ? `${0.4 + index * 0.1}s` : '0s' }}
              >
                <div className="club-card-content">
                  {club.image && (
                    <div className="club-card-image">
                      <img 
                        src={club.image} 
                        alt={club.club}
                        style={{
                          width: '100%',
                          height: '200px',
                          objectFit: 'cover',
                          borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0'
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <div className="club-card-content-wrapper">
                    <div className="club-card-info">
                      <h2 className="club-card-title">{club.club}</h2>
                      
                      <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                        <p><strong>Président :</strong> {club.president}</p>
                        <p><strong>Année d'étude :</strong> {club.annees_etude}</p>
                      </div>
                      
                      <div style={{ marginBottom: 'var(--spacing-md)' }}>
                        <p>
                          <strong>Téléphone :</strong>{' '}
                          <a href={`tel:${club.tel}`} className="text-primary">
                            {club.tel}
                          </a>
                        </p>
                        <p>
                          <strong>Email :</strong>{' '}
                          <a href={`mailto:${club.email}`} className="text-primary">
                            {club.email}
                          </a>
                        </p>
                        {club.website && (
                          <p>
                            <strong>Site web :</strong>{' '}
                            <a 
                              href={club.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary"
                            >
                              Visiter le site
                            </a>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {club.observations && (
                    <div className="info-card">
                      <h4>Observations</h4>
                      <p>{club.observations}</p>
                    </div>
                  )}
                  
                  {isAdmin && (
                    <div className="admin-controls">
                      <button
                        onClick={() => handleEdit(club, index)}
                        className="btn-icon btn-small secondary"
                        title="Modifier"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(index)}
                        className="btn-icon btn-small danger"
                        title="Supprimer"
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                  
                  <div className="club-card-actions">
                    <a href={`/club/${index}`} className="club-details-btn">
                      Voir les détails
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card text-center">
            <h3>Aucun club disponible</h3>
            <p>Les clubs étudiants apparaîtront ici dès qu'ils seront enregistrés.</p>
            {isAdmin && (
              <button
                onClick={() => setShowForm(true)}
                className="btn btn-small"
                style={{ marginTop: 'var(--spacing-md)' }}
              >
                Ajouter le premier club
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Clubs;