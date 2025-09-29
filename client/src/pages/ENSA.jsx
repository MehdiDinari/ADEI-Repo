import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../AuthContext';

const ENSA = () => {
  const { token } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [pageReady, setPageReady] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [content, setContent] = useState({
    title: "École Nationale des Sciences Appliquées de Fès",
    subtitle: "Excellence académique et innovation technologique au cœur du Maroc",
    sections: [
      {
        title: "Présentation de l'ENSAF",
        content: "L'École Nationale des Sciences Appliquées de Fès (ENSAF) est un établissement d'enseignement supérieur public marocain, créé en 1999. Elle fait partie du réseau des Écoles Nationales des Sciences Appliquées (ENSA) du Royaume du Maroc et relève de l'Université Sidi Mohamed Ben Abdellah."
      },
      {
        title: "Formation et Filières",
        content: "L'ENSAF propose des formations d'ingénieur dans plusieurs spécialités : Génie Informatique, Génie des Télécommunications et Réseaux, Génie Électrique et Systèmes Embarqués, Génie Industriel, Génie Mécanique et Systèmes Automatisés, et Génie des Matériaux et Procédés. Les formations allient théorie et pratique avec des stages en entreprise et des projets de fin d'études."
      },
      {
        title: "Recherche et Innovation",
        content: "L'école développe une recherche de qualité à travers ses laboratoires et équipes de recherche. Elle entretient des partenariats avec des universités internationales et des entreprises industrielles, favorisant l'innovation et le transfert de technologie."
      },
      {
        title: "Vie Étudiante",
        content: "L'ENSAF offre un environnement d'apprentissage stimulant avec des infrastructures modernes, des laboratoires équipés, une bibliothèque riche, et de nombreuses activités parascolaires. Les étudiants bénéficient d'un encadrement pédagogique de qualité et d'un accompagnement vers l'insertion professionnelle."
      }
    ]
  });

  const filieres = [
    { name: 'Ingénierie des Systèmes Communicants et Sécurité Informatique (ISCSI)', link: 'https://docs.ensaf.ac.ma/home/fil/ISCSN.pdf' },
    { name: 'Ingénierie Informatique, Intelligence Artificielle et Confiance Numérique (3IACN)', link: 'https://docs.ensaf.ac.ma/home/fil/3IACN.pdf' },
    { name: 'Ingénierie des Systèmes Embarqués et Intelligence Artificielle (ISEIA)', link: 'https://docs.ensaf.ac.ma/home/fil/ISEIA.pdf' },
    { name: 'Ingénierie Logicielle et Intelligence Artificielle (ILIA)', link: 'https://docs.ensaf.ac.ma/home/fil/ILIAV2.pdf' },
    { name: 'Génie du développement numérique et Cybersécurité (GDNC)', link: 'https://docs.ensaf.ac.ma/home/fil/DNC.pdf' },
    { name: 'Ingénierie en Science de Données et Intelligence Artificielle (ISDIA)', link: 'https://docs.ensaf.ac.ma/home/fil/ISDIAV3.pdf' },
    { name: 'Génie Informatique', link: 'https://docs.ensaf.ac.ma/home/fil/INFO.pdf' },
    { name: 'Génie Mécanique', link: 'https://docs.ensaf.ac.ma/home/fil/GM.pdf' },
    { name: 'Génie Energétique et systèmes intelligents (GESI)', link: 'https://docs.ensaf.ac.ma/home/fil/GESI.pdf' },
    { name: 'Génie Mécatronique', link: 'https://docs.ensaf.ac.ma/home/fil/GMT.pdf' },
    { name: 'Génie Industriel', link: 'https://docs.ensaf.ac.ma/home/fil/gind.pdf' }
  ];

  const isAdmin = token === 'admin' || (token && token.length > 0);

  useEffect(() => {
    const timer = setTimeout(() => setPageReady(true), 200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.floating-button-container')) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSave = () => {
    setIsEditing(false);
  };

  const updateSection = (index, field, value) => {
    const newSections = [...content.sections];
    newSections[index] = { ...newSections[index], [field]: value };
    setContent({ ...content, sections: newSections });
  };

  const addSection = () => {
    setContent({
      ...content,
      sections: [...content.sections, { title: "Nouvelle section", content: "" }]
    });
  };

  const removeSection = (index) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette section ?')) {
      const newSections = content.sections.filter((_, i) => i !== index);
      setContent({ ...content, sections: newSections });
    }
  };

  return (
    <div className={`page-container ${pageReady ? 'fade-in' : ''}`}>
      <>
        <div
          className="hero"
          style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/images/hero-about.png)` }}
        >
          <div className={`hero-content ${pageReady ? 'slide-up' : ''}`}>
            {isEditing ? (
              <>
                <input
                  type="text"
                  value={content.title}
                  onChange={(e) => setContent({ ...content, title: e.target.value })}
                  style={{
                    background: 'rgba(0,0,0,0.5)',
                    border: '2px solid var(--primary)',
                    color: 'white',
                    fontSize: 'var(--font-size-4xl)',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    padding: 'var(--spacing-md)',
                    borderRadius: 'var(--radius-lg)',
                    marginBottom: 'var(--spacing-md)',
                    width: '100%'
                  }}
                />
                <textarea
                  value={content.subtitle}
                  onChange={(e) => setContent({ ...content, subtitle: e.target.value })}
                  style={{
                    background: 'rgba(0,0,0,0.5)',
                    border: '2px solid var(--primary)',
                    color: 'white',
                    fontSize: 'var(--font-size-lg)',
                    textAlign: 'center',
                    padding: 'var(--spacing-md)',
                    borderRadius: 'var(--radius-lg)',
                    resize: 'vertical',
                    minHeight: '60px',
                    width: '100%'
                  }}
                />
              </>
            ) : (
              <>
                <h1>{content.title}</h1>
                <p>{content.subtitle}</p>
              </>
            )}
          </div>
        </div>

        <div className={`content ${pageReady ? 'fade-in' : ''}`} style={{ animationDelay: '0.2s' }}>
          {isAdmin && (
            <div className={`${pageReady ? 'zoom-in' : ''}`} style={{ marginBottom: 'var(--spacing-xl)', textAlign: 'center', animationDelay: '0.3s' }}>
              {isEditing ? (
                <div style={{ 
                  display: 'flex', 
                  gap: 'var(--spacing-md)', 
                  justifyContent: 'center',
                  flexWrap: 'wrap'
                }}>
                  <button onClick={handleSave} className="btn success">
                    Sauvegarder
                  </button>
                  <button onClick={() => setIsEditing(false)} className="btn secondary">
                    Annuler
                  </button>
                  <button onClick={addSection} className="btn">
                    Ajouter une section
                  </button>
                </div>
              ) : (
                <button onClick={() => setIsEditing(true)} className="btn">
                  Modifier la page
                </button>
              )}
            </div>
          )}

          <div className="card-grid">
            {content.sections.map((section, index) => (
              <div key={index} className={`card ${pageReady ? 'slide-up' : ''}`} style={{ animationDelay: pageReady ? `${0.4 + index * 0.1}s` : '0s' }}>
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) => updateSection(index, 'title', e.target.value)}
                      className="form-input"
                      style={{ 
                        marginBottom: 'var(--spacing-md)', 
                        fontWeight: 'bold', 
                        fontSize: 'var(--font-size-xl)' 
                      }}
                    />
                    <textarea
                      value={section.content}
                      onChange={(e) => updateSection(index, 'content', e.target.value)}
                      className="form-input"
                      rows="6"
                      style={{ marginBottom: 'var(--spacing-md)' }}
                    />
                    <button
                      onClick={() => removeSection(index)}
                      className="btn-icon danger"
                      title="Supprimer cette section"
                    >
                      🗑️
                    </button>
                  </>
                ) : (
                  <>
                    <h2 className="text-primary mt-0">{section.title}</h2>
                    <p>{section.content}</p>
                  </>
                )}
              </div>
            ))}
          </div>

          {!isEditing && (
            <div className={`card text-center highlight-card ${pageReady ? 'zoom-in' : ''}`} style={{ 
              marginTop: 'var(--spacing-3xl)',
              animationDelay: '0.6s'
            }}>
              <h2 className="text-primary">Rejoignez l'ENSAF !</h2>
              <p style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-xl)' }}>
                Découvrez nos formations d'excellence et intégrez une communauté d'ingénieurs 
                passionnés par l'innovation et la technologie.
              </p>
              <div style={{ 
                display: 'flex', 
                gap: 'var(--spacing-md)', 
                justifyContent: 'center', 
                flexWrap: 'wrap' 
              }}>
                <a href="/clubs" className="btn">
                  Découvrir les clubs
                </a>
                <a href="/events" className="btn secondary">
                  Voir les événements
                </a>
                <a href="/contact" className="btn secondary">
                  Nous contacter
                </a>
              </div>
            </div>
          )}
        </div>
      </>

      {/* Floating Button */}
      <div className="floating-button-container">
        <button
          className={`floating-button ${isDropdownOpen ? 'active' : ''}`}
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          title="Voir les filières"
        >
          📚
        </button>
        
        {isDropdownOpen && (
          <div className="floating-dropdown">
            <div className="floating-dropdown-header">
              <h4>Filières ENSA</h4>
            </div>
            <div className="floating-dropdown-content">
              {filieres.map((filiere, index) => (
                <a
                  key={index}
                  href={filiere.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="floating-dropdown-item"
                >
                  📄 {filiere.name}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ENSA;