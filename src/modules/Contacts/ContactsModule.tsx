import { useState } from 'react'

interface Contact {
  id: string
  name: string
  email: string
  phone: string
  role: string
  type: 'parent' | 'officer' | 'member' | 'teacher' | 'vendor'
  grade?: string
  committee?: string
}

const SEED: Contact[] = [
  { id: '1', name: 'Sarah Mitchell', email: 'smitchell@email.com', phone: '(555) 234-5678', role: 'PTA President', type: 'officer', committee: 'Executive Board' },
  { id: '2', name: 'Tom Rivera', email: 'trivera@email.com', phone: '(555) 345-6789', role: 'Vice President', type: 'officer', committee: 'Executive Board' },
  { id: '3', name: 'Jessica Park', email: 'jpark@email.com', phone: '(555) 456-7890', role: 'Secretary', type: 'officer', committee: 'Executive Board' },
  { id: '4', name: 'Michael Chen', email: 'mchen@email.com', phone: '(555) 567-8901', role: 'Treasurer', type: 'officer', committee: 'Executive Board' },
  { id: '5', name: 'Amanda Johnson', email: 'ajohnson@email.com', phone: '(555) 678-9012', role: 'Fundraising Chair', type: 'officer', committee: 'Fundraising' },
  { id: '6', name: 'David Kim', email: 'dkim@email.com', phone: '(555) 789-0123', role: 'Events Chair', type: 'officer', committee: 'Events' },
  { id: '7', name: 'Maria Gonzalez', email: 'mgonzalez@email.com', phone: '(555) 890-1234', role: 'Parent Member', type: 'parent', grade: '3rd' },
  { id: '8', name: 'Robert Thompson', email: 'rthompson@email.com', phone: '(555) 901-2345', role: 'Parent Member', type: 'parent', grade: 'K' },
  { id: '9', name: 'Linda Wu', email: 'lwu@email.com', phone: '(555) 012-3456', role: 'Parent Member', type: 'parent', grade: '5th' },
  { id: '10', name: 'James Carter', email: 'jcarter@email.com', phone: '(555) 123-4567', role: 'Parent Member', type: 'parent', grade: '1st' },
  { id: '11', name: 'Ms. Patricia Brown', email: 'pbrown@lincoln.edu', phone: '(555) 234-5679', role: '2nd Grade Teacher', type: 'teacher' },
  { id: '12', name: 'Mr. Kevin Davis', email: 'kdavis@lincoln.edu', phone: '(555) 345-6780', role: '4th Grade Teacher', type: 'teacher' },
  { id: '13', name: 'PrintPro Solutions', email: 'orders@printpro.com', phone: '(555) 456-7891', role: 'Spirit Wear Vendor', type: 'vendor' },
  { id: '14', name: 'Fun Events Rentals', email: 'info@funevents.com', phone: '(555) 567-8902', role: 'Carnival Equipment', type: 'vendor' },
]

