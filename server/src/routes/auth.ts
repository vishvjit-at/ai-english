import { Router, Response } from 'express'
import { prisma } from '../lib/prisma.js'
import type { Prisma } from '../generated/prisma/client.js'
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

// GET /api/user/preferences — fetch saved user preferences (any JSON shape)
router.get('/user/preferences', async (req, res: Response) => {
  try {
    const { userId } = req as AuthenticatedRequest
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { preferences: true },
    })
    res.json({ preferences: user?.preferences ?? null })
  } catch (err) {
    console.error('Get preferences error:', err)
    res.status(500).json({ error: 'Failed to load preferences' })
  }
})

// PATCH /api/user/preferences — merge partial preferences into stored JSON
router.patch('/user/preferences', async (req, res: Response) => {
  try {
    const { userId } = req as AuthenticatedRequest
    const partial = req.body as Record<string, unknown>
    if (!partial || typeof partial !== 'object' || Array.isArray(partial)) {
      res.status(400).json({ error: 'Body must be a JSON object' })
      return
    }
    const existing = await prisma.user.findUnique({
      where: { id: userId },
      select: { preferences: true },
    })
    const current = (existing?.preferences as Record<string, unknown> | null) || {}
    const merged = { ...current, ...partial }
    await prisma.user.update({
      where: { id: userId },
      data: { preferences: merged as Prisma.InputJsonValue },
    })
    res.json({ preferences: merged })
  } catch (err) {
    console.error('Patch preferences error:', err)
    res.status(500).json({ error: 'Failed to save preferences' })
  }
})

export default router
