import type {
  AriaResponse,
  Scenario,
  PredefinedTopicKey,
  UserContext,
  Lesson,
  SessionListItem,
  SessionDetail,
  SessionSummary,
  ProgressData,
  SaveSessionPayload,
  VocabularyItem,
  VocabEvaluation,
  DifficultyRecommendation,
} from './types'
import { supabase } from './supabase'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

async function authHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) return {}
  return { Authorization: `Bearer ${session.access_token}` }
}

async function get(path: string) {
  const res = await fetch(`${API_BASE}${path}`, { headers: await authHeaders() })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || `Request failed: ${path}`)
  }
  return res.json()
}

async function post(path: string, body?: unknown) {
  const headers: Record<string, string> = { ...(await authHeaders()) }
  const opts: RequestInit = { method: 'POST', headers }
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    opts.body = JSON.stringify(body)
  }
  const res = await fetch(`${API_BASE}${path}`, opts)
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || `Request failed: ${path}`)
  }
  return res.json()
}

async function patch(path: string, body: unknown) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`Request failed: ${path}`)
  return res.json()
}

async function del(path: string) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'DELETE',
    headers: await authHeaders(),
  })
  if (!res.ok) throw new Error(`Request failed: ${path}`)
}

// ── Scenarios & Lessons ──

export async function fetchScenarios(): Promise<{
  scenarios: Record<PredefinedTopicKey, Scenario[]>
  customScenario: Scenario
}> {
  return get('/scenarios')
}

export async function fetchLessons(): Promise<{ lessons: Lesson[] }> {
  return get('/lessons')
}

// ── Conversation ──

export async function startConversation(
  userContext: UserContext,
  opts: { scenarioId?: string; lessonId?: string }
): Promise<{ openingLine: string; maxExchanges?: number }> {
  return post('/conversation/start', { ...opts, userContext })
}

export async function sendMessage(
  message: string,
  userContext: UserContext,
  history: { role: string; content: string }[],
  opts: { scenarioId?: string; lessonId?: string }
): Promise<AriaResponse> {
  return post('/conversation', { message, ...opts, userContext, history })
}

// ── Sessions ──

export async function saveSession(data: SaveSessionPayload): Promise<{ sessionId: string }> {
  return post('/sessions', data)
}

export async function generateSummary(sessionId: string): Promise<{ summary: SessionSummary }> {
  return post(`/sessions/${sessionId}/summary`)
}

export async function fetchSessions(limit = 20, offset = 0): Promise<{ sessions: SessionListItem[]; total: number }> {
  return get(`/sessions?limit=${limit}&offset=${offset}`)
}

export async function fetchSession(id: string): Promise<{ session: SessionDetail }> {
  return get(`/sessions/${id}`)
}

export async function deleteSession(id: string): Promise<void> {
  await del(`/sessions/${id}`)
}

// ── Progress ──

export async function fetchProgress(): Promise<ProgressData> {
  return get('/progress')
}

export async function fetchDifficultyRecommendation(): Promise<DifficultyRecommendation> {
  return get('/progress/recommendation')
}

// ── Vocabulary ──

export async function fetchVocabulary(mastered?: boolean): Promise<{ vocabulary: VocabularyItem[] }> {
  const params = mastered !== undefined ? `?mastered=${mastered}` : ''
  return get(`/vocabulary${params}`)
}

export async function updateVocabulary(id: string, data: { mastered: boolean }): Promise<void> {
  await patch(`/vocabulary/${id}`, data)
}

export async function deleteVocabulary(id: string): Promise<void> {
  await del(`/vocabulary/${id}`)
}

export async function fetchVocabularyForReview(limit = 10): Promise<{ words: VocabularyItem[] }> {
  return get(`/vocabulary/review?limit=${limit}`)
}

export async function evaluateVocabulary(
  id: string,
  word: string,
  sentence: string
): Promise<{ evaluation: VocabEvaluation; vocabulary: VocabularyItem }> {
  return post(`/vocabulary/${id}/evaluate`, { word, sentence })
}

// ── Quiz ──

export interface QuizModuleInfo {
  id: string
  label: string
  icon: string
  description: string
  seen: number
}
export interface QuizQuestionPublic {
  id: string
  module: string
  prompt: string
  options: string[]
}
export interface QuizResultRow {
  questionId: string
  prompt: string
  options: string[]
  chosenIdx: number
  correctIdx: number
  correct: boolean
  explanation: string | null
}
export interface QuizAttemptHistory {
  id: string
  module: string
  mode: 'module' | 'daily'
  score: number
  total: number
  finishedAt: string
  moduleLabel: string
}

export async function fetchQuizModules(): Promise<{ modules: QuizModuleInfo[]; dailyDoneToday: boolean }> {
  return get('/quiz/modules')
}
export async function startQuiz(moduleId: string): Promise<{ attemptId: string; module: string; questions: QuizQuestionPublic[] }> {
  return post('/quiz/start', { module: moduleId })
}
export async function submitQuiz(attemptId: string, answers: { questionId: string; chosenIdx: number }[]): Promise<{ attemptId: string; score: number; total: number; results: QuizResultRow[] }> {
  return post('/quiz/submit', { attemptId, answers })
}
export async function fetchQuizHistory(): Promise<{ attempts: QuizAttemptHistory[] }> {
  return get('/quiz/history')
}

export async function fetchUserPreferences(): Promise<{ preferences: Record<string, unknown> | null }> {
  return get('/user/preferences')
}
export async function patchUserPreferences(partial: Record<string, unknown>): Promise<{ preferences: Record<string, unknown> }> {
  return patch('/user/preferences', partial)
}