const TYPE_CONFIG = {
  officer: { label: 'Officers', color: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500' },
  parent: { label: 'Parents', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  member: { label: 'Members', color: 'bg-teal-100 text-teal-700', dot: 'bg-teal-500' },
  teacher: { label: 'Teachers', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  vendor: { label: 'Vendors', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
}

export default function ContactsModule() {
  const [contacts, setContacts] = useState(SEED)
  const [filter, setFilter] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Contact | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: '', type: 'parent' as Contact['type'], grade: '', committee: '' })

  const filtered = contacts.filter(c => {
    const matchType = filter === 'all' || c.type === filter
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.role.toLowerCase().includes(search.toLowerCase())
    return matchType && matchSearch
  })

  const addContact = () => {
    if (!form.name || !form.email) return
    setContacts(prev => [...prev, { id: Date.now().toString(), ...form }])
    setForm({ name: '', email: '', phone: '', role: '', type: 'parent', grade: '', committee: '' })
    setShowAdd(false)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Contact Directory</h1>
          <p className="text-slate-500 text-sm mt-1">Parents, officers, members, teachers & vendors all in one place</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Export CSV
          </button>
          <button onClick={() => setShowAdd(true)} className="btn-primary">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add Contact
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {Object.entries(TYPE_CONFIG).map(([type, cfg]) => (
          <button
            key={type}
            onClick={() => setFilter(filter === type ? 'all' : type)}
            className={`card p-4 text-center transition-all ${filter === type ? 'ring-2 ring-brand-500' : 'hover:shadow-md'}`}
          >
            <div className={`w-3 h-3 rounded-full ${cfg.dot} mx-auto mb-2`} />
            <p className="text-xl font-bold text-slate-800">{contacts.filter(c => c.type === type).length}</p>
            <p className="text-xs text-slate-500">{cfg.label}</p>
          </button>
        ))}
      </div>

      <div className="flex gap-6">
        {/* List */}
        <div className="flex-1">
          <div className="mb-4 relative">
            <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input className="input pl-9" placeholder="Search by name, email, or role…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="space-y-2">
            {filtered.map(contact => {
              const cfg = TYPE_CONFIG[contact.type]
              return (
                <div
                  key={contact.id}
                  onClick={() => setSelected(selected?.id === contact.id ? null : contact)}
                  className={`card p-4 flex items-center gap-4 cursor-pointer hover:shadow-md transition-all ${selected?.id === contact.id ? 'ring-2 ring-brand-500' : ''}`}
                >
                  <div className={`w-10 h-10 rounded-full ${cfg.dot} flex items-center justify-center text-white font-bold flex-shrink-0`}>
                    {contact.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-800 text-sm">{contact.name}</p>
                      <span className={`badge ${cfg.color} text-xs`}>{contact.type}</span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">{contact.role}{contact.grade ? ` · Grade ${contact.grade}` : ''}</p>
                  </div>
                  <div className="text-right hidden md:block">
                    <p className="text-sm text-slate-600">{contact.email}</p>
                    <p className="text-xs text-slate-400">{contact.phone}</p>
                  </div>
                </div>
              )
            })}
            {filtered.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <p className="text-4xl mb-3">👥</p>
                <p className="text-sm">No contacts found</p>
              </div>
            )}
          </div>
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className="w-72 flex-shrink-0">
            <div className="card p-6 sticky top-6">
              <div className="text-center mb-5">
                <div className={`w-16 h-16 rounded-full ${TYPE_CONFIG[selected.type].dot} flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3`}>
                  {selected.name.charAt(0)}
                </div>
                <h3 className="font-bold text-slate-800">{selected.name}</h3>
                <p className="text-sm text-slate-500">{selected.role}</p>
                <span className={`badge ${TYPE_CONFIG[selected.type].color} mt-2`}>{selected.type}</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-400">📧</span>
                  <a href={`mailto:${selected.email}`} className="text-brand-600 hover:underline truncate">{selected.email}</a>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-400">📞</span>
                  <span className="text-slate-700">{selected.phone}</span>
                </div>
                {selected.grade && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-400">🎒</span>
                    <span className="text-slate-700">Grade {selected.grade}</span>
                  </div>
                )}
                {selected.committee && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-400">🏛️</span>
                    <span className="text-slate-700">{selected.committee}</span>
                  </div>
                )}
              </div>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <a href={`mailto:${selected.email}`} className="btn-primary text-xs justify-center py-2">Email</a>
                <button className="btn-secondary text-xs justify-center py-2">Edit</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in">
            <h3 className="font-bold text-slate-800 text-lg mb-4">Add Contact</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="label">Full Name *</label>
                  <input className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Jane Smith" />
                </div>
                <div>
                  <label className="label">Email *</label>
                  <input className="input" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="jane@email.com" />
                </div>
                <div>
                  <label className="label">Phone</label>
                  <input className="input" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="(555) 000-0000" />
                </div>
                <div>
                  <label className="label">Role / Title</label>
                  <input className="input" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} placeholder="Parent Member" />
                </div>
                <div>
                  <label className="label">Type</label>
                  <select className="input" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as Contact['type'] }))}>
                    <option value="parent">Parent</option>
                    <option value="officer">Officer</option>
                    <option value="member">Member</option>
                    <option value="teacher">Teacher</option>
                    <option value="vendor">Vendor</option>
                  </select>
                </div>
                {form.type === 'parent' && (
                  <div>
                    <label className="label">Child's Grade</label>
                    <input className="input" value={form.grade} onChange={e => setForm(p => ({ ...p, grade: e.target.value }))} placeholder="3rd" />
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAdd(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button onClick={addContact} className="btn-primary flex-1 justify-center">Add Contact</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
