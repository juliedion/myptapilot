import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useWorkspace } from '../contexts/WorkspaceContext'

interface Props {
  setActiveModule: (m: string) => void
}

const QUICK_LINKS = [
  { icon: '📅', label: 'Calendar',         module: 'calendar',    gradient: 'from-violet-500 to-purple-600' },
  { icon: '💬', label: 'Community Chat',   module: 'chat',        gradient: 'from-pink-500 to-rose-500' },
  { icon: '💰', label: 'Fundraisers',      module: 'fundraisers', gradient: 'from-emerald-500 to-teal-500' },
  { icon: '👕', label: 'Spirit Wear',      module: 'spiritwear',  gradient: 'from-amber-400 to-orange-500' },
  { icon: '🎨', label: 'Create Flyer',     module: 'creative',    gradient: 'from-cyan-500 to-blue-500' },
  { icon: '📋', label: 'Documents',        module: 'documents',   gradient: 'from-indigo-500 to-violet-600' },
  { icon: '🎓', label: 'Student Directory',module: 'students',    gradient: 'from-teal-500 to-cyan-500' },
]

const SETUP_STEPS = [
  { id: 'setup-workspace',   label: 'Set up your workspace name & colors', module: '' },
  { id: 'add-officers',      label: 'Add your officers to the team',        module: '' },
  { id: 'populate-calendar', label: 'Populate the calendar for the school year', module: 'calendar' },
  { id: 'plan-events',       label: 'Plan your first event',                module: 'calendar' },
  { id: 'first-fundraiser',  label: 'Set up your first fundraiser',         module: 'fundraisers' },
  { id: 'add-contacts',      label: 'Add member contacts',                  module: 'contacts' },
  { id: 'upload-docs',       label: 'Upload bylaws and key documents',      module: 'documents' },
  { id: 'first-agenda',      label: 'Create your first meeting agenda',     module: '' },
]

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
  const showGuide = completedCount < totalSteps && !workspace.isOnboarded

  const handleStepClick = (step: typeof SETUP_STEPS[0]) => {
    completeStep(step.id)
    if (step.module) setActiveModule(step.module)
  }

  const handleSaveIdea = () => {
    setIdeaSaved(true)
    setIdeaText('')
    setTimeout(() => { setIdeaSaved(false); setShowIdeaBox(false) }, 2000)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in space-y-6">

      {/* Setup Guide */}
      {showGuide && (
        <div className="gradient-vivid rounded-3xl p-6 relative overflow-hidden shadow-brand">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white font-bold text-lg">Getting Started Checklist</h2>
              <div className="flex items-center gap-3">
                <span className="text-white/70 text-sm font-medium">{completedCount} of {totalSteps} complete</span>
                <button onClick={() => updateWorkspace({ isOnboarded: true })} className="text-white/50 hover:text-white/80 text-xs underline transition-colors">
                  Dismiss guide
                </button>
              </div>
            </div>
            <div className="h-2 bg-white/20 rounded-full mb-5 overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${(completedCount / totalSteps) * 100}%` }} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SETUP_STEPS.map((step, idx) => {
                const done = workspace.completedSteps.includes(step.id)
                return (
                  <button key={step.id} onClick={() => handleStepClick(step)}
                    className="flex items-center gap-3 text-left p-2.5 rounded-xl hover:bg-white/10 transition-colors">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${done ? 'bg-green-400' : 'border-2 border-white/40'}`}>
                      {done
                        ? <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                        : <span className="text-white/50 text-[10px] font-bold">{idx + 1}</span>
                      }
                    </div>
                    <span className={`text-sm ${done ? 'text-white/50 line-through' : 'text-white/90'}`}>{step.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Hero Banner */}
      <div className="rounded-3xl gradient-vivid p-8 relative overflow-hidden shadow-brand">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full" />
        <div className="absolute -bottom-10 right-24 w-36 h-36 bg-white/10 rounded-full" />
        <div className="relative">
          <p className="text-white/60 text-sm font-medium mb-1">{dateStr}</p>
          <h1 className="text-3xl font-bold text-white mb-1">Good morning, {firstName}! 👋</h1>
          <p className="text-white/70 text-sm">{workspace.orgName}</p>
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

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Upcoming Events */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-title">Upcoming Events</h2>
            <button onClick={() => setActiveModule('calendar')} className="text-sm text-brand-600 hover:text-brand-700 font-semibold">View all →</button>
          </div>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center text-2xl mb-3">📅</div>
            <p className="font-semibold text-slate-700 mb-1">No upcoming events</p>
            <p className="text-sm text-slate-400 mb-4">Add events to your calendar to see them here.</p>
            <button onClick={() => setActiveModule('calendar')} className="btn-primary text-sm">
              Go to Calendar
            </button>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">

          {/* Mini Chat */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title">Community Chat</h2>
              <button onClick={() => setActiveModule('chat')} className="text-xs text-brand-600 hover:text-brand-700 font-semibold">Open Chat →</button>
            </div>
            <div className="text-center py-4">
              <p className="text-xs text-slate-400">No messages yet — be the first to say hello!</p>
            </div>
            <div className="mt-4 flex gap-2">
              <input className="input text-sm flex-1 py-1.5" placeholder="Say something…"
                value={chatInput} onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && setActiveModule('chat')} />
              <button onClick={() => setActiveModule('chat')}
                className="w-8 h-8 rounded-lg gradient-vivid flex items-center justify-center flex-shrink-0">
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Quick Ideas */}
          <div className="card p-5">
            <h2 className="section-title mb-3">Quick Ideas</h2>
            <div className="space-y-2">
              <button onClick={() => setActiveModule('programs')}
                className="w-full flex items-center gap-2 text-left px-3 py-2.5 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-700 text-sm font-medium transition-colors">
                <span>💡</span> Add Program Idea
              </button>
              <button onClick={() => setActiveModule('fundraisers')}
                className="w-full flex items-center gap-2 text-left px-3 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-sm font-medium transition-colors">
                <span>💰</span> Add Fundraiser Idea
              </button>
              <button onClick={() => setShowIdeaBox(v => !v)}
                className="w-full flex items-center gap-2 text-left px-3 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 text-sm font-medium transition-colors">
                <span>✨</span> General Idea
              </button>
              {showIdeaBox && (
                <div className="mt-2 space-y-2">
                  <textarea className="input text-sm resize-none" rows={2} placeholder="Type your idea…"
                    value={ideaText} onChange={e => setIdeaText(e.target.value)} autoFocus />
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

      {/* Quick Access */}
      <div>
        <h2 className="section-title mb-4">Quick Access</h2>
        <div className="grid grid-cols-3 sm:grid-cols-7 gap-3">
          {QUICK_LINKS.map(q => (
            <button key={q.module} onClick={() => setActiveModule(q.module)}
              className="card p-4 text-left hover:shadow-md hover:-translate-y-0.5 transition-all group">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${q.gradient} flex items-center justify-center text-xl mb-3 shadow-sm`}>
                {q.icon}
              </div>
              <p className="font-semibold text-slate-800 text-xs group-hover:text-brand-700 leading-tight">{q.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Active Fundraisers */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">Active Fundraisers</h2>
          <button onClick={() => setActiveModule('fundraisers')} className="text-sm text-brand-600 hover:text-brand-700 font-semibold">Manage →</button>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-2xl mb-3">💰</div>
          <p className="font-semibold text-slate-700 mb-1">No active fundraisers</p>
          <p className="text-sm text-slate-400 mb-4">Start a campaign to track your progress here.</p>
          <button onClick={() => setActiveModule('fundraisers')} className="btn-primary text-sm">
            Browse Fundraiser Ideas
          </button>
        </div>
      </div>

    </div>
  )
}
