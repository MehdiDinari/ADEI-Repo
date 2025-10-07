import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminUsers.css';

const AdminUsers = () => {
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'guest'
  });

  // Charger les utilisateurs
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/users', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Vérifier si la réponse est au format JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('La réponse du serveur n\'est pas au format JSON');
      }
      
      const data = await response.json();
      
      if (data.success && Array.isArray(data.users)) {
        setUsers(data.users);
        setFilteredUsers(data.users);
      } else {
        setError(data.message || 'Erreur lors du chargement des utilisateurs');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError(`Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    // Vérifier si l'utilisateur est authentifié
    if (!token) {
      navigate('/login');
      return;
    }
    
    // Vérifier si l'utilisateur est admin
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    
    fetchUsers();
  }, [token, user, navigate]);
  
  // Filtrer les utilisateurs en fonction des critères de recherche
  useEffect(() => {
    let result = users;
    
    // Filtrer par terme de recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(user => 
        user.username.toLowerCase().includes(term) || 
        user.email.toLowerCase().includes(term)
      );
    }
    
    // Filtrer par rôle
    if (roleFilter) {
      result = result.filter(user => user.role === roleFilter);
    }
    
    setFilteredUsers(result);
  }, [searchTerm, roleFilter, users]);
  
  // Gérer les changements dans le formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Ouvrir le modal pour créer un utilisateur
  const handleAddUser = () => {
    setCurrentUser(null);
    setFormData({
      username: '',
      email: '',
      password: '',
      role: 'guest'
    });
    setShowModal(true);
  };
  
  // Ouvrir le modal pour modifier un utilisateur
  const handleEditUser = (user) => {
    setCurrentUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      role: user.role
    });
    setShowModal(true);
  };
  
  // Soumettre le formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const url = currentUser 
        ? `http://localhost:5000/api/users/${currentUser._id}` 
        : 'http://localhost:5000/api/users';
      
      const method = currentUser ? 'PUT' : 'POST';
      
      // Ne pas envoyer le mot de passe s'il est vide lors d'une modification
      const dataToSend = {...formData};
      if (currentUser && !dataToSend.password) {
        delete dataToSend.password;
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dataToSend)
      });
      
      // Vérifier si la réponse est au format JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('La réponse du serveur n\'est pas au format JSON');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess(currentUser ? 'Utilisateur modifié avec succès' : 'Utilisateur créé avec succès');
        setShowModal(false);
        fetchUsers();
      } else {
        setError(data.message || 'Une erreur est survenue');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError(`Erreur: ${error.message}`);
    }
  };
  
  // Supprimer un utilisateur
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      return;
    }
    
    try {
      setError('');
      const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Vérifier si la réponse est au format JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('La réponse du serveur n\'est pas au format JSON');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess('Utilisateur supprimé avec succès');
        fetchUsers();
      } else {
        setError(data.message || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError(`Erreur: ${error.message}`);
    }
  };
  
  if (loading && users.length === 0) {
    return <div className="loading">Chargement...</div>;
  }
  
  return (
    <div className="admin-users-container">
      <h1>Gestion des utilisateurs</h1>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <div className="users-list">
        <div className="search-filters">
          <button className="add-user-btn" onClick={handleAddUser}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Ajouter un utilisateur
          </button>
          
          <input
            type="text"
            className="search-input"
            placeholder="Rechercher par nom ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <select 
            className="filter-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">Tous les rôles</option>
            <option value="admin">Admin</option>
            <option value="adherent">Adhérent</option>
            <option value="guest">Invité</option>
          </select>
        </div>
        
        <h2>Liste des utilisateurs ({filteredUsers.length})</h2>
        
        {loading && <div className="loading">Actualisation...</div>}
        
        {!loading && filteredUsers.length === 0 ? (
          <p>Aucun utilisateur trouvé.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nom d'utilisateur</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Date de création</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((userData, index) => (
                <tr key={index}>
                  <td>{userData.username}</td>
                  <td>{userData.email}</td>
                  <td>{userData.role}</td>
                  <td>{new Date(userData.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="edit-btn" 
                        onClick={() => handleEditUser(userData)}
                      >
                        Modifier
                      </button>
                      <button 
                        className="delete-btn" 
                        onClick={() => handleDeleteUser(userData._id)}
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      {/* Modal pour ajouter/modifier un utilisateur */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{currentUser ? 'Modifier l\'utilisateur' : 'Ajouter un utilisateur'}</h3>
              <button className="close-modal" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="username">Nom d'utilisateur</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  className="form-control"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-control"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password">
                  {currentUser ? 'Mot de passe (laisser vide pour ne pas changer)' : 'Mot de passe'}
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="form-control"
                  value={formData.password}
                  onChange={handleChange}
                  required={!currentUser}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="role">Rôle</label>
                <select
                  id="role"
                  name="role"
                  className="form-control"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="guest">Invité</option>
                  <option value="adherent">Adhérent</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="submit-btn">
                  {currentUser ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;