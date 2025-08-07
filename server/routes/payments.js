const express = require('express');
const { body, validationResult } = require('express-validator');
const Payment = require('../models/Payment');
const Enrollment = require('../models/Enrollment');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all payments (Admin only)
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, status = '', method = '', student = '' } = req.query;
    
    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (method) {
      query.paymentMethod = method;
    }
    
    if (student) {
      query.student = student;
    }

    const payments = await Payment.find(query)
      .populate('student', 'firstName lastName email')
      .populate('course', 'name category')
      .populate('processedBy', 'firstName lastName')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ paymentDate: -1 });

    const total = await Payment.countDocuments(query);

    // Calculate statistics
    const stats = await Payment.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          totalPayments: { $sum: 1 },
          averageAmount: { $avg: '$amount' }
        }
      }
    ]);

    res.json({
      payments,
      stats: stats[0] || { totalAmount: 0, totalPayments: 0, averageAmount: 0 },
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Get payment by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('student', 'firstName lastName email phone')
      .populate('course', 'name category price')
      .populate('enrollment')
      .populate('processedBy', 'firstName lastName');

    if (!payment) {
      return res.status(404).json({ message: 'Paiement non trouvé' });
    }

    // Check if user can view this payment
    if (req.user.role !== 'admin' && payment.student._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    res.json({ payment });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Record new payment (Admin only)
router.post('/', authenticate, requireAdmin, [
  body('enrollmentId').isMongoId(),
  body('amount').isFloat({ min: 0.01 }),
  body('paymentMethod').isIn(['cash', 'card', 'transfer', 'cheque', 'mobile_money']),
  body('paymentDate').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Données invalides', 
        errors: errors.array() 
      });
    }

    const { enrollmentId, amount, paymentMethod, paymentDate, notes, transactionId } = req.body;

    // Get enrollment details
    const enrollment = await Enrollment.findById(enrollmentId)
      .populate('student', 'firstName lastName email')
      .populate('course', 'name price');

    if (!enrollment) {
      return res.status(404).json({ message: 'Inscription non trouvée' });
    }

    // Check if payment amount is valid
    const remainingBalance = enrollment.totalAmount - enrollment.amountPaid;
    if (amount > remainingBalance) {
      return res.status(400).json({ 
        message: `Le montant ne peut pas dépasser le solde restant (${remainingBalance} €)` 
      });
    }

    // Create payment record
    const payment = new Payment({
      enrollment: enrollmentId,
      student: enrollment.student._id,
      course: enrollment.course._id,
      amount,
      paymentMethod,
      paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      notes,
      transactionId,
      processedBy: req.user._id
    });

    await payment.save();

    // Update enrollment payment status
    enrollment.amountPaid += amount;
    
    if (enrollment.amountPaid >= enrollment.totalAmount) {
      enrollment.paymentStatus = 'paid';
      if (enrollment.status === 'pending') {
        enrollment.status = 'active';
      }
    } else {
      enrollment.paymentStatus = 'partial';
    }

    await enrollment.save();

    await payment.populate([
      { path: 'student', select: 'firstName lastName email' },
      { path: 'course', select: 'name category' },
      { path: 'processedBy', select: 'firstName lastName' }
    ]);

    res.status(201).json({
      message: 'Paiement enregistré avec succès',
      payment,
      enrollment: {
        id: enrollment._id,
        amountPaid: enrollment.amountPaid,
        remainingBalance: enrollment.totalAmount - enrollment.amountPaid,
        paymentStatus: enrollment.paymentStatus
      }
    });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ message: 'Erreur serveur lors de l\'enregistrement du paiement' });
  }
});

// Update payment (Admin only)
router.put('/:id', authenticate, requireAdmin, [
  body('amount').optional().isFloat({ min: 0.01 }),
  body('paymentMethod').optional().isIn(['cash', 'card', 'transfer', 'cheque', 'mobile_money']),
  body('paymentDate').optional().isISO8601(),
  body('status').optional().isIn(['pending', 'completed', 'failed', 'refunded'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Données invalides', 
        errors: errors.array() 
      });
    }

    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({ message: 'Paiement non trouvé' });
    }

    const oldAmount = payment.amount;
    const updateData = { ...req.body };
    
    if (req.body.paymentDate) {
      updateData.paymentDate = new Date(req.body.paymentDate);
    }

    const updatedPayment = await Payment.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate([
      { path: 'student', select: 'firstName lastName email' },
      { path: 'course', select: 'name category' },
      { path: 'processedBy', select: 'firstName lastName' }
    ]);

    // Update enrollment if amount changed
    if (req.body.amount && req.body.amount !== oldAmount) {
      const enrollment = await Enrollment.findById(payment.enrollment);
      enrollment.amountPaid = enrollment.amountPaid - oldAmount + req.body.amount;
      
      if (enrollment.amountPaid >= enrollment.totalAmount) {
        enrollment.paymentStatus = 'paid';
      } else if (enrollment.amountPaid > 0) {
        enrollment.paymentStatus = 'partial';
      } else {
        enrollment.paymentStatus = 'pending';
      }
      
      await enrollment.save();
    }

    res.json({
      message: 'Paiement mis à jour avec succès',
      payment: updatedPayment
    });
  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la mise à jour' });
  }
});

// Delete payment (Admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({ message: 'Paiement non trouvé' });
    }

    // Update enrollment
    const enrollment = await Enrollment.findById(payment.enrollment);
    enrollment.amountPaid -= payment.amount;
    
    if (enrollment.amountPaid >= enrollment.totalAmount) {
      enrollment.paymentStatus = 'paid';
    } else if (enrollment.amountPaid > 0) {
      enrollment.paymentStatus = 'partial';
    } else {
      enrollment.paymentStatus = 'pending';
    }
    
    await enrollment.save();

    await Payment.findByIdAndDelete(req.params.id);

    res.json({ message: 'Paiement supprimé avec succès' });
  } catch (error) {
    console.error('Delete payment error:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression' });
  }
});

// Get payments for a specific student
router.get('/student/:studentId', authenticate, requireAdmin, async (req, res) => {
  try {
    const payments = await Payment.find({ student: req.params.studentId })
      .populate('course', 'name category')
      .populate('processedBy', 'firstName lastName')
      .sort({ paymentDate: -1 });

    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);

    res.json({
      payments,
      totalPaid
    });
  } catch (error) {
    console.error('Get student payments error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Get my payments (for current student)
router.get('/my/payments', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const payments = await Payment.find({ student: req.user._id })
      .populate('course', 'name category')
      .sort({ paymentDate: -1 });

    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);

    res.json({
      payments,
      totalPaid
    });
  } catch (error) {
    console.error('Get my payments error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Generate payment report (Admin only)
router.get('/reports/summary', authenticate, requireAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);
    
    const matchStage = {};
    if (startDate || endDate) {
      matchStage.paymentDate = dateFilter;
    }

    const report = await Payment.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          totalPayments: { $sum: 1 },
          averagePayment: { $avg: '$amount' }
        }
      }
    ]);

    const paymentsByMethod = await Payment.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          total: { $sum: '$amount' }
        }
      }
    ]);

    const paymentsByMonth = await Payment.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            year: { $year: '$paymentDate' },
            month: { $month: '$paymentDate' }
          },
          count: { $sum: 1 },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      summary: report[0] || { totalAmount: 0, totalPayments: 0, averagePayment: 0 },
      paymentsByMethod,
      paymentsByMonth
    });
  } catch (error) {
    console.error('Generate payment report error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;