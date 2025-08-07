const express = require('express');
const { body, validationResult } = require('express-validator');
const PDFDocument = require('pdfkit');
const Certificate = require('../models/Certificate');
const Enrollment = require('../models/Enrollment');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all certificates (Admin only)
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, status = '', student = '', course = '' } = req.query;
    
    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (student) {
      query.student = student;
    }
    
    if (course) {
      query.course = course;
    }

    const certificates = await Certificate.find(query)
      .populate('student', 'firstName lastName email')
      .populate('course', 'name category duration')
      .populate('issuedBy', 'firstName lastName')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ issueDate: -1 });

    const total = await Certificate.countDocuments(query);

    res.json({
      certificates,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get certificates error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Get certificate by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id)
      .populate('student', 'firstName lastName email')
      .populate('course', 'name category duration instructor')
      .populate('enrollment')
      .populate('issuedBy', 'firstName lastName');

    if (!certificate) {
      return res.status(404).json({ message: 'Certificat non trouvé' });
    }

    // Check if user can view this certificate
    if (req.user.role !== 'admin' && certificate.student._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    res.json({ certificate });
  } catch (error) {
    console.error('Get certificate error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Issue new certificate (Admin only)
router.post('/', authenticate, requireAdmin, [
  body('enrollmentId').isMongoId(),
  body('completionDate').isISO8601(),
  body('grade').optional().isIn(['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'Pass', 'Fail']),
  body('finalScore').optional().isFloat({ min: 0, max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Données invalides', 
        errors: errors.array() 
      });
    }

    const { enrollmentId, completionDate, grade, finalScore, attendanceRate, notes } = req.body;

    // Get enrollment details
    const enrollment = await Enrollment.findById(enrollmentId)
      .populate('student', 'firstName lastName email')
      .populate('course', 'name category duration instructor');

    if (!enrollment) {
      return res.status(404).json({ message: 'Inscription non trouvée' });
    }

    // Check if enrollment is completed
    if (enrollment.status !== 'completed') {
      return res.status(400).json({ message: 'L\'inscription doit être marquée comme terminée' });
    }

    // Check if certificate already exists
    const existingCertificate = await Certificate.findOne({
      enrollment: enrollmentId
    });

    if (existingCertificate) {
      return res.status(400).json({ message: 'Un certificat existe déjà pour cette inscription' });
    }

    // Create certificate
    const certificate = new Certificate({
      student: enrollment.student._id,
      course: enrollment.course._id,
      enrollment: enrollmentId,
      completionDate: new Date(completionDate),
      grade: grade || 'Pass',
      finalScore,
      attendanceRate: attendanceRate || enrollment.attendanceRate,
      issuedBy: req.user._id,
      notes
    });

    await certificate.save();

    // Update enrollment
    enrollment.certificateIssued = true;
    enrollment.certificateDate = certificate.issueDate;
    await enrollment.save();

    await certificate.populate([
      { path: 'student', select: 'firstName lastName email' },
      { path: 'course', select: 'name category duration' },
      { path: 'issuedBy', select: 'firstName lastName' }
    ]);

    res.status(201).json({
      message: 'Certificat émis avec succès',
      certificate
    });
  } catch (error) {
    console.error('Issue certificate error:', error);
    res.status(500).json({ message: 'Erreur serveur lors de l\'émission du certificat' });
  }
});

// Update certificate (Admin only)
router.put('/:id', authenticate, requireAdmin, [
  body('completionDate').optional().isISO8601(),
  body('grade').optional().isIn(['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'Pass', 'Fail']),
  body('finalScore').optional().isFloat({ min: 0, max: 100 }),
  body('status').optional().isIn(['valid', 'revoked', 'expired'])
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
    
    if (req.body.completionDate) {
      updateData.completionDate = new Date(req.body.completionDate);
    }

    const updatedCertificate = await Certificate.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate([
      { path: 'student', select: 'firstName lastName email' },
      { path: 'course', select: 'name category duration' },
      { path: 'issuedBy', select: 'firstName lastName' }
    ]);

    if (!updatedCertificate) {
      return res.status(404).json({ message: 'Certificat non trouvé' });
    }

    res.json({
      message: 'Certificat mis à jour avec succès',
      certificate: updatedCertificate
    });
  } catch (error) {
    console.error('Update certificate error:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la mise à jour' });
  }
});

// Delete certificate (Admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);
    
    if (!certificate) {
      return res.status(404).json({ message: 'Certificat non trouvé' });
    }

    // Update enrollment
    await Enrollment.findByIdAndUpdate(certificate.enrollment, {
      certificateIssued: false,
      $unset: { certificateDate: 1 }
    });

    await Certificate.findByIdAndDelete(req.params.id);

    res.json({ message: 'Certificat supprimé avec succès' });
  } catch (error) {
    console.error('Delete certificate error:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression' });
  }
});

