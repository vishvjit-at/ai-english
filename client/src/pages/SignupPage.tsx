import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Mic, Mail, Lock, User } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export function SignupPage() {
  const { user, loading, signInWithGoogle, signUp } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-surface">
        <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (user) return <Navigate to="/" replace />

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !password) return
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setIsSubmitting(true)
    setError('')
    const { error: err } = await signUp(email, password, name)
    if (err) setError(err)
    else setSuccess(true)
    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center shadow-md">
            <Mic className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-heading font-extrabold text-neutral-800 text-2xl">SpeakUp</h1>
          <p className="text-sm text-neutral-400 font-body mt-1">with Aria</p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-100 p-6 shadow-sm animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
          <h2 className="font-heading font-bold text-neutral-700 text-lg mb-6 text-center">Create your account</h2>

          {success ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-500 text-xl">✓</span>
              </div>
              <p className="text-sm text-neutral-600 font-body mb-2">Account created!</p>
              <p className="text-xs text-neutral-400 font-body mb-4">Check your email to confirm, then sign in.</p>
              <Link to="/login" className="text-primary-500 font-heading font-semibold text-sm hover:underline">
                Go to Sign In
              </Link>
            </div>
          ) : (
            <>
              {/* Google OAuth */}
              <button
                onClick={signInWithGoogle}
                className="w-full flex items-center justify-center gap-3 py-3 border border-neutral-200 rounded-xl font-heading font-semibold text-sm text-neutral-600 hover:bg-neutral-50 hover:border-neutral-300 transition-all cursor-pointer mb-4"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-neutral-100" />
                <span className="text-xs text-neutral-300 font-heading">or</span>
                <div className="flex-1 h-px bg-neutral-100" />
              </div>

              <form onSubmit={handleSignup} className="flex flex-col gap-3">
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300" />
                  <input
                    type="text"
                    placeholder="Full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-sm font-body bg-neutral-50 border border-neutral-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-300/50 focus:border-primary-300 transition-all placeholder:text-neutral-300"
                  />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300" />
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-sm font-body bg-neutral-50 border border-neutral-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-300/50 focus:border-primary-300 transition-all placeholder:text-neutral-300"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300" />
                  <input
                    type="password"
                    placeholder="Password (min 6 chars)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-sm font-body bg-neutral-50 border border-neutral-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-300/50 focus:border-primary-300 transition-all placeholder:text-neutral-300"
                  />
                </div>

                {error && <p className="text-xs text-red-500 font-body">{error}</p>}

                <button
                  type="submit"
                  disabled={isSubmitting || !name || !email || !password}
                  className="w-full py-3 bg-gradient-to-br from-primary-400 to-primary-500 text-white rounded-xl font-heading font-semibold text-sm hover:shadow-md disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isSubmitting ? 'Creating account...' : 'Create Account'}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-xs text-neutral-400 font-body mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-500 font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
