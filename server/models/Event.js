import mongoose from 'mongoose'

const eventSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String
  },
  endTime: {
    type: String
  },
  duration: {
    type: Number,
    default: 0
  },
  group: {
    type: String
  },
  repeat: {
    type: {
      type: String,
      enum: ['none', 'daily', 'weekly', 'monthly', 'yearly'],
      default: 'none'
    },
    weekdays: [{
      type: Number,
      min: 0,
      max: 6
    }],
    dates: [Date]
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

// Index for efficient queries
eventSchema.index({ userId: 1, date: 1 })
eventSchema.index({ userId: 1, title: 'text', description: 'text' })

export default mongoose.model('Event', eventSchema)