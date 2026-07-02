import ModuleHeader from '../../components/ModuleHeader'
import { useState } from 'react'
import { fundraiserSuggestions } from '../../data/suggestions'

interface Fundraiser {
  id: string
  name: string
  type: string
  status: 'planned' | 'active' | 'completed'
  goalAmount: number
  raisedAmount: number
  startDate: string
  endDate: string
  description: string
  vendor?: string
}

const SEED: Fundraiser[] = []

const statusConfig = {
  planned: { color: 'bg-blue-100 text-blue-700', label: 'Planned' },
  active: { color: 'bg-green-100 text-green-700', label: 'Active' },
  completed: { color: 'bg-slate-100 text-slate-600', label: 'Completed' },
}

export default function FundraisersModule() {
  const [fundraisers, setFundraisers] = useState(SEED)
  const [tab, setTab] = useState<'active' | 'ideas'>(SEED.length === 0 ? 'ideas' : 'active')
  const [showAdd, setShowAdd] = useState(false)
  const [selectedSuggestion, setSelectedSuggestion] = useState<typeof fundraiserSuggestions[0] | null>(null)
  const [form, setForm] = useState({ name: '', type: '', goalAmount: '', startDate: '', endDate: '', description: '', vendor: '' })

  const totalRaised = fundraisers.reduce((s, f) => s + f.raisedAmount, 0)
  const totalGoal = fundraisers.reduce((s, f) => s + f.goalAmount, 0)
  const active = fundraisers.filter(f => f.status === 'active')

  const addFundraiser = () => {
    if (!form.name) return
    const f: Fundraiser = {
      id: Date.now().toString(),
      name: form.name,
      type: form.type,
      status: 'planned',
      goalAmount: parseFloat(form.goalAmount) || 0,
      raisedAmount: 0,
      startDate: form.startDate,
      endDate: form.endDate,
      description: form.description,
      vendor: form.vendor,
    }
    setFundraisers(prev => [...prev, f])
    setForm({ name: '', type: '', goalAmount: '', startDate: '', endDate: '', description: '', vendor: '' })
    setShowAdd(false)
  }

  const addSuggestion = (s: typeof fundraiserSuggestions[0]) => {
    setForm(p => ({ ...p, name: s.name, type: s.type, description: s.description }))
    setSelectedSuggestion(null)
    setShowAdd(true)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      <ModuleHeader title="Fundraisers" subtitle="Track campaigns, explore new ideas, and manage your fundraising year" gradient="gradient-green" icon="💰" />
      <div className="flex items-center justify-between mb-6">
        <div>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          New Fundraiser
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card p-5">
          <p className="text-sm text-slate-500 mb-1">Total Raised (YTD)</p>
          <p className="text-3xl font-bold text-brand-600">${totalRaised.toLocaleString()}</p>
          <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5">
            <div className="gradient-brand h-1.5 rounded-full" style={{ width: `${Math.min(100, (totalRaised / totalGoal) * 100)}%` }} />
          </div>
          <p className="text-xs text-slate-400 mt-1">{Math.round((totalRaised / totalGoal) * 100)}% of ${totalGoal.toLocaleString()} combined goal</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-slate-500 mb-1">Active Campaigns</p>
          <p className="text-3xl font-bold text-green-600">{active.length}</p>
          <p className="text-xs text-slate-400 mt-2">Running right now</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-slate-500 mb-1">Completed This Year</p>
          <p className="text-3xl font-bold text-slate-700">{fundraisers.filter(f => f.status === 'completed').length}</p>
          <p className="text-xs text-slate-400 mt-2">Successfully finished</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-slate-100 rounded-xl p-1 w-fit">
        <button onClick={() => setTab('active')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'active' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>
          My Fundraisers ({fundraisers.length})
        </button>
        <button onClick={() => setTab('ideas')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'ideas' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>
          💡 Ideas & Suggestions ({fundraiserSuggestions.length})
        </button>
      </div>

      {tab === 'active' ? (
        <div className="space-y-4">
          {fundraisers.length === 0 && (
            <div className="card p-12 text-center">
              <div className="w-16 h-16 gradient-green rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">💰</div>
              <h3 className="font-bold text-slate-800 text-lg mb-2">No fundraisers yet</h3>
              <p className="text-slate-500 text-sm mb-5 max-w-sm mx-auto">Browse the Ideas tab to find a fundraiser that fits your school, then add it here to start tracking.</p>
              <button onClick={() => setTab('ideas')} className="btn-primary justify-center">Browse Fundraiser Ideas →</button>
            </div>
          )}
          {fundraisers.map(f => {
            const pct = Math.min(100, Math.round((f.raisedAmount / f.goalAmount) * 100))
            const cfg = statusConfig[f.status]
            return (
              <div key={f.id} className="card p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-slate-800">{f.name}</h3>
                      <span className={`badge ${cfg.color}`}>{cfg.label}</span>
                      <span className="badge bg-slate-100 text-slate-500">{f.type}</span>
                    </div>
                    <p className="text-sm text-slate-500 mb-4">{f.description}</p>
                    <div className="flex items-center gap-6 text-sm text-slate-500 mb-4">
                      <span>📅 {f.startDate} → {f.endDate}</span>
                      {f.vendor && <span>🏢 {f.vendor}</span>}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-semibold text-slate-800">${f.raisedAmount.toLocaleString()} raised</span>
                          <span className="text-slate-400">Goal: ${f.goalAmount.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2.5">
                          <div
                            className={`h-2.5 rounded-full transition-all ${f.status === 'completed' && pct >= 100 ? 'gradient-emerald' : 'gradient-brand'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{pct}% of goal</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-2xl font-bold text-brand-600">{pct}%</p>
                    <p className="text-xs text-slate-400">complete</p>
                    <div className="mt-3 flex flex-col gap-2">
                      <button className="btn-secondary text-xs py-1.5">Edit</button>
                      <button className="btn-primary text-xs py-1.5">Update Amount</button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {fundraiserSuggestions.map((s, i) => (
            <div key={i} className="card p-5 hover:shadow-md transition-all group">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm group-hover:text-brand-700">{s.name}</h3>
                  <span className="badge bg-slate-100 text-slate-500 text-xs mt-1">{s.type}</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">{s.description}</p>
              <button
                onClick={() => addSuggestion(s)}
                className="mt-4 w-full btn-primary text-xs py-2 justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                + Add to My Fundraisers
              </button>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-fade-in max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-slate-800 text-lg mb-4">New Fundraiser</h3>
            <div className="space-y-3">
              <div>
                <label className="label">Fundraiser Name *</label>
                <input className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Spring Book Fair" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Type</label>
                  <input className="input" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} placeholder="e.g. Pledge-Based" />
                </div>
                <div>
                  <label className="label">Goal Amount ($)</label>
                  <input className="input" type="number" value={form.goalAmount} onChange={e => setForm(p => ({ ...p, goalAmount: e.target.value }))} placeholder="5000" />
                </div>
                <div>
                  <label className="label">Start Date</label>
                  <input className="input" type="date" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} />
                </div>
                <div>
                  <label className="label">End Date</label>
                  <input className="input" type="date" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="label">Vendor / Partner</label>
                <input className="input" value={form.vendor} onChange={e => setForm(p => ({ ...p, vendor: e.target.value }))} placeholder="Scholastic, Chipotle, etc." />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea className="input" rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Describe the fundraiser…" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAdd(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button onClick={addFundraiser} className="btn-primary flex-1 justify-center">Create Fundraiser</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
