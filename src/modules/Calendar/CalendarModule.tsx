import { useState, useRef } from 'react'
import ModuleHeader from '../../components/ModuleHeader'
import { monthlyEventSuggestions } from '../../data/suggestions'

const MONTHS       = ['January','February','March','April','May','June','July','August','September','October','November','December']
const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAYS         = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const DAYS_SHORT   = ['S','M','T','W','T','F','S']
const HOURS        = Array.from({ length: 15 }, (_, i) => i + 7) // 7am–9pm

interface Signup {
  id: string
  name: string
  email?: string
  role?: string
  note?: string
}

interface CalEvent {
  id: string
  year: number
  month: number
  day: number
  hour?: number
  endHour?: number
  title: string
  type: 'meeting' | 'fundraiser' | 'event' | 'deadline'
  description?: string
  location?: string
  signups: Signup[]
  maxSignups?: number
}

type ViewMode = 'month' | 'day' | 'year' | 'list'

const seed = (e: Omit<CalEvent, 'signups'>): CalEvent => ({ ...e, signups: [] })

const SEED_EVENTS: CalEvent[] = [
  seed({ id: '1',  year: 2025, month: 6,  day: 10, hour: 18, endHour: 19, title: 'Board Meeting',          type: 'meeting',    description: 'Monthly board meeting via Zoom', location: 'Zoom' }),
  seed({ id: '2',  year: 2025, month: 6,  day: 22, hour: 17,              title: 'Summer Planning',        type: 'meeting' }),
  seed({ id: '3',  year: 2025, month: 6,  day: 30,                        title: 'Walk-A-Thon End',        type: 'deadline' }),
  seed({ id: '4',  year: 2025, month: 7,  day:  5, hour: 18, endHour: 20, title: 'Back-to-School Night',   type: 'event',      description: 'Welcome families to the new school year', location: 'School Gymnasium' }),
  seed({ id: '5',  year: 2025, month: 7,  day: 12,                        title: 'Spirit Wear Deadline',   type: 'deadline' }),
  seed({ id: '6',  year: 2025, month: 7,  day: 20, hour: 11,              title: 'Welcome Picnic',         type: 'event',      location: 'School Grounds', maxSignups: 50 }),
  seed({ id: '7',  year: 2025, month: 7,  day: 26, hour: 19, endHour: 20, title: 'First PTO Meeting',      type: 'meeting',    location: 'Library' }),
  seed({ id: '8',  year: 2025, month: 8,  day:  3, hour:  8,              title: 'Walk-A-Thon Kickoff',    type: 'fundraiser', description: 'Kick off our biggest fundraiser of the year', maxSignups: 100 }),
  seed({ id: '9',  year: 2025, month: 8,  day: 15, hour:  9,              title: 'Picture Day',            type: 'event' }),
  seed({ id: '10', year: 2025, month: 8,  day: 23, hour: 18, endHour: 19, title: 'General Meeting',        type: 'meeting' }),
  seed({ id: '11', year: 2025, month: 9,  day: 18, hour: 17, endHour: 21, title: 'Fall Carnival',          type: 'event',      description: 'Annual fall carnival with games and food', location: 'School Grounds', maxSignups: 200 }),
  seed({ id: '12', year: 2025, month: 9,  day:  1, hour:  9,              title: 'Box Tops Drive Starts',  type: 'fundraiser' }),
  seed({ id: '13', year: 2025, month: 10, day: 11, hour: 19, endHour: 20, title: 'November Board Meeting', type: 'meeting' }),
  seed({ id: '14', year: 2025, month: 11, day: 14, hour: 10,              title: 'Holiday Shop',           type: 'fundraiser', maxSignups: 30 }),
]

const TYPE = {
  meeting:    { bg: 'bg-blue-100',   text: 'text-blue-700',   dot: 'bg-blue-500',   border: 'border-blue-200',   gradient: 'from-blue-500 to-blue-600',    pill: 'bg-blue-600' },
  fundraiser: { bg: 'bg-amber-100',  text: 'text-amber-700',  dot: 'bg-amber-500',  border: 'border-amber-200',  gradient: 'from-amber-400 to-orange-500', pill: 'bg-amber-500' },
  event:      { bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-500', border: 'border-purple-200', gradient: 'from-violet-500 to-purple-600', pill: 'bg-violet-600' },
  deadline:   { bg: 'bg-red-100',    text: 'text-red-600',    dot: 'bg-red-500',    border: 'border-red-200',    gradient: 'from-red-500 to-rose-500',     pill: 'bg-red-500' },
}

const BLANK_EVENT = { title: '', day: '', hour: '18', endHour: '19', type: 'event' as CalEvent['type'], description: '', location: '', maxSignups: '' }

function daysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate() }
function firstDayOf(y: number, m: number)  { return new Date(y, m, 1).getDay() }
function fmt12(h: number) {
  if (h === 0)  return '12 AM'
  if (h < 12)  return `${h} AM`
  if (h === 12) return '12 PM'
  return `${h - 12} PM`
}
function pad(n: number) { return String(n).padStart(2, '0') }
function icsDate(e: CalEvent) {
  const base = `${e.year}${pad(e.month + 1)}${pad(e.day)}`
  return e.hour != null ? `${base}T${pad(e.hour)}0000` : `${base}`
}

