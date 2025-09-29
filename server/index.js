const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Create an Express application
const app = express();

// Choose a port for the backend. When deploying the app you can set
// process.env.PORT; otherwise it will default to 5000.
const PORT = process.env.PORT || 5000;

// Enable CORS so that the React frontend running on another port
// (e.g. http://localhost:3000) can access the API without being
// blocked by the browser. Without this call the browser would
// refuse to fetch resources from a different origin.
app.use(cors());

// Parse JSON bodies for incoming requests (e.g. contact form)
app.use(express.json());

// Locate the data directory relative to this file.  The JSON files
// stored in the ``data`` folder contain the static content for
// news, events and clubs.  Reading them at start‑up avoids doing
// synchronous disk I/O on each request.
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

// -----------------------------------------------------------------------------
// Authentication
//
// For demonstration purposes the site supports a very basic login/logout
// mechanism.  Users are defined statically in the ``users`` array and
// sessions are stored in memory in the ``sessions`` object.  A real
// application should store hashed passwords in a database and persist
// sessions using a secure mechanism such as JWTs or cookies.

// Hard‑coded list of users.  You can add additional user objects if
// necessary.  Passwords are stored in plain text here for simplicity.
const users = [
  { username: 'admin', password: 'password' }
];

// Active sessions keyed by a randomly generated token.  When a user
// successfully logs in a new token is created and stored here.  The
// client is expected to send the token back when it wants to log out.
const sessions = {};

// In‑memory storage for contact messages.  Each element in this
// array is an object with ``name``, ``email`` and ``message`` fields.
const messages = [];

// Expose a simple REST API to the frontend.  Each GET endpoint
// returns the corresponding dataset as JSON.  For a real project
// you might connect to a database here instead of serving static
// files.
app.get('/api/news', (_req, res) => {
  res.json(newsData);
});

app.get('/api/events', (_req, res) => {
  res.json(eventsData);
});

app.get('/api/clubs', (_req, res) => {
  res.json(clubsData);
});

// This POST endpoint receives contact form submissions from the
// frontend.  In a production environment you might want to store
// submissions in a database or forward them via email.  Here we
// simply log the submission to the console and return a success
// message to the client.
app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;
  // Store the message in memory.  In a real application you would
  // persist this to a database or forward it to an email service.
  messages.push({ name, email, message, timestamp: new Date().toISOString() });
  console.log('Contact message received:', { name, email, message });
  res.status(200).json({ message: 'Votre message a été envoyé avec succès!' });
});

// -----------------------------------------------------------------------------
// Endpoint for retrieving contact messages.
//
// Only authenticated users can view contact messages.  We expect
// clients to send the session token in the ``Authorization`` header.
// If the token is valid we return the full list of messages.
app.get('/api/messages', (req, res) => {
  const token = req.headers.authorization;
  if (!token || !sessions[token]) {
    return res.status(401).json({ success: false, message: 'Accès non autorisé' });
  }
  res.json(messages);
});

// -----------------------------------------------------------------------------
// Login endpoint
//
// Accepts ``username`` and ``password`` in the request body.  If the
// credentials match a user, generate a token and return it.  Otherwise
// return a 401 with an error message.
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username && u.password === password);
  if (user) {
    const token = Math.random().toString(36).substring(2);
    sessions[token] = { username };
    res.json({ success: true, token });
  } else {
    res.status(401).json({ success: false, message: 'Identifiants invalides' });
  }
});

// -----------------------------------------------------------------------------
// Logout endpoint
//
// Removes the supplied ``token`` from the sessions map.  Always returns
// success so that callers cannot probe which tokens are valid.
app.post('/api/logout', (req, res) => {
  const { token } = req.body;
  if (token && sessions[token]) {
    delete sessions[token];
  }
  res.json({ success: true });
});

// -----------------------------------------------------------------------------
// Registration endpoint
//
// Allows a new user to create an account.  Expects ``username`` and
// ``password`` in the request body.  If the username is already taken
// returns a 409 status with an error message.  Otherwise stores the
// new user in memory and returns success.  For a real application you
// would hash passwords and persist users in a database.
app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Nom d\'utilisateur et mot de passe requis' });
  }
  const existing = users.find((u) => u.username === username);
  if (existing) {
    return res.status(409).json({ success: false, message: 'Ce nom d\'utilisateur est déjà utilisé' });
  }
  users.push({ username, password });
  // Optionally create a session token to log in automatically
  const token = Math.random().toString(36).substring(2);
  sessions[token] = { username };
  res.json({ success: true, message: 'Compte créé avec succès', token });
});

// Start listening for incoming HTTP requests
app.listen(PORT, () => {
  console.log(`Backend server listening on port ${PORT}`);
});