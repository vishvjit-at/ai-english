import { Router, Request, Response } from 'express'
import { prisma } from '../lib/prisma.js'
import { groq } from '../lib/groq.js'
import { buildSummaryPrompt } from '../lib/system-prompts.js'
import type { Prisma } from '../generated/prisma/client.js'
import type { AuthenticatedRequest } from '../middleware/auth.js'

const router = Router()

function getUserId(req: Request): string {
  return (req as AuthenticatedRequest).userId
}

// POST /api/sessions — save a completed conversation
router.post('/sessions', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req)
    const { scenarioId, scenarioName, topic, userContext, startedAt, messages } = req.body

    if (!scenarioId || !scenarioName || !messages?.length) {
      res.status(400).json({ error: 'Missing required fields' })
      return
    }

    const startDate = new Date(startedAt)
    const endDate = new Date()
    const durationSecs = Math.round((endDate.getTime() - startDate.getTime()) / 1000)

    const session = await prisma.session.create({
      data: {
        userId,
        scenarioId,
        scenarioName,
        topic: topic || 'custom',
        userContext: (userContext || {}) as Prisma.InputJsonValue,
        startedAt: startDate,
        endedAt: endDate,
        durationSecs,
        messageCount: messages.length,
        messages: {
          create: messages.map((m: { role: string; content: string; feedback?: unknown; createdAt: string }) => ({
            role: m.role,
            content: m.content,
            feedback: (m.feedback || undefined) as Prisma.InputJsonValue | undefined,
            createdAt: new Date(m.createdAt),
          })),
        },
      },
    })

    res.status(201).json({ sessionId: session.id })
  } catch (err) {
    console.error('Save session error:', err)
    res.status(500).json({ error: 'Failed to save session' })
  }
})

// POST /api/sessions/:id/summary — generate AI summary
router.post('/sessions/:id/summary', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req)
    const id = req.params.id as string

    const session = await prisma.session.findFirst({
      where: { id, userId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    })

    if (!session) {
      res.status(404).json({ error: 'Session not found' })
      return
    }

    const userContext = session.userContext as Record<string, string>
    const transcript = session.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }))

    const prompt = buildSummaryPrompt(
      session.scenarioName,
      userContext.level || 'intermediate',
      transcript
    )

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      max_tokens: 600,
      response_format: { type: 'json_object' },
    })

    const raw = completion.choices[0]?.message?.content || '{}'
    let parsed: {
      overallScore: number
      fluencyAssessment: string
      grammarSummary: string
      vocabHighlights: string[]
      areasToImprove: string[]
      encouragement: string
    }

    try {
      parsed = JSON.parse(raw)
    } catch {
      parsed = {
        overallScore: 6,
        fluencyAssessment: 'Good effort in this conversation.',
        grammarSummary: 'Some areas for improvement were noticed.',
        vocabHighlights: [],
        areasToImprove: ['Keep practicing regularly'],
        encouragement: 'Great job practicing! Every conversation makes you better.',
      }
    }

    const summary = await prisma.sessionSummary.upsert({
      where: { sessionId: id },
      update: {
        overallScore: parsed.overallScore,
        fluencyAssessment: parsed.fluencyAssessment,
        grammarSummary: parsed.grammarSummary,
        vocabHighlights: parsed.vocabHighlights || [],
        areasToImprove: parsed.areasToImprove || [],
        encouragement: parsed.encouragement,
      },
      create: {
        sessionId: id,
        overallScore: parsed.overallScore,
        fluencyAssessment: parsed.fluencyAssessment,
        grammarSummary: parsed.grammarSummary,
        vocabHighlights: parsed.vocabHighlights || [],
        areasToImprove: parsed.areasToImprove || [],
        encouragement: parsed.encouragement,
      },
    })

    if (parsed.vocabHighlights?.length) {
      for (const word of parsed.vocabHighlights) {
        const existing = await prisma.vocabularyItem.findFirst({ where: { word, userId } })
        if (!existing) {
          await prisma.vocabularyItem.create({
            data: { word, userId, sessionId: id },
          })
        }
      }
    }

    res.json({ summary })
  } catch (err) {
    console.error('Generate summary error:', err)
    res.status(500).json({ error: 'Failed to generate summary' })
  }
})

