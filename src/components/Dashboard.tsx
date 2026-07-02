import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useWorkspace } from '../contexts/WorkspaceContext'

interface Props {
  setActiveModule: (m: string) => void
}

const STATS = [
  { label: 'Total Members', value: '247', icon: '👥', gradient: 'gradient-vivid', sub: '+12 this month' },
  { label: 'YTD Raised', value: '$18,420', icon: '💰', gradient: 'gradient-green', sub: '83% of annual goal' },
  { label: 'Events This Year', value: '34', icon: '📅', gradient: 'gradient-cool', sub: '5 coming up' },
  { label: 'Active Volunteers', value: '89', icon: '🙌', gradient: 'gradient-warm', sub: 'Across 14 committees' },
]

const QUICK_LINKS = [
  { icon: '📅', label: 'Calendar', sub: 'Events & suggestions', module: 'calendar', gradient: 'from-violet-500 to-purple-600' },
  { icon: '💬', label: 'Community Chat', sub: '3 unread messages', module: 'chat', gradient: 'from-pink-500 to-rose-500' },
  { icon: '💰', label: 'Fundraisers', sub: '2 active campaigns', module: 'fundraisers', gradient: 'from-emerald-500 to-teal-500' },
  { icon: '👕', label: 'Spirit Wear', sub: '12 pending orders', module: 'spiritwear', gradient: 'from-amber-400 to-orange-500' },
  { icon: '🎨', label: 'Create Flyer', sub: 'Design graphics', module: 'creative', gradient: 'from-cyan-500 to-blue-500' },
  { icon: '📋', label: 'Documents', sub: 'Bylaws & records', module: 'documents', gradient: 'from-indigo-500 to-violet-600' },
  { icon: '🎓', label: 'Student Directory', sub: 'Student & family info', module: 'students', gradient: 'from-teal-500 to-cyan-500' },
]

const TYPE_COLORS: Record<string, string> = {
  meeting:    'bg-violet-100 text-violet-700',
  event:      'bg-pink-100 text-pink-700',
  deadline:   'bg-red-100 text-red-700',
  fundraiser: 'bg-amber-100 text-amber-700',
}

const UPCOMING = [
  { date: 'Jul 15', title: 'Board Meeting', type: 'meeting' },
  { date: 'Jul 22', title: 'Summer Planning Session', type: 'meeting' },
  { date: 'Aug 5',  title: 'Back-to-School Night', type: 'event' },
  { date: 'Aug 12', title: 'Spirit Wear Order Deadline', type: 'deadline' },
  { date: 'Sep 3',  title: 'Walk-A-Thon Kickoff', type: 'fundraiser' },
]

const CHAT_PREVIEW: { sender: string; avatar: string; text: string; time: string }[] = []

const SETUP_STEPS = [
  { id: 'setup-workspace',   label: 'Set up your workspace name & colors', module: '' },
  { id: 'add-officers',      label: 'Add your officers to the team', module: '' },
  { id: 'populate-calendar', label: 'Populate the calendar for the school year', module: 'calendar' },
  { id: 'plan-events',       label: 'Plan your first event', module: 'calendar' },
  { id: 'first-fundraiser',  label: 'Set up your first fundraiser', module: 'fundraisers' },
  { id: 'add-contacts',      label: 'Add member contacts & student directory', module: 'contacts' },
  { id: 'upload-docs',       label: 'Upload bylaws and key documents', module: 'documents' },
  { id: 'first-agenda',      label: 'Create your first meeting agenda', module: '' },
]

const AVATAR_COLORS = ['from-violet-500 to-purple-600', 'from-pink-500 to-rose-500', 'from-teal-500 to-cyan-500']

