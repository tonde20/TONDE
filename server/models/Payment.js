const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  enrollment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enrollment',
    required: true
  },
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
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'transfer', 'cheque', 'mobile_money'],
    required: true
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'completed'
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true
  },
  notes: {
    type: String
  },
  receiptNumber: {
    type: String,
    unique: true,
    required: true
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Admin who processed the payment
  }
}, {
  timestamps: true
});

// Generate receipt number before saving
paymentSchema.pre('save', async function(next) {
  if (!this.receiptNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    // Find the last receipt number for today
    const lastPayment = await this.constructor.findOne({
      receiptNumber: new RegExp(`^REC-${year}${month}${day}`)
    }).sort({ receiptNumber: -1 });
    
    let sequence = 1;
    if (lastPayment) {
      const lastSequence = parseInt(lastPayment.receiptNumber.split('-')[2]);
      sequence = lastSequence + 1;
    }
    
    this.receiptNumber = `REC-${year}${month}${day}-${String(sequence).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);