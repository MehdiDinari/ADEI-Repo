# ADEI Site amélioré

Ce projet fournit une version améliorée du site de l'Association des Étudiants Ingénieurs (ADEI).  Le code est divisé en deux parties :

* **client/** : une application front‑end React qui affiche les pages du site (accueil, actualités, événements, clubs, à propos et contact).  Le code a été simplifié par rapport à la version originale pour se concentrer sur la consommation d'une API.
* **server/** : un petit serveur Node.js/Express qui expose des points d'API REST pour les actualités, les événements, les clubs et les messages du formulaire de contact.  Les données sont stockées sous forme de fichiers JSON dans le répertoire `data/`.

## Démarrage

1. **Installer les dépendances du serveur** :

   ```bash
   cd server
   npm install express cors
   ```

2. **Lancer le serveur** :

   ```bash
   node index.js
   ```

   Par défaut, le serveur écoute sur `http://localhost:5000`.

3. **Installer les dépendances du client** :

   ```bash
   cd ../client
   npm install
   ```
# 4. Installer Framer Motion pour les animations
   ```bash
      npm install framer-motion@latest --prefix 
   ```
# Explications :
# - framer-motion@latest : dernière version stable
# - --prefix . : installation dans le dossier courant (client)
# Permet d’animer cartes, boutons et sections

5. **Démarrer l'application React** :

   ```bash
   npm start
   ```

   L'application front‑end démarre normalement sur `http://localhost:3000` et consomme l'API exposée par le serveur.

## Fonctionnalités

* **Accueil** : affiche un message de bienvenue ainsi que les trois dernières actualités et les trois prochains événements.
* **Actualités** : liste tous les articles récupérés depuis `/api/news`.
* **Événements** : liste tous les événements récupérés depuis `/api/events`.
* **Clubs** : affiche les clubs avec leurs présidents, années d'étude et coordonnées.  Les données proviennent de `/api/clubs`.
* **À propos** : fournit une brève présentation de l'association et de son contexte.
* **Contact** : formulaire permettant d'envoyer un message.  Le message est envoyé au backend via `/api/contact` et une confirmation est affichée.

## Personnalisation et amélioration

Ce dépôt sert de base pour développer davantage le site de l'ADEI.  Voici quelques idées d'amélioration :

* Connecter un vrai système de base de données (par exemple MongoDB) pour stocker les articles, événements et clubs de manière persistante.
* Ajouter un panneau d'administration protégé afin de créer, modifier ou supprimer des contenus.
* Améliorer la mise en page et l'apparence à l'aide d'un framework CSS comme Tailwind ou Bootstrap.
* Internationaliser l'interface afin de supporter plusieurs langues.

L'architecture en deux parties permet de faire évoluer séparément le front‑end et le back‑end en fonction des besoins.



npm add framer-motion@latest --prefix client"# ADEI-Repo" 
