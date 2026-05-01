// Hand-picked quiz modules. Adding/removing here is the only thing
// needed to surface a new module in the UI; the AI generator handles content.

export interface QuizModule {
  id: string
  label: string
  icon: string
  description: string
  topicHint: string // injected verbatim into the AI prompt
}

export const QUIZ_MODULES: QuizModule[] = [
  {
    id: 'articles',
    label: 'Articles',
    icon: '🅰️',
    description: 'a, an, the — when each fits and when to drop them.',
    topicHint: 'English articles (a, an, the, and zero article). Cover countable/uncountable nouns, vowel sounds, definite vs indefinite, generic vs specific reference.',
  },
  {
    id: 'tenses',
    label: 'Tenses',
    icon: '⏳',
    description: 'Past, present, future, perfect — pick the right form.',
    topicHint: 'English verb tenses: simple/continuous/perfect across past, present, future. Include tense consistency, time markers (since/for/ago), and reported speech tense shifts.',
  },
  {
    id: 'prepositions',
    label: 'Prepositions',
    icon: '🧭',
    description: 'in, on, at, by, with — the small words that trip everyone up.',
    topicHint: 'English prepositions of time, place, direction, and dependent prepositions in collocations (e.g. "interested in", "good at").',
  },
  {
    id: 'subject_verb',
    label: 'Subject–Verb Agreement',
    icon: '🤝',
    description: 'Match the subject and verb, even when the subject is tricky.',
    topicHint: 'Subject–verb agreement, including collective nouns, indefinite pronouns (everyone/nobody), "either/neither…or", quantifiers, and intervening phrases.',
  },
  {
    id: 'vocabulary',
    label: 'Vocabulary Builder',
    icon: '📖',
    description: 'Common words, meanings, and how they fit in real sentences.',
    topicHint: 'Common-to-intermediate English vocabulary. Test meanings, synonyms, antonyms, and contextual usage of single words.',
  },
  {
    id: 'business',
    label: 'Business English',
    icon: '💼',
    description: 'Workplace phrases — meetings, emails, negotiation.',
    topicHint: 'Professional/business English: workplace vocabulary, meeting language, polite email phrasing, negotiation, presentations, and business idioms.',
  },
  {
    id: 'idioms',
    label: 'Idioms & Expressions',
    icon: '🗣️',
    description: 'Figurative phrases that don\'t mean what they say.',
    topicHint: 'Common English idioms and figurative expressions. Test the meaning or correct usage of idiomatic phrases.',
  },
  {
    id: 'common_mistakes',
    label: 'Common Mistakes',
    icon: '⚠️',
    description: 'Their/there, affect/effect, and other classic confusions.',
    topicHint: 'Frequently confused word pairs and common English mistakes (their/there/they\'re, affect/effect, fewer/less, who/whom, lay/lie, principle/principal, etc.).',
  },
]

export const MODULE_BY_ID = Object.fromEntries(QUIZ_MODULES.map((m) => [m.id, m])) as Record<string, QuizModule>