// ── iCal export ──────────────────────────────────────────────────────────────
function exportICS(events: CalEvent[]) {
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//My PTA Pilot//Calendar//EN', 'CALSCALE:GREGORIAN',
    ...events.flatMap(e => [
      'BEGIN:VEVENT',
      `UID:${e.id}@myptapilot.com`,
      `DTSTART:${icsDate(e)}`,
      e.endHour != null ? `DTEND:${icsDate({ ...e, hour: e.endHour })}` : '',
      `SUMMARY:${e.title}`,
      e.description ? `DESCRIPTION:${e.description}` : '',
      e.location    ? `LOCATION:${e.location}` : '',
      `CATEGORIES:${e.type.toUpperCase()}`,
      'END:VEVENT',
    ].filter(Boolean)),
    'END:VCALENDAR',
  ]
  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'pta-calendar.ics'
  a.click()
}

// ── CSV export ───────────────────────────────────────────────────────────────
function exportCSV(events: CalEvent[]) {
  const header = 'Title,Date,Time,Type,Location,Description,Signups'
  const rows = events.map(e =>
    [e.title, `${MONTHS[e.month]} ${e.day} ${e.year}`, e.hour != null ? fmt12(e.hour) : 'All day',
     e.type, e.location || '', e.description || '', e.signups.length].map(v => `"${v}"`).join(',')
  )
  const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'pta-calendar.csv'
  a.click()
}

// ── iCal import parser ───────────────────────────────────────────────────────
function parseICS(text: string): Omit<CalEvent, 'id'>[] {
  const vevents = text.split('BEGIN:VEVENT').slice(1)
  return vevents.map(block => {
    const get = (key: string) => {
      const m = block.match(new RegExp(`${key}[^:]*:([^\r\n]+)`))
      return m ? m[1].trim() : ''
    }
    const dtstart = get('DTSTART')
    const y = parseInt(dtstart.slice(0, 4))
    const mo = parseInt(dtstart.slice(4, 6)) - 1
    const d  = parseInt(dtstart.slice(6, 8))
    const hasTime = dtstart.includes('T')
    const h  = hasTime ? parseInt(dtstart.slice(9, 11)) : undefined
    const cats = get('CATEGORIES').toLowerCase()
    const type: CalEvent['type'] =
      cats.includes('meeting')    ? 'meeting'    :
      cats.includes('fundraiser') ? 'fundraiser' :
      cats.includes('deadline')   ? 'deadline'   : 'event'
    return {
      year: y, month: mo, day: d, hour: h,
      title: get('SUMMARY') || 'Imported Event',
      type,
      description: get('DESCRIPTION') || undefined,
      location: get('LOCATION') || undefined,
      signups: [],
    }
  }).filter(e => !isNaN(e.year))
}

