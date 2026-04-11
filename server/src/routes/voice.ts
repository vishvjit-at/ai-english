import { Router, Request, Response } from 'express'

const router = Router()

// ── Usage tracking (in-memory, resets on restart) ──

interface UsageRecord {
  month: string // "YYYY-MM"
  elevenlabs: number
}

const LIMITS = {
  elevenlabs: 10_000,
}

let usage: UsageRecord = {
  month: getCurrentMonth(),
  elevenlabs: 0,
}

function getCurrentMonth(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function getUsage(): UsageRecord {
  const current = getCurrentMonth()
  if (usage.month !== current) {
    usage = { month: current, elevenlabs: 0 }
  }
  return usage
}

// ── POST /api/voice/speak ──

router.post('/voice/speak', async (req: Request, res: Response) => {
  try {
    const { text, provider, voiceName, speed } = req.body as {
      text: string
      provider: 'elevenlabs' | 'browser'
      voiceName?: string
      speed?: number
    }

    if (!text || !provider) {
      res.status(400).json({ error: 'text and provider are required' })
      return
    }

    if (provider === 'browser') {
      res.json({ audio: null, message: 'Use browser Web Speech API' })
      return
    }

    const u = getUsage()
    const charCount = text.length

    if (provider === 'elevenlabs') {
      const apiKey = process.env.ELEVENLABS_API_KEY
      if (!apiKey) {
        res.status(500).json({ error: 'ELEVENLABS_API_KEY not configured' })
        return
      }

      if (u.elevenlabs + charCount > LIMITS.elevenlabs) {
        res.json({
          error: 'limit_exceeded',
          usage: { used: u.elevenlabs, limit: LIMITS.elevenlabs },
        })
        return
      }

      const voiceId = voiceName || '21m00Tcm4TlvDq8ikWAM' // Rachel default

      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': apiKey,
          },
          body: JSON.stringify({
            text,
            model_id: 'eleven_flash_v2_5',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
            },
          }),
        }
      )

      if (!response.ok) {
        const err = await response.text()
        console.error('ElevenLabs TTS error:', err)
        res.status(502).json({ error: 'ElevenLabs TTS request failed' })
        return
      }

      const arrayBuffer = await response.arrayBuffer()
      const base64 = Buffer.from(arrayBuffer).toString('base64')
      u.elevenlabs += charCount

      res.json({
        audio: base64,
        contentType: 'audio/mpeg',
        usage: { used: u.elevenlabs, limit: LIMITS.elevenlabs },
      })
      return
    }

    res.status(400).json({ error: `Unknown provider: ${provider}` })
  } catch (err) {
    console.error('TTS error:', err)
    res.status(500).json({ error: 'TTS failed' })
  }
})

// ── GET /api/voice/voices ──

router.get('/voice/voices', async (req: Request, res: Response) => {
  try {
    const provider = req.query.provider as string

    if (provider === 'elevenlabs') {
      const apiKey = process.env.ELEVENLABS_API_KEY
      if (!apiKey) {
        res.json({ voices: [], error: 'ELEVENLABS_API_KEY not configured' })
        return
      }

      const response = await fetch('https://api.elevenlabs.io/v1/voices', {
        headers: { 'xi-api-key': apiKey },
      })

      if (!response.ok) {
        res.json({ voices: [], error: 'Failed to fetch ElevenLabs voices' })
        return
      }

      const data = (await response.json()) as {
        voices: Array<{ voice_id: string; name: string; labels?: Record<string, string> }>
      }

      const voices = data.voices.map((v) => ({
        id: v.voice_id,
        name: v.name,
        lang: v.labels?.accent || 'english',
        type: 'elevenlabs',
      }))

      res.json({ voices })
      return
    }

    if (provider === 'browser') {
      res.json({ voices: [] })
      return
    }

    res.status(400).json({ error: 'provider query param required (elevenlabs, browser)' })
  } catch (err) {
    console.error('Voices list error:', err)
    res.status(500).json({ error: 'Failed to list voices' })
  }
})

// ── GET /api/voice/usage ──

router.get('/voice/usage', (_req: Request, res: Response) => {
  const u = getUsage()
  res.json({
    month: u.month,
    elevenlabs: { used: u.elevenlabs, limit: LIMITS.elevenlabs },
  })
})

// POST /api/voice/transcribe — Groq Whisper fallback STT
router.post('/voice/transcribe', async (_req: Request, res: Response) => {
  try {
    res.status(501).json({
      error: 'Voice transcription requires multipart upload. Use Web Speech API as primary STT.',
    })
  } catch (err) {
    console.error('Transcription error:', err)
    res.status(500).json({ error: 'Transcription failed' })
  }
})

export default router
