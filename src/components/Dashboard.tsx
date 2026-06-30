import { useAuth } from '../contexts/AuthContext'

interface Props {
  setActiveModule: (m: string) => void
}

const StatCard = ({ label, value, icon, color }: { label: string; value: string; icon: string; color: string }) => (
  <div className="card p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${color}`}>{icon}</div>
    <div>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  </div>
)

const QuickLink = ({ icon, label, sub, onClick }: { icon: string; label: string; sub: string; onClick: () => void }) => (
  <button onClick={onClick} className="card p-4 text-left hover:shadow-md hover:-translate-y-0.5 transition-all group w-full">
    <div className="text-2xl mb-2">{icon}</div>
    <p className="font-semibold text-slate-800 text-sm group-hover:text-brand-700">{label}</p>
    <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
  </button>
)

export default function Dashboard({ setActiveModule }: Props) {
  const { user } = useAuth()

  const upcomingEvents = [
    { date: 'Jul 15', title: 'Board Meeting', type: 'meeting' },
    { date: 'Jul 22', title: 'Summer Planning Session', type: 'meeting' },
    { date: 'Aug 5', title: 'Back-to-School Night', type: 'event' },
    { date: 'Aug 12', title: 'Spirit Wear Order Deadline', type: 'deadline' },
    { date: 'Sep 3', title: 'Walk-A-Thon Kickoff', type: 'fundraiser' },
  ]

  const typeColors: Record<string, string> = {
    meeting: 'bg-blue-100 text-blue-700',
    event: 'bg-purple-100 text-purple-700',
    deadline: 'bg-red-100 text-red-700',
    fundraiser: 'bg-gold-400 bg-opacity-20 text-amber-700',
  }

  const recentActivity = [
    { text: 'Amanda J. uploaded Fall Festival Budget', time: '2h ago', icon: '📄' },
    { text: 'New member registration: David Kim', time: '4h ago', icon: '👋' },
    { text: 'Spirit Wear order received from Martinez family', time: '6h ago', icon: '👕' },
    { text: 'Treasurer posted August financial report', time: '1d ago', icon: '📊' },
    { text: 'Walk-A-Thon raised $12,400 total!', time: '2d ago', icon: '🎉' },
  ]

  const tips = [
    'Start planning Fall Carnival now — it takes 3 months to organize well.',
    'The IRS 990-N filing deadline is May 15. Mark your calendar now.',
    'Restaurant Night fundraisers average $500–$1,200 per event with zero upfront cost.',
    'Set up a shared Google Drive folder for all event committees to share files.',
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="page-title">Good morning, {user?.name.split(' ')[0]}! 👋</h1>
          <p className="text-slate-500 mt-1">Lincoln Elementary PTA · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>
        <div className="card px-4 py-2 flex items-center gap-2 text-sm text-slate-600">
          <span className="w-2 h-2 rounded-full bg-green-400"></span>
          School Year 2025–2026
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Members" value="247" icon="👥" color="bg-brand-50" />
        <StatCard label="YTD Raised" value="$18,420" icon="💰" color="bg-green-50" />
        <StatCard label="Events This Year" value="34" icon="📅" color="bg-purple-50" />
        <StatCard label="Active Volunteers" value="89" icon="🙌" color="bg-amber-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Events */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Upcoming Events</h2>
            <button onClick={() => setActiveModule('calendar')} className="text-sm text-brand-600 hover:text-brand-700 font-medium">View Calendar →</button>
          </div>
          <div className="space-y-3">
            {upcomingEvents.map((ev, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="w-12 text-center">
                  <div className="text-xs text-slate-400 font-medium">{ev.date.split(' ')[0]}</div>
                  <div className="text-lg font-bold text-slate-800">{ev.date.split(' ')[1]}</div>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-800 text-sm">{ev.title}</p>
                  <span className={`badge text-xs mt-0.5 ${typeColors[ev.type]}`}>{ev.type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Activity Feed */}
          <div className="card p-6">
            <h2 className="section-title mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {recentActivity.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-base mt-0.5">{item.icon}</span>
                  <div>
                    <p className="text-sm text-slate-700 leading-snug">{item.text}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pro Tip */}
          <div className="bg-brand-50 border border-brand-100 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-brand-600">💡</span>
              <span className="text-sm font-semibold text-brand-800">PTA Pro Tip</span>
            </div>
            <p className="text-sm text-brand-700">{tips[Math.floor(Math.random() * tips.length)]}</p>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="mt-8">
        <h2 className="section-title mb-4">Quick Access</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <QuickLink icon="📅" label="Calendar" sub="Events & suggestions" onClick={() => setActiveModule('calendar')} />
          <QuickLink icon="💬" label="Community Chat" sub="3 unread messages" onClick={() => setActiveModule('chat')} />
          <QuickLink icon="💰" label="Fundraisers" sub="2 active campaigns" onClick={() => setActiveModule('fundraisers')} />
          <QuickLink icon="👕" label="Spirit Wear" sub="12 pending orders" onClick={() => setActiveModule('spiritwear')} />
          <QuickLink icon="🎨" label="Create Flyer" sub="Design graphics" onClick={() => setActiveModule('creative')} />
          <QuickLink icon="📋" label="Documents" sub="Bylaws & records" onClick={() => setActiveModule('documents')} />
        </div>
      </div>

      {/* Fundraiser Progress */}
      <div className="mt-6 card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">Active Fundraisers</h2>
          <button onClick={() => setActiveModule('fundraisers')} className="text-sm text-brand-600 hover:text-brand-700 font-medium">Manage →</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: 'Walk-A-Thon', raised: 12400, goal: 15000, end: 'Ends Jul 30' },
            { name: 'Fall Carnival Tickets', raised: 2800, goal: 8000, end: 'Ends Sep 15' },
          ].map((f, i) => (
            <div key={i} className="bg-slate-50 rounded-xl p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{f.name}</p>
                  <p className="text-xs text-slate-500">{f.end}</p>
                </div>
                <span className="text-sm font-bold text-brand-600">${f.raised.toLocaleString()}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 mb-1">
                <div
                  className="gradient-brand h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (f.raised / f.goal) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>{Math.round((f.raised / f.goal) * 100)}% of goal</span>
                <span>Goal: ${f.goal.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
