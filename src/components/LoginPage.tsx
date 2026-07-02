import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const ok = await login(email, password)
    if (!ok) setError('Invalid email or password.')
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-vivid flex-col justify-between p-12 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full" />
        <div className="absolute -bottom-32 -left-16 w-80 h-80 bg-white/10 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <svg className="w-6 h-6 text-white rotate-45" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2.5 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
              </svg>
            </div>
            <span className="text-white font-bold text-xl tracking-tight">My PTA Pilot</span>
          </div>
        </div>

        <div className="relative">
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Everything your PTA needs,<br />all in one place.
          </h2>
          <p className="text-white/75 text-lg leading-relaxed mb-10">
            Fundraisers, events, communications, spirit wear, and more — organized and ready for your whole school community.
          </p>

          <div className="space-y-4">
            {[
              { icon: '📅', text: 'Smart calendar with month-by-month event suggestions' },
              { icon: '💰', text: 'Fundraiser tracking with built-in ideas library' },
              { icon: '🎨', text: 'Flyer & social media graphic generator' },
              { icon: '💬', text: 'Community chat + private officer channel' },
            ].map((f) => (
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

      {/* Right panel — login form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-10">
          <div className="w-9 h-9 gradient-vivid rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white rotate-45" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2.5 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
            </svg>
          </div>
          <span className="font-bold text-lg text-slate-800">My PTA Pilot</span>
        </div>

        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Welcome back</h1>
          <p className="text-slate-500 text-sm mb-8">Sign in to your PTA portal</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <input
                type="email"
                className="input"
                placeholder="you@school-pta.org"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label mb-0">Password</label>
                <button type="button" className="text-xs text-brand-600 hover:text-brand-700 font-medium">Forgot password?</button>
              </div>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100 flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary justify-center py-3 text-base rounded-xl"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
                  Signing in…
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">Don't have an account yet?</p>
            <button className="mt-2 text-sm font-semibold text-brand-600 hover:text-brand-700">Request Access →</button>
          </div>
        </div>
      </div>
    </div>
  )
}
