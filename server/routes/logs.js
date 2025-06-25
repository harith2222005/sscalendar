import express from 'express'
import Log from '../models/Log.js'
import { authenticateToken, requireAdmin } from '../middleware/auth.js'

const router = express.Router()

// Get logs (admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { action, userId, startDate, endDate, limit = 50 } = req.query
    
    let query = {}
    
    if (action) {
      query.action = action
    }
    
    if (userId) {
      query.userId = userId
    }
    
    if (startDate && endDate) {
      query.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }

    const logs = await Log.find(query)
      .populate('userId', 'name email')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))

    res.json({
      logs: logs.map(log => ({
        id: log._id,
        userId: log.userId._id,
        userName: log.userId.name,
        userEmail: log.userId.email,
        action: log.action,
        description: log.description,
        metadata: log.metadata,
        timestamp: log.timestamp
      }))
    })
  } catch (error) {
    console.error('Get logs error:', error)
    res.status(500).json({ message: 'Failed to fetch logs' })
  }
})

export default router