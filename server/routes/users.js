import express from 'express'
import User from '../models/User.js'
import Event from '../models/Event.js'
import Log from '../models/Log.js'
import { authenticateToken, requireAdmin } from '../middleware/auth.js'

const router = express.Router()

// Get all users (admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 })
    
    res.json({
      users: users.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        picture: user.picture,
        role: user.role,
        active: user.active,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }))
    })
  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({ message: 'Failed to fetch users' })
  }
})

// Update user status (admin only)
router.patch('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { active } = req.body
    const userId = req.params.id

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    user.active = active
    await user.save()

    // If deactivating user, also deactivate their events
    if (!active) {
      await Event.updateMany(
        { userId: user._id },
        { active: false }
      )
    }

    // Log the action
    await Log.create({
      userId: req.user._id,
      action: 'admin_action',
      description: `${active ? 'Activated' : 'Deactivated'} user: ${user.name}`,
      metadata: { 
        targetUserId: user._id, 
        targetUserEmail: user.email,
        action: active ? 'activate' : 'deactivate'
      }
    })

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        picture: user.picture,
        role: user.role,
        active: user.active,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    })
  } catch (error) {
    console.error('Update user error:', error)
    res.status(400).json({ message: 'Failed to update user' })
  }
})

export default router