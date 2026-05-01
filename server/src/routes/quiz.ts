import { Router, Request, Response } from 'express'
import { prisma } from '../lib/prisma.js'
import { fetchQuizQuestions } from '../lib/quiz-generator.js'
import { QUIZ_MODULES, MODULE_BY_ID } from '../lib/quiz-modules.js'
import type { AuthenticatedRequest } from '../middleware/auth.js'

const router = Router()
const userId = (req: Request) => (req as AuthenticatedRequest).userId

// GET /api/quiz/modules — list of available modules + each user's seen-count.
router.get('/quiz/modules', async (req: Request, res: Response) => {
  try {
    const uid = userId(req)
    const seenCounts = await prisma.userSeenQuestion.groupBy({
      by: ['questionId'],
      where: { userId: uid },
    })
    const seenByModule: Record<string, number> = {}
    if (seenCounts.length) {
      const ids = seenCounts.map((s) => s.questionId)
      const qs = await prisma.quizQuestion.findMany({
        where: { id: { in: ids } },
        select: { module: true },
      })
      for (const q of qs) seenByModule[q.module] = (seenByModule[q.module] || 0) + 1
    }
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
    const dailyDoneToday = await prisma.quizAttempt.count({
      where: { userId: uid, mode: 'daily', startedAt: { gte: todayStart }, finishedAt: { not: null } },
    })
    res.json({
      modules: QUIZ_MODULES.map((m) => ({
        id: m.id, label: m.label, icon: m.icon, description: m.description,
        seen: seenByModule[m.id] || 0,
      })),
      dailyDoneToday: dailyDoneToday > 0,
    })
  } catch (err) {
    console.error('GET /quiz/modules:', err)
    res.status(500).json({ error: 'Failed to load modules' })
  }
})

// POST /api/quiz/start — { module: 'articles' | ... | 'daily' }
router.post('/quiz/start', async (req: Request, res: Response) => {
  try {
    const uid = userId(req)
    const moduleId: string = req.body?.module
    if (!moduleId || (moduleId !== 'daily' && !MODULE_BY_ID[moduleId])) {
      res.status(400).json({ error: 'Unknown module' })
      return
    }

    const questions = await fetchQuizQuestions(uid, moduleId, 10)
    if (!questions.length) {
      res.status(503).json({ error: 'Could not produce questions right now. Try again in a moment.' })
      return
    }

    const attempt = await prisma.quizAttempt.create({
      data: {
        userId: uid,
        module: moduleId,
        mode: moduleId === 'daily' ? 'daily' : 'module',
        total: questions.length,
      },
    })

    res.json({
      attemptId: attempt.id,
      module: moduleId,
      questions, // {id, module, prompt, options} — correctIdx withheld
    })
  } catch (err) {
    console.error('POST /quiz/start:', err)
    res.status(500).json({ error: 'Failed to start quiz' })
  }
})

// POST /api/quiz/submit — { attemptId, answers: [{ questionId, chosenIdx }] }
router.post('/quiz/submit', async (req: Request, res: Response) => {
  try {
    const uid = userId(req)
    const { attemptId, answers } = req.body as {
      attemptId: string
      answers: { questionId: string; chosenIdx: number }[]
    }
    if (!attemptId || !Array.isArray(answers)) {
      res.status(400).json({ error: 'Missing attemptId or answers' })
      return
    }

    const attempt = await prisma.quizAttempt.findUnique({ where: { id: attemptId } })
    if (!attempt || attempt.userId !== uid) {
      res.status(404).json({ error: 'Attempt not found' })
      return
    }
    if (attempt.finishedAt) {
      res.status(409).json({ error: 'Attempt already submitted' })
      return
    }

    const questions = await prisma.quizQuestion.findMany({
      where: { id: { in: answers.map((a) => a.questionId) } },
    })
    const byId = new Map(questions.map((q) => [q.id, q]))

    let score = 0
    const results = answers.map((a) => {
      const q = byId.get(a.questionId)
      if (!q) return null
      const correct = a.chosenIdx === q.correctIdx
      if (correct) score += 1
      return {
        questionId: q.id,
        prompt: q.prompt,
        options: q.options,
        chosenIdx: a.chosenIdx,
        correctIdx: q.correctIdx,
        correct,
        explanation: q.explanation || null,
      }
    }).filter(Boolean) as NonNullable<ReturnType<typeof Array.prototype.find>>[]

    await prisma.$transaction([
      prisma.quizResponse.createMany({
        data: results.map((r) => ({
          attemptId, questionId: r.questionId, chosenIdx: r.chosenIdx, correct: r.correct,
        })),
      }),
      prisma.quizAttempt.update({
        where: { id: attemptId },
        data: { score, finishedAt: new Date() },
      }),
    ])

    res.json({ attemptId, score, total: attempt.total, results })
  } catch (err) {
    console.error('POST /quiz/submit:', err)
    res.status(500).json({ error: 'Failed to submit quiz' })
  }
})

// GET /api/quiz/history — list attempts for this user.
router.get('/quiz/history', async (req: Request, res: Response) => {
  try {
    const uid = userId(req)
    const attempts = await prisma.quizAttempt.findMany({
      where: { userId: uid, finishedAt: { not: null } },
      orderBy: { finishedAt: 'desc' },
      take: 50,
    })
    res.json({
      attempts: attempts.map((a) => ({
        id: a.id,
        module: a.module,
        mode: a.mode,
        score: a.score,
        total: a.total,
        finishedAt: a.finishedAt,
        moduleLabel: MODULE_BY_ID[a.module]?.label || (a.mode === 'daily' ? 'Daily Quiz' : a.module),
      })),
    })
  } catch (err) {
    console.error('GET /quiz/history:', err)
    res.status(500).json({ error: 'Failed to load history' })
  }
})

export default router
