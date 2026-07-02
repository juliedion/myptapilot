import { useState } from 'react'
import ModuleHeader from '../../components/ModuleHeader'
import { clubSuggestions } from '../../data/suggestions'

interface Club {
  id: string
  name: string
  type: string
  description: string
  advisor?: string
  meetingDay?: string
  meetingTime?: string
  memberCount?: number
  status: 'proposed' | 'active' | 'inactive'
}

const SEED: Club[] = [
  { id: '1', name: 'STEM Club', type: 'Academic', description: 'Hands-on science and engineering projects every other week.', advisor: 'Ms. Patricia Brown', meetingDay: 'Wednesday', meetingTime: '3:30 PM', memberCount: 24, status: 'active' },
  { id: '2', name: 'Art Club', type: 'Arts', description: 'Explore various media — painting, sculpture, mixed media, and more.', advisor: 'Mr. Kevin Davis', meetingDay: 'Thursday', meetingTime: '3:30 PM', memberCount: 18, status: 'active' },
  { id: '3', name: 'Robotics Club', type: 'STEM', description: 'Build and program LEGO robots. Participate in regional competitions.', meetingDay: 'Tuesday', meetingTime: '4:00 PM', memberCount: 12, status: 'active' },
  { id: '4', name: 'Garden Club', type: 'Nature', description: 'Tend the school garden, learn about plants, sustainability, and nutrition.', memberCount: 8, status: 'proposed' },
  { id: '5', name: 'Chess Club', type: 'Academic', description: 'Learn strategy, compete, and have fun.', advisor: 'Ms. Patricia Brown', meetingDay: 'Monday', meetingTime: '3:30 PM', memberCount: 15, status: 'active' },
]

const STATUS_CONFIG = {
  proposed: { color: 'bg-yellow-100 text-yellow-700', label: 'Proposed' },
  active: { color: 'bg-green-100 text-green-700', label: 'Active' },
  inactive: { color: 'bg-slate-100 text-slate-500', label: 'Inactive' },
}

const TYPE_EMOJI: Record<string, string> = {
  Academic: '📚', STEM: '🔬', Arts: '🎨', Nature: '🌱', Technology: '💻',
  Literacy: '📖', Sustainability: '♻️', Leadership: '🏆', Community: '🤝',
  'Life Skills': '🍳', Music: '🎵', Media: '📷', Health: '🏃', Other: '⭐',
}