// ── Event Detail / Edit Modal ────────────────────────────────────────────────
function EventModal({
  event, onClose, onSave, onDelete,
}: {
  event: CalEvent
  onClose: () => void
  onSave: (e: CalEvent) => void
  onDelete: (id: string) => void
}) {
  const [tab, setTab]           = useState<'detail' | 'edit' | 'signups'>('detail')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [form, setForm]         = useState({
    title: event.title, day: String(event.day),
    hour: event.hour != null ? String(event.hour) : '',
    endHour: event.endHour != null ? String(event.endHour) : '',
    type: event.type, description: event.description || '',
    location: event.location || '',
    maxSignups: event.maxSignups != null ? String(event.maxSignups) : '',
  })
  const [signupForm, setSignupForm] = useState({ name: '', email: '', role: '', note: '' })

  const saveEdit = () => {
    onSave({
      ...event,
      title: form.title,
      day: parseInt(form.day),
      hour: form.hour ? parseInt(form.hour) : undefined,
      endHour: form.endHour ? parseInt(form.endHour) : undefined,
      type: form.type,
      description: form.description || undefined,
      location: form.location || undefined,
      maxSignups: form.maxSignups ? parseInt(form.maxSignups) : undefined,
    })
    setTab('detail')
  }

  const addSignup = () => {
    if (!signupForm.name.trim()) return
    const updated: CalEvent = {
      ...event,
      signups: [...event.signups, {
        id: Date.now().toString(),
        name: signupForm.name.trim(),
        email: signupForm.email || undefined,
        role: signupForm.role || undefined,
        note: signupForm.note || undefined,
      }],
    }
    onSave(updated)
    setSignupForm({ name: '', email: '', role: '', note: '' })
  }

  const removeSignup = (sid: string) => {
    onSave({ ...event, signups: event.signups.filter(s => s.id !== sid) })
  }

  const t = TYPE[event.type]
  const dateStr = `${DAYS[new Date(event.year, event.month, event.day).getDay()]}, ${MONTHS[event.month]} ${event.day}, ${event.year}`
  const spotsLeft = event.maxSignups != null ? event.maxSignups - event.signups.length : null

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col animate-fade-in" onClick={e => e.stopPropagation()}>

        {/* Header strip */}
        <div className={`bg-gradient-to-r ${t.gradient} p-5 rounded-t-2xl flex items-start justify-between`}>
          <div>
            <span className="text-white/70 text-xs font-semibold uppercase tracking-wider">{event.type}</span>
            <h2 className="text-white font-bold text-xl leading-tight mt-0.5">{event.title}</h2>
            <p className="text-white/75 text-sm mt-1">{dateStr}{event.hour != null ? ` · ${fmt12(event.hour)}${event.endHour != null ? ` – ${fmt12(event.endHour)}` : ''}` : ''}</p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white ml-4 flex-shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100">
          {(['detail','edit','signups'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-3 text-sm font-semibold capitalize transition-colors ${tab === t ? 'text-brand-600 border-b-2 border-brand-600' : 'text-slate-500 hover:text-slate-700'}`}>
              {t === 'signups' ? `Sign-Ups (${event.signups.length}${event.maxSignups ? `/${event.maxSignups}` : ''})` : t === 'detail' ? 'Details' : 'Edit'}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5">

          {/* DETAIL TAB */}
          {tab === 'detail' && (
            <div className="space-y-4">
              {event.location && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 text-slate-500">📍</div>
                  <div><p className="text-xs text-slate-400 font-medium">Location</p><p className="text-sm text-slate-800">{event.location}</p></div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 text-slate-500">📅</div>
                <div><p className="text-xs text-slate-400 font-medium">Date & Time</p>
                  <p className="text-sm text-slate-800">{dateStr}</p>
                  <p className="text-sm text-slate-600">{event.hour != null ? `${fmt12(event.hour)}${event.endHour != null ? ` – ${fmt12(event.endHour)}` : ''}` : 'All day'}</p>
                </div>
              </div>
              {event.description && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 text-slate-500">📝</div>
                  <div><p className="text-xs text-slate-400 font-medium">Description</p><p className="text-sm text-slate-700 leading-relaxed">{event.description}</p></div>
                </div>
              )}
              {event.maxSignups != null && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 text-slate-500">🙋</div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Sign-Ups</p>
                    <p className="text-sm text-slate-800">{event.signups.length} signed up · {spotsLeft! > 0 ? `${spotsLeft} spots left` : <span className="text-red-600 font-semibold">Full</span>}</p>
                    <div className="w-48 bg-slate-100 rounded-full h-1.5 mt-1.5">
                      <div className="gradient-brand h-1.5 rounded-full" style={{ width: `${Math.min(100, (event.signups.length / event.maxSignups!) * 100)}%` }} />
                    </div>
                  </div>
                </div>
              )}
              <div className="pt-2 flex gap-2">
                <button onClick={() => setTab('edit')} className="btn-secondary flex-1 justify-center text-sm">✏️ Edit Event</button>
                <button onClick={() => setTab('signups')} className="btn-primary flex-1 justify-center text-sm">🙋 Sign-Ups</button>
              </div>
              <div className="pt-1">
                {!confirmDelete ? (
                  <button onClick={() => setConfirmDelete(true)} className="w-full py-2 rounded-xl text-sm text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors font-medium">
                    🗑 Delete Event
                  </button>
                ) : (
                  <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                    <p className="text-sm text-red-700 font-semibold mb-3">Delete "{event.title}"? This cannot be undone.</p>
                    <div className="flex gap-2">
                      <button onClick={() => setConfirmDelete(false)} className="btn-secondary flex-1 justify-center text-sm">Cancel</button>
                      <button onClick={() => onDelete(event.id)} className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors">Delete</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* EDIT TAB */}
          {tab === 'edit' && (
            <div className="space-y-4">
              <div>
                <label className="label">Title *</label>
                <input className="input" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Day</label>
                  <input className="input" type="number" min="1" max="31" value={form.day} onChange={e => setForm(p => ({ ...p, day: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Type</label>
                  <select className="input" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as CalEvent['type'] }))}>
                    <option value="event">Event</option>
                    <option value="meeting">Meeting</option>
                    <option value="fundraiser">Fundraiser</option>
                    <option value="deadline">Deadline</option>
                  </select>
                </div>
                <div>
                  <label className="label">Start Time</label>
                  <select className="input" value={form.hour} onChange={e => setForm(p => ({ ...p, hour: e.target.value }))}>
                    <option value="">All day</option>
                    {HOURS.map(h => <option key={h} value={h}>{fmt12(h)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">End Time</label>
                  <select className="input" value={form.endHour} onChange={e => setForm(p => ({ ...p, endHour: e.target.value }))} disabled={!form.hour}>
                    <option value="">—</option>
                    {HOURS.filter(h => h > parseInt(form.hour || '0')).map(h => <option key={h} value={h}>{fmt12(h)}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Location</label>
                <input className="input" placeholder="e.g. School Gymnasium" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea className="input" rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div>
                <label className="label">Max Sign-Ups (leave blank for unlimited)</label>
                <input className="input" type="number" min="1" placeholder="e.g. 50" value={form.maxSignups} onChange={e => setForm(p => ({ ...p, maxSignups: e.target.value }))} />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setTab('detail')} className="btn-secondary flex-1 justify-center">Cancel</button>
                <button onClick={saveEdit} className="btn-primary flex-1 justify-center">Save Changes</button>
              </div>
            </div>
          )}

          {/* SIGNUPS TAB */}
          {tab === 'signups' && (
            <div className="space-y-5">
              {/* Add signup form */}
              {(spotsLeft == null || spotsLeft > 0) ? (
                <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
                  <p className="text-sm font-bold text-slate-700">Add a Sign-Up</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="label">Name *</label>
                      <input className="input text-sm" placeholder="Jane Smith" value={signupForm.name} onChange={e => setSignupForm(p => ({ ...p, name: e.target.value }))} />
                    </div>
                    <div>
                      <label className="label">Email</label>
                      <input className="input text-sm" placeholder="jane@email.com" type="email" value={signupForm.email} onChange={e => setSignupForm(p => ({ ...p, email: e.target.value }))} />
                    </div>
                    <div>
                      <label className="label">Role / Slot</label>
                      <input className="input text-sm" placeholder="e.g. Volunteer, Chaperone" value={signupForm.role} onChange={e => setSignupForm(p => ({ ...p, role: e.target.value }))} />
                    </div>
                    <div>
                      <label className="label">Note</label>
                      <input className="input text-sm" placeholder="Optional" value={signupForm.note} onChange={e => setSignupForm(p => ({ ...p, note: e.target.value }))} />
                    </div>
                  </div>
                  <button onClick={addSignup} className="btn-primary w-full justify-center text-sm">+ Add Sign-Up</button>
                </div>
              ) : (
                <div className="bg-red-50 rounded-xl p-4 text-center">
                  <p className="text-red-600 font-semibold text-sm">This event is full ({event.maxSignups}/{event.maxSignups} spots taken)</p>
                </div>
              )}

              {/* Signup list */}
              {event.signups.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">No sign-ups yet</p>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{event.signups.length} Sign-Up{event.signups.length !== 1 ? 's' : ''}</p>
                  {event.signups.map((s, i) => (
                    <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 group">
                      <div className="w-8 h-8 rounded-full gradient-vivid flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800">{s.name}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          {s.email && <p className="text-xs text-slate-400">{s.email}</p>}
                          {s.role  && <span className="badge bg-brand-100 text-brand-700 text-xs">{s.role}</span>}
                          {s.note  && <span className="text-xs text-slate-400 italic">{s.note}</span>}
                        </div>
                      </div>
                      <button onClick={() => removeSignup(s.id)} className="text-slate-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function CalendarModule() {
  const today = new Date()
  const importRef = useRef<HTMLInputElement>(null)

  const [view, setView]             = useState<ViewMode>('month')
  const [year, setYear]             = useState(today.getFullYear())
  const [month, setMonth]           = useState(today.getMonth())
  const [selectedDay, setSelectedDay] = useState(today.getDate())
  const [events, setEvents]         = useState<CalEvent[]>(SEED_EVENTS)
  const [showAdd, setShowAdd]       = useState(false)
  const [selected, setSelected]     = useState<CalEvent | null>(null)
  const [listFilter, setListFilter] = useState('all')
  const [listSearch, setListSearch] = useState('')
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [importMsg, setImportMsg]   = useState('')
  const [newEvent, setNewEvent]     = useState(BLANK_EVENT)

  const eventsFor = (y: number, m: number, d?: number) =>
    events.filter(e => e.year === y && e.month === m && (d == null || e.day === d))

  const openEvent = (ev: CalEvent) => setSelected(ev)
  const closeEvent = () => setSelected(null)

  const saveEvent = (updated: CalEvent) => {
    setEvents(prev => prev.map(e => e.id === updated.id ? updated : e))
    setSelected(updated)
  }

  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id))
    setSelected(null)
  }

  const addEvent = () => {
    if (!newEvent.title || !newEvent.day) return
    setEvents(prev => [...prev, {
      id: Date.now().toString(),
      year, month,
      day: parseInt(newEvent.day),
      hour: newEvent.hour ? parseInt(newEvent.hour) : undefined,
      endHour: newEvent.endHour ? parseInt(newEvent.endHour) : undefined,
      title: newEvent.title,
      type: newEvent.type,
      description: newEvent.description || undefined,
      location: newEvent.location || undefined,
      maxSignups: newEvent.maxSignups ? parseInt(newEvent.maxSignups) : undefined,
      signups: [],
    }])
    setNewEvent(BLANK_EVENT)
    setShowAdd(false)
  }

  const handleImport = (file: File) => {
    const reader = new FileReader()
    reader.onload = e => {
      const text = e.target?.result as string
      const parsed = parseICS(text)
      if (parsed.length === 0) { setImportMsg('No events found in file.'); return }
      setEvents(prev => [...prev, ...parsed.map(ev => ({ ...ev, id: `imp_${Date.now()}_${Math.random()}` }))])
      setImportMsg(`✓ Imported ${parsed.length} event${parsed.length !== 1 ? 's' : ''}`)
      setTimeout(() => setImportMsg(''), 4000)
    }
    reader.readAsText(file)
  }

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1) }
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1) }
  const prevDay   = () => { const d = new Date(year, month, selectedDay - 1); setYear(d.getFullYear()); setMonth(d.getMonth()); setSelectedDay(d.getDate()) }
  const nextDay   = () => { const d = new Date(year, month, selectedDay + 1); setYear(d.getFullYear()); setMonth(d.getMonth()); setSelectedDay(d.getDate()) }
  const goToDay   = (d: number, m?: number, y?: number) => { if (m != null) setMonth(m); if (y != null) setYear(y); setSelectedDay(d); setView('day') }
  const goToday   = () => { setYear(today.getFullYear()); setMonth(today.getMonth()); setSelectedDay(today.getDate()) }

  // ── shared sub-components ─────────────────────────────────────────────────
  const EventPill = ({ ev, compact = false }: { ev: CalEvent; compact?: boolean }) => (
    <div onClick={e => { e.stopPropagation(); openEvent(ev) }}
      className={`${TYPE[ev.type].bg} ${TYPE[ev.type].text} text-[10px] px-1.5 py-0.5 rounded-md mb-0.5 truncate font-semibold cursor-pointer hover:opacity-80 transition-opacity ${compact ? '' : ''}`}>
      {ev.hour != null && !compact ? `${fmt12(ev.hour)} ` : ''}{ev.title}
      {ev.signups.length > 0 && <span className="ml-1 opacity-60">({ev.signups.length})</span>}
    </div>
  )

  const ViewToggle = () => (
    <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
      {(['month','day','year','list'] as ViewMode[]).map(v => (
        <button key={v} onClick={() => setView(v)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${view === v ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>
          {v === 'month' ? '📅 Month' : v === 'day' ? '🕐 Day' : v === 'year' ? '📆 Year' : '📋 List'}
        </button>
      ))}
    </div>
  )

  const NavBar = () => {
    if (view === 'year' || view === 'list') return null
    const isPrevNext = view === 'day'
    return (
      <div className="flex items-center gap-2">
        <button onClick={isPrevNext ? prevDay : prevMonth} className="btn-secondary !p-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
        </button>
        <span className="font-bold text-slate-800 min-w-[160px] text-center text-sm">
          {view === 'day'
            ? `${DAYS[new Date(year, month, selectedDay).getDay()]}, ${MONTHS[month]} ${selectedDay}`
            : `${MONTHS[month]} ${year}`}
        </span>
        <button onClick={isPrevNext ? nextDay : nextMonth} className="btn-secondary !p-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
        </button>
        <button onClick={goToday} className="btn-secondary text-xs">Today</button>
      </div>
    )
  }

  // ── MONTH VIEW ────────────────────────────────────────────────────────────
  const MonthView = () => {
    const dim = daysInMonth(year, month)
    const first = firstDayOf(year, month)
    const cells: (number | null)[] = [...Array(first).fill(null), ...Array.from({ length: dim }, (_, i) => i + 1)]
    const monthEvs = eventsFor(year, month)
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6">
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map(d => <div key={d} className="text-center text-xs font-bold text-slate-400 py-2">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              if (!day) return <div key={i} />
              const dayEvs = monthEvs.filter(e => e.day === day)
              const isToday = year === today.getFullYear() && month === today.getMonth() && day === today.getDate()
              return (
                <div key={i} onClick={() => goToDay(day)}
                  className={`min-h-[76px] rounded-xl p-1.5 border cursor-pointer transition-all hover:shadow-sm ${isToday ? 'border-brand-400 bg-brand-50' : 'border-transparent hover:bg-slate-50 hover:border-slate-200'}`}>
                  <p className={`text-xs font-bold mb-1 w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-brand-600 text-white' : 'text-slate-600'}`}>{day}</p>
                  {dayEvs.slice(0, 2).map(ev => <EventPill key={ev.id} ev={ev} compact />)}
                  {dayEvs.length > 2 && <div className="text-[10px] text-slate-400 font-medium">+{dayEvs.length - 2} more</div>}
                </div>
              )
            })}
          </div>
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
            {Object.entries(TYPE).map(([type, c]) => (
              <div key={type} className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${c.dot}`} />
                <span className="text-xs text-slate-500 capitalize">{type}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="font-bold text-slate-800 mb-3">{MONTHS[month]} Events</h3>
            {monthEvs.length === 0
              ? <p className="text-sm text-slate-400">No events this month.</p>
              : <div className="space-y-2">
                  {monthEvs.sort((a, b) => a.day - b.day || (a.hour ?? 0) - (b.hour ?? 0)).map(ev => (
                    <div key={ev.id} onClick={() => openEvent(ev)}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                      <div className={`w-8 h-8 rounded-lg ${TYPE[ev.type].bg} flex items-center justify-center flex-shrink-0`}>
                        <span className={`text-xs font-bold ${TYPE[ev.type].text}`}>{ev.day}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-800 truncate">{ev.title}</p>
                        <p className={`text-xs ${TYPE[ev.type].text}`}>{ev.hour != null ? fmt12(ev.hour) : 'All day'}</p>
                      </div>
                      {ev.signups.length > 0 && <span className="badge bg-slate-100 text-slate-500 text-xs">{ev.signups.length} 🙋</span>}
                    </div>
                  ))}
                </div>
            }
          </div>
          <div className="card p-5">
            <h3 className="font-bold text-slate-800 mb-1">💡 Ideas for {MONTHS[month]}</h3>
            <p className="text-xs text-slate-400 mb-3">Click to add</p>
            <div className="space-y-1">
              {(monthlyEventSuggestions[month] || []).slice(0, 5).map((s, i) => (
                <button key={i}
                  onClick={() => setEvents(p => [...p, { id: Date.now().toString(), year, month, day: 15, title: s, type: 'event', signups: [] }])}
                  className="w-full text-left p-2 rounded-lg hover:bg-brand-50 text-sm text-slate-600 hover:text-brand-700 transition-colors flex items-center gap-2 group">
                  <span className="text-brand-400 opacity-0 group-hover:opacity-100 font-bold">+</span>{s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── DAY VIEW ──────────────────────────────────────────────────────────────
  const DayView = () => {
    const dayEvs = eventsFor(year, month, selectedDay)
    const allDay  = dayEvs.filter(e => e.hour == null)
    const timed   = dayEvs.filter(e => e.hour != null)
    const isToday = year === today.getFullYear() && month === today.getMonth() && selectedDay === today.getDate()
    return (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 card overflow-hidden">
          <div className={`p-5 border-b border-slate-100 ${isToday ? 'bg-brand-50' : ''}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{DAYS[new Date(year, month, selectedDay).getDay()]}</p>
                <h2 className="text-3xl font-bold text-slate-900">{selectedDay}</h2>
                <p className="text-sm text-slate-500">{MONTHS[month]} {year}</p>
              </div>
              {isToday && <span className="badge bg-brand-100 text-brand-700 text-sm">Today</span>}
            </div>
            {allDay.length > 0 && (
              <div className="mt-3 space-y-1">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">All Day</p>
                {allDay.map(ev => (
                  <div key={ev.id} onClick={() => openEvent(ev)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${TYPE[ev.type].bg} cursor-pointer hover:opacity-80`}>
                    <div className={`w-2 h-2 rounded-full ${TYPE[ev.type].dot}`} />
                    <span className={`text-sm font-semibold ${TYPE[ev.type].text}`}>{ev.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: '520px' }}>
            {HOURS.map(h => {
              const hourEvs = timed.filter(e => e.hour === h)
              const isNow = isToday && today.getHours() === h
              return (
                <div key={h} className={`flex border-b border-slate-50 min-h-[60px] ${isNow ? 'bg-brand-50/50' : ''}`}>
                  <div className="w-16 flex-shrink-0 px-3 pt-2">
                    <span className={`text-xs font-semibold ${isNow ? 'text-brand-600' : 'text-slate-400'}`}>{fmt12(h)}</span>
                  </div>
                  <div className="flex-1 py-1 pr-3 space-y-1">
                    {isNow && <div className="flex items-center gap-2 mb-1"><div className="w-2 h-2 rounded-full bg-brand-500 pulse-dot" /><div className="flex-1 h-px bg-brand-400" /></div>}
                    {hourEvs.map(ev => (
                      <div key={ev.id} onClick={() => openEvent(ev)}
                        className={`px-3 py-2 rounded-xl bg-gradient-to-r ${TYPE[ev.type].gradient} text-white shadow-sm cursor-pointer hover:opacity-90 transition-opacity`}>
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-bold leading-tight">{ev.title}</p>
                          {ev.signups.length > 0 && <span className="text-white/70 text-xs ml-2">{ev.signups.length} 🙋</span>}
                        </div>
                        {ev.endHour && <p className="text-xs text-white/70 mt-0.5">{fmt12(h)} – {fmt12(ev.endHour)}{ev.location ? ` · ${ev.location}` : ''}</p>}
                        {ev.description && <p className="text-xs text-white/70 mt-0.5 truncate">{ev.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        {/* Mini picker */}
        <div className="space-y-4">
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <button onClick={prevMonth} className="p-1 hover:bg-slate-100 rounded-lg"><svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg></button>
              <p className="text-sm font-bold text-slate-800">{MONTHS_SHORT[month]} {year}</p>
              <button onClick={nextMonth} className="p-1 hover:bg-slate-100 rounded-lg"><svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg></button>
            </div>
            <div className="grid grid-cols-7 mb-1">{DAYS_SHORT.map((d, i) => <div key={i} className="text-center text-[10px] font-bold text-slate-400 py-1">{d}</div>)}</div>
            <div className="grid grid-cols-7 gap-0.5">
              {[...Array(firstDayOf(year, month)).fill(null), ...Array.from({ length: daysInMonth(year, month) }, (_, i) => i + 1)].map((d, i) => {
                if (!d) return <div key={i} />
                const isSel = d === selectedDay, isTod = year === today.getFullYear() && month === today.getMonth() && d === today.getDate()
                const hasEv = eventsFor(year, month, d).length > 0
                return (
                  <button key={i} onClick={() => setSelectedDay(d)}
                    className={`w-full aspect-square rounded-full flex items-center justify-center text-[11px] font-semibold transition-all relative ${isSel ? 'bg-brand-600 text-white' : isTod ? 'bg-brand-100 text-brand-700' : 'hover:bg-slate-100 text-slate-700'}`}>
                    {d}
                    {hasEv && !isSel && <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-400" />}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="card p-4">
            <h3 className="font-bold text-slate-800 text-sm mb-3">This day's events</h3>
            {dayEvs.length === 0
              ? <p className="text-xs text-slate-400">No events. Add one above.</p>
              : <div className="space-y-2">
                  {dayEvs.sort((a, b) => (a.hour ?? -1) - (b.hour ?? -1)).map(ev => (
                    <div key={ev.id} onClick={() => openEvent(ev)}
                      className={`p-2.5 rounded-xl border cursor-pointer hover:shadow-sm transition-all ${TYPE[ev.type].border} ${TYPE[ev.type].bg}`}>
                      <p className={`text-xs font-bold ${TYPE[ev.type].text}`}>{ev.hour != null ? fmt12(ev.hour) : 'All day'}</p>
                      <p className="text-sm font-semibold text-slate-800">{ev.title}</p>
                    </div>
                  ))}
                </div>
            }
          </div>
        </div>
      </div>
    )
  }

  // ── YEAR VIEW ─────────────────────────────────────────────────────────────
  const YearView = () => (
    <div>
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => setYear(y => y - 1)} className="btn-secondary">← {year - 1}</button>
        <h2 className="text-2xl font-bold text-slate-800">{year}</h2>
        <button onClick={() => setYear(y => y + 1)} className="btn-secondary">{year + 1} →</button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {MONTHS.map((mName, mi) => {
          const dim = daysInMonth(year, mi), first = firstDayOf(year, mi)
          const cells = [...Array(first).fill(null), ...Array.from({ length: dim }, (_, i) => i + 1)]
          const mEvs  = eventsFor(year, mi)
          const isCurrent = year === today.getFullYear() && mi === today.getMonth()
          return (
            <div key={mi} onClick={() => { setMonth(mi); setView('month') }}
              className={`card p-4 cursor-pointer hover:shadow-md transition-all ${isCurrent ? 'ring-2 ring-brand-500' : ''}`}>
              <div className="flex items-center justify-between mb-2">
                <p className="font-bold text-slate-800 text-sm">{mName}</p>
                {mEvs.length > 0 && <span className="badge bg-brand-100 text-brand-700 text-xs">{mEvs.length}</span>}
              </div>
              <div className="grid grid-cols-7 gap-px mb-1">{DAYS_SHORT.map((d, i) => <div key={i} className="text-center text-[8px] font-bold text-slate-300">{d}</div>)}</div>
              <div className="grid grid-cols-7 gap-px">
                {cells.map((d, i) => {
                  if (!d) return <div key={i} />
                  const isT = isCurrent && d === today.getDate()
                  const hasEv = mEvs.some(e => e.day === d)
                  return (
                    <div key={i} onClick={e => { e.stopPropagation(); goToDay(d, mi, year) }}
                      className={`aspect-square rounded-sm flex items-center justify-center text-[9px] font-semibold hover:bg-brand-100 cursor-pointer transition-colors ${isT ? 'bg-brand-600 text-white rounded-full' : hasEv ? 'text-brand-700 font-bold' : 'text-slate-400'}`}>
                      {d}
                    </div>
                  )
                })}
              </div>
              {mEvs.length > 0 && (
                <div className="mt-2 pt-2 border-t border-slate-100 space-y-0.5">
                  {mEvs.slice(0, 2).map(ev => (
                    <div key={ev.id} className="flex items-center gap-1">
                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${TYPE[ev.type].dot}`} />
                      <p className="text-[10px] text-slate-600 truncate">{ev.title}</p>
                    </div>
                  ))}
                  {mEvs.length > 2 && <p className="text-[10px] text-slate-400">+{mEvs.length - 2} more</p>}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )

  // ── LIST VIEW ─────────────────────────────────────────────────────────────
  const ListView = () => {
    const filtered = [...events]
      .filter(e => listFilter === 'all' || e.type === listFilter)
      .filter(e => !listSearch || e.title.toLowerCase().includes(listSearch.toLowerCase()) || e.location?.toLowerCase().includes(listSearch.toLowerCase()))
      .sort((a, b) => new Date(a.year, a.month, a.day, a.hour ?? 0).getTime() - new Date(b.year, b.month, b.day, b.hour ?? 0).getTime())

    const grouped: Record<string, CalEvent[]> = {}
    filtered.forEach(e => {
      const k = `${e.year}-${e.month}`
      if (!grouped[k]) grouped[k] = []
      grouped[k].push(e)
    })

    return (
      <div>
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input className="input pl-9" placeholder="Search events…" value={listSearch} onChange={e => setListSearch(e.target.value)} />
          </div>
          <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
            {['all','meeting','event','fundraiser','deadline'].map(f => (
              <button key={f} onClick={() => setListFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${listFilter === f ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>{f}</button>
            ))}
          </div>
        </div>
        {Object.keys(grouped).length === 0
          ? <div className="card p-12 text-center"><p className="text-slate-400">No events found</p></div>
          : <div className="space-y-6">
              {Object.entries(grouped).map(([key, evs]) => {
                const [y, m] = key.split('-').map(Number)
                return (
                  <div key={key}>
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="font-bold text-slate-800">{MONTHS[m]} {y}</h3>
                      <div className="flex-1 h-px bg-slate-100" />
                      <span className="text-xs text-slate-400">{evs.length} event{evs.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="space-y-2">
                      {evs.map(ev => {
                        const isPast = new Date(ev.year, ev.month, ev.day) < today
                        return (
                          <div key={ev.id} onClick={() => openEvent(ev)}
                            className={`card p-4 flex items-center gap-4 cursor-pointer hover:shadow-md transition-all ${isPast ? 'opacity-60' : ''}`}>
                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${TYPE[ev.type].gradient} flex flex-col items-center justify-center flex-shrink-0 shadow-sm`}>
                              <span className="text-white text-[10px] font-bold uppercase">{MONTHS_SHORT[ev.month]}</span>
                              <span className="text-white text-xl font-black leading-none">{ev.day}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <p className="font-bold text-slate-800 truncate">{ev.title}</p>
                                {isPast && <span className="badge bg-slate-100 text-slate-400 text-xs flex-shrink-0">Past</span>}
                              </div>
                              <p className="text-sm text-slate-500">{DAYS[new Date(ev.year, ev.month, ev.day).getDay()]}, {MONTHS[ev.month]} {ev.day}{ev.hour != null ? ` · ${fmt12(ev.hour)}` : ''}{ev.location ? ` · ${ev.location}` : ''}</p>
                              {ev.description && <p className="text-xs text-slate-400 mt-0.5 truncate">{ev.description}</p>}
                            </div>
                            <div className="flex flex-col items-end gap-1 flex-shrink-0">
                              <span className={`badge ${TYPE[ev.type].bg} ${TYPE[ev.type].text}`}>{ev.type}</span>
                              {ev.signups.length > 0 && <span className="text-xs text-slate-400">{ev.signups.length} 🙋</span>}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
        }
      </div>
    )
  }

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      <ModuleHeader title="Calendar & Events" subtitle="Plan, schedule, and discover event ideas for each month" gradient="gradient-cool" icon="📅" />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <ViewToggle />
        <div className="flex items-center gap-2 flex-wrap">
          <NavBar />

          {/* Import */}
          <div className="relative">
            <button onClick={() => importRef.current?.click()} className="btn-secondary text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
              Import
            </button>
            <input ref={importRef} type="file" accept=".ics,.ical" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleImport(f); e.target.value = '' }} />
          </div>

          {/* Export */}
          <div className="relative">
            <button onClick={() => setShowExportMenu(v => !v)} className="btn-secondary text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
              Export ▾
            </button>
            {showExportMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden z-20 w-44">
                <button onClick={() => { exportICS(events); setShowExportMenu(false) }}
                  className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                  <span>📅</span> Download .ics
                </button>
                <button onClick={() => { exportCSV(events); setShowExportMenu(false) }}
                  className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 border-t border-slate-50">
                  <span>📊</span> Download .csv
                </button>
              </div>
            )}
          </div>

          <button onClick={() => setShowAdd(true)} className="btn-primary text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
            Add Event
          </button>
        </div>
      </div>

      {importMsg && (
        <div className="mb-4 bg-green-50 border border-green-100 text-green-700 text-sm font-medium px-4 py-3 rounded-xl flex items-center gap-2 animate-fade-in">
          ✓ {importMsg}
        </div>
      )}

      {view === 'month' && <MonthView />}
      {view === 'day'   && <DayView />}
      {view === 'year'  && <YearView />}
      {view === 'list'  && <ListView />}

      {/* Event detail/edit modal */}
      {selected && (
        <EventModal
          event={selected}
          onClose={closeEvent}
          onSave={saveEvent}
          onDelete={deleteEvent}
        />
      )}

      {/* Add Event Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in">
            <h3 className="font-bold text-slate-800 text-lg mb-4">Add Event — {MONTHS[month]} {year}</h3>
            <div className="space-y-4">
              <div>
                <label className="label">Title *</label>
                <input className="input" placeholder="e.g. Fall Carnival" value={newEvent.title} onChange={e => setNewEvent(p => ({ ...p, title: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Day</label>
                  <input className="input" type="number" min="1" max={daysInMonth(year, month)} value={newEvent.day} onChange={e => setNewEvent(p => ({ ...p, day: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Type</label>
                  <select className="input" value={newEvent.type} onChange={e => setNewEvent(p => ({ ...p, type: e.target.value as CalEvent['type'] }))}>
                    <option value="event">Event</option>
                    <option value="meeting">Meeting</option>
                    <option value="fundraiser">Fundraiser</option>
                    <option value="deadline">Deadline</option>
                  </select>
                </div>
                <div>
                  <label className="label">Start Time</label>
                  <select className="input" value={newEvent.hour} onChange={e => setNewEvent(p => ({ ...p, hour: e.target.value }))}>
                    <option value="">All day</option>
                    {HOURS.map(h => <option key={h} value={h}>{fmt12(h)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">End Time</label>
                  <select className="input" value={newEvent.endHour} onChange={e => setNewEvent(p => ({ ...p, endHour: e.target.value }))} disabled={!newEvent.hour}>
                    <option value="">—</option>
                    {HOURS.filter(h => h > parseInt(newEvent.hour || '0')).map(h => <option key={h} value={h}>{fmt12(h)}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Location</label>
                <input className="input" placeholder="e.g. School Gymnasium" value={newEvent.location} onChange={e => setNewEvent(p => ({ ...p, location: e.target.value }))} />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea className="input" rows={2} value={newEvent.description} onChange={e => setNewEvent(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div>
                <label className="label">Max Sign-Ups (optional)</label>
                <input className="input" type="number" min="1" placeholder="Leave blank for unlimited" value={newEvent.maxSignups} onChange={e => setNewEvent(p => ({ ...p, maxSignups: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAdd(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button onClick={addEvent} className="btn-primary flex-1 justify-center">Add Event</button>
            </div>
          </div>
        </div>
      )}

      {/* Close export menu on outside click */}
      {showExportMenu && <div className="fixed inset-0 z-10" onClick={() => setShowExportMenu(false)} />}
    </div>
  )
}
