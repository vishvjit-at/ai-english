import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { GraduationCap, BookOpen, MessageSquare, Zap, ArrowRight, Flame, Sparkles } from 'lucide-react'
import { fetchLessons } from '@/lib/api'
import type { Lesson, LessonType } from '@/lib/types'

const TYPE_CONFIG: Record<LessonType, { icon: React.ReactNode; label: string; color: string }> = {
  grammar_focus: { icon: <BookOpen className="w-4 h-4" />, label: 'Grammar Focus', color: 'text-blue-600 bg-blue-50' },
  vocabulary_building: { icon: <MessageSquare className="w-4 h-4" />, label: 'Vocabulary Building', color: 'text-purple-600 bg-purple-50' },
  fluency_drill: { icon: <Zap className="w-4 h-4" />, label: 'Fluency Drill', color: 'text-primary-600 bg-primary-50' },
}

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'bg-primary-50 text-primary-600',
  intermediate: 'bg-amber-50 text-amber-600',
  advanced: 'bg-purple-50 text-purple-600',
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
    <div className="h-full overflow-y-auto bg-neutral-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-neutral-900">Guided Lessons</h1>
          </div>
          <div className="bg-orange-50 text-orange-600 text-sm font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5" />
            Daily Streak: 14 Days
          </div>
        </div>
        <p className="text-neutral-500 text-sm mb-8">Structured exercises to build specific English skills</p>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-0">
            {(Object.keys(grouped) as LessonType[]).map((type) => {
              const cfg = TYPE_CONFIG[type]
              return (
                <section key={type} className="mb-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${cfg.color}`}>
                        {cfg.icon}
                      </div>
                      <h2 className="text-lg font-semibold text-neutral-900">{cfg.label}</h2>
                    </div>
                    <button className="text-primary-600 text-sm font-medium hover:underline cursor-pointer">View All →</button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {grouped[type].map((lesson) => (
                      <Link
                        key={lesson.id}
                        to={`/lessons/${lesson.id}`}
                        className="bg-white rounded-2xl border border-neutral-100 p-5 hover:shadow-md transition-all cursor-pointer block"
                      >
                        {/* Top: difficulty + message count */}
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-medium capitalize px-2.5 py-0.5 rounded-full ${DIFFICULTY_COLORS[lesson.difficulty] || 'bg-neutral-100 text-neutral-500'}`}>
                            {lesson.difficulty}
                          </span>
                          <span className="text-xs text-neutral-400 flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" /> {lesson.maxExchanges}
                          </span>
                        </div>

                        {/* Title */}
                        <p className="font-semibold text-neutral-900 mt-2 mb-1">{lesson.name}</p>
                        <p className="text-neutral-500 text-sm">{lesson.description}</p>

                        {/* Bottom */}
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex -space-x-1">
                            {[1, 2, 3].map((n) => (
                              <div key={n} className="w-5 h-5 rounded-full bg-primary-100 border-2 border-white" />
                            ))}
                          </div>
                          <ArrowRight className="w-4 h-4 text-neutral-400" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        )}

        {/* CTA card */}
        <div className="bg-gradient-to-r from-primary-900 to-primary-700 rounded-2xl p-8 text-white flex items-center justify-between mt-2">
          <div>
            <p className="text-xl font-bold mb-2">Want a custom lesson?</p>
            <p className="text-primary-200 text-sm mb-4">
              Aria can build a personalised curriculum based on your specific industry or interests.
            </p>
            <button className="bg-white text-primary-900 font-semibold px-5 py-2.5 rounded-xl text-sm inline-flex items-center gap-2 hover:bg-primary-50 transition-colors cursor-pointer">
              <Sparkles className="w-4 h-4" /> Request AI Curriculum
            </button>
          </div>
          <Sparkles className="w-16 h-16 text-white/30 shrink-0" />
        </div>
      </div>
    </div>
  )
}
