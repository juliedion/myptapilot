import { useAuth } from '../contexts/AuthContext'

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
]

const TYPE_COLORS: Record<string, string> = {
  meeting:   'bg-violet-100 text-violet-700',
  event:     'bg-pink-100 text-pink-700',
  deadline:  'bg-red-100 text-red-700',
  fundraiser:'bg-amber-100 text-amber-700',
}

const UPCOMING = [
  { date: 'Jul 15', title: 'Board Meeting', type: 'meeting' },
  { date: 'Jul 22', title: 'Summer Planning Session', type: 'meeting' },
  { date: 'Aug 5',  title: 'Back-to-School Night', type: 'event' },
  { date: 'Aug 12', title: 'Spirit Wear Order Deadline', type: 'deadline' },
  { date: 'Sep 3',  title: 'Walk-A-Thon Kickoff', type: 'fundraiser' },
]

const ACTIVITY = [
  { text: 'New member registration: David Kim', time: '2h ago', icon: '👋' },
  { text: 'Spirit Wear order received from Martinez family', time: '4h ago', icon: '👕' },
  { text: 'Treasurer posted August financial report', time: '1d ago', icon: '📊' },
  { text: 'Walk-A-Thon raised $12,400 total!', time: '2d ago', icon: '🎉' },
]

const TIPS = [
  'Start planning Fall Carnival now — it takes 3 months to organize well.',
  'The IRS 990-N filing deadline is May 15. Mark your calendar now.',
  'Restaurant Night fundraisers average $500–$1,200 with zero upfront cost.',
  'Set up a shared folder for all event committees to share files easily.',
]
const TIP = TIPS[0]

export default function Dashboard({ setActiveModule }: Props) {
  const { user } = useAuth()
  const firstName = user?.name.split(' ')[0]
  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in space-y-6">

      {/* Hero Banner */}
      <div className="rounded-3xl gradient-vivid p-8 relative overflow-hidden shadow-brand">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full" />
        <div className="absolute -bottom-10 right-24 w-36 h-36 bg-white/10 rounded-full" />
        <div className="relative">
          <p className="text-white/60 text-sm font-medium mb-1">{dateStr}</p>
          <h1 className="text-3xl font-bold text-white mb-1">Good morning, {firstName}! 👋</h1>
          <p className="text-white/70 text-sm">Lincoln Elementary PTA · School Year 2025–2026</p>
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

      {/* Stat Cards */}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Events */}
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

        {/* Right column */}
        <div className="space-y-4">
          {/* Activity */}
          <div className="card p-5">
            <h2 className="section-title mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {ACTIVITY.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-sm flex-shrink-0">{item.icon}</div>
                  <div>
                    <p className="text-sm text-slate-700 leading-snug">{item.text}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tip */}
          <div className="rounded-2xl gradient-cool p-5 text-white relative overflow-hidden shadow-card">
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
            <div className="relative">
              <p className="text-xs font-bold text-white/60 uppercase tracking-wider mb-2">💡 Pro Tip</p>
              <p className="text-sm text-white/90 leading-relaxed">{TIP}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access */}
      <div>
        <h2 className="section-title mb-4">Quick Access</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
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

      {/* Fundraiser Progress */}
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
