const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
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
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'dropped', 'pending'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'partial', 'paid', 'overdue'],
    default: 'pending'
  },
  totalAmount: {
    type: Number,
    required: true
  },
  amountPaid: {
    type: Number,
    default: 0
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  attendance: [{
    date: Date,
    present: Boolean,
    notes: String
  }],
  grades: [{
    assessment: String,
    score: Number,
    maxScore: Number,
    date: Date
  }],
  notes: {
    type: String
  },
  certificateIssued: {
    type: Boolean,
    default: false
  },
  certificateDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for efficient queries
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

// Virtual for remaining balance
enrollmentSchema.virtual('remainingBalance').get(function() {
  return this.totalAmount - this.amountPaid;
});

// Virtual for attendance rate
enrollmentSchema.virtual('attendanceRate').get(function() {
  if (this.attendance.length === 0) return 0;
  const presentCount = this.attendance.filter(a => a.present).length;
  return Math.round((presentCount / this.attendance.length) * 100);
});

module.exports = mongoose.model('Enrollment', enrollmentSchema);