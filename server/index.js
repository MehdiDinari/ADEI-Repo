const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
require('dotenv').config();

// Import models and middleware
const User = require('./models/User');
const Feedback = require('./models/Feedback');
const connectDB = require('./config/db');
const { auth, checkRole } = require('./middleware/auth');
const { validateRegister, validateLogin, sanitizeInput } = require('./middleware/validation');

// Ne pas démarrer immédiatement la connexion MongoDB ici sans attendre.
// Nous allons l'attendre explicitement dans une fonction de démarrage.

// Create an Express application
const app = express();

// Choose a port for the backend
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors());

// Middleware de sécurité
app.use(helmet());

// Rate limiting pour les routes d'authentification
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limite à 5 tentatives par IP par fenêtre de temps
  message: {
    success: false,
    message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting général
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limite à 100 requêtes par IP par fenêtre de temps
  message: {
    success: false,
    message: 'Trop de requêtes. Réessayez plus tard.'
  }
});

app.use(generalLimiter);

// Parse JSON bodies for incoming requests
app.use(express.json());

// Configuration de la sécurité
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "default-src 'self'; connect-src 'self' http://localhost:*; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';");
  next();
});

// Locate the data directory relative to this file
const dataDir = path.join(__dirname, '..', 'data');
const newsData = JSON.parse(
  fs.readFileSync(path.join(dataDir, 'news.json'), 'utf8')
);
const eventsData = JSON.parse(
  fs.readFileSync(path.join(dataDir, 'events.json'), 'utf8')
);
const clubsData = JSON.parse(
  fs.readFileSync(path.join(dataDir, 'clubs.json'), 'utf8')
);

// Modèle pour les feedbacks


// Route pour la page d'accueil

