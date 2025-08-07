const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  enrollment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enrollment',
    required: true
  },
  certificateNumber: {
    type: String,
    unique: true,
    required: true
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  completionDate: {
    type: Date,
    required: true
  },
  grade: {
    type: String,
    enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'Pass', 'Fail'],
    default: 'Pass'
  },
  finalScore: {
    type: Number,
    min: 0,
    max: 100
  },
  attendanceRate: {
    type: Number,
    min: 0,
    max: 100
  },
  issuedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Admin who issued the certificate
    required: true
  },
  status: {
    type: String,
    enum: ['valid', 'revoked', 'expired'],
    default: 'valid'
  },
  template: {
    type: String,
    default: 'default'
  },
  digitalSignature: {
    type: String // Hash or signature for verification
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Generate certificate number before saving
certificateSchema.pre('save', async function(next) {
  if (!this.certificateNumber) {
    const date = new Date();
    const year = date.getFullYear();
    
    // Find the last certificate number for this year
    const lastCertificate = await this.constructor.findOne({
      certificateNumber: new RegExp(`^CERT-${year}`)
    }).sort({ certificateNumber: -1 });
    
    let sequence = 1;
    if (lastCertificate) {
      const lastSequence = parseInt(lastCertificate.certificateNumber.split('-')[2]);
      sequence = lastSequence + 1;
    }
    
    this.certificateNumber = `CERT-${year}-${String(sequence).padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Certificate', certificateSchema);