export default function ClubsModule() {
  const [clubs, setClubs] = useState(SEED)
  const [tab, setTab] = useState<'clubs' | 'ideas'>('clubs')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', type: 'Academic', description: '', advisor: '', meetingDay: '', meetingTime: '', memberCount: '' })

  const add = () => {
    if (!form.name) return
    setClubs(prev => [...prev, {
      id: Date.now().toString(),
      ...form,
      memberCount: form.memberCount ? parseInt(form.memberCount) : undefined,
      status: 'proposed' as const,
    }])
    setForm({ name: '', type: 'Academic', description: '', advisor: '', meetingDay: '', meetingTime: '', memberCount: '' })
    setShowAdd(false)
  }

  const addSuggestion = (s: typeof clubSuggestions[0]) => {
    setClubs(prev => [...prev, { id: Date.now().toString(), name: s.name, type: s.type, description: s.description, status: 'proposed' }])
  }

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      <ModuleHeader title="Clubs" subtitle="Organize school clubs and discover new ideas" gradient="gradient-teal" icon="🌟" />
      <div className="flex items-center justify-between mb-6">
        <div>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Club
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card p-5 text-center">
          <p className="text-3xl font-bold text-brand-600">{clubs.filter(c => c.status === 'active').length}</p>
          <p className="text-sm text-slate-500 mt-1">Active Clubs</p>
        </div>
        <div className="card p-5 text-center">
          <p className="text-3xl font-bold text-slate-800">{clubs.reduce((s, c) => s + (c.memberCount || 0), 0)}</p>
          <p className="text-sm text-slate-500 mt-1">Total Members</p>
        </div>
        <div className="card p-5 text-center">
          <p className="text-3xl font-bold text-yellow-600">{clubs.filter(c => c.status === 'proposed').length}</p>
          <p className="text-sm text-slate-500 mt-1">Proposed</p>
        </div>
      </div>

      <div className="flex gap-1 mb-6 bg-slate-100 rounded-xl p-1 w-fit">
        <button onClick={() => setTab('clubs')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'clubs' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'}`}>
          Our Clubs ({clubs.length})
        </button>
        <button onClick={() => setTab('ideas')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'ideas' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'}`}>
          💡 Club Ideas ({clubSuggestions.length})
        </button>
      </div>

      {tab === 'clubs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clubs.map(club => {
            const emoji = TYPE_EMOJI[club.type] || '⭐'
            const status = STATUS_CONFIG[club.status]
            return (
              <div key={club.id} className="card p-5 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-xl">{emoji}</div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">{club.name}</h3>
                      <span className={`badge ${status.color} text-xs`}>{status.label}</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mb-3 leading-relaxed">{club.description}</p>
                <div className="space-y-1.5 text-xs text-slate-500">
                  {club.advisor && <div className="flex items-center gap-2"><span>👤</span><span>{club.advisor}</span></div>}
                  {club.meetingDay && <div className="flex items-center gap-2"><span>📅</span><span>{club.meetingDay}s at {club.meetingTime}</span></div>}
                  {club.memberCount && <div className="flex items-center gap-2"><span>👥</span><span>{club.memberCount} members</span></div>}
                </div>
                <div className="mt-4 flex gap-2">
                  {(['proposed', 'active', 'inactive'] as Club['status'][]).map(s => (
                    <button
                      key={s}
                      onClick={() => setClubs(prev => prev.map(c => c.id === club.id ? { ...c, status: s } : c))}
                      className={`text-xs px-2.5 py-1 rounded-lg transition-all ${club.status === s ? STATUS_CONFIG[s].color + ' font-semibold' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      {STATUS_CONFIG[s].label}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {tab === 'ideas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clubSuggestions.map((s, i) => {
            const emoji = TYPE_EMOJI[s.type] || '⭐'
            const alreadyAdded = clubs.some(c => c.name === s.name)
            return (
              <div key={i} className="card p-5 hover:shadow-md transition-all group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-xl">{emoji}</div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">{s.name}</h3>
                    <span className="badge bg-slate-100 text-slate-500 text-xs">{s.type}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{s.description}</p>
                {alreadyAdded ? (
                  <div className="mt-4 flex items-center gap-1 text-green-600 text-xs font-medium"><span>✓</span> Added to your clubs</div>
                ) : (
                  <button onClick={() => addSuggestion(s)} className="mt-4 w-full btn-primary text-xs py-2 justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    + Add Club
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-fade-in">
            <h3 className="font-bold text-slate-800 text-lg mb-4">Add Club</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Club Name *</label>
                  <input className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Chess Club" />
                </div>
                <div>
                  <label className="label">Type</label>
                  <input className="input" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} placeholder="Academic, Arts, STEM…" />
                </div>
                <div>
                  <label className="label">Faculty Advisor</label>
                  <input className="input" value={form.advisor} onChange={e => setForm(p => ({ ...p, advisor: e.target.value }))} placeholder="Ms. Brown" />
                </div>
                <div>
                  <label className="label">Members</label>
                  <input className="input" type="number" value={form.memberCount} onChange={e => setForm(p => ({ ...p, memberCount: e.target.value }))} placeholder="12" />
                </div>
                <div>
                  <label className="label">Meeting Day</label>
                  <select className="input" value={form.meetingDay} onChange={e => setForm(p => ({ ...p, meetingDay: e.target.value }))}>
                    <option value="">-- Select --</option>
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Meeting Time</label>
                  <input className="input" value={form.meetingTime} onChange={e => setForm(p => ({ ...p, meetingTime: e.target.value }))} placeholder="3:30 PM" />
                </div>
              </div>
              <div>
                <label className="label">Description</label>
                <textarea className="input" rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAdd(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button onClick={add} className="btn-primary flex-1 justify-center">Add Club</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
