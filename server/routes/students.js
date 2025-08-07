const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all students (Admin only)
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '' } = req.query;
    
    const query = { role: 'student' };
    
    // Search filter
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Status filter
    if (status) {
      query.isActive = status === 'active';
    }

    const students = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      students,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Get student by ID with enrollments
router.get('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const student = await User.findOne({ 
      _id: req.params.id, 
      role: 'student' 
    }).select('-password');

    if (!student) {
      return res.status(404).json({ message: 'Étudiant non trouvé' });
    }

    // Get student's enrollments with course details
    const enrollments = await Enrollment.find({ student: req.params.id })
      .populate('course', 'name category price startDate endDate')
      .sort({ enrollmentDate: -1 });

    res.json({
      student,
      enrollments
    });
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Create new student (Admin only)
router.post('/', authenticate, requireAdmin, [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').trim().isLength({ min: 2 }),
  body('lastName').trim().isLength({ min: 2 }),
  body('phone').optional().isMobilePhone(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Données invalides', 
        errors: errors.array() 
      });
    }

    const { email, password, firstName, lastName, phone, address, dateOfBirth } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Un utilisateur avec cet email existe déjà' });
    }

    // Create new student
    const student = new User({
      email,
      password,
      firstName,
      lastName,
      phone,
      address,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      role: 'student'
    });

    await student.save();

    res.status(201).json({
      message: 'Étudiant créé avec succès',
      student: {
        id: student._id,
        email: student.email,
        firstName: student.firstName,
        lastName: student.lastName,
        phone: student.phone,
        address: student.address,
        dateOfBirth: student.dateOfBirth,
        isActive: student.isActive,
        createdAt: student.createdAt
      }
    });
  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la création de l\'étudiant' });
  }
});

// Update student (Admin only)
router.put('/:id', authenticate, requireAdmin, [
  body('firstName').optional().trim().isLength({ min: 2 }),
  body('lastName').optional().trim().isLength({ min: 2 }),
  body('phone').optional().isMobilePhone(),
  body('email').optional().isEmail().normalizeEmail(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Données invalides', 
        errors: errors.array() 
      });
    }

    const { firstName, lastName, phone, address, dateOfBirth, email, isActive } = req.body;
    
    // Check if email is already used by another user
    if (email) {
      const existingUser = await User.findOne({ 
        email, 
        _id: { $ne: req.params.id } 
      });
      if (existingUser) {
        return res.status(400).json({ message: 'Cet email est déjà utilisé' });
      }
    }

    const updatedStudent = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'student' },
      {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(phone && { phone }),
        ...(address && { address }),
        ...(email && { email }),
        ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
        ...(typeof isActive === 'boolean' && { isActive })
      },
      { new: true }
    ).select('-password');

    if (!updatedStudent) {
      return res.status(404).json({ message: 'Étudiant non trouvé' });
    }

    res.json({
      message: 'Étudiant mis à jour avec succès',
      student: updatedStudent
    });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la mise à jour' });
  }
});

// Delete student (Admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    // Check if student has active enrollments
    const activeEnrollments = await Enrollment.countDocuments({
      student: req.params.id,
      status: { $in: ['active', 'pending'] }
    });

    if (activeEnrollments > 0) {
      return res.status(400).json({ 
        message: 'Impossible de supprimer un étudiant avec des inscriptions actives' 
      });
    }

    const deletedStudent = await User.findOneAndDelete({ 
      _id: req.params.id, 
      role: 'student' 
    });

    if (!deletedStudent) {
      return res.status(404).json({ message: 'Étudiant non trouvé' });
    }

    res.json({ message: 'Étudiant supprimé avec succès' });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression' });
  }
});

// Get student dashboard data (for current student)
router.get('/dashboard/me', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    // Get student's enrollments with course details
    const enrollments = await Enrollment.find({ student: req.user._id })
      .populate('course', 'name category price startDate endDate instructor')
      .sort({ enrollmentDate: -1 });

    // Calculate statistics
    const stats = {
      totalEnrollments: enrollments.length,
      activeEnrollments: enrollments.filter(e => e.status === 'active').length,
      completedCourses: enrollments.filter(e => e.status === 'completed').length,
      totalPaid: enrollments.reduce((sum, e) => sum + e.amountPaid, 0),
      totalOwed: enrollments.reduce((sum, e) => sum + (e.totalAmount - e.amountPaid), 0)
    };

    res.json({
      student: req.user,
      enrollments,
      stats
    });
  } catch (error) {
    console.error('Get student dashboard error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;