import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Mic, Mail, Lock, User } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { MaskButton } from '@/components/ui/MaskButton'

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
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--sem-surface)' }}>
        <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
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

  const inputClass = 'w-full border border-neutral-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:border-primary-500 placeholder:text-neutral-400 transition-colors'

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--sem-surface)' }}>
      {/* Left panel — desktop only */}
      <div className="hidden lg:flex w-5/12 p-12 flex-col text-white" style={{ background: 'linear-gradient(135deg, var(--sem-primary-900), var(--sem-primary-700))' }}>
        <div className="flex items-center gap-2 animate-slide-in-left delay-0">
          <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
            <Mic className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold">SpeakUp</span>
        </div>

        <div className="mt-auto mb-auto">
          <p className="text-xs tracking-[0.3em] uppercase font-medium mb-4 opacity-60">Your English Partner</p>
          <h2 className="font-black leading-tight mb-4 animate-slide-in-left delay-200" style={{ fontSize: 'clamp(2rem, 3vw, 2.8rem)', fontFamily: 'var(--font-heading)' }}>
            Unlock your<br />potential in<br />English
          </h2>
          <p className="text-lg mb-12 opacity-80">
            Practice with an AI tutor that's always patient, always available.
          </p>

          <div className="bg-white/10 backdrop-blur rounded-2xl p-6 animate-slide-in-left delay-400">
            <p className="text-sm leading-relaxed mb-4 opacity-90">
              "SpeakUp helped me feel confident speaking English at work. After just 2 weeks, I gave my first presentation in English!"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: 'var(--sem-primary-500)' }}>A</div>
              <div>
                <p className="text-white text-sm font-semibold">Ananya S.</p>
                <p className="text-xs opacity-60">Software Engineer</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col relative overflow-hidden" style={{ background: 'var(--sem-surface)' }}>
        {/* Mobile background blobs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none lg:hidden" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none lg:hidden" />

        <div className="flex-1 flex items-center justify-center p-5 sm:p-8 lg:p-12">
          <div className="bg-white rounded-3xl border border-neutral-100 p-6 sm:p-10 w-full max-w-md relative z-10 lg:bg-transparent lg:border-0 lg:p-0 lg:rounded-none">
            {/* Mobile logo */}
            <div className="flex flex-col items-center mb-6 lg:hidden animate-slide-in-down">
              <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center mb-4">
                <Mic className="w-7 h-7 text-white" />
              </div>
            </div>

            <p className="text-xs tracking-[0.3em] uppercase font-medium mb-2" style={{ color: 'var(--sem-neutral-400)', fontFamily: 'var(--font-heading)' }}>
              Join Today
            </p>
            <h1 className="font-black tracking-tight leading-none mb-8 animate-slide-in-up delay-100" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontFamily: 'var(--font-heading)', color: 'var(--sem-neutral-900)' }}>
              Create<br />Account
            </h1>

            {success ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary-50 rounded-3xl flex items-center justify-center">
                  <span className="text-primary-500 text-2xl font-black">✓</span>
                </div>
                <h2 className="font-black text-neutral-700 text-xl mb-2">Account created!</h2>
                <p className="text-sm text-neutral-400 mb-6">Check your email to confirm, then sign in.</p>
                <Link to="/login" className="bg-primary-600 text-white px-7 py-3 rounded-full text-sm font-semibold hover-glow inline-block">
                  Go to Sign In
                </Link>
              </div>
            ) : (
              <>
                {/* Google OAuth */}
                <button
                  onClick={signInWithGoogle}
                  className="w-full flex items-center justify-center gap-3 border border-neutral-200 rounded-2xl py-3.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer hover-lift mb-6 bg-white animate-slide-in-up delay-150"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continue with Google
                </button>

                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-1 h-px bg-neutral-100" />
                  <span className="text-xs text-neutral-400 font-medium tracking-wider">OR EMAIL</span>
                  <div className="flex-1 h-px bg-neutral-100" />
                </div>

                <form onSubmit={handleSignup} className="flex flex-col gap-4 animate-slide-in-up delay-250">
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoComplete="name"
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="password"
                      placeholder="Password (min 6 chars)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                      className={`${inputClass} pl-10`}
                    />
                  </div>

                  {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

                  <MaskButton
                    type="submit"
                    disabled={isSubmitting || !name || !email || !password}
                    fullWidth
                    wrapperClassName="mt-2"
                    className="py-3.5 font-bold"
                  >
                    {isSubmitting ? 'Creating account…' : 'Create Account'}
                  </MaskButton>
                </form>

                <p className="text-center text-sm text-neutral-500 mt-6 animate-fade-in delay-400">
                  Already have an account?{' '}
                  <Link to="/login" className="text-primary-600 font-bold hover:underline">Sign in</Link>
                </p>
              </>
            )}
          </div>
        </div>

        <div className="flex justify-between text-xs text-neutral-400 px-8 py-4">
          <span>© 2026 SpeakUp</span>
          <span>Privacy · Terms</span>
        </div>
      </div>
    </div>
  )
}
