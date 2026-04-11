import { Mic, Sparkles, MessageCircle, Volume2, BookOpen, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export function HomePage() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="min-h-full bg-surface flex flex-col">
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="max-w-xl text-center animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-300 to-primary-500 rounded-3xl mb-8 shadow-lg shadow-primary-300/30 animate-float">
              <Mic className="w-10 h-10 text-white" />
            </div>

            <h1 className="font-heading text-4xl sm:text-5xl lg:text-[56px] font-extrabold text-neutral-800 tracking-tight mb-5 leading-[1.08]">
              Your safe space to<br />
              <span className="bg-gradient-to-r from-primary-500 to-primary-400 bg-clip-text text-transparent">
                practice English
              </span>
            </h1>

            <p className="text-lg text-neutral-400 max-w-md mx-auto font-body leading-relaxed mb-10">
              Talk with Aria — she's patient, encouraging, and never judges. Pick a scenario from the sidebar or create your own.
            </p>

            <Link to="/practice/custom">
              <button className="inline-flex items-center gap-2.5 bg-gradient-to-r from-primary-400 to-primary-500 text-white px-7 py-3.5 rounded-2xl font-heading font-bold text-[15px] shadow-lg shadow-primary-400/20 hover:shadow-xl hover:shadow-primary-400/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer">
                <Sparkles className="w-5 h-5" />
                Create Your Scenario
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-14">
              <div className="bg-white rounded-2xl border border-neutral-100 p-5 text-left hover:shadow-md hover:shadow-primary-100/50 hover:-translate-y-0.5 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
                <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center mb-3">
                  <MessageCircle className="w-5 h-5 text-primary-500" />
                </div>
                <h3 className="font-heading font-bold text-neutral-700 text-sm mb-1">Voice + Text</h3>
                <p className="text-xs text-neutral-400 font-body leading-relaxed">
                  Speak or type — Aria responds naturally and corrects gently.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-neutral-100 p-5 text-left hover:shadow-md hover:shadow-accent-100/50 hover:-translate-y-0.5 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
                <div className="w-10 h-10 rounded-xl bg-accent-100 flex items-center justify-center mb-3">
                  <Volume2 className="w-5 h-5 text-accent-400" />
                </div>
                <h3 className="font-heading font-bold text-neutral-700 text-sm mb-1">Real Scenarios</h3>
                <p className="text-xs text-neutral-400 font-body leading-relaxed">
                  Interviews, daily life, college — practice what matters most.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-neutral-100 p-5 text-left hover:shadow-md hover:shadow-tertiary-100/50 hover:-translate-y-0.5 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.35s' }}>
                <div className="w-10 h-10 rounded-xl bg-tertiary-100 flex items-center justify-center mb-3">
                  <BookOpen className="w-5 h-5 text-tertiary-400" />
                </div>
                <h3 className="font-heading font-bold text-neutral-700 text-sm mb-1">Gentle Feedback</h3>
                <p className="text-xs text-neutral-400 font-body leading-relaxed">
                  No red marks — just friendly tips to help you improve naturally.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="py-4 text-center shrink-0">
          <p className="text-[11px] text-neutral-300 font-heading">
            100% free &middot; No sign-up &middot; Powered by Groq
          </p>
        </div>
      </div>
    </div>
  )
}
