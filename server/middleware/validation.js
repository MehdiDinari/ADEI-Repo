const validator = require('validator');

// Middleware de validation pour l'inscription
exports.validateRegister = (req, res, next) => {
  const { username, email, password } = req.body;
  const errors = [];

  // Validation du nom d'utilisateur
  if (!username || username.trim().length === 0) {
    errors.push('Le nom d\'utilisateur est requis');
  } else if (username.length < 3 || username.length > 30) {
    errors.push('Le nom d\'utilisateur doit contenir entre 3 et 30 caractères');
  } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    errors.push('Le nom d\'utilisateur ne peut contenir que des lettres, chiffres et underscores');
  }

  // Validation de l'email (si fourni)
  if (email && !validator.isEmail(email)) {
    errors.push('Format d\'email invalide');
  }

  // Validation du mot de passe
  if (!password || password.length === 0) {
    errors.push('Le mot de passe est requis');
  } else if (password.length < 8) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères');
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre');
  }

  // Nettoyage des données (sanitization)
  if (username) req.body.username = validator.escape(username.trim());
  if (email) req.body.email = validator.normalizeEmail(email);

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Données invalides',
      errors: errors
    });
  }

  next();
};

// Middleware de validation pour la connexion
exports.validateLogin = (req, res, next) => {
  const { username, password } = req.body;
  const errors = [];

  // Validation du nom d'utilisateur/email
  if (!username || username.trim().length === 0) {
    errors.push('Le nom d\'utilisateur ou email est requis');
  }

  // Validation du mot de passe
  if (!password || password.length === 0) {
    errors.push('Le mot de passe est requis');
  }

  // Nettoyage des données
  if (username) req.body.username = validator.escape(username.trim());

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Données invalides',
      errors: errors
    });
  }

  next();
};

// Middleware de validation générale pour les entrées utilisateur
exports.sanitizeInput = (req, res, next) => {
  // Nettoyer récursivement tous les champs string du body
  const sanitizeObject = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = validator.escape(obj[key].trim());
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  };

  if (req.body && typeof req.body === 'object') {
    sanitizeObject(req.body);
  }

  next();
};