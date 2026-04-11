import { Router, Request, Response } from 'express'
import { groq } from '../lib/groq.js'
import { buildSystemPrompt, buildStarterPrompt, buildLessonSystemPrompt, buildLessonStarterPrompt } from '../lib/system-prompts.js'
import { getScenario, getAllScenarios } from '../lib/scenarios.js'
import { getLesson, getAllLessons } from '../lib/lessons.js'
import type { AriaResponse, UserContext } from '../lib/types.js'

const router = Router()

// GET /api/scenarios — send all scenarios to the client
router.get('/scenarios', (_req: Request, res: Response) => {
  const data = getAllScenarios()
  res.json(data)
})

// GET /api/lessons — send all lessons to the client
router.get('/lessons', (_req: Request, res: Response) => {
  const data = getAllLessons()
  res.json({ lessons: data })
})

// POST /api/conversation/start — generate dynamic opening line
router.post('/conversation/start', async (req: Request, res: Response) => {
  try {
    const { scenarioId, lessonId, userContext } = req.body as {
      scenarioId?: string
      lessonId?: string
      userContext: UserContext
    }

    if (!userContext) {
      res.status(400).json({ error: 'Missing userContext' })
      return
    }

    let prompt: string
    let maxExchanges: number | undefined

    if (lessonId) {
      const lesson = getLesson(lessonId)
      if (!lesson) {
        res.status(400).json({ error: 'Invalid lesson' })
        return
      }
      prompt = buildLessonStarterPrompt(lesson, userContext)
      maxExchanges = lesson.maxExchanges
    } else if (scenarioId) {
      const scenario = getScenario(scenarioId)
      if (!scenario) {
        res.status(400).json({ error: 'Invalid scenario' })
        return
      }
      prompt = buildStarterPrompt(scenario, userContext)
    } else {
      res.status(400).json({ error: 'Missing scenarioId or lessonId' })
      return
    }

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.9,
      max_tokens: 150,
    })

    const openingLine = completion.choices[0]?.message?.content?.trim() || ''
    res.json({ openingLine, maxExchanges })
  } catch (err) {
    console.error('Conversation start error:', err)
    res.status(500).json({ error: 'Failed to generate opening' })
  }
})

// POST /api/conversation — main conversation endpoint
router.post('/conversation', async (req: Request, res: Response) => {
  try {
    const { message, scenarioId, lessonId, userContext, history } = req.body as {
      message: string
      scenarioId?: string
      lessonId?: string
      userContext: UserContext
      history: { role: string; content: string }[]
    }

    if (!message || !userContext) {
      res.status(400).json({ error: 'Missing message or userContext' })
      return
    }

    let systemPrompt: string

    if (lessonId) {
      const lesson = getLesson(lessonId)
      if (!lesson) {
        res.status(400).json({ error: 'Invalid lesson' })
        return
      }
      systemPrompt = buildLessonSystemPrompt(lesson, userContext)
    } else if (scenarioId) {
      const scenario = getScenario(scenarioId)
      if (!scenario) {
        res.status(400).json({ error: 'Invalid scenario' })
        return
      }
      systemPrompt = buildSystemPrompt(scenario, userContext)
    } else {
      res.status(400).json({ error: 'Missing scenarioId or lessonId' })
      return
    }

    const chatHistory = (history || []).map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }))

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        ...chatHistory,
        { role: 'user', content: message },
      ],
      temperature: 0.7,
      max_tokens: 400,
      response_format: { type: 'json_object' },
    })

    const raw = completion.choices[0]?.message?.content || '{}'

    let parsed: AriaResponse
    try {
      parsed = JSON.parse(raw)
    } catch {
      parsed = {
        response: `That's great, ${userContext.name}! Keep going — you're doing really well.`,
        feedback: { show: false, original: '', improved: '', tip: '' },
        followUpQuestion: 'Can you tell me more about that?',
        emotionalTone: 'encouraging',
      }
    }

    if (!parsed.feedback) {
      parsed.feedback = { show: false, original: '', improved: '', tip: '' }
    }

    res.json(parsed)
  } catch (err) {
    console.error('Conversation error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
