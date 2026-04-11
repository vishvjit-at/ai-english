import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { requireAuth } from './middleware/auth.js'
import authRoutes from './routes/auth.js'
import conversationRoutes from './routes/conversation.js'
import voiceRoutes from './routes/voice.js'
import sessionRoutes from './routes/sessions.js'
import { runMigrations } from './lib/migrate.js'

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))

// Health check (public — before auth middleware)
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Auth middleware for all /api routes below
app.use('/api', requireAuth)

// Protected routes
app.use('/api', authRoutes)
app.use('/api', conversationRoutes)
app.use('/api', voiceRoutes)
app.use('/api', sessionRoutes)

// Run migrations then start server
runMigrations()
  .catch(err => console.error('Migration error (non-fatal):', err))
  .finally(() => {
    app.listen(Number(PORT), '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`)
      if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_api_key_here') {
        console.warn('GROQ_API_KEY not set — conversations will fail')
      }
      if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.warn('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set — auth will fail')
      }
    })
  })

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err)
  process.exit(1)
})

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason)
  process.exit(1)
})
