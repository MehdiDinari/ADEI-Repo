import React, { useState, useContext, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../AuthContext';
import '../styles/card-animations.css';

const ADEI = () => {
  const { token } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [pageReady, setPageReady] = useState(false);
  const formRef = useRef(null);
  const [memberForm, setMemberForm] = useState({
    photo: '/images/default.jpg',
    name: '',
    filiere: '',
    email: ''
  });
  const [content, setContent] = useState({
    title: "Association des Étudiants Ingénieurs (ADEI)",
    subtitle: "Votre communauté étudiante au cœur de l'ENSAF",
    sections: [
      {
        title: "Notre Mission",
        content: "L'Association des Élèves Ingénieurs (ADEI) vise à unir les étudiants ingénieurs et à organiser des activités sociales, culturelles et académiques. Nous travaillons à faciliter leur vie étudiante et à offrir des opportunités de développement personnel et professionnel."
      },
      {
        title: "Nos Valeurs",
        content: "L'ADEI prône l'excellence académique, l'esprit d'équipe, l'innovation et la solidarité. Nous croyons en l'importance de créer un environnement inclusif où chaque étudiant peut s'épanouir et développer ses compétences."
      },
      {
        title: "Nos Activités",
        content: "Notre association organise régulièrement des événements, ateliers, conférences et compétitions pour enrichir l'expérience des étudiants et promouvoir un esprit de communauté au sein de l'école. Nous coordonnons également les activités des différents clubs étudiants."
      },
      {
        title: "Gouvernance",
        content: "L'ADEI est dirigée par un bureau exécutif élu démocratiquement par les étudiants. Notre structure organisationnelle favorise la participation active de tous les membres et assure une représentation équitable de toutes les filières."
      },
      {
        title: "Partenariats",
        content: "Nous entretenons des relations privilégiées avec l'administration de l'ENSAF, les entreprises partenaires et d'autres associations étudiantes. Ces partenariats nous permettent d'offrir des opportunités uniques à nos membres."
      }
    ]
  });
  
  const [members, setMembers] = useState([
    {
      id: 1,
      photo: '/images/default.jpg',
      name: 'Dhirech Yassir',
      filiere: 'G.INFO 1',
      email: 'dhirech.yassir@usmba.ac.ma'
    },
    {
      id: 2,
      photo: '/images/default.jpg',
      name: 'Sara Mountasser',
      filiere: 'CP2',
      email: 'mountasara25@gmail.com'
    },
    {
      id: 3,
      photo: '/images/default.jpg',
      name: 'Mohammed Sbihi',
      filiere: 'GTR 2',
      email: 'mohammedsbihi11@gmail.com'
    },
    {
      id: 4,
      photo: '/images/default.jpg',
      name: 'Badr Toudi',
      filiere: 'GSEII 2',
      email: 'bdtoudi@gmail.com'
    },
    {
      id: 5,
      photo: '/images/default.jpg',
      name: 'Malak Essalhi',
      filiere: 'G. INDUS 2',
      email: 'malak.essalhi@usmba.ac.ma'
    },
    {
      id: 6,
      photo: '/images/default.jpg',
      name: 'Hatim Daanoun',
      filiere: 'GTR 2',
      email: 'hatim.danoun@usmba.ac.ma'
    }
  ]);

  const isAdmin = token === 'admin' || (token && token.length > 0);

  useEffect(() => {
    const timer = setTimeout(() => setPageReady(true), 200);
    return () => clearTimeout(timer);
  }, []);

  // Auto-scroll to modal when editing
  useEffect(() => {
    if (showMemberModal && formRef.current) {
      const timer = setTimeout(() => {
        formRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'nearest'
        });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [showMemberModal, editingMember]);

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

  const handleMemberEdit = (member = null) => {
    if (member) {
      setMemberForm({
        photo: member.photo,
        name: member.name,
        filiere: member.filiere,
        email: member.email
      });
      setEditingMember(member.id);
    } else {
      setMemberForm({
        photo: '/images/default.jpg',
        name: '',
        filiere: '',
        email: ''
      });
      setEditingMember(null);
    }
    setShowMemberModal(true);
  };

  const handleMemberSave = () => {
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(memberForm.email)) {
      alert('Veuillez entrer une adresse email valide');
      return;
    }

    if (editingMember) {
      setMembers(members.map(member => 
        member.id === editingMember 
          ? { ...member, ...memberForm }
          : member
      ));
    } else {
      const newMember = {
        id: Date.now(),
        ...memberForm
      };
      setMembers([...members, newMember]);
    }
    setShowMemberModal(false);
    setEditingMember(null);
    setMemberForm({ photo: '/images/default.jpg', name: '', filiere: '', email: '' });
  };

  const handleMemberDelete = (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce membre ?')) {
      setMembers(members.filter(member => member.id !== id));
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      rotateX: -15
    },
    visible: { 
      opacity: 1, 
      y: 0,
      rotateX: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
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

          {/* Members Section */}
          <div className={`members-section ${pageReady ? 'fade-in' : ''}`} style={{ 
            marginTop: 'var(--spacing-3xl)',
            animationDelay: '0.7s'
          }}>
            <div className="section-header" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'var(--spacing-xl)',
              flexWrap: 'wrap',
              gap: 'var(--spacing-md)'
            }}>
              <h2 className="text-primary" style={{ margin: 0 }}>Membres de l'ADEI</h2>
              {isAdmin && (
                <button
                  onClick={() => handleMemberEdit()}
                  className="btn"
                  style={{ fontSize: 'var(--font-size-sm)' }}
                >
                  Ajouter un membre
                </button>
              )}
            </div>

            <motion.div
              className="members-grid"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 'var(--spacing-xl)',
                '@media (max-width: 768px)': {
                  gridTemplateColumns: '1fr'
                }
              }}
            >
              {members.map((member) => (
                <div key={member.id} className="card-animation-layer">
                  <motion.div
                    variants={itemVariants}
                    whileHover={{ 
                      y: -8,
                      transition: { duration: 0.3 }
                    }}
                    className="member-card card"
                    style={{
                      background: 'var(--card-bg)',
                      borderRadius: 'var(--radius-xl)',
                      padding: 'var(--spacing-xl)',
                      textAlign: 'center',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                      border: '1px solid var(--card-border)',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {/* Background decoration */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '60px',
                      background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                      opacity: 0.1
                    }} />
                    
                    {/* Member Photo */}
                    <div style={{
                      position: 'relative',
                      marginBottom: 'var(--spacing-lg)'
                    }}>
                      <div style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        margin: '0 auto',
                        border: '4px solid var(--primary)',
                        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)'
                      }}>
                        <img
                          src={member.photo}
                          alt={member.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.3s ease'
                          }}
                          onError={(e) => {
                            e.target.src = '/images/default.jpg';
                          }}
                        />
                      </div>
                    </div>

                    {/* Member Info */}
                    <h3 style={{
                      margin: '0 0 var(--spacing-sm) 0',
                      fontSize: 'var(--font-size-lg)',
                      fontWeight: 'bold',
                      color: 'var(--text-primary)'
                    }}>
                      {member.name}
                    </h3>
                    
                    <p style={{
                      margin: '0 0 var(--spacing-md) 0',
                      fontSize: 'var(--font-size-md)',
                      color: 'var(--primary)',
                      fontWeight: '600',
                      background: 'var(--bg-secondary)',
                      padding: 'var(--spacing-xs) var(--spacing-md)',
                      borderRadius: 'var(--radius-xl)',
                      display: 'inline-block'
                    }}>
                      {member.filiere}
                    </p>

                    {/* Contact Button */}
                    <div style={{ marginTop: 'var(--spacing-lg)' }}>
                      <a
                        href={`mailto:${member.email}`}
                        className="contact-email-btn"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 'var(--spacing-sm)',
                          background: 'var(--primary)',
                          color: 'white',
                          padding: 'var(--spacing-sm) var(--spacing-md)',
                          borderRadius: 'var(--radius-lg)',
                          textDecoration: 'none',
                          fontSize: 'var(--font-size-sm)',
                          fontWeight: '600',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
                        }}
                        onMouseOver={(e) => {
                          e.target.style.background = 'var(--primary-dark)';
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
                        }}
                        onMouseOut={(e) => {
                          e.target.style.background = 'var(--primary)';
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
                        }}
                      >
                        <span style={{ fontSize: '16px' }}>📧</span>
                        Contacter
                      </a>
                    </div>

                    {/* Admin Controls */}
                    {isAdmin && (
                      <div style={{
                        position: 'absolute',
                        top: 'var(--spacing-md)',
                        right: 'var(--spacing-md)',
                        display: 'flex',
                        gap: 'var(--spacing-xs)'
                      }}>
                        <button
                          onClick={() => handleMemberEdit(member)}
                          className="btn-icon secondary"
                          style={{
                            width: '32px',
                            height: '32px',
                            fontSize: '14px',
                            borderRadius: '50%'
                          }}
                          title="Modifier"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleMemberDelete(member.id)}
                          className="btn-icon danger"
                          style={{
                            width: '32px',
                            height: '32px',
                            fontSize: '14px',
                            borderRadius: '50%'
                          }}
                          title="Supprimer"
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </motion.div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Member Modal */}
        <AnimatePresence>
          {showMemberModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: 'var(--spacing-md)'
              }}
              onClick={() => setShowMemberModal(false)}
            >
              <motion.div
                ref={formRef}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: 'var(--card-bg)',
                  borderRadius: 'var(--radius-xl)',
                  padding: 'var(--spacing-xl)',
                  width: '100%',
                  maxWidth: '500px',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                  maxHeight: '90vh',
                  overflowY: 'auto'
                }}
              >
                <h3 style={{ 
                  margin: '0 0 var(--spacing-xl) 0',
                  color: 'var(--primary)',
                  textAlign: 'center'
                }}>
                  {editingMember ? 'Modifier le membre' : 'Ajouter un membre'}
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                  // Only showing the updated part of the Member Modal input section
                  <div className="form-group">
                    <label className="form-label">Photo</label>
                    <input
                      type="file"
                      accept="image/*"
                      className="form-input"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => {
                            setMemberForm({ ...memberForm, photo: reader.result });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <small className="text-muted">
                      Sélectionnez une image pour le membre (si aucun fichier choisi, l'image par défaut sera utilisée)
                    </small>
                    {memberForm.photo && (
                      <div style={{ marginTop: 'var(--spacing-md)', textAlign: 'center' }}>
                        <img
                          src={memberForm.photo}
                          alt="Aperçu"
                          style={{
                            width: '100px',
                            height: '100px',
                            objectFit: 'cover',
                            borderRadius: '50%',
                            border: '2px solid var(--primary)'
                          }}
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Nom complet</label>
                    <input
                      type="text"
                      className="form-input"
                      value={memberForm.name}
                      onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                      placeholder="Prénom Nom"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Filière</label>
                    <input
                      type="text"
                      className="form-input"
                      value={memberForm.filiere}
                      onChange={(e) => setMemberForm({ ...memberForm, filiere: e.target.value })}
                      placeholder="ex: G.INFO 2"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-input"
                      value={memberForm.email}
                      onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                      placeholder="email@usmba.ac.ma"
                      required
                    />
                  </div>
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  gap: 'var(--spacing-md)', 
                  marginTop: 'var(--spacing-xl)',
                  justifyContent: 'flex-end'
                }}>
                  <button
                    onClick={() => setShowMemberModal(false)}
                    className="btn secondary"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleMemberSave}
                    className="btn success"
                    disabled={!memberForm.name || !memberForm.filiere || !memberForm.email}
                  >
                    {editingMember ? 'Mettre à jour' : 'Ajouter'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    </div>
  );
};

export default ADEI;