import { Mic, Sparkles, MessageCircle, Volume2, BookOpen, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export function HomePage() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="min-h-full flex flex-col items-center justify-center py-16 px-8 text-center">
        <h1 className="text-5xl font-bold text-slate-900 leading-tight mb-4">
          Your safe space to<br />
          <span className="text-green-600">practice English</span>
        </h1>

        <p className="text-slate-500 text-lg max-w-lg mx-auto mb-10">
          Talk with Aria — she's patient, encouraging, and never judges. Pick a scenario from the sidebar or create your own.
        </p>

        {/* Mic button */}
        <div className="w-24 h-24 bg-green-600 hover:bg-green-700 rounded-full shadow-xl shadow-green-600/30 flex items-center justify-center mx-auto cursor-pointer transition-all hover:scale-105 active:scale-95">
          <Mic className="w-10 h-10 text-white" />
        </div>
        <p className="text-xs tracking-[0.2em] text-slate-400 mt-3 mb-6">TAP TO SPEAK</p>

        <Link to="/practice/custom">
          <button className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-3.5 rounded-xl font-semibold shadow-lg shadow-green-600/20 transition-colors cursor-pointer">
            <Sparkles className="w-5 h-5" />
            Create Your Scenario
            <ArrowRight className="w-4 h-4" />
          </button>
        </Link>

        {/* Feature cards */}
        <div className="grid grid-cols-3 gap-6 mt-16 max-w-3xl w-full">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 text-left shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600 mb-4">
              <MessageCircle className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Voice + Text</h3>
            <p className="text-slate-500 text-sm">
              Speak or type — Aria responds naturally and corrects gently.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-6 text-left shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600 mb-4">
              <Volume2 className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Real Scenarios</h3>
            <p className="text-slate-500 text-sm">
              Interviews, daily life, college — practice what matters most.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-6 text-left shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600 mb-4">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Gentle Feedback</h3>
            <p className="text-slate-500 text-sm">
              No red marks — just friendly tips to help you improve naturally.
            </p>
          </div>
        </div>

        <p className="mt-16 text-xs text-slate-400 tracking-wider">
          100% FREE &middot; NO SIGN-UP &middot; POWERED BY GROQ
        </p>
      </div>
    </div>
  )
}