// GET /api/sessions — list past sessions
router.get('/sessions', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req)
    const limit = parseInt(req.query.limit as string) || 20
    const offset = parseInt(req.query.offset as string) || 0

    const [sessions, total] = await Promise.all([
      prisma.session.findMany({
        where: { userId },
        orderBy: { startedAt: 'desc' },
        skip: offset,
        take: limit,
        include: {
          summary: { select: { overallScore: true } },
          messages: { select: { feedback: true } },
        },
      }),
      prisma.session.count({ where: { userId } }),
    ])

    res.json({
      sessions: sessions.map((s) => ({
        id: s.id,
        scenarioId: s.scenarioId,
        scenarioName: s.scenarioName,
        topic: s.topic,
        startedAt: s.startedAt.toISOString(),
        durationSecs: s.durationSecs,
        messageCount: s.messageCount,
        // A "correction" = an AI message that includes a feedback object the UI surfaces.
        correctionCount: s.messages.filter((m) => {
          const f = m.feedback as { show?: boolean } | null
          return f != null && f.show !== false
        }).length,
        overallScore: s.summary?.overallScore ?? null,
      })),
      total,
    })
  } catch (err) {
    console.error('List sessions error:', err)
    res.status(500).json({ error: 'Failed to list sessions' })
  }
})

// GET /api/sessions/:id — single session detail
router.get('/sessions/:id', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req)
    const session = await prisma.session.findFirst({
      where: { id: req.params.id as string, userId },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
        summary: true,
        vocabulary: true,
      },
    })

    if (!session) {
      res.status(404).json({ error: 'Session not found' })
      return
    }

    res.json({ session })
  } catch (err) {
    console.error('Get session error:', err)
    res.status(500).json({ error: 'Failed to get session' })
  }
})

// DELETE /api/sessions/:id — delete a session
router.delete('/sessions/:id', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req)
    const session = await prisma.session.findFirst({ where: { id: req.params.id as string, userId } })
    if (!session) {
      res.status(404).json({ error: 'Session not found' })
      return
    }
    await prisma.session.delete({ where: { id: session.id } })
    res.json({ success: true })
  } catch (err) {
    console.error('Delete session error:', err)
    res.status(500).json({ error: 'Failed to delete session' })
  }
})

