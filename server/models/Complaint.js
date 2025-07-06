const mongoose = require('mongoose')

const complaintSchema = new mongoose.Schema({
  complaintId: {
    type: String,
    unique: true,
    required: true
  },
  title: {
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
      'Product Quality',
      'Service Issue', 
      'Billing Problem',
      'Delivery Issue',
      'Technical Support',
      'Account Problem',
      'Refund Request',
      'Other'
    ]
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in-progress', 'resolved', 'closed'],
    default: 'pending'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedAgent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  contactMethod: {
    type: String,
    enum: ['email', 'phone', 'both'],
    default: 'email'
  },
  attachments: [{
    filename: String,
    originalName: String,
    path: String,
    mimetype: String,
    size: Number
  }],
  statusHistory: [{
    status: {
      type: String,
      enum: ['pending', 'assigned', 'in-progress', 'resolved', 'closed']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    comment: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    submittedAt: {
      type: Date,
      default: Date.now
    }
  },
  resolution: {
    description: String,
    resolvedAt: Date,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }
}, {
  timestamps: true
})

// Generate complaint ID before saving
complaintSchema.pre('save', async function(next) {
  if (!this.complaintId) {
    const count = await mongoose.model('Complaint').countDocuments()
    this.complaintId = `CMP${String(count + 1).padStart(6, '0')}`
  }
  
  // Add to status history if status changed
  if (this.isModified('status') && !this.isNew) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date()
    })
  }
  
  next()
})

module.exports = mongoose.model('Complaint', complaintSchema)