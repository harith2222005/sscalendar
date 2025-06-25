import mongoose from 'mongoose'

const logSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'event_created',
      'event_updated', 
      'event_deleted',
      'json_upload',
      'user_login',
      'user_logout',
      'admin_action'
    ]
  },
  description: {
    type: String
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

// Index for efficient queries
logSchema.index({ userId: 1, timestamp: -1 })
logSchema.index({ action: 1, timestamp: -1 })

export default mongoose.model('Log', logSchema)