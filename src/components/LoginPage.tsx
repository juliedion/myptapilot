import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useWorkspace } from '../contexts/WorkspaceContext'

const HubLogo = () => (
  <svg viewBox="0 0 24 24" className="w-full h-full">
    <defs>
      <linearGradient id="login-bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#7c3aed"/>
        <stop offset="100%" stopColor="#ec4899"/>
      </linearGradient>
    </defs>
    <rect width="24" height="24" rx="6" fill="url(#login-bg)"/>
    <line x1="12" y1="12" x2="12" y2="5"       stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="12" y1="12" x2="18.06" y2="15.5"  stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="12" y1="12" x2="5.94"  y2="15.5"  stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="12"    cy="12"   r="3"   fill="white"/>
    <circle cx="12"    cy="5"    r="2"   fill="white"/>
    <circle cx="18.06" cy="15.5" r="2"   fill="white"/>
    <circle cx="5.94"  cy="15.5" r="2"   fill="white"/>
  </svg>
)

const FEATURES = [
  { icon: '📅', text: 'Smart calendar with month-by-month event suggestions' },
  { icon: '💰', text: 'Fundraiser tracking with built-in ideas library' },
  { icon: '🎨', text: 'Flyer & social media graphic generator' },
  { icon: '💬', text: 'Community chat + private officer channel' },
  { icon: '🎓', text: 'Student & family directory, spirit wear, and more' },
]

export default function LoginPage() {
  const { login, register } = useAuth()
  const { resetWorkspace } = useWorkspace()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')

  // Sign-in state
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')

  // Sign-up state
  const [suName, setSuName]           = useState('')
  const [suEmail, setSuEmail]         = useState('')
  const [suPassword, setSuPassword]   = useState('')
  const [suConfirm, setSuConfirm]     = useState('')

  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const ok = await login(email, password)
    if (!ok) setError('Invalid email or password.')
    setLoading(false)
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!suName.trim()) return setError('Please enter your full name.')
    if (suPassword.length < 6) return setError('Password must be at least 6 characters.')
    if (suPassword !== suConfirm) return setError('Passwords do not match.')
    setLoading(true)
    // Reset workspace so onboarding wizard runs fresh for this new account
    resetWorkspace()
    const result = await register(suName.trim(), suEmail.trim(), suPassword)
    if (!result.ok) setError(result.error || 'Registration failed.')
    setLoading(false)
  }

  const switchMode = (m: 'signin' | 'signup') => {
    setMode(m)
    setError('')
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-vivid flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full" />
        <div className="absolute -bottom-32 -left-16 w-80 h-80 bg-white/10 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full" />

        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10"><HubLogo /></div>
          <span className="text-white font-bold text-xl tracking-tight">My PTA Pilot</span>
        </div>

        <div className="relative">
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            {mode === 'signup'
              ? <>Your school community,<br />organized at last.</>
              : <>Everything your PTA needs,<br />all in one place.</>}
          </h2>
          <p className="text-white/75 text-lg leading-relaxed mb-10">
            {mode === 'signup'
              ? 'Create your free portal in minutes. Set up your team, plan events, track fundraisers, and more.'
              : 'Fundraisers, events, communications, spirit wear, and more — organized for your whole community.'}
          </p>
          <div className="space-y-4">
            {FEATURES.map(f => (
              <div key={f.icon} className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/15 rounded-lg flex items-center justify-center text-base flex-shrink-0 backdrop-blur-sm">
                  {f.icon}
                </div>
                <span className="text-white/90 text-sm">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-white/40 text-xs">© 2025 My PTA Pilot. Built for school communities.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-10">
          <div className="w-9 h-9"><HubLogo /></div>
          <span className="font-bold text-lg text-slate-800">My PTA Pilot</span>
        </div>

        <div className="w-full max-w-sm">
          {/* Mode toggle */}
          <div className="flex bg-slate-100 rounded-xl p-1 mb-8">
            <button
              onClick={() => switchMode('signin')}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${mode === 'signin' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => switchMode('signup')}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${mode === 'signup' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Create Portal
            </button>
          </div>

          {mode === 'signin' ? (
            <>
              <h1 className="text-2xl font-bold text-slate-900 mb-1">Welcome back</h1>
              <p className="text-slate-500 text-sm mb-6">Sign in to your PTA portal</p>

              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="label">Email address</label>
                  <input type="email" className="input" placeholder="you@school-pta.org"
                    value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="label mb-0">Password</label>
                    <button type="button" className="text-xs text-brand-600 hover:text-brand-700 font-medium">Forgot password?</button>
                  </div>
                  <input type="password" className="input" placeholder="••••••••"
                    value={password} onChange={e => setPassword(e.target.value)} required />
                </div>

                {error && <ErrorBox message={error} />}

                <button type="submit" disabled={loading} className="w-full btn-primary justify-center py-3 text-base">
                  <Spinner show={loading} /> {loading ? 'Signing in…' : 'Sign In'}
                </button>
              </form>

              <p className="text-center text-xs text-slate-400 mt-6">
                New here?{' '}
                <button onClick={() => switchMode('signup')} className="text-brand-600 font-semibold hover:text-brand-700">
                  Create your free portal →
                </button>
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-slate-900 mb-1">Create your portal</h1>
              <p className="text-slate-500 text-sm mb-6">Free to set up — takes about 2 minutes</p>

              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <label className="label">Your full name</label>
                  <input type="text" className="input" placeholder="Jane Smith"
                    value={suName} onChange={e => setSuName(e.target.value)} required />
                </div>
                <div>
                  <label className="label">Email address</label>
                  <input type="email" className="input" placeholder="you@school.org"
                    value={suEmail} onChange={e => setSuEmail(e.target.value)} required />
                </div>
                <div>
                  <label className="label">Password</label>
                  <input type="password" className="input" placeholder="At least 6 characters"
                    value={suPassword} onChange={e => setSuPassword(e.target.value)} required />
                </div>
                <div>
                  <label className="label">Confirm password</label>
                  <input type="password" className="input" placeholder="••••••••"
                    value={suConfirm} onChange={e => setSuConfirm(e.target.value)} required />
                </div>

                {error && <ErrorBox message={error} />}

                <button type="submit" disabled={loading} className="w-full btn-vivid justify-center py-3 text-base">
                  <Spinner show={loading} /> {loading ? 'Creating portal…' : 'Create My Portal 🚀'}
                </button>
              </form>

              <p className="text-center text-xs text-slate-400 mt-4">
                By signing up you agree to our{' '}
                <span className="text-brand-600 cursor-pointer hover:underline">Terms of Service</span>.
              </p>

              <p className="text-center text-xs text-slate-400 mt-4">
                Already have an account?{' '}
                <button onClick={() => switchMode('signin')} className="text-brand-600 font-semibold hover:text-brand-700">
                  Sign in →
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100 flex items-center gap-2">
      <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {message}
    </div>
  )
}

function Spinner({ show }: { show: boolean }) {
  if (!show) return null
  return (
    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
    </svg>
  )
}
