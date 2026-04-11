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
