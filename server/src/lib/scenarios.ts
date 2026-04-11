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

export const scenarios: Record<PredefinedTopicKey, Scenario[]> = {
  job_interview: [
    {
      id: 'intro',
      name: 'Tell Me About Yourself',
      description: 'Practice the most common interview opener with confidence.',
      starterQuestion: '',
      difficulty: 'intermediate',
      topic: 'job_interview',
      tags: ['career', 'formal', 'introduction'],
    },
    {
      id: 'strengths',
      name: 'Strengths & Weaknesses',
      description: 'Learn to talk about yourself positively and honestly.',
      starterQuestion: '',
      difficulty: 'intermediate',
      topic: 'job_interview',
      tags: ['career', 'formal', 'self-awareness'],
    },
    {
      id: 'why_company',
      name: 'Why This Company?',
      description: 'Show genuine interest and research in your target company.',
      starterQuestion: '',
      difficulty: 'advanced',
      topic: 'job_interview',
      tags: ['career', 'formal', 'research'],
    },
  ],
  daily_life: [
    {
      id: 'restaurant',
      name: 'Ordering at a Restaurant',
      description: 'Practice ordering food and asking questions in English.',
      starterQuestion: '',
      difficulty: 'beginner',
      topic: 'daily_life',
      tags: ['casual', 'food', 'social'],
    },
    {
      id: 'doctor',
      name: 'Talking to a Doctor',
      description: 'Describe your symptoms and understand medical advice clearly.',
      starterQuestion: '',
      difficulty: 'beginner',
      topic: 'daily_life',
      tags: ['health', 'formal', 'vocabulary'],
    },
    {
      id: 'shopping',
      name: 'Bargaining at a Market',
      description: 'Practice negotiating prices and asking about products.',
      starterQuestion: '',
      difficulty: 'beginner',
      topic: 'daily_life',
      tags: ['casual', 'shopping', 'negotiation'],
    },
  ],
  college: [
    {
      id: 'presentation',
      name: 'Giving a Class Presentation',
      description: 'Practice presenting your ideas clearly in front of an audience.',
      starterQuestion: '',
      difficulty: 'intermediate',
      topic: 'college',
      tags: ['academic', 'formal', 'public speaking'],
    },
    {
      id: 'professor',
      name: 'Talking to Your Professor',
      description: 'Ask for help, extensions, or clarifications professionally.',
      starterQuestion: '',
      difficulty: 'beginner',
      topic: 'college',
      tags: ['academic', 'formal', 'respect'],
    },
    {
      id: 'group',
      name: 'Group Project Discussion',
      description: 'Share ideas, assign tasks, and collaborate in English.',
      starterQuestion: '',
      difficulty: 'intermediate',
      topic: 'college',
      tags: ['academic', 'casual', 'teamwork'],
    },
  ],
}

export const customScenario: Scenario = {
  id: 'custom',
  name: 'Your Own Scenario',
  description: 'Describe any situation and practice it in English',
  starterQuestion: '',
  difficulty: 'intermediate',
  topic: 'custom',
  tags: ['custom'],
}

export function getScenario(scenarioId: string): Scenario | undefined {
  if (scenarioId === 'custom') return customScenario
  for (const topic of Object.values(scenarios)) {
    const found = topic.find((s) => s.id === scenarioId)
    if (found) return found
  }
  return undefined
}

export function getAllScenarios() {
  return {
    scenarios,
    customScenario,
  }
}