// Route pour récupérer tous les utilisateurs (protégée, admin seulement)
app.get('/api/users', auth, async (req, res) => {
  try {
    // Vérifier si l'utilisateur est admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Accès non autorisé' });
    }
    
    const users = await User.find().select('-password');
    res.json({ success: true, users });
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Routes pour les avis et réclamations

// Créer un nouveau feedback (accessible à tous)
app.post('/api/feedbacks', async (req, res) => {
  try {
    const { name, email, message, type } = req.body;
    let userId = null;
    
    // Si l'utilisateur est authentifié, récupérer son ID
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
        
        // Si c'est un adhérent connecté, utiliser ses informations de profil
        if (decoded.role === 'adherent' || decoded.role === 'admin') {
          const user = await User.findById(decoded.id);
          if (user) {
            const newFeedback = new Feedback({
              name: user.username,
              email: user.email,
              message,
              type: type || 'avis',
              userId: user.id
            });
            
            await newFeedback.save();
            return res.status(201).json({ success: true, feedback: newFeedback });
          }
        }
      } catch (err) {
        // Token invalide, continuer comme un utilisateur non authentifié
      }
    }
    
    // Pour les utilisateurs non authentifiés
    // Validation des données
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Veuillez remplir tous les champs obligatoires' });
    }
    
    const newFeedback = new Feedback({
      name,
      email,
      message,
      type: type || 'autre',
      userId
    });
    
    await newFeedback.save();
    res.status(201).json({ success: true, feedback: newFeedback });
  } catch (error) {
    console.error('Erreur lors de la création du feedback:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Mettre à jour le statut d'un feedback (protégé, admin seulement)
app.put('/api/feedbacks/:id', auth, async (req, res) => {
  try {
    // Vérifier si l'utilisateur est admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Accès non autorisé' });
    }
    
    const { status } = req.body;
    
    // Validation du statut
    if (!['nouveau', 'en_traitement', 'traité'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Statut invalide' });
    }
    
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback non trouvé' });
    }
    
    res.json({ success: true, feedback });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du feedback:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Supprimer un feedback (protégé, admin seulement)
app.delete('/api/feedbacks/:id', auth, async (req, res) => {
  try {
    // Vérifier si l'utilisateur est admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Accès non autorisé' });
    }
    
    const feedback = await Feedback.findByIdAndDelete(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback non trouvé' });
    }
    
    res.json({ success: true, message: 'Feedback supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du feedback:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Ajouter/retirer un like à un feedback (protégé, authentifié seulement)
app.post('/api/feedbacks/:id/like', auth, async (req, res) => {
  try {
    const feedbackId = req.params.id;
    const userId = req.user.id;
    
    const feedback = await Feedback.findById(feedbackId);
    
    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback non trouvé' });
    }
    
    // Vérifier si l'utilisateur a déjà liké ce feedback
    const alreadyLiked = feedback.likedBy.includes(userId);
    
    if (alreadyLiked) {
      // Retirer le like
      feedback.likes = Math.max(0, feedback.likes - 1);
      feedback.likedBy = feedback.likedBy.filter(id => id.toString() !== userId.toString());
    } else {
      // Ajouter le like
      feedback.likes += 1;
      feedback.likedBy.push(userId);
    }
    
    await feedback.save();
    
    res.json({ 
      success: true, 
      liked: !alreadyLiked,
      likes: feedback.likes
    });
  } catch (error) {
    console.error('Erreur lors de la gestion du like:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Ajouter une réponse à un feedback (protégé, admin seulement)
app.post('/api/feedbacks/:id/respond', auth, async (req, res) => {
  try {
    // Vérifier si l'utilisateur est admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Accès non autorisé' });
    }
    
    const { text } = req.body;
    
    if (!text || text.trim() === '') {
      return res.status(400).json({ success: false, message: 'Le texte de la réponse est requis' });
    }
    
    const feedback = await Feedback.findById(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback non trouvé' });
    }
    
    feedback.response = {
      text,
      createdAt: new Date(),
      adminId: req.user.id
    };
    
    feedback.status = 'traité';
    
    await feedback.save();
    
    res.json({ success: true, feedback });
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la réponse:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>ADEI API Server</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          h1 { color: #333; }
          .endpoint { background: #f4f4f4; padding: 10px; margin: 10px 0; border-radius: 5px; }
          code { background: #eee; padding: 2px 5px; border-radius: 3px; }
        </style>
      </head>
      <body>
        <h1>ADEI API Server</h1>
        <p>Bienvenue sur le serveur API de l'ADEI. Voici les endpoints disponibles :</p>
        
        <div class="endpoint">
          <h3>Authentification</h3>
          <p><code>POST /api/auth/login</code> - Connexion</p>
          <p><code>POST /api/auth/register</code> - Inscription</p>
        </div>
        
        <div class="endpoint">
          <h3>Données</h3>
          <p><code>GET /api/news</code> - Actualités</p>
          <p><code>GET /api/events</code> - Événements</p>
          <p><code>GET /api/clubs</code> - Clubs</p>
        </div>
        
        <p>Pour plus d'informations, consultez la documentation.</p>
      </body>
    </html>
  `);
});

// API endpoints pour les données statiques
app.get('/api/news', (_req, res) => {
  res.json(newsData);
});

app.get('/api/events', (_req, res) => {
  res.json(eventsData);
});

app.get('/api/clubs', (_req, res) => {
  res.json(clubsData);
});

// Endpoint pour soumettre un feedback (accessible à tous)
app.post('/api/feedback', async (req, res) => {
  try {
    const { name, email, type, message } = req.body;
    const feedback = new Feedback({ name, email, type, message });
    await feedback.save();
    console.log('Feedback received:', { name, email, type, message });
    res.status(200).json({ message: 'Votre avis/réclamation a été envoyé avec succès!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de l\'envoi du feedback' });
  }
});

// Endpoint pour récupérer tous les feedbacks (admin et adhérent seulement)
app.get('/api/feedbacks', auth, async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      // Admin voit tous les feedbacks
      const feedbacks = await Feedback.find()
        .sort({ createdAt: -1 })
        .populate('userId', 'username email')
        .populate('response.adminId', 'username');
      return res.json({ success: true, feedbacks });
    } else if (req.user.role === 'adherent') {
      // Adhérent voit uniquement ses propres feedbacks
      const feedbacks = await Feedback.find({ userId: req.user.id })
        .sort({ createdAt: -1 })
        .populate('response.adminId', 'username');
      return res.json({ success: true, feedbacks });
    } else {
      return res.status(403).json({ success: false, message: 'Accès non autorisé' });
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des feedbacks:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des feedbacks' });
  }
});

// Endpoint pour la connexion - route principale
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Identifiants invalides' });
    }
    
    // Vérifier le mot de passe
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Identifiants invalides' });
    }
    
    // Créer et signer le token JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de la connexion' });
  }
});

// Route pour la connexion - pour compatibilité avec le frontend
app.post('/api/auth/login', authLimiter, validateLogin, async (req, res) => {
  try {
    console.log('Tentative de connexion avec:', req.body);
    const { username, password } = req.body;
    
    // Vérifier si l'utilisateur existe (par username ou email)
    const user = await User.findOne({ 
      $or: [
        { username: username },
        { email: username }
      ]
    });
    
    if (!user) {
      console.log('Utilisateur non trouvé:', username);
      return res.status(401).json({ success: false, message: 'Identifiants invalides' });
    }
    
    // Vérifier le mot de passe
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Mot de passe incorrect pour:', username);
      return res.status(401).json({ success: false, message: 'Identifiants invalides' });
    }
    
    // Créer et signer le token JWT
    const token = jwt.sign(
      { 
        userId: user._id,
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    console.log('Connexion réussie pour:', username);
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erreur de connexion:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la connexion' });
  }
});

// Route pour l'inscription - pour compatibilité avec le frontend
app.post('/api/auth/register', authLimiter, validateRegister, async (req, res) => {
  try {
    console.log('Tentative d\'inscription avec:', req.body);
    const { username, email, password, role } = req.body;
    
    // Vérifier si les champs obligatoires sont présents
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Le nom d\'utilisateur et le mot de passe sont requis' 
      });
    }
    
    // Vérifier si le rôle est valide
    const validRoles = ['admin', 'adherent', 'guest'];
    const userRole = role && validRoles.includes(role) ? role : 'guest';
    
    // Créer un nouvel utilisateur avec des valeurs valides
    const newUser = new User({
      username,
      email: email || username, // Utiliser l'email fourni ou le username comme fallback
      password,
      role: userRole // Utiliser le rôle fourni s'il est valide, sinon 'guest'
    });
    
    await newUser.save();
    
    // Créer et signer le token JWT
    const token = jwt.sign(
      { 
        userId: newUser._id,
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    console.log('Inscription réussie pour:', username, 'avec le rôle:', newUser.role);
    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Erreur d\'inscription:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la création du compte' });
  }
});

// Endpoint pour la déconnexion (pas nécessaire avec JWT, géré côté client)
app.post('/api/logout', (req, res) => {
  res.json({ success: true });
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true });
});

// Endpoint pour l'inscription (uniquement pour les invités)
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(409).json({ 
        success: false, 
        message: 'Cet email ou nom d\'utilisateur est déjà utilisé' 
      });
    }
    
    // Créer un nouvel utilisateur avec le rôle "guest"
    const user = new User({
      username,
      email,
      password,
      role: 'guest'
    });
    
    await user.save();
    
    // Créer et signer le token JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    res.json({
      success: true,
      message: 'Compte créé avec succès',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de l\'inscription' });
  }
});

// Endpoint pour créer un compte adhérent (admin seulement)
app.post('/api/users/adherent', auth, checkRole(['admin']), async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(409).json({ 
        success: false, 
        message: 'Cet email ou nom d\'utilisateur est déjà utilisé' 
      });
    }
    
    // Créer un nouvel utilisateur avec le rôle "adherent"
    const user = new User({
      username,
      email,
      password,
      role: 'adherent',
      createdBy: req.user._id
    });
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Compte adhérent créé avec succès',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de la création du compte adhérent' });
  }
});

// Endpoint pour récupérer tous les utilisateurs (admin seulement)
app.get('/api/users', auth, checkRole(['admin']), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ success: true, users });
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des utilisateurs' });
  }
});

// Endpoint pour créer un nouvel utilisateur (admin seulement)
app.post('/api/users', auth, async (req, res) => {
  try {
    // Vérifier si l'utilisateur est admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Accès non autorisé' });
    }

    const { username, email, password, role } = req.body;
    
    // Vérifier si les champs obligatoires sont présents
    if (!username || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Le nom d\'utilisateur, l\'email et le mot de passe sont requis' 
      });
    }
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(409).json({ 
        success: false, 
        message: 'Cet email ou nom d\'utilisateur est déjà utilisé' 
      });
    }
    
    // Vérifier si le rôle est valide
    const validRoles = ['admin', 'adherent', 'guest'];
    const userRole = role && validRoles.includes(role) ? role : 'guest';
    
    // Créer un nouvel utilisateur
    const newUser = new User({
      username,
      email,
      password,
      role: userRole,
      createdBy: req.user._id
    });
    
    await newUser.save();
    
    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la création de l\'utilisateur' });
  }
});

// Endpoint pour récupérer un utilisateur spécifique (admin seulement)
app.get('/api/users/:id', auth, checkRole(['admin']), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }
    
    res.json({ success: true, user });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération de l\'utilisateur' });
  }
});

// Endpoint pour mettre à jour un utilisateur (admin seulement)
app.put('/api/users/:id', auth, async (req, res) => {
  // Vérifier si l'utilisateur est admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Accès non autorisé' });
  }
  try {
    const { username, email, password, role } = req.body;
    
    // Vérifier si l'utilisateur existe
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }
    
    // Vérifier si le nom d'utilisateur ou l'email est déjà utilisé par un autre utilisateur
    if (username && username !== user.username) {
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        return res.status(409).json({ success: false, message: 'Ce nom d\'utilisateur est déjà utilisé' });
      }
      user.username = username;
    }
    
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(409).json({ success: false, message: 'Cet email est déjà utilisé' });
      }
      user.email = email;
    }
    
    // Mettre à jour le mot de passe si fourni
    if (password) {
      user.password = password;
    }
    
    // Mettre à jour le rôle si fourni et valide
    if (role) {
      const validRoles = ['admin', 'adherent', 'guest', 'user'];
      if (validRoles.includes(role)) {
        user.role = role;
      }
    }
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Utilisateur mis à jour avec succès',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour de l\'utilisateur' });
  }
});

// Endpoint pour supprimer un utilisateur (admin seulement)
app.delete('/api/users/:id', auth, async (req, res) => {
  // Vérifier si l'utilisateur est admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Accès non autorisé' });
  }
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }
    
    // Empêcher la suppression de son propre compte
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Vous ne pouvez pas supprimer votre propre compte' });
    }
    
    await User.findByIdAndDelete(req.params.id);
    
    res.json({ success: true, message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la suppression de l\'utilisateur' });
  }
});

// Endpoint pour vérifier l'authentification
app.get('/api/auth/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des informations utilisateur' });
  }
});

// Initialiser l'utilisateur admin par défaut si aucun admin n'existe
const initAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      const admin = new User({
        username: 'admin',
        email: 'admin@adei.ma',
        password: 'admin123',
        role: 'admin'
      });
      await admin.save();
      console.log('Admin user created successfully');
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
};



// Démarrage orchestré pour garantir que la base de données est prête
const startServer = async () => {
  try {
    await connectDB();
    // Initialiser l'admin par défaut APRÈS la connexion DB
    await initAdmin();
    app.listen(PORT, () => {
      console.log(`Backend server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();