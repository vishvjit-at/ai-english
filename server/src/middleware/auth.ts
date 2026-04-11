import { Request, Response, NextFunction } from 'express'
import { supabaseAdmin } from '../lib/supabase.js'

export interface AuthenticatedRequest extends Request {
  userId: string
  userEmail: string
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header' })
    return
  }

  const token = authHeader.slice(7)

  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token)
    if (error || !data.user) {
      res.status(401).json({ error: 'Invalid or expired token' })
      return
    }

    ;(req as AuthenticatedRequest).userId = data.user.id
    ;(req as AuthenticatedRequest).userEmail = data.user.email!
    next()
  } catch {
    res.status(401).json({ error: 'Authentication failed' })
  }
}
