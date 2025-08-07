const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Initiation Informatique',
      'Microsoft Office Débutant',
      'Microsoft Office Intermédiaire', 
      'Microsoft Office Avancé',
      'Intelligence Artificielle',
      'Stockage en Ligne',
      'Collecte et Analyse de Données'
    ]
  },
  duration: {
    type: Number, // durée en heures
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  maxStudents: {
    type: Number,
    default: 20
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  schedule: {
    days: [{
      type: String,
      enum: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
    }],
    time: {
      start: String, // format "HH:mm"
      end: String    // format "HH:mm"
    }
  },
  instructor: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  prerequisites: [{
    type: String
  }],
  objectives: [{
    type: String
  }]
}, {
  timestamps: true
});

// Virtual for enrolled students count
courseSchema.virtual('enrolledCount', {
  ref: 'Enrollment',
  localField: '_id',
  foreignField: 'course',
  count: true
});

module.exports = mongoose.model('Course', courseSchema);