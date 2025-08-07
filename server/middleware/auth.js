const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Accès refusé. Token manquant.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Token invalide.' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Compte désactivé.' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token invalide.' });
  }
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Accès refusé. Droits administrateur requis.' });
  }
  next();
};

// Middleware to check if user is student or admin
const requireStudentOrAdmin = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'student') {
    return res.status(403).json({ message: 'Accès refusé.' });
  }
  next();
};

module.exports = {
  authenticate,
  requireAdmin,
  requireStudentOrAdmin
};