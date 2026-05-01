import { groq } from './groq.js'
import { prisma } from './prisma.js'
import { MODULE_BY_ID, QUIZ_MODULES } from './quiz-modules.js'

const MODEL = 'llama-3.1-8b-instant'

interface RawAIQuestion {
  prompt: string
  options: string[]
  correctIdx: number
  explanation?: string
}

/**
 * Ask the AI for `count` fresh MCQs for a module, while explicitly
 * forbidding repeats of any prompts the user has already seen.
 */
async function generateAIQuestions(moduleId: string, count: number, seenPrompts: string[]): Promise<RawAIQuestion[]> {
  const mod = MODULE_BY_ID[moduleId]
  if (!mod) throw new Error(`Unknown module: ${moduleId}`)

  const dedupeBlock = seenPrompts.length
    ? `\n\nThe user has ALREADY been shown the following questions. DO NOT repeat any of them, and avoid generating semantically equivalent questions (same answer, same trap, just reworded). Generate genuinely new questions that test different angles of the topic.\n\nSEEN_QUESTIONS:\n${seenPrompts.map((p, i) => `${i + 1}. ${p}`).join('\n')}`
    : ''

  const system = `You generate high-quality, didactic multiple-choice questions for English learners. Always reply with strict JSON only — no prose, no markdown fences. Each question must have exactly 4 options and a single correct answer. Explanations must teach the rule, not just state the answer.`

  const user = `Generate ${count} multiple-choice questions on the topic below.

TOPIC: ${mod.label}
TOPIC_DETAIL: ${mod.topicHint}

REQUIREMENTS:
- Each question tests practical English usage (not trivia).
- Options must be 4 plausible choices; only one is correct.
- Every option must be a non-empty string with the actual answer written out (do NOT use empty strings, "(none)", or "—" as a placeholder; if the answer is "no article", write "no article needed").
- Wrong options should be tempting but clearly incorrect once you know the rule.
- Vary difficulty across the set (mostly intermediate, a couple harder).
- Keep prompts under 200 characters.
- The "explanation" field is the most important part — it must TEACH:
  1. State the underlying grammar rule or word-meaning briefly (1 sentence).
  2. Explain why the correct option fits the sentence/context.
  3. Briefly note why at least one tempting wrong option is wrong (so the learner doesn't repeat the mistake).
  4. Use plain language a B1–B2 learner can follow. Aim for 2–4 sentences total, around 40–80 words.${dedupeBlock}

OUTPUT_FORMAT — JSON of this exact shape:
{
  "questions": [
    {
      "prompt": "string",
      "options": ["a", "b", "c", "d"],
      "correctIdx": 0,
      "explanation": "string — multi-sentence teaching explanation per the rules above"
    }
  ]
}`

  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    temperature: 0.85,
    response_format: { type: 'json_object' },
  })

  const text = completion.choices[0]?.message?.content?.trim() || '{}'
  let parsed: { questions?: RawAIQuestion[] }
  try {
    parsed = JSON.parse(text)
  } catch {
    // Strip markdown fences if model added them despite the response_format hint.
    parsed = JSON.parse(text.replace(/^```json\s*/i, '').replace(/```\s*$/i, ''))
  }
  const out = (parsed.questions || []).filter(
    (q) =>
      q?.prompt &&
      Array.isArray(q.options) &&
      q.options.length === 4 &&
      q.options.every((o) => typeof o === 'string' && o.trim().length > 0) &&
      Number.isInteger(q.correctIdx) &&
      q.correctIdx >= 0 &&
      q.correctIdx < 4,
  )
  return out
}

/**
 * Returns 10 questions for the user, dedupe-aware.
 *
 * Strategy:
 *  1. Load every prompt this user has already seen (to forbid repeats).
 *  2. First fill from existing-but-unseen rows in QuizQuestion (cheap & fast).
 *  3. If we still need more, ask the AI to generate the gap, persist them,
 *     and use them. The seen-prompts list is sent to the AI as a blocklist.
 *  4. Mark all delivered questions as seen.
 *
 * For module mode we narrow to that module. For daily mode we cycle across
 * modules to give variety.
 */
export async function fetchQuizQuestions(
  userId: string,
  modeOrModule: string,
  count = 10,
): Promise<{ id: string; module: string; prompt: string; options: string[]; correctIdx: number; explanation: string | null }[]> {
  const isDaily = modeOrModule === 'daily'

  const seen = await prisma.userSeenQuestion.findMany({
    where: { userId },
    select: { questionId: true, question: { select: { prompt: true } } },
  })
  const seenIds = new Set(seen.map((s) => s.questionId))
  const seenPrompts = seen.map((s) => s.question.prompt)

  const moduleFilter = isDaily ? undefined : modeOrModule

  // Step 2: existing unseen.
  const cached = await prisma.quizQuestion.findMany({
    where: {
      ...(moduleFilter ? { module: moduleFilter } : {}),
      id: seenIds.size ? { notIn: [...seenIds] } : undefined,
    },
    take: count,
    orderBy: { createdAt: 'desc' },
  })

  let picked = [...cached]

  // Step 3: AI top-up.
  const need = count - picked.length
  if (need > 0) {
    if (isDaily) {
      // Round-robin across modules for variety.
      const perModule = Math.max(1, Math.ceil(need / Math.min(QUIZ_MODULES.length, need)))
      let remaining = need
      for (const mod of QUIZ_MODULES) {
        if (remaining <= 0) break
        const take = Math.min(perModule, remaining)
        const fresh = await generateAndPersist(mod.id, take, seenPrompts)
        picked = picked.concat(fresh)
        remaining -= fresh.length
      }
    } else {
      const fresh = await generateAndPersist(modeOrModule, need, seenPrompts)
      picked = picked.concat(fresh)
    }
  }

  // Trim to exactly `count`.
  picked = picked.slice(0, count)

  // Step 4: mark as seen up-front so they never repeat even if user abandons.
  if (picked.length) {
    await prisma.userSeenQuestion.createMany({
      data: picked.map((q) => ({ userId, questionId: q.id })),
      skipDuplicates: true,
    })
  }

  return picked.map((q) => ({
    id: q.id,
    module: q.module,
    prompt: q.prompt,
    options: q.options,
    correctIdx: q.correctIdx,
    explanation: q.explanation,
  }))
}

async function generateAndPersist(moduleId: string, count: number, seenPrompts: string[]) {
  const raw = await generateAIQuestions(moduleId, count, seenPrompts)
  if (!raw.length) return []
  // Persist; let DB assign UUIDs.
  await prisma.quizQuestion.createMany({
    data: raw.map((q) => ({
      module: moduleId,
      prompt: q.prompt,
      options: q.options,
      correctIdx: q.correctIdx,
      explanation: q.explanation || null,
    })),
  })
  // Re-read with IDs (createMany doesn't return rows on Postgres).
  const persisted = await prisma.quizQuestion.findMany({
    where: { module: moduleId, prompt: { in: raw.map((r) => r.prompt) } },
  })
  return persisted
}