// GET /api/progress — aggregate stats
router.get('/progress', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req)
    const sessions = await prisma.session.findMany({
      where: { userId },
      orderBy: { startedAt: 'desc' },
      include: {
        summary: { select: { overallScore: true, areasToImprove: true } },
        messages: { select: { role: true, feedback: true } },
      },
    })

    const totalSessions = sessions.length
    const totalMinutes = Math.round(
      sessions.reduce((sum, s) => sum + (s.durationSecs || 0), 0) / 60
    )
    const totalMessages = sessions.reduce((sum, s) => sum + s.messageCount, 0)

    const scores = sessions
      .map((s) => s.summary?.overallScore)
      .filter((s): s is number => s != null)
    const averageScore = scores.length
      ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
      : null

    const topicBreakdown: Record<string, number> = {}
    for (const s of sessions) {
      topicBreakdown[s.topic] = (topicBreakdown[s.topic] || 0) + 1
    }

    const scoreHistory = sessions
      .filter((s) => s.summary?.overallScore != null)
      .slice(0, 20)
      .map((s) => ({
        date: s.startedAt.toISOString(),
        score: s.summary!.overallScore,
        scenarioName: s.scenarioName,
      }))
      .reverse()

    const sessionDates = [
      ...new Set(sessions.map((s) => s.startedAt.toISOString().split('T')[0])),
    ].sort()

    let currentStreak = 0
    let longestStreak = 0
    if (sessionDates.length) {
      const today = new Date().toISOString().split('T')[0]
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
      const lastDate = sessionDates[sessionDates.length - 1]
      if (lastDate === today || lastDate === yesterday) {
        currentStreak = 1
        for (let i = sessionDates.length - 2; i >= 0; i--) {
          const curr = new Date(sessionDates[i + 1])
          const prev = new Date(sessionDates[i])
          if ((curr.getTime() - prev.getTime()) / 86400000 <= 1) currentStreak++
          else break
        }
      }
      let streak = 1
      for (let i = 1; i < sessionDates.length; i++) {
        const curr = new Date(sessionDates[i])
        const prev = new Date(sessionDates[i - 1])
        if ((curr.getTime() - prev.getTime()) / 86400000 <= 1) streak++
        else { longestStreak = Math.max(longestStreak, streak); streak = 1 }
      }
      longestStreak = Math.max(longestStreak, streak)
    }

    const areaCount: Record<string, number> = {}
    for (const s of sessions.slice(0, 10)) {
      for (const area of s.summary?.areasToImprove || []) {
        areaCount[area] = (areaCount[area] || 0) + 1
      }
    }
    const recentWeakAreas = Object.entries(areaCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([area, count]) => ({ area, count }))

    let userMessages = 0
    let corrections = 0
    for (const s of sessions) {
      for (const m of s.messages) {
        if (m.role === 'assistant' && m.feedback) {
          const fb = m.feedback as Record<string, unknown>
          if (fb.show) corrections++
        }
        if (m.role === 'user') userMessages++
      }
    }
    const grammarCorrectionRate = userMessages ? Math.round((corrections / userMessages) * 100) : 0

    res.json({
      totalSessions, totalMinutes, totalMessages, averageScore,
      currentStreak, longestStreak, topicBreakdown, scoreHistory,
      recentWeakAreas, grammarCorrectionRate,
    })
  } catch (err) {
    console.error('Progress error:', err)
    res.status(500).json({ error: 'Failed to get progress' })
  }
})

// GET /api/progress/recommendation — difficulty progression
router.get('/progress/recommendation', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req)
    const recentSessions = await prisma.session.findMany({
      where: { userId },
      orderBy: { startedAt: 'desc' },
      take: 5,
      include: { summary: { select: { overallScore: true } } },
    })

    if (recentSessions.length === 0) {
      res.json({ currentLevel: 'beginner', recommendedLevel: 'beginner', reason: '', recentScores: [], shouldShow: false })
      return
    }

    const latestCtx = recentSessions[0].userContext as Record<string, string>
    const currentLevel = latestCtx.level || 'beginner'
    const levels = ['beginner', 'intermediate', 'advanced']

    const atCurrentLevel = recentSessions.filter((s) => {
      const ctx = s.userContext as Record<string, string>
      return ctx.level === currentLevel && s.summary?.overallScore != null
    })
    const scores = atCurrentLevel.map((s) => s.summary!.overallScore)
    const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0

    let recommendedLevel = currentLevel
    let reason = ''
    let shouldShow = false
    const currentIdx = levels.indexOf(currentLevel)

    if (scores.length >= 3 && avg >= 7 && currentIdx < levels.length - 1) {
      recommendedLevel = levels[currentIdx + 1]
      reason = `You averaged ${avg.toFixed(1)} in your last ${scores.length} ${currentLevel} sessions. You're ready for ${recommendedLevel}!`
      shouldShow = true
    } else if (scores.length >= 2 && avg <= 4 && currentIdx > 0) {
      recommendedLevel = levels[currentIdx - 1]
      reason = `Let's build more confidence at ${recommendedLevel} level before moving up. You've got this!`
      shouldShow = true
    }

    res.json({ currentLevel, recommendedLevel, reason, recentScores: scores, shouldShow })
  } catch (err) {
    console.error('Recommendation error:', err)
    res.status(500).json({ error: 'Failed to get recommendation' })
  }
})

