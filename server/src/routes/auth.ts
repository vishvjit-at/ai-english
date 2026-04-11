import { Router, Response } from 'express'
import { prisma } from '../lib/prisma.js'
import type { AuthenticatedRequest } from '../middleware/auth.js'

const router = Router()

// POST /api/auth/profile — create or update user record after login
router.post('/auth/profile', async (req, res: Response) => {
  try {
    const { userId, userEmail } = req as AuthenticatedRequest
    const { name, avatarUrl } = req.body as { name?: string; avatarUrl?: string }

    const user = await prisma.user.upsert({
      where: { id: userId },
      update: { name, avatarUrl, email: userEmail },
      create: { id: userId, email: userEmail, name, avatarUrl },
    })

    res.json({ user })
  } catch (err) {
    console.error('Profile sync error:', err)
    res.status(500).json({ error: 'Failed to sync profile' })
  }
})

// GET /api/auth/me — get current user profile
router.get('/auth/me', async (req, res: Response) => {
  try {
    const { userId } = req as AuthenticatedRequest
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }
    res.json({ user })
  } catch (err) {
    console.error('Get profile error:', err)
    res.status(500).json({ error: 'Failed to get profile' })
  }
})

export default router
