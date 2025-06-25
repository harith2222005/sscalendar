import express from 'express'
import jwt from 'jsonwebtoken'
import { OAuth2Client } from 'google-auth-library'
import User from '../models/User.js'
import Log from '../models/Log.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

// Google Sign-In
router.post('/google', async (req, res) => {
  try {
    const { token } = req.body

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    })

    const payload = ticket.getPayload()
    const { sub: googleId, name, email, picture } = payload

    // Find or create user
    let user = await User.findOne({ googleId })
    
    if (!user) {
      user = new User({
        googleId,
        name,
        email,
        picture
      })
      await user.save()
    } else {
      // Update user info and last login
      user.name = name
      user.email = email
      user.picture = picture
      user.lastLogin = new Date()
      await user.save()
    }

    // Log the login
    await Log.create({
      userId: user._id,
      action: 'user_login',
      description: `User ${user.name} logged in`,
      metadata: { email: user.email }
    })

    // Generate JWT
    const jwtToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        picture: user.picture,
        role: user.role,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    })
  } catch (error) {
    console.error('Google auth error:', error)
    res.status(400).json({ message: 'Invalid Google token' })
  }
})

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      picture: req.user.picture,
      role: req.user.role,
      createdAt: req.user.createdAt,
      lastLogin: req.user.lastLogin
    }
  })
})

// Logout endpoint
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // Log the logout action
    await Log.create({
      userId: req.user._id,
      action: 'user_logout',
      description: `User ${req.user.name} logged out`,
      metadata: { email: req.user.email }
    })

    res.json({ message: 'Logged out successfully' })
  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({ message: 'Logout failed' })
  }
})

export default router