// Get my certificates (for current student)
router.get('/my/certificates', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const certificates = await Certificate.find({ 
      student: req.user._id,
      status: 'valid'
    })
      .populate('course', 'name category duration instructor')
      .sort({ issueDate: -1 });

    res.json({ certificates });
  } catch (error) {
    console.error('Get my certificates error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Generate PDF certificate
router.get('/:id/pdf', authenticate, async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id)
      .populate('student', 'firstName lastName')
      .populate('course', 'name category duration instructor')
      .populate('issuedBy', 'firstName lastName');

    if (!certificate) {
      return res.status(404).json({ message: 'Certificat non trouvé' });
    }

    // Check if user can view this certificate
    if (req.user.role !== 'admin' && certificate.student._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    if (certificate.status !== 'valid') {
      return res.status(400).json({ message: 'Ce certificat n\'est pas valide' });
    }

    // Create PDF
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margins: { top: 50, bottom: 50, left: 50, right: 50 }
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="certificat-${certificate.certificateNumber}.pdf"`);
    
    doc.pipe(res);

    // Header
    doc.fontSize(28)
       .fillColor('#2c3e50')
       .text('CERTIFICAT DE FORMATION', 0, 80, { align: 'center' });

    // Certificate number
    doc.fontSize(12)
       .fillColor('#7f8c8d')
       .text(`N° ${certificate.certificateNumber}`, 0, 130, { align: 'center' });

    // Main content
    doc.fontSize(16)
       .fillColor('#2c3e50')
       .text('Nous certifions que', 0, 180, { align: 'center' });

    doc.fontSize(24)
       .fillColor('#e74c3c')
       .text(`${certificate.student.firstName} ${certificate.student.lastName}`, 0, 220, { align: 'center' });

    doc.fontSize(16)
       .fillColor('#2c3e50')
       .text('a suivi avec succès la formation', 0, 270, { align: 'center' });

    doc.fontSize(20)
       .fillColor('#3498db')
       .text(certificate.course.name, 0, 310, { align: 'center' });

    doc.fontSize(14)
       .text(`Catégorie: ${certificate.course.category}`, 0, 350, { align: 'center' })
       .text(`Durée: ${certificate.course.duration} heures`, 0, 370, { align: 'center' });

    if (certificate.finalScore) {
      doc.text(`Note finale: ${certificate.finalScore}/100`, 0, 390, { align: 'center' });
    }

    if (certificate.attendanceRate) {
      doc.text(`Taux de présence: ${certificate.attendanceRate}%`, 0, 410, { align: 'center' });
    }

    // Footer
    const completionDate = new Date(certificate.completionDate).toLocaleDateString('fr-FR');
    const issueDate = new Date(certificate.issueDate).toLocaleDateString('fr-FR');

    doc.fontSize(12)
       .fillColor('#7f8c8d')
       .text(`Formation terminée le: ${completionDate}`, 100, 480)
       .text(`Certificat émis le: ${issueDate}`, 100, 500);

    if (certificate.issuedBy) {
      doc.text(`Émis par: ${certificate.issuedBy.firstName} ${certificate.issuedBy.lastName}`, 400, 480);
    }

    if (certificate.course.instructor) {
      doc.text(`Formateur: ${certificate.course.instructor}`, 400, 500);
    }

    // Border
    doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60)
       .stroke('#3498db');

    doc.end();
  } catch (error) {
    console.error('Generate PDF certificate error:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la génération du PDF' });
  }
});

// Verify certificate by number
router.get('/verify/:certificateNumber', async (req, res) => {
  try {
    const certificate = await Certificate.findOne({ 
      certificateNumber: req.params.certificateNumber,
      status: 'valid'
    })
      .populate('student', 'firstName lastName')
      .populate('course', 'name category duration')
      .select('-notes');

    if (!certificate) {
      return res.status(404).json({ 
        message: 'Certificat non trouvé ou invalide',
        valid: false 
      });
    }

    res.json({
      valid: true,
      certificate: {
        certificateNumber: certificate.certificateNumber,
        student: certificate.student,
        course: certificate.course,
        completionDate: certificate.completionDate,
        issueDate: certificate.issueDate,
        grade: certificate.grade,
        finalScore: certificate.finalScore,
        attendanceRate: certificate.attendanceRate
      }
    });
  } catch (error) {
    console.error('Verify certificate error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;