export default function Dashboard({ setActiveModule }: Props) {
  const { user } = useAuth()
  const { workspace, completeStep, updateWorkspace } = useWorkspace()
  const firstName = user?.name.split(' ')[0]
  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  const [chatInput, setChatInput] = useState('')
  const [ideaText, setIdeaText] = useState('')
  const [showIdeaBox, setShowIdeaBox] = useState(false)
  const [ideaSaved, setIdeaSaved] = useState(false)

  const completedCount = workspace.completedSteps.length
  const totalSteps = SETUP_STEPS.length
  const showGuide = !workspace.isOnboarded || completedCount < totalSteps

  const handleStepClick = (step: typeof SETUP_STEPS[0]) => {
    completeStep(step.id)
    if (step.module) setActiveModule(step.module)
  }

  const handleSaveIdea = () => {
    console.log('Idea saved:', ideaText)
    setIdeaSaved(true)
    setIdeaText('')
    setTimeout(() => { setIdeaSaved(false); setShowIdeaBox(false) }, 2000)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in space-y-6">

      {/* A) Setup Guide */}
      {showGuide && (
        <div className="gradient-vivid rounded-3xl p-6 relative overflow-hidden shadow-brand">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white font-bold text-lg">Getting Started Checklist</h2>
              <div className="flex items-center gap-3">
                <span className="text-white/70 text-sm font-medium">{completedCount} of {totalSteps} complete</span>
                <button
                  onClick={() => updateWorkspace({ isOnboarded: true })}
                  className="text-white/50 hover:text-white/80 text-xs underline transition-colors"
                >
                  Dismiss guide
                </button>
              </div>
            </div>
            <div className="h-2 bg-white/20 rounded-full mb-5 overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${(completedCount / totalSteps) * 100}%` }}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SETUP_STEPS.map((step, idx) => {
                const done = workspace.completedSteps.includes(step.id)
                return (
                  <button
                    key={step.id}
                    onClick={() => handleStepClick(step)}
                    className="flex items-center gap-3 text-left p-2.5 rounded-xl hover:bg-white/10 transition-colors"
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                      done ? 'bg-green-400' : 'border-2 border-white/40'
                    }`}>
                      {done ? (
                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="text-white/50 text-[10px] font-bold">{idx + 1}</span>
                      )}
                    </div>
                    <span className={`text-sm ${done ? 'text-white/50 line-through' : 'text-white/90'}`}>
                      {step.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* B) Hero Banner */}
      <div className="rounded-3xl gradient-vivid p-8 relative overflow-hidden shadow-brand">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full" />
        <div className="absolute -bottom-10 right-24 w-36 h-36 bg-white/10 rounded-full" />
        <div className="relative">
          <p className="text-white/60 text-sm font-medium mb-1">{dateStr}</p>
          <h1 className="text-3xl font-bold text-white mb-1">Good morning, {firstName}! 👋</h1>
          <p className="text-white/70 text-sm">{workspace.orgName} · School Year 2025–2026</p>
          <div className="flex gap-3 mt-5">
            <button onClick={() => setActiveModule('calendar')} className="bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-4 py-2 rounded-xl backdrop-blur-sm transition-all">
              View Calendar
            </button>
            <button onClick={() => setActiveModule('chat')} className="bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-4 py-2 rounded-xl backdrop-blur-sm transition-all">
              Community Chat
            </button>
          </div>
        </div>
      </div>

      {/* C) Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map(s => (
          <div key={s.label} className={`${s.gradient} rounded-2xl p-5 text-white relative overflow-hidden shadow-card`}>
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full" />
            <div className="text-2xl mb-3">{s.icon}</div>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-white/70 text-xs mt-0.5">{s.label}</p>
            <p className="text-white/50 text-xs mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* D) Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Upcoming Events */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-title">Upcoming Events</h2>
            <button onClick={() => setActiveModule('calendar')} className="text-sm text-brand-600 hover:text-brand-700 font-semibold">View all →</button>
          </div>
          <div className="space-y-2">
            {UPCOMING.map((ev, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-default">
                <div className="w-10 h-10 rounded-xl gradient-brand flex flex-col items-center justify-center flex-shrink-0 shadow-sm">
                  <span className="text-white text-[9px] font-bold uppercase leading-none">{ev.date.split(' ')[0]}</span>
                  <span className="text-white text-sm font-bold leading-none mt-0.5">{ev.date.split(' ')[1]}</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-800 text-sm">{ev.title}</p>
                  <span className={`badge text-xs mt-0.5 ${TYPE_COLORS[ev.type]}`}>{ev.type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Mini Chat + Idea Quick-Add */}
        <div className="space-y-4">
          {/* Mini Group Chat */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title">Community Chat</h2>
              <button onClick={() => setActiveModule('chat')} className="text-xs text-brand-600 hover:text-brand-700 font-semibold">
                Open Chat →
              </button>
            </div>
            <div className="space-y-3 overflow-hidden">
              {CHAT_PREVIEW.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-xs text-slate-400">No messages yet — be the first to say hello!</p>
                </div>
              )}
              {CHAT_PREVIEW.map((msg, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                    {msg.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xs font-semibold text-slate-700 truncate">{msg.sender}</span>
                      <span className="text-[10px] text-slate-400 flex-shrink-0">{msg.time}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <input
                className="input text-sm flex-1 py-1.5"
                placeholder="Say something…"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && setActiveModule('chat')}
              />
              <button
                onClick={() => setActiveModule('chat')}
                className="w-8 h-8 rounded-lg gradient-vivid flex items-center justify-center flex-shrink-0"
                title="Open full chat"
              >
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>

          {/* Idea Quick-Add */}
          <div className="card p-5">
            <h2 className="section-title mb-3">Quick Ideas</h2>
            <div className="space-y-2">
              <button
                onClick={() => setActiveModule('programs')}
                className="w-full flex items-center gap-2 text-left px-3 py-2.5 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-700 text-sm font-medium transition-colors"
              >
                <span>💡</span> Add Program Idea
              </button>
              <button
                onClick={() => setActiveModule('fundraisers')}
                className="w-full flex items-center gap-2 text-left px-3 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-sm font-medium transition-colors"
              >
                <span>💰</span> Add Fundraiser Idea
              </button>
              <button
                onClick={() => setShowIdeaBox(v => !v)}
                className="w-full flex items-center gap-2 text-left px-3 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 text-sm font-medium transition-colors"
              >
                <span>✨</span> General Idea
              </button>
              {showIdeaBox && (
                <div className="mt-2 space-y-2">
                  <textarea
                    className="input text-sm resize-none"
                    rows={2}
                    placeholder="Type your idea…"
                    value={ideaText}
                    onChange={e => setIdeaText(e.target.value)}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button onClick={handleSaveIdea} className="btn-primary text-xs py-1.5 flex-1">
                      {ideaSaved ? '✓ Saved!' : 'Save'}
                    </button>
                    <button onClick={() => setShowIdeaBox(false)} className="btn-secondary text-xs py-1.5">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* E) Quick Access */}
      <div>
        <h2 className="section-title mb-4">Quick Access</h2>
        <div className="grid grid-cols-3 sm:grid-cols-7 gap-3">
          {QUICK_LINKS.map(q => (
            <button
              key={q.module}
              onClick={() => setActiveModule(q.module)}
              className="card p-4 text-left hover:shadow-md hover:-translate-y-0.5 transition-all group"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${q.gradient} flex items-center justify-center text-xl mb-3 shadow-sm`}>
                {q.icon}
              </div>
              <p className="font-semibold text-slate-800 text-xs group-hover:text-brand-700 leading-tight">{q.label}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{q.sub}</p>
            </button>
          ))}
        </div>
      </div>

      {/* F) Active Fundraisers */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="section-title">Active Fundraisers</h2>
          <button onClick={() => setActiveModule('fundraisers')} className="text-sm text-brand-600 hover:text-brand-700 font-semibold">Manage →</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: 'Walk-A-Thon', raised: 12400, goal: 15000, end: 'Ends Jul 30', gradient: 'gradient-vivid' },
            { name: 'Fall Carnival Tickets', raised: 2800, goal: 8000, end: 'Ends Sep 15', gradient: 'gradient-cool' },
          ].map((f, i) => (
            <div key={i} className="bg-slate-50 rounded-2xl p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-bold text-slate-800 text-sm">{f.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{f.end}</p>
                </div>
                <span className="text-base font-bold text-brand-600">${f.raised.toLocaleString()}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2.5 mb-2">
                <div className={`${f.gradient} h-2.5 rounded-full`} style={{ width: `${Math.min(100, (f.raised / f.goal) * 100)}%` }} />
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span className="font-semibold text-slate-600">{Math.round((f.raised / f.goal) * 100)}% of goal</span>
                <span>Goal: ${f.goal.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
