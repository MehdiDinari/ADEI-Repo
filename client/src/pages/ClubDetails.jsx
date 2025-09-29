import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

const ClubDetails = () => {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const [club, setClub] = useState(null);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageReady, setPageReady] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [clubDetails, setClubDetails] = useState({
    description: '',
    activities: [],
    achievements: [],
    members: [],
    meetings: '',
    socialMedia: {
      facebook: '',
      instagram: '',
      linkedin: ''
    }
  });

  const isAdmin = token === 'admin' || (token && token.length > 0);

  useEffect(() => {
    fetchClubs();
  }, []);

  useEffect(() => {
    if (clubs.length > 0) {
      const clubIndex = parseInt(clubId);
      if (clubIndex >= 0 && clubIndex < clubs.length) {
        const selectedClub = clubs[clubIndex];
        setClub(selectedClub);
        
        // Initialize club details with existing data or defaults
        setClubDetails({
          description: selectedClub.description || `${selectedClub.club} est un club dynamique de l'ENSAF qui rassemble des étudiants passionnés. Nous organisons régulièrement des activités pour développer les compétences de nos membres et créer une communauté soudée.`,
          activities: selectedClub.activities || [
            'Ateliers techniques',
            'Conférences',
            'Projets collaboratifs',
            'Événements sociaux'
          ],
          achievements: selectedClub.achievements || [
            'Organisation d\'événements réussis',
            'Participation à des compétitions',
            'Partenariats avec des entreprises'
          ],
          members: selectedClub.members || [
            { name: selectedClub.president, role: 'Président', year: selectedClub.annees_etude }
          ],
          meetings: selectedClub.meetings || 'Les réunions ont lieu chaque semaine. Contactez-nous pour plus d\'informations.',
          socialMedia: selectedClub.socialMedia || {
            facebook: '',
            instagram: '',
            linkedin: ''
          }
        });
      } else {
        navigate('/clubs');
      }
      setLoading(false);
      setTimeout(() => setPageReady(true), 100);
    }
  }, [clubs, clubId, navigate]);

  const fetchClubs = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/clubs');
      const data = await response.json();
      setClubs(data);
    } catch (error) {
      console.error('Error fetching clubs:', error);
      setLoading(false);
    }
  };

  const handleSave = () => {
    // In a real app, you would save to backend
    setIsEditing(false);
  };

  const addActivity = () => {
    setClubDetails({
      ...clubDetails,
      activities: [...clubDetails.activities, 'Nouvelle activité']
    });
  };

  const removeActivity = (index) => {
    setClubDetails({
      ...clubDetails,
      activities: clubDetails.activities.filter((_, i) => i !== index)
    });
  };

  const updateActivity = (index, value) => {
    const newActivities = [...clubDetails.activities];
    newActivities[index] = value;
    setClubDetails({ ...clubDetails, activities: newActivities });
  };

  const addAchievement = () => {
    setClubDetails({
      ...clubDetails,
      achievements: [...clubDetails.achievements, 'Nouveau succès']
    });
  };

  const removeAchievement = (index) => {
    setClubDetails({
      ...clubDetails,
      achievements: clubDetails.achievements.filter((_, i) => i !== index)
    });
  };

  const updateAchievement = (index, value) => {
    const newAchievements = [...clubDetails.achievements];
    newAchievements[index] = value;
    setClubDetails({ ...clubDetails, achievements: newAchievements });
  };

  const addMember = () => {
    setClubDetails({
      ...clubDetails,
      members: [...clubDetails.members, { name: '', role: '', year: '' }]
    });
  };

  const removeMember = (index) => {
    setClubDetails({
      ...clubDetails,
      members: clubDetails.members.filter((_, i) => i !== index)
    });
  };

  const updateMember = (index, field, value) => {
    const newMembers = [...clubDetails.members];
    newMembers[index] = { ...newMembers[index], [field]: value };
    setClubDetails({ ...clubDetails, members: newMembers });
  };

  if (loading) {
    return (
      <div className="loading fade-in">
        <div className="spinner"></div>
        Chargement des détails du club...
      </div>
    );
  }

  if (!club) {
    return (
      <div className="content">
        <div className="card text-center">
          <h2>Club non trouvé</h2>
          <p>Le club demandé n'existe pas.</p>
          <a href="/clubs" className="btn">
            Retour aux clubs
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`page-container club-details-page ${pageReady ? 'fade-in' : ''}`}>
      <div className="club-details-hero">
        <div className={`hero-content ${pageReady ? 'slide-up' : ''}`}>
          <div className="club-hero-image">
            {club.image ? (
              <img 
                src={club.image} 
                alt={club.club}
                className="club-hero-img"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className="club-hero-placeholder" 
              style={{ display: club.image ? 'none' : 'flex' }}
            >
              🏛️
            </div>
          </div>
          <div className="club-hero-info">
            <h1>{club.club}</h1>
            <p className="club-hero-subtitle">
              Dirigé par {club.president} • {club.annees_etude}
            </p>
            <div className="club-hero-contact">
              <a href={`mailto:${club.email}`} className="contact-btn">
                📧 {club.email}
              </a>
              <a href={`tel:${club.tel}`} className="contact-btn">
                📞 {club.tel}
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className={`content ${pageReady ? 'fade-in' : ''}`} style={{ animationDelay: '0.2s' }}>
        <div className="club-details-nav">
          <a href="/clubs" className="btn secondary">
            ← Retour aux clubs
          </a>
          {isAdmin && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`btn ${isEditing ? 'success' : ''}`}
            >
              {isEditing ? 'Terminer l\'édition' : 'Modifier les détails'}
            </button>
          )}
        </div>

        <div className="club-details-grid">
          {/* Description */}
          <div className={`club-detail-card ${pageReady ? 'slide-up' : ''}`} style={{ animationDelay: '0.3s' }}>
            <h2>Description</h2>
            {isEditing ? (
              <textarea
                value={clubDetails.description}
                onChange={(e) => setClubDetails({ ...clubDetails, description: e.target.value })}
                className="club-textarea"
                rows="6"
              />
            ) : (
              <p>{clubDetails.description}</p>
            )}
          </div>

          {/* Activities */}
          <div className={`club-detail-card ${pageReady ? 'slide-up' : ''}`} style={{ animationDelay: '0.4s' }}>
            <div className="card-header">
              <h2>Nos Activités</h2>
              {isEditing && (
                <button onClick={addActivity} className="btn-small">
                  Ajouter
                </button>
              )}
            </div>
            <ul className="club-list">
              {clubDetails.activities.map((activity, index) => (
                <li key={index} className="club-list-item">
                  {isEditing ? (
                    <div className="edit-item">
                      <input
                        type="text"
                        value={activity}
                        onChange={(e) => updateActivity(index, e.target.value)}
                        className="club-input"
                      />
                      <button
                        onClick={() => removeActivity(index)}
                        className="btn-icon danger"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <span>• {activity}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Achievements */}
          <div className={`club-detail-card ${pageReady ? 'slide-up' : ''}`} style={{ animationDelay: '0.5s' }}>
            <div className="card-header">
              <h2>Nos Réussites</h2>
              {isEditing && (
                <button onClick={addAchievement} className="btn-small">
                  Ajouter
                </button>
              )}
            </div>
            <ul className="club-list">
              {clubDetails.achievements.map((achievement, index) => (
                <li key={index} className="club-list-item">
                  {isEditing ? (
                    <div className="edit-item">
                      <input
                        type="text"
                        value={achievement}
                        onChange={(e) => updateAchievement(index, e.target.value)}
                        className="club-input"
                      />
                      <button
                        onClick={() => removeAchievement(index)}
                        className="btn-icon danger"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <span>• {achievement}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Members */}
          <div className={`club-detail-card ${pageReady ? 'slide-up' : ''}`} style={{ animationDelay: '0.6s' }}>
            <div className="card-header">
              <h2>Membres du Bureau</h2>
              {isEditing && (
                <button onClick={addMember} className="btn-small">
                  Ajouter
                </button>
              )}
            </div>
            <div className="members-grid">
              {clubDetails.members.map((member, index) => (
                <div key={index} className="member-card">
                  {isEditing ? (
                    <div className="edit-member">
                      <input
                        type="text"
                        placeholder="Nom"
                        value={member.name}
                        onChange={(e) => updateMember(index, 'name', e.target.value)}
                        className="club-input"
                      />
                      <input
                        type="text"
                        placeholder="Rôle"
                        value={member.role}
                        onChange={(e) => updateMember(index, 'role', e.target.value)}
                        className="club-input"
                      />
                      <input
                        type="text"
                        placeholder="Année"
                        value={member.year}
                        onChange={(e) => updateMember(index, 'year', e.target.value)}
                        className="club-input"
                      />
                      <button
                        onClick={() => removeMember(index)}
                        className="btn-icon danger"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="member-avatar">👤</div>
                      <h4>{member.name}</h4>
                      <p className="member-role">{member.role}</p>
                      <p className="member-year">{member.year}</p>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Meetings */}
          <div className={`club-detail-card ${pageReady ? 'slide-up' : ''}`} style={{ animationDelay: '0.7s' }}>
            <h2>Réunions</h2>
            {isEditing ? (
              <textarea
                value={clubDetails.meetings}
                onChange={(e) => setClubDetails({ ...clubDetails, meetings: e.target.value })}
                className="club-textarea"
                rows="3"
              />
            ) : (
              <p>{clubDetails.meetings}</p>
            )}
          </div>

          {/* Social Media */}
          <div className={`club-detail-card ${pageReady ? 'slide-up' : ''}`} style={{ animationDelay: '0.8s' }}>
            <h2>Réseaux Sociaux</h2>
            {isEditing ? (
              <div className="social-edit">
                <div className="form-group">
                  <label>Facebook</label>
                  <input
                    type="url"
                    value={clubDetails.socialMedia.facebook}
                    onChange={(e) => setClubDetails({
                      ...clubDetails,
                      socialMedia: { ...clubDetails.socialMedia, facebook: e.target.value }
                    })}
                    className="club-input"
                    placeholder="https://facebook.com/..."
                  />
                </div>
                <div className="form-group">
                  <label>Instagram</label>
                  <input
                    type="url"
                    value={clubDetails.socialMedia.instagram}
                    onChange={(e) => setClubDetails({
                      ...clubDetails,
                      socialMedia: { ...clubDetails.socialMedia, instagram: e.target.value }
                    })}
                    className="club-input"
                    placeholder="https://instagram.com/..."
                  />
                </div>
                <div className="form-group">
                  <label>LinkedIn</label>
                  <input
                    type="url"
                    value={clubDetails.socialMedia.linkedin}
                    onChange={(e) => setClubDetails({
                      ...clubDetails,
                      socialMedia: { ...clubDetails.socialMedia, linkedin: e.target.value }
                    })}
                    className="club-input"
                    placeholder="https://linkedin.com/..."
                  />
                </div>
              </div>
            ) : (
              <div className="social-links">
                {clubDetails.socialMedia.facebook && (
                  <a href={clubDetails.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="social-link">
                    Facebook
                  </a>
                )}
                {clubDetails.socialMedia.instagram && (
                  <a href={clubDetails.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="social-link">
                    Instagram
                  </a>
                )}
                {clubDetails.socialMedia.linkedin && (
                  <a href={clubDetails.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" className="social-link">
                    LinkedIn
                  </a>
                )}
                {!clubDetails.socialMedia.facebook && !clubDetails.socialMedia.instagram && !clubDetails.socialMedia.linkedin && (
                  <p className="text-muted">Aucun réseau social configuré</p>
                )}
              </div>
            )}
          </div>
        </div>

        {isEditing && (
          <div className="club-details-actions">
            <button onClick={handleSave} className="btn success">
              Sauvegarder les modifications
            </button>
            <button onClick={() => setIsEditing(false)} className="btn secondary">
              Annuler
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClubDetails;