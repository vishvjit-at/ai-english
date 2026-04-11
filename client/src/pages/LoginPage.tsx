import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Mic, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export function LoginPage() {
  const { user, loading, signInWithGoogle, signInWithEmail } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white">
        <div className="w-8 h-8 border-2 border-green-200 border-t-green-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (user) return <Navigate to="/" replace />

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    setIsSubmitting(true)
    setError('')
    const { error: err } = await signInWithEmail(email, password)
    if (err) setError(err)
    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-green-400/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-400/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="bg-white rounded-3xl shadow-xl p-10 w-full max-w-md relative z-10 mx-4">
        {/* Logo */}
        <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <Mic className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 text-center">Aria AI</h1>
        <p className="text-sm text-slate-400 text-center mb-8">Your English Partner</p>

        {/* Google OAuth */}
        <button
          onClick={signInWithGoogle}
          className="w-full flex items-center justify-center gap-3 border border-slate-200 rounded-xl py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </button>

        {/* OR divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-slate-100" />
          <span className="text-xs text-slate-400">OR EMAIL</span>
          <div className="flex-1 h-px bg-slate-100" />
        </div>

        {/* Email form */}
        <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 placeholder:text-slate-400 transition-colors"
              />
            </div>
          </div>
          <div>
            <div className="relative mb-1.5">
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <Link to="/forgot-password" className="absolute right-0 top-0 text-xs text-green-600 hover:underline">
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 placeholder:text-slate-400 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting || !email || !password}
            className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl py-3 font-semibold mt-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-green-600 font-semibold hover:underline">Sign Up</Link>
        </p>

        {/* Status indicator */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-2">
          <span className="w-2 h-2 bg-green-400 rounded-full" />
          <span className="text-xs text-slate-400">SYSTEMS OPERATIONAL</span>
        </div>
      </div>
    </div>
  )
}
