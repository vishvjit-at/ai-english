export interface UserContext {
  name: string
  level: 'beginner' | 'intermediate' | 'advanced'
  targetRole?: string
  targetCompany?: string
  yearsOfExperience?: string
  situationDetail?: string
  subject?: string
  collegeName?: string
  customScenario?: string
}

export interface FeedbackData {
  show: boolean
  original: string
  improved: string
  tip: string
}

export interface AriaResponse {
  response: string
  feedback: FeedbackData
  followUpQuestion: string
  emotionalTone: 'encouraging' | 'neutral' | 'celebratory'
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  feedback?: FeedbackData
  timestamp: Date
}

export type Difficulty = 'beginner' | 'intermediate' | 'advanced'
export type TopicKey = 'job_interview' | 'daily_life' | 'college' | 'custom'
export type PredefinedTopicKey = Exclude<TopicKey, 'custom'>

export interface Scenario {
  id: string
  name: string
  description: string
  starterQuestion: string
  difficulty: Difficulty
  topic: TopicKey
  tags: string[]
}

// ── Session & Progress types ──

export interface SessionListItem {
  id: string
  scenarioId: string
  scenarioName: string
  topic: string
  startedAt: string
  durationSecs: number | null
  messageCount: number
  overallScore: number | null
}

export interface SessionSummary {
  id: string
  sessionId: string
  overallScore: number
  fluencyAssessment: string
  grammarSummary: string
  vocabHighlights: string[]
  areasToImprove: string[]
  encouragement: string
  createdAt: string
}

export interface SessionDetail {
  id: string
  scenarioId: string
  scenarioName: string
  topic: string
  userContext: UserContext
  startedAt: string
  endedAt: string | null
  durationSecs: number | null
  messageCount: number
  messages: Array<{
    id: string
    role: string
    content: string
    feedback: FeedbackData | null
    createdAt: string
  }>
  summary: SessionSummary | null
  vocabulary: VocabularyItem[]
}

export interface VocabularyItem {
  id: string
  word: string
  context: string | null
  definition: string | null
  mastered: boolean
  reviewCount: number
  lastReviewAt: string | null
  createdAt: string
}

export interface VocabEvaluation {
  correct: boolean
  feedback: string
  exampleSentence: string
}

export interface DifficultyRecommendation {
  currentLevel: Difficulty
  recommendedLevel: Difficulty
  reason: string
  recentScores: number[]
  shouldShow: boolean
}

export interface ProgressData {
  totalSessions: number
  totalMinutes: number
  totalMessages: number
  averageScore: number | null
  currentStreak: number
  longestStreak: number
  topicBreakdown: Record<string, number>
  scoreHistory: Array<{ date: string; score: number; scenarioName: string }>
  recentWeakAreas: Array<{ area: string; count: number }>
  grammarCorrectionRate: number
}

export type LessonType = 'grammar_focus' | 'vocabulary_building' | 'fluency_drill'

export interface Lesson {
  id: string
  name: string
  description: string
  type: LessonType
  difficulty: Difficulty
  objective: string
  maxExchanges: number
  targetSkills: string[]
}

export interface SaveSessionPayload {
  scenarioId: string
  scenarioName: string
  topic: string
  userContext: UserContext
  startedAt: string
  messages: Array<{
    role: string
    content: string
    feedback?: FeedbackData | null
    createdAt: string
  }>
}
