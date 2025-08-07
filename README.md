# EduManager - Système de Gestion des Étudiants

Une application web complète pour la gestion d'un centre de formation, développée avec React, Node.js, Express et MongoDB.

## 🚀 Fonctionnalités

### Pour les Étudiants
- 📝 **Inscription en ligne** avec formulaire complet
- 🔐 **Connexion sécurisée** avec authentification JWT
- 📊 **Tableau de bord personnalisé** avec suivi des formations
- 💰 **Suivi des paiements** et soldes restants
- 📜 **Accès aux certificats** obtenus
- 📈 **Suivi de progression** des cours

### Pour les Administrateurs
- 👥 **Gestion complète des étudiants** (CRUD)
- 🎓 **Gestion des formations** avec 7 catégories :
  - Initiation Informatique
  - Microsoft Office (Débutant, Intermédiaire, Avancé)
  - Intelligence Artificielle
  - Stockage en Ligne
  - Collecte et Analyse de Données
- 💳 **Gestion des paiements** avec différents modes
- 🎖️ **Émission d'attestations** PDF personnalisées
- 📊 **Tableau de bord avec statistiques** en temps réel
- 📈 **Rapports et analyses** des performances

## 🛠️ Technologies Utilisées

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **MongoDB** - Base de données NoSQL
- **Mongoose** - ODM pour MongoDB
- **JWT** - Authentification
- **bcryptjs** - Hachage des mots de passe
- **PDFKit** - Génération de certificats PDF

### Frontend
- **React 18** - Bibliothèque UI
- **TypeScript** - Typage statique
- **Material-UI (MUI)** - Composants UI
- **React Router** - Navigation
- **Axios** - Client HTTP

## 📋 Prérequis

- Node.js (version 16 ou supérieure)
- MongoDB (local ou Atlas)
- npm ou yarn

## ⚙️ Installation

1. **Cloner le projet**
```bash
git clone [url-du-repo]
cd student-management-app
```

2. **Installer les dépendances**
```bash
# Dépendances générales
npm install

# Backend
npm run install-server

# Frontend
npm run install-client
```

3. **Configuration de l'environnement**

Créer un fichier `.env` dans le dossier `server` :
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/student_management
JWT_SECRET=votre_secret_jwt_super_securise_changez_moi
NODE_ENV=development
```

4. **Démarrer MongoDB**
```bash
# Si MongoDB est installé localement
mongod
```

5. **Initialiser la base de données**
```bash
cd server
node scripts/seedDatabase.js
```

6. **Lancer l'application**
```bash
# Démarrer backend et frontend simultanément
npm run dev

# Ou séparément :
# Backend (port 5000)
npm run server

# Frontend (port 3000)
npm run client
```

## 🔑 Comptes de Test

Après l'initialisation de la base de données, vous pouvez utiliser :

### Administrateur
- **Email :** admin@edumanager.com
- **Mot de passe :** admin123

### Étudiant
- **Email :** etudiant@edumanager.com
- **Mot de passe :** etudiant123

## 📱 Pages de l'Application

### Pages Publiques
- **Accueil** (`/`) - Présentation du centre et des formations
- **Formations** (`/courses`) - Catalogue des cours disponibles
- **Connexion** (`/login`) - Authentification
- **Inscription** (`/register`) - Création de compte étudiant

### Pages Protégées
- **Tableau de bord Étudiant** (`/dashboard`) - Espace personnel
- **Tableau de bord Admin** (`/dashboard`) - Interface d'administration

## 🏗️ Architecture du Projet

```
student-management-app/
├── client/                 # Application React
│   ├── public/
│   ├── src/
│   │   ├── components/     # Composants réutilisables
│   │   ├── contexts/       # Contextes React (Auth)
│   │   ├── pages/          # Pages de l'application
│   │   ├── services/       # Services API
│   │   └── utils/          # Utilitaires
│   └── package.json
├── server/                 # API Node.js
│   ├── models/            # Modèles Mongoose
│   ├── routes/            # Routes Express
│   ├── middleware/        # Middlewares
│   ├── scripts/           # Scripts utilitaires
│   └── package.json
└── package.json           # Configuration racine
```

## 🗄️ Modèles de Données

### User (Utilisateur)
- Informations personnelles
- Rôle (admin/student)
- Authentification

### Course (Formation)
- Détails du cours
- Catégorie et niveau
- Planification
- Prérequis et objectifs

### Enrollment (Inscription)
- Relation étudiant-cours
- Statut et progression
- Informations de paiement

### Payment (Paiement)
- Transactions financières
- Méthodes de paiement
- Numéros de reçu

### Certificate (Certificat)
- Attestations de formation
- Notes et taux de présence
- Génération PDF

## 🔐 Sécurité

- **Authentification JWT** avec expiration
- **Hachage des mots de passe** avec bcryptjs
- **Validation des données** côté serveur
- **Protection des routes** selon les rôles
- **Gestion des erreurs** sécurisée

## 📊 API Endpoints

### Authentification
- `POST /api/auth/login` - Connexion
- `POST /api/auth/register` - Inscription
- `GET /api/auth/me` - Profil utilisateur
- `PUT /api/auth/profile` - Mise à jour profil

### Étudiants (Admin uniquement)
- `GET /api/students` - Liste des étudiants
- `POST /api/students` - Créer un étudiant
- `PUT /api/students/:id` - Modifier un étudiant
- `DELETE /api/students/:id` - Supprimer un étudiant

### Formations
- `GET /api/courses` - Liste des formations
- `POST /api/courses` - Créer une formation (Admin)
- `POST /api/courses/:id/enroll` - S'inscrire à une formation

### Paiements
- `GET /api/payments` - Liste des paiements (Admin)
- `POST /api/payments` - Enregistrer un paiement (Admin)
- `GET /api/payments/my/payments` - Mes paiements (Étudiant)

### Certificats
- `GET /api/certificates` - Liste des certificats (Admin)
- `POST /api/certificates` - Émettre un certificat (Admin)
- `GET /api/certificates/:id/pdf` - Télécharger le PDF
- `GET /api/certificates/verify/:number` - Vérifier un certificat

## 🚀 Déploiement

### Variables d'environnement de production
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
JWT_SECRET=your_super_secure_jwt_secret
```

### Build de production
```bash
# Build du frontend
cd client
npm run build

# Le serveur servira automatiquement les fichiers statiques
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push sur la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🐛 Support

Pour signaler un bug ou demander une fonctionnalité, ouvrez une issue sur GitHub.

## 📞 Contact

Votre Nom - email@example.com

Lien du projet : [https://github.com/username/student-management-app](https://github.com/username/student-management-app)

---

**EduManager** - Simplifiez la gestion de votre centre de formation ! 🎓