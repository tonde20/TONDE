const express = require('express');
const { body, validationResult } = require('express-validator');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all courses (public for browsing, detailed for admin)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, category = '', search = '', active = 'true' } = req.query;
    
    const query = {};
    
    // Filter by category
    if (category) {
      query.category = category;
    }
    
    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { instructor: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Active filter
    if (active !== 'all') {
      query.isActive = active === 'true';
    }

    const courses = await Course.find(query)
      .populate('enrolledCount')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ startDate: 1 });

    const total = await Course.countDocuments(query);

    // Get course categories for filters
    const categories = await Course.distinct('category');

    res.json({
      courses,
      categories,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Get course by ID with enrollment details
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Cours non trouvé' });
    }

    // Get enrollment count
    const enrollmentCount = await Enrollment.countDocuments({ 
      course: req.params.id,
      status: { $in: ['active', 'pending'] }
    });

    res.json({
      course,
      enrollmentCount,
      availableSpots: course.maxStudents - enrollmentCount
    });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Create new course (Admin only)
router.post('/', authenticate, requireAdmin, [
  body('name').trim().isLength({ min: 3 }),
  body('description').trim().isLength({ min: 10 }),
  body('category').isIn([
    'Initiation Informatique',
    'Microsoft Office Débutant',
    'Microsoft Office Intermédiaire', 
    'Microsoft Office Avancé',
    'Intelligence Artificielle',
    'Stockage en Ligne',
    'Collecte et Analyse de Données'
  ]),
  body('duration').isInt({ min: 1 }),
  body('price').isFloat({ min: 0 }),
  body('startDate').isISO8601(),
  body('endDate').isISO8601(),
  body('instructor').trim().isLength({ min: 2 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Données invalides', 
        errors: errors.array() 
      });
    }

    const {
      name, description, category, duration, price, maxStudents,
      startDate, endDate, schedule, instructor, prerequisites, objectives
    } = req.body;

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) {
      return res.status(400).json({ message: 'La date de fin doit être après la date de début' });
    }

    if (start < new Date()) {
      return res.status(400).json({ message: 'La date de début ne peut pas être dans le passé' });
    }

    const course = new Course({
      name,
      description,
      category,
      duration,
      price,
      maxStudents: maxStudents || 20,
      startDate: start,
      endDate: end,
      schedule,
      instructor,
      prerequisites: prerequisites || [],
      objectives: objectives || []
    });

    await course.save();

    res.status(201).json({
      message: 'Cours créé avec succès',
      course
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la création du cours' });
  }
});

// Update course (Admin only)
router.put('/:id', authenticate, requireAdmin, [
  body('name').optional().trim().isLength({ min: 3 }),
  body('description').optional().trim().isLength({ min: 10 }),
  body('category').optional().isIn([
    'Initiation Informatique',
    'Microsoft Office Débutant',
    'Microsoft Office Intermédiaire', 
    'Microsoft Office Avancé',
    'Intelligence Artificielle',
    'Stockage en Ligne',
    'Collecte et Analyse de Données'
  ]),
  body('duration').optional().isInt({ min: 1 }),
  body('price').optional().isFloat({ min: 0 }),
  body('startDate').optional().isISO8601(),
  body('endDate').optional().isISO8601(),
  body('instructor').optional().trim().isLength({ min: 2 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Données invalides', 
        errors: errors.array() 
      });
    }

    const updateData = { ...req.body };
    
    // Validate dates if provided
    if (req.body.startDate || req.body.endDate) {
      const course = await Course.findById(req.params.id);
      const startDate = req.body.startDate ? new Date(req.body.startDate) : course.startDate;
      const endDate = req.body.endDate ? new Date(req.body.endDate) : course.endDate;
      
      if (startDate >= endDate) {
        return res.status(400).json({ message: 'La date de fin doit être après la date de début' });
      }
      
      updateData.startDate = startDate;
      updateData.endDate = endDate;
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedCourse) {
      return res.status(404).json({ message: 'Cours non trouvé' });
    }

    res.json({
      message: 'Cours mis à jour avec succès',
      course: updatedCourse
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la mise à jour' });
  }
});

// Delete course (Admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    // Check if course has active enrollments
    const activeEnrollments = await Enrollment.countDocuments({
      course: req.params.id,
      status: { $in: ['active', 'pending'] }
    });

    if (activeEnrollments > 0) {
      return res.status(400).json({ 
        message: 'Impossible de supprimer un cours avec des inscriptions actives' 
      });
    }

    const deletedCourse = await Course.findByIdAndDelete(req.params.id);

    if (!deletedCourse) {
      return res.status(404).json({ message: 'Cours non trouvé' });
    }

    res.json({ message: 'Cours supprimé avec succès' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression' });
  }
});

// Enroll student in course
router.post('/:id/enroll', authenticate, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Cours non trouvé' });
    }

    if (!course.isActive) {
      return res.status(400).json({ message: 'Ce cours n\'est pas disponible' });
    }

    // Check if course is full
    const enrollmentCount = await Enrollment.countDocuments({ 
      course: req.params.id,
      status: { $in: ['active', 'pending'] }
    });

    if (enrollmentCount >= course.maxStudents) {
      return res.status(400).json({ message: 'Ce cours est complet' });
    }

    // Check if student is already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: req.user._id,
      course: req.params.id
    });

    if (existingEnrollment) {
      return res.status(400).json({ message: 'Vous êtes déjà inscrit à ce cours' });
    }

    // Create enrollment
    const enrollment = new Enrollment({
      student: req.user._id,
      course: req.params.id,
      totalAmount: course.price,
      status: 'pending'
    });

    await enrollment.save();

    await enrollment.populate('course', 'name category price startDate endDate');

    res.status(201).json({
      message: 'Inscription réussie',
      enrollment
    });
  } catch (error) {
    console.error('Enroll error:', error);
    res.status(500).json({ message: 'Erreur serveur lors de l\'inscription' });
  }
});

// Get course enrollments (Admin only)
router.get('/:id/enrollments', authenticate, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, status = '' } = req.query;
    
    const query = { course: req.params.id };
    
    if (status) {
      query.status = status;
    }

    const enrollments = await Enrollment.find(query)
      .populate('student', 'firstName lastName email phone')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ enrollmentDate: -1 });

    const total = await Enrollment.countDocuments(query);

    res.json({
      enrollments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get course enrollments error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;