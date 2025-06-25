import express from 'express'
import Event from '../models/Event.js'
import Log from '../models/Log.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// Get events
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query
    
    let query = { userId: req.user._id, active: true }
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }

    const events = await Event.find(query).sort({ date: 1, startTime: 1 })
    
    res.json({
      events: events.map(event => ({
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
    console.error('Get events error:', error)
    res.status(500).json({ message: 'Failed to fetch events' })
  }
})

// Create event
router.post('/', authenticateToken, async (req, res) => {
  try {
    const eventData = {
      ...req.body,
      userId: req.user._id
    }

    const event = new Event(eventData)
    await event.save()

    // Log the action
    await Log.create({
      userId: req.user._id,
      action: 'event_created',
      description: `Created event: ${event.title}`,
      metadata: { eventId: event._id, title: event.title }
    })

    res.status(201).json({
      event: {
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
      }
    })
  } catch (error) {
    console.error('Create event error:', error)
    res.status(400).json({ message: 'Failed to create event' })
  }
})

// Update event
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const event = await Event.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    })

    if (!event) {
      return res.status(404).json({ message: 'Event not found' })
    }

    Object.assign(event, req.body)
    await event.save()

    // Log the action
    await Log.create({
      userId: req.user._id,
      action: 'event_updated',
      description: `Updated event: ${event.title}`,
      metadata: { eventId: event._id, title: event.title }
    })

    res.json({
      event: {
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
      }
    })
  } catch (error) {
    console.error('Update event error:', error)
    res.status(400).json({ message: 'Failed to update event' })
  }
})

// Delete event
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const event = await Event.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    })

    if (!event) {
      return res.status(404).json({ message: 'Event not found' })
    }

    await Event.findByIdAndDelete(req.params.id)

    // Log the action
    await Log.create({
      userId: req.user._id,
      action: 'event_deleted',
      description: `Deleted event: ${event.title}`,
      metadata: { eventId: event._id, title: event.title }
    })

    res.json({ message: 'Event deleted successfully' })
  } catch (error) {
    console.error('Delete event error:', error)
    res.status(500).json({ message: 'Failed to delete event' })
  }
})

// Upload JSON events
router.post('/upload', authenticateToken, async (req, res) => {
  try {
    const { events } = req.body

    if (!Array.isArray(events)) {
      return res.status(400).json({ message: 'Events must be an array' })
    }

    const createdEvents = []
    
    for (const eventData of events) {
      const event = new Event({
        ...eventData,
        userId: req.user._id
      })
      await event.save()
      createdEvents.push({
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
      })
    }

    // Log the action
    await Log.create({
      userId: req.user._id,
      action: 'json_upload',
      description: `Uploaded ${createdEvents.length} events via JSON`,
      metadata: { eventCount: createdEvents.length }
    })

    res.status(201).json({ events: createdEvents })
  } catch (error) {
    console.error('JSON upload error:', error)
    res.status(400).json({ message: 'Failed to upload events' })
  }
})

export default router