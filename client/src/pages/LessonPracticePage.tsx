import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchLessons, startConversation } from '@/lib/api'
import { ConversationView } from '@/components/conversation/ConversationView'
import { MaskButton } from '@/components/ui/MaskButton'
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
      <div className="h-full overflow-y-auto flex items-center justify-center p-8" style={{ background: 'var(--sem-surface)' }}>
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary-50 flex items-center justify-center">
              <span className="text-3xl">📝</span>
            </div>
            <p className="text-xs tracking-[0.3em] uppercase font-medium mb-2" style={{ color: 'var(--sem-neutral-400)', fontFamily: 'var(--font-heading)' }}>
              Guided Lesson
            </p>
            <h1 className="font-black tracking-tight leading-tight mb-2" style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontFamily: 'var(--font-heading)', color: 'var(--sem-neutral-900)' }}>
              {lesson.name}
            </h1>
            <p className="text-sm text-neutral-400 mb-3">{lesson.objective}</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-xs font-semibold text-neutral-500 bg-neutral-100 px-3 py-1 rounded-full capitalize">{lesson.difficulty}</span>
              <span className="text-xs font-semibold text-neutral-500 bg-neutral-100 px-3 py-1 rounded-full">{lesson.maxExchanges} exchanges</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-neutral-100 p-8">
            <div className="mb-5">
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2 block">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full text-sm border border-neutral-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:border-primary-500 transition-all placeholder:text-neutral-400"
              />
            </div>

            <div className="mb-8">
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2 block">Level</label>
              <div className="grid grid-cols-3 gap-2">
                {(['beginner', 'intermediate', 'advanced'] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLevel(l)}
                    className={`py-2.5 rounded-2xl text-xs font-semibold capitalize transition-all cursor-pointer border ${
                      level === l ? 'border-primary-500 bg-primary-50 text-primary-600' : 'border-neutral-200 text-neutral-500 hover:border-neutral-300'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <MaskButton
              onClick={handleStart}
              disabled={!name.trim() || isStarting}
              fullWidth
              className="py-3.5 font-bold text-sm disabled:opacity-50"
            >
              {isStarting ? (
                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Starting…</>
              ) : 'Start Lesson'}
            </MaskButton>

            {error && <p className="text-xs text-rose-500 mt-3 text-center font-medium">{error}</p>}
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
