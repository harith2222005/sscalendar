import express from 'express'
import Event from '../models/Event.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// Search events
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { query, startDate, endDate, group } = req.query
    
    let searchQuery = { userId: req.user._id, active: true }
    
    // Text search
    if (query) {
      searchQuery.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    }
    
    // Date range filter
    if (startDate && endDate) {
      searchQuery.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }
    
    // Group filter
    if (group) {
      searchQuery.group = { $regex: group, $options: 'i' }
    }

    const events = await Event.find(searchQuery)
      .sort({ date: 1, startTime: 1 })
      .limit(100) // Limit results for performance

    res.json({
      results: events.map(event => ({
        id: event._id,
        title: event.title,
        description: event.description,
        date: event.date,
        startTime: event.startTime,
        endTime: event.endTime,
        duration: event.duration,
        group: event.group,
        repeat: event.repeat,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt
      }))
    })
  } catch (error) {
    console.error('Search error:', error)
    res.status(500).json({ message: 'Search failed' })
  }
})

export default router