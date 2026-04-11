import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { GraduationCap, BookOpen, MessageSquare, Zap, ArrowRight } from 'lucide-react'
import { fetchLessons } from '@/lib/api'
import type { Lesson, LessonType } from '@/lib/types'

const TYPE_CONFIG: Record<LessonType, { icon: React.ReactNode; label: string; color: string }> = {
  grammar_focus: { icon: <BookOpen className="w-4 h-4" />, label: 'Grammar Focus', color: 'text-blue-500 bg-blue-50 border-blue-100' },
  vocabulary_building: { icon: <MessageSquare className="w-4 h-4" />, label: 'Vocabulary Building', color: 'text-purple-500 bg-purple-50 border-purple-100' },
  fluency_drill: { icon: <Zap className="w-4 h-4" />, label: 'Fluency Drill', color: 'text-green-500 bg-green-50 border-green-100' },
}

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'bg-primary-50 text-primary-500',
  intermediate: 'bg-accent-50 text-accent-500',
  advanced: 'bg-tertiary-50 text-tertiary-500',
}

export function LessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLessons()
      .then((data) => setLessons(data.lessons))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const grouped = lessons.reduce<Record<LessonType, Lesson[]>>((acc, l) => {
    if (!acc[l.type]) acc[l.type] = []
    acc[l.type].push(l)
    return acc
  }, {} as Record<LessonType, Lesson[]>)

  return (
    <div className="h-full overflow-y-auto bg-surface">
      <div className="max-w-2xl mx-auto px-5 py-8 sm:py-12">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8 animate-fade-in-up">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center shadow-sm">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-neutral-800 text-xl">Guided Lessons</h1>
            <p className="text-xs text-neutral-400 font-body">Structured exercises to build specific skills</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {(Object.keys(grouped) as LessonType[]).map((type, gi) => {
              const cfg = TYPE_CONFIG[type]
              return (
                <section key={type} className="animate-fade-in-up" style={{ animationDelay: `${gi * 0.05}s` }}>
                  <div className="flex items-center gap-2 mb-4">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${cfg.color}`}>
                      {cfg.icon}
                    </div>
                    <h2 className="font-heading font-bold text-neutral-700 text-sm">{cfg.label}</h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {grouped[type].map((lesson) => (
                      <Link
                        key={lesson.id}
                        to={`/lessons/${lesson.id}`}
                        className="group bg-white rounded-2xl border border-neutral-100 p-5 hover:border-primary-200 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-heading font-semibold text-neutral-700 text-sm">{lesson.name}</p>
                          <span className={`text-[9px] font-heading font-semibold capitalize px-1.5 py-0.5 rounded-full shrink-0 ${DIFFICULTY_COLORS[lesson.difficulty] || ''}`}>
                            {lesson.difficulty.slice(0, 3)}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400 font-body mb-3">{lesson.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-neutral-300 font-body">{lesson.maxExchanges} exchanges</span>
                          <span className="text-xs text-primary-500 font-heading font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            Start <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
