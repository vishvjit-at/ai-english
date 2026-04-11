import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchLessons, startConversation } from '@/lib/api'
import { ConversationView } from '@/components/conversation/ConversationView'
import type { Lesson, UserContext } from '@/lib/types'

type Stage = 'loading' | 'setup' | 'conversation'

export function LessonPracticePage() {
  const { lessonId } = useParams<{ lessonId: string }>()
  const [stage, setStage] = useState<Stage>('loading')
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [starterMessage, setStarterMessage] = useState('')
  const [maxExchanges, setMaxExchanges] = useState<number | undefined>()
  const [error, setError] = useState('')

  // Simple setup: name + level (reuse from localStorage if available)
  const [name, setName] = useState(() => localStorage.getItem('aria_user_name') || '')
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner')
  const [isStarting, setIsStarting] = useState(false)

  useEffect(() => {
    fetchLessons().then((data) => {
      const found = data.lessons.find((l) => l.id === lessonId)
      if (found) {
        setLesson(found)
        setLevel(found.difficulty)
        setStage('setup')
      } else {
        setError('Lesson not found')
      }
    }).catch(() => setError('Failed to load lessons'))
  }, [lessonId])

  const handleStart = async () => {
    if (!lesson || !name.trim()) return
    setIsStarting(true)
    setError('')
    localStorage.setItem('aria_user_name', name)
    try {
      const ctx: UserContext = { name: name.trim(), level }
      const result = await startConversation(ctx, { lessonId: lesson.id })
      setStarterMessage(result.openingLine)
      setMaxExchanges(result.maxExchanges)
      setStage('conversation')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start lesson')
    } finally {
      setIsStarting(false)
    }
  }

  if (stage === 'loading') {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (error && !lesson) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4">
        <p className="text-rose-500 font-heading font-semibold">{error}</p>
        <Link to="/lessons" className="text-primary-600 text-sm font-heading font-semibold hover:underline">Back to Lessons</Link>
      </div>
    )
  }

  if (stage === 'setup' && lesson) {
    return (
      <div className="h-full overflow-y-auto bg-surface">
        <div className="max-w-md mx-auto px-5 py-12">
          <div className="text-center mb-8 animate-fade-in-up">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-100 to-primary-100 flex items-center justify-center">
              <span className="text-2xl">📝</span>
            </div>
            <h1 className="font-heading font-extrabold text-neutral-800 text-xl mb-2">{lesson.name}</h1>
            <p className="text-sm text-neutral-400 font-body">{lesson.objective}</p>
            <div className="flex items-center justify-center gap-3 mt-3">
              <span className="text-[10px] font-heading font-semibold text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full capitalize">{lesson.difficulty}</span>
              <span className="text-[10px] font-heading font-semibold text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full">{lesson.maxExchanges} exchanges</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-100 p-6 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
            <div className="mb-4">
              <label className="text-xs font-heading font-semibold text-neutral-600 mb-1.5 block">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full text-sm font-body bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-300/50 focus:border-primary-300 transition-all placeholder:text-neutral-300"
              />
            </div>

            <div className="mb-6">
              <label className="text-xs font-heading font-semibold text-neutral-600 mb-1.5 block">Level</label>
              <div className="grid grid-cols-3 gap-2">
                {(['beginner', 'intermediate', 'advanced'] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLevel(l)}
                    className={`py-2 rounded-xl text-xs font-heading font-semibold capitalize transition-all cursor-pointer border ${
                      level === l ? 'border-primary-300 bg-primary-50 text-primary-600' : 'border-neutral-100 text-neutral-500 hover:border-neutral-200'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleStart}
              disabled={!name.trim() || isStarting}
              className="w-full py-3 bg-gradient-to-br from-primary-400 to-primary-500 text-white rounded-xl font-heading font-semibold text-sm hover:shadow-md disabled:opacity-50 transition-all cursor-pointer"
            >
              {isStarting ? 'Starting...' : 'Start Lesson'}
            </button>

            {error && <p className="text-xs text-rose-500 font-body mt-3 text-center">{error}</p>}
          </div>
        </div>
      </div>
    )
  }

  if (stage === 'conversation' && lesson) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-hidden">
          <ConversationView
            config={{
              lessonId: lesson.id,
              scenarioName: lesson.name,
              topic: lesson.type,
              maxExchanges,
            }}
            userContext={{ name, level }}
            starterMessage={starterMessage}
            lessonObjective={lesson.objective}
          />
        </div>
      </div>
    )
  }

  return null
}
