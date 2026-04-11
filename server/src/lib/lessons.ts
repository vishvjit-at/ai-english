export type LessonType = 'grammar_focus' | 'vocabulary_building' | 'fluency_drill'
export type Difficulty = 'beginner' | 'intermediate' | 'advanced'

export interface Lesson {
  id: string
  name: string
  description: string
  type: LessonType
  difficulty: Difficulty
  objective: string
  maxExchanges: number
  targetSkills: string[]
  systemPromptExtras: string
  scoringCriteria: string
}

export const lessons: Lesson[] = [
  {
    id: 'articles_101',
    name: 'Articles: A, An, The',
    description: 'Practice using articles correctly in everyday sentences.',
    type: 'grammar_focus',
    difficulty: 'beginner',
    objective: 'Use a, an, and the correctly in 5 sentences.',
    maxExchanges: 6,
    targetSkills: ['articles', 'determiners'],
    systemPromptExtras: `This is a GUIDED LESSON focused on articles (a, an, the).
Your job:
- Ask the user questions that require them to use articles in their answer.
- Focus ALL feedback on article usage specifically.
- After each response, ask a new question that tests a different article rule.
- Examples: "Describe what you see on your desk", "Tell me about your morning routine"
- Keep track: after 5 user responses, wrap up with encouragement.`,
    scoringCriteria: 'Score based primarily on correct article usage (a/an/the). Count how many of their 5+ sentences used articles correctly.',
  },
  {
    id: 'past_tense',
    name: 'Past Tense Practice',
    description: 'Tell stories about yesterday using correct past tense.',
    type: 'grammar_focus',
    difficulty: 'beginner',
    objective: 'Describe past events using correct past tense forms.',
    maxExchanges: 6,
    targetSkills: ['past tense', 'irregular verbs'],
    systemPromptExtras: `This is a GUIDED LESSON focused on past tense.
Ask the user to tell you about things that happened yesterday or last week.
Focus ALL feedback on past tense usage. Gently correct present-tense when past is needed.
Ask follow-up questions that require past tense: "What did you eat?", "How did you get there?"`,
    scoringCriteria: 'Score based on correct past tense usage. Note irregular verbs used correctly vs incorrectly.',
  },
  {
    id: 'vocab_food',
    name: 'Food & Restaurant Vocabulary',
    description: 'Learn and use 10 food-related words and phrases.',
    type: 'vocabulary_building',
    difficulty: 'beginner',
    objective: 'Use 10 food-related vocabulary words in conversation.',
    maxExchanges: 8,
    targetSkills: ['food vocabulary', 'ordering', 'descriptions'],
    systemPromptExtras: `This is a VOCABULARY BUILDING lesson about food and restaurants.
Target words to teach: appetizer, entrée, portion, seasoning, beverage, garnish, cuisine, dietary, savory, delicacy.
Introduce 1-2 words per exchange. Use them in your questions naturally.
After introducing a word, ask the user to use it in a sentence.
Track which words they've successfully used.`,
    scoringCriteria: 'Score based on how many of the target vocabulary words the user successfully used in context.',
  },
  {
    id: 'rapid_qa',
    name: 'Quick Response Drill',
    description: 'Answer rapid-fire questions to build fluency and confidence.',
    type: 'fluency_drill',
    difficulty: 'intermediate',
    objective: 'Respond quickly and naturally to 10 rapid-fire questions.',
    maxExchanges: 10,
    targetSkills: ['fluency', 'response time', 'natural speech'],
    systemPromptExtras: `This is a FLUENCY DRILL. Ask rapid-fire questions — one per turn.
Mix question types: opinion, description, comparison, hypothetical.
Do NOT give grammar feedback during this drill. Always set feedback.show = false.
Your response should only be brief acknowledgment + next question.
Keep it fast-paced and fun. Examples: "What's better, pizza or sushi?", "Describe your room in 10 words."`,
    scoringCriteria: 'Score based on fluency and naturalness of responses, not grammar. Did they answer all questions? Were responses complete sentences?',
  },
  {
    id: 'prepositions',
    name: 'Preposition Power',
    description: 'Master common prepositions: in, on, at, by, for, with.',
    type: 'grammar_focus',
    difficulty: 'intermediate',
    objective: 'Use prepositions correctly in various contexts.',
    maxExchanges: 7,
    targetSkills: ['prepositions', 'in/on/at', 'prepositional phrases'],
    systemPromptExtras: `This is a GUIDED LESSON focused on prepositions (in, on, at, by, for, with).
Ask questions that naturally require prepositions: locations, times, methods.
Focus ALL feedback on preposition usage. Common errors: "in Monday" vs "on Monday", "at the morning" vs "in the morning".
After each response, ask about a different preposition context: time, place, method.`,
    scoringCriteria: 'Score based on correct preposition usage. Note specific preposition errors and corrections.',
  },
]

export function getLesson(id: string): Lesson | undefined {
  return lessons.find((l) => l.id === id)
}

export function getAllLessons() {
  return lessons
}
