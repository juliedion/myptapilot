import { useState } from 'react'
import ModuleHeader from '../../components/ModuleHeader'
import { programSuggestions } from '../../data/suggestions'

interface Program {
  id: string
  name: string
  category: string
  description: string
  status: 'idea' | 'planning' | 'active' | 'completed'
  budget?: number
  lead?: string
}

const SEED: Program[] = []

const CATEGORY_CONFIG: Record<string, { color: string; emoji: string }> = {
  academic: { color: 'bg-blue-100 text-blue-700', emoji: '📚' },
  arts: { color: 'bg-purple-100 text-purple-700', emoji: '🎨' },
  wellness: { color: 'bg-green-100 text-green-700', emoji: '💚' },
  community: { color: 'bg-orange-100 text-orange-700', emoji: '🤝' },
  stem: { color: 'bg-teal-100 text-teal-700', emoji: '🔬' },
}

const STATUS_CONFIG = {
  idea: { color: 'bg-slate-100 text-slate-600', label: 'Idea' },
  planning: { color: 'bg-blue-100 text-blue-700', label: 'Planning' },
  active: { color: 'bg-green-100 text-green-700', label: 'Active' },
  completed: { color: 'bg-gray-100 text-gray-600', label: 'Completed' },
}

export default function ProgramsModule() {
  const [programs, setPrograms] = useState(SEED)
  const [tab, setTab] = useState<'programs' | 'ideas'>(SEED.length === 0 ? 'ideas' : 'programs')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', category: 'academic', description: '', status: 'idea' as Program['status'], budget: '', lead: '' })

  const filtered = programs.filter(p => categoryFilter === 'all' || p.category === categoryFilter)

  const add = () => {
    if (!form.name) return
    setPrograms(prev => [...prev, { id: Date.now().toString(), ...form, budget: form.budget ? parseFloat(form.budget) : undefined }])
    setForm({ name: '', category: 'academic', description: '', status: 'idea', budget: '', lead: '' })
    setShowAdd(false)
  }

  const addSuggestion = (s: typeof programSuggestions[0]) => {
    setPrograms(prev => [...prev, {
      id: Date.now().toString(),
      name: s.name,
      category: s.category,
      description: s.description,
      status: 'idea',
    }])
  }

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      <ModuleHeader title="Programs & Initiatives" subtitle="Launch and track programs that enrich student life" gradient="gradient-warm" icon="💡" />
      <div className="flex items-center justify-between mb-6">
        <div>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Program
        </button>
      </div>

      <div className="flex gap-1 mb-6 bg-slate-100 rounded-xl p-1 w-fit">
        <button onClick={() => setTab('programs')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'programs' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'}`}>
          Our Programs ({programs.length})
        </button>
        <button onClick={() => setTab('ideas')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'ideas' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'}`}>
          💡 Suggested Programs ({programSuggestions.length})
        </button>
      </div>

      {tab === 'programs' && (
        <>
          <div className="flex gap-2 mb-6">
            {['all', 'academic', 'arts', 'wellness', 'community', 'stem'].map(c => (
              <button key={c} onClick={() => setCategoryFilter(c)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${categoryFilter === c ? 'bg-brand-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                {c === 'all' ? 'All' : `${CATEGORY_CONFIG[c]?.emoji} ${c}`}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {programs.length === 0 && (
              <div className="col-span-2 card p-12 text-center">
                <div className="w-16 h-16 gradient-warm rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">💡</div>
                <h3 className="font-bold text-slate-800 text-lg mb-2">No programs yet</h3>
                <p className="text-slate-500 text-sm mb-5 max-w-sm mx-auto">Check out the Suggested Programs tab for ideas like Reflections, STEM Night, and more.</p>
                <button onClick={() => setTab('ideas')} className="btn-primary justify-center">Browse Program Ideas →</button>
              </div>
            )}
            {filtered.map(prog => {
              const cat = CATEGORY_CONFIG[prog.category] || { color: 'bg-slate-100 text-slate-600', emoji: '📌' }
              const status = STATUS_CONFIG[prog.status]
              return (
                <div key={prog.id} className="card p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{cat.emoji}</span>
                      <div>
                        <h3 className="font-bold text-slate-800">{prog.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`badge ${cat.color} text-xs`}>{prog.category}</span>
                          <span className={`badge ${status.color} text-xs`}>{status.label}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mb-3 leading-relaxed">{prog.description}</p>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    {prog.budget && <span>💰 Budget: ${prog.budget.toLocaleString()}</span>}
                    {prog.lead && <span>👤 Lead: {prog.lead}</span>}
                  </div>
                  <div className="mt-4 flex gap-2">
                    {(['idea', 'planning', 'active', 'completed'] as Program['status'][]).map(s => (
                      <button
                        key={s}
                        onClick={() => setPrograms(prev => prev.map(p => p.id === prog.id ? { ...p, status: s } : p))}
                        className={`text-xs px-2 py-1 rounded-lg transition-all ${prog.status === s ? STATUS_CONFIG[s].color + ' font-semibold' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        {STATUS_CONFIG[s].label}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {tab === 'ideas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {programSuggestions.map((s, i) => {
            const cat = CATEGORY_CONFIG[s.category] || { color: 'bg-slate-100 text-slate-600', emoji: '📌' }
            const alreadyAdded = programs.some(p => p.name === s.name)
            return (
              <div key={i} className="card p-5 hover:shadow-md transition-all group">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-2xl">{cat.emoji}</span>
                  {alreadyAdded && <span className="badge bg-green-100 text-green-700 text-xs">Added ✓</span>}
                </div>
                <h3 className="font-bold text-slate-800 text-sm mb-1">{s.name}</h3>
                <span className={`badge ${cat.color} text-xs`}>{s.category}</span>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">{s.description}</p>
                {!alreadyAdded && (
                  <button onClick={() => addSuggestion(s)} className="mt-4 w-full btn-primary text-xs py-2 justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    + Add to Programs
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
            <h3 className="font-bold text-slate-800 text-lg mb-4">Add Program</h3>
            <div className="space-y-3">
              <div>
                <label className="label">Program Name *</label>
                <input className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Family STEM Nights" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Category</label>
                  <select className="input" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                    <option value="academic">Academic</option>
                    <option value="arts">Arts</option>
                    <option value="wellness">Wellness</option>
                    <option value="community">Community</option>
                    <option value="stem">STEM</option>
                  </select>
                </div>
                <div>
                  <label className="label">Status</label>
                  <select className="input" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as Program['status'] }))}>
                    <option value="idea">Idea</option>
                    <option value="planning">Planning</option>
                    <option value="active">Active</option>
                  </select>
                </div>
                <div>
                  <label className="label">Budget ($)</label>
                  <input className="input" type="number" value={form.budget} onChange={e => setForm(p => ({ ...p, budget: e.target.value }))} placeholder="500" />
                </div>
                <div>
                  <label className="label">Program Lead</label>
                  <input className="input" value={form.lead} onChange={e => setForm(p => ({ ...p, lead: e.target.value }))} placeholder="Jane Smith" />
                </div>
              </div>
              <div>
                <label className="label">Description</label>
                <textarea className="input" rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAdd(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button onClick={add} className="btn-primary flex-1 justify-center">Add Program</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
