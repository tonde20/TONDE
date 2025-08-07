#!/bin/bash

# Script de démarrage pour EduManager
echo "🎓 Démarrage d'EduManager - Système de Gestion des Étudiants"
echo "============================================================"

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

# Vérifier si MongoDB est en cours d'exécution
if ! pgrep mongod > /dev/null; then
    echo "⚠️  MongoDB ne semble pas être en cours d'exécution."
    echo "   Veuillez démarrer MongoDB avec la commande : mongod"
    echo "   Ou utilisez MongoDB Atlas pour une base cloud."
fi

# Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
fi

if [ ! -d "server/node_modules" ]; then
    echo "📦 Installation des dépendances du serveur..."
    cd server && npm install && cd ..
fi

if [ ! -d "client/node_modules" ]; then
    echo "📦 Installation des dépendances du client..."
    cd client && npm install && cd ..
fi

# Vérifier si le fichier .env existe
if [ ! -f "server/.env" ]; then
    echo "⚙️  Création du fichier .env..."
    cat > server/.env << EOL
PORT=5000
MONGODB_URI=mongodb://localhost:27017/student_management
JWT_SECRET=votre_secret_jwt_super_securise_changez_moi_$(date +%s)
NODE_ENV=development
EOL
    echo "✅ Fichier .env créé dans server/"
fi

# Proposer d'initialiser la base de données
echo ""
read -p "🗄️  Voulez-vous initialiser la base de données avec des données de test ? (y/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔄 Initialisation de la base de données..."
    cd server && node scripts/seedDatabase.js && cd ..
fi

echo ""
echo "🚀 Démarrage de l'application..."
echo "   - Backend : http://localhost:5000"
echo "   - Frontend : http://localhost:3000"
echo ""
echo "📋 Comptes de test :"
echo "   Admin : admin@edumanager.com / admin123"
echo "   Étudiant : etudiant@edumanager.com / etudiant123"
echo ""
echo "Pour arrêter l'application, appuyez sur Ctrl+C"
echo ""

# Démarrer l'application
npm run dev