// GET /api/vocabulary/review — get words for review
router.get('/vocabulary/review', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req)
    const limit = parseInt(req.query.limit as string) || 10

    const unmastered = await prisma.vocabularyItem.findMany({
      where: { userId, mastered: false },
      orderBy: [{ reviewCount: 'asc' }, { createdAt: 'asc' }],
      take: limit,
    })

    let words = unmastered
    if (words.length < limit) {
      const mastered = await prisma.vocabularyItem.findMany({
        where: { userId, mastered: true },
        orderBy: [{ reviewCount: 'asc' }],
        take: limit - words.length,
      })
      words = [...words, ...mastered]
    }

    res.json({ words })
  } catch (err) {
    console.error('Vocabulary review error:', err)
    res.status(500).json({ error: 'Failed to get review words' })
  }
})

// POST /api/vocabulary/:id/evaluate — AI evaluation of word usage
router.post('/vocabulary/:id/evaluate', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req)
    const id = req.params.id as string
    const { word, sentence } = req.body as { word: string; sentence: string }

    if (!word || !sentence) {
      res.status(400).json({ error: 'word and sentence are required' })
      return
    }

    // Verify ownership
    const existing = await prisma.vocabularyItem.findFirst({ where: { id, userId } })
    if (!existing) {
      res.status(404).json({ error: 'Vocabulary item not found' })
      return
    }

    const { buildVocabEvaluationPrompt } = await import('../lib/system-prompts.js')
    const prompt = buildVocabEvaluationPrompt(word, sentence)

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 200,
      response_format: { type: 'json_object' },
    })

    const raw = completion.choices[0]?.message?.content || '{}'
    let evaluation: { correct: boolean; feedback: string; exampleSentence: string }
    try {
      evaluation = JSON.parse(raw)
    } catch {
      evaluation = { correct: true, feedback: 'Good effort!', exampleSentence: `The word "${word}" can be used in many contexts.` }
    }

    const vocabulary = await prisma.vocabularyItem.update({
      where: { id },
      data: {
        reviewCount: { increment: 1 },
        lastReviewAt: new Date(),
        mastered: evaluation.correct ? true : undefined,
      },
    })

    res.json({ evaluation, vocabulary })
  } catch (err) {
    console.error('Vocabulary evaluate error:', err)
    res.status(500).json({ error: 'Failed to evaluate vocabulary' })
  }
})

// GET /api/vocabulary — list vocabulary
router.get('/vocabulary', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req)
    const mastered = req.query.mastered === 'true' ? true : req.query.mastered === 'false' ? false : undefined
    const limit = parseInt(req.query.limit as string) || 50

    const items = await prisma.vocabularyItem.findMany({
      where: { userId, ...(mastered !== undefined ? { mastered } : {}) },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    res.json({ vocabulary: items })
  } catch (err) {
    console.error('Vocabulary list error:', err)
    res.status(500).json({ error: 'Failed to list vocabulary' })
  }
})

// PATCH /api/vocabulary/:id — toggle mastered
router.patch('/vocabulary/:id', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req)
    const { mastered } = req.body as { mastered: boolean }
    const existing = await prisma.vocabularyItem.findFirst({ where: { id: req.params.id as string, userId } })
    if (!existing) {
      res.status(404).json({ error: 'Vocabulary item not found' })
      return
    }
    const item = await prisma.vocabularyItem.update({
      where: { id: existing.id },
      data: { mastered },
    })
    res.json({ vocabulary: item })
  } catch (err) {
    console.error('Vocabulary update error:', err)
    res.status(500).json({ error: 'Failed to update vocabulary' })
  }
})

// DELETE /api/vocabulary/:id — remove word
router.delete('/vocabulary/:id', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req)
    const existing = await prisma.vocabularyItem.findFirst({ where: { id: req.params.id as string, userId } })
    if (!existing) {
      res.status(404).json({ error: 'Vocabulary item not found' })
      return
    }
    await prisma.vocabularyItem.delete({ where: { id: existing.id } })
    res.json({ success: true })
  } catch (err) {
    console.error('Vocabulary delete error:', err)
    res.status(500).json({ error: 'Failed to delete vocabulary' })
  }
})

export default router
