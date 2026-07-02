import { useState, useRef } from 'react'
import ModuleHeader from '../../components/ModuleHeader'
import { monthlyEventSuggestions } from '../../data/suggestions'
import SmartImport, { type ImportedEvent } from './SmartImport'

const MONTHS       = ['January','February','March','April','May','June','July','August','September','October','November','December']
const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAYS         = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const DAYS_SHORT   = ['S','M','T','W','T','F','S']

// Quarter-hour slots 7:00 AM – 9:00 PM
const TIME_SLOTS: { label: string; minutes: number }[] = []
for (let h = 7; h <= 21; h++) {
  for (const m of [0, 15, 30, 45]) {
    if (h === 21 && m > 0) break
    const suffix = h < 12 ? 'AM' : 'PM'
    const h12    = h === 0 ? 12 : h > 12 ? h - 12 : h
    const label  = m === 0 ? `${h12}:00 ${suffix}` : `${h12}:${m} ${suffix}`
    TIME_SLOTS.push({ label, minutes: h * 60 + m })
  }
}

function fmt(minutes: number) {
  const slot = TIME_SLOTS.find(s => s.minutes === minutes)
  return slot?.label ?? ''
}

interface Invite  { id: string; email: string; name?: string }
interface Signup  { id: string; name: string; email?: string; role?: string; note?: string }

interface CalEvent {
  id: string
  year: number; month: number; day: number
  startMin?: number; endMin?: number
  title: string
  type: 'meeting' | 'fundraiser' | 'event' | 'deadline'
  description?: string
  location?: string          // in-person address/room
  googleMeet?: boolean       // has a video link
  meetLink?: string          // video URL
  virtualPlatform?: string   // 'Google Meet' | 'Zoom' | 'Teams' | 'Other'
  signupsEnabled?: boolean
  signups: Signup[]
  maxSignups?: number
  invites: Invite[]
}

type ViewMode = 'month' | 'day' | 'year' | 'list'
type LocType  = '' | 'inperson' | 'virtual'
type VPlatform = 'googlemeet' | 'zoom' | 'teams' | 'other'

const SEED_EVENTS: CalEvent[] = []

const TYPE = {
  meeting:    { bg: 'bg-blue-100',   text: 'text-blue-700',   dot: 'bg-blue-500',   border: 'border-blue-200',   gradient: 'from-blue-500 to-blue-600',    pill: 'bg-blue-600' },
  fundraiser: { bg: 'bg-amber-100',  text: 'text-amber-700',  dot: 'bg-amber-500',  border: 'border-amber-200',  gradient: 'from-amber-400 to-orange-500', pill: 'bg-amber-500' },
  event:      { bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-500', border: 'border-purple-200', gradient: 'from-violet-500 to-purple-600', pill: 'bg-violet-600' },
  deadline:   { bg: 'bg-red-100',    text: 'text-red-600',    dot: 'bg-red-500',    border: 'border-red-200',    gradient: 'from-red-500 to-rose-500',     pill: 'bg-red-500' },
}

function daysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate() }
function firstDayOf(y: number, m: number)  { return new Date(y, m, 1).getDay() }
function pad(n: number) { return String(n).padStart(2, '0') }

function icsDate(year: number, month: number, day: number, min?: number) {
  const base = `${year}${pad(month + 1)}${pad(day)}`
  if (min == null) return base
  return `${base}T${pad(Math.floor(min / 60))}${pad(min % 60)}00`
}

function exportICS(events: CalEvent[]) {
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//My PTA Pilot//Calendar//EN', 'CALSCALE:GREGORIAN',
    ...events.flatMap(e => [
      'BEGIN:VEVENT',
      `UID:${e.id}@myptapilot.com`,
      `DTSTART:${icsDate(e.year, e.month, e.day, e.startMin)}`,
      e.endMin != null ? `DTEND:${icsDate(e.year, e.month, e.day, e.endMin)}` : '',
      `SUMMARY:${e.title}`,
      e.description ? `DESCRIPTION:${e.description}` : '',
      e.location    ? `LOCATION:${e.location}` : '',
      e.meetLink    ? `URL:${e.meetLink}` : '',
      `CATEGORIES:${e.type.toUpperCase()}`,
      ...e.invites.map(i => `ATTENDEE;CN="${i.name || i.email}":mailto:${i.email}`),
      'END:VEVENT',
    ].filter(Boolean)),
    'END:VCALENDAR',
  ]
  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar' })
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'pta-calendar.ics'; a.click()
}

function exportCSV(events: CalEvent[]) {
  const header = 'Title,Date,Start,End,Type,Location,Virtual Platform,Meet Link,Sign-Ups,Description'
  const rows = events.map(e =>
    [e.title,
     `${MONTHS[e.month]} ${e.day} ${e.year}`,
     e.startMin != null ? fmt(e.startMin) : 'All day',
     e.endMin   != null ? fmt(e.endMin)   : '',
     e.type, e.location || '',
     e.virtualPlatform || (e.googleMeet ? 'Virtual' : ''),
     e.meetLink || '',
     e.signups.length,
     e.description || '',
    ].map(v => `"${v}"`).join(',')
  )
  const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' })
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'pta-calendar.csv'; a.click()
}


// ── Toggle ────────────────────────────────────────────────────────────────────
function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <div onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${checked ? 'bg-brand-600' : 'bg-slate-200'}`}>
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : ''}`} />
      </div>
      <span className="text-sm text-slate-700 font-medium">{label}</span>
    </label>
  )
}

// ── TimeSelect ────────────────────────────────────────────────────────────────
function TimeSelect({ value, onChange, placeholder = 'All day', afterMin }: {
  value: string; onChange: (v: string) => void; placeholder?: string; afterMin?: number
}) {
  const slots = afterMin != null ? TIME_SLOTS.filter(s => s.minutes > afterMin) : TIME_SLOTS
  return (
    <select className="input" value={value} onChange={e => onChange(e.target.value)}>
      <option value="">{placeholder}</option>
      {slots.map(s => <option key={s.minutes} value={s.minutes}>{s.label}</option>)}
    </select>
  )
}

// ── DatePicker popover ────────────────────────────────────────────────────────
function DatePicker({ selYear, selMonth, selDay, onChange }: {
  selYear: number; selMonth: number; selDay: number
  onChange: (y: number, m: number, d: number) => void
}) {
  const today = new Date()
  const [open, setOpen]         = useState(false)
  const [viewYear, setViewYear] = useState(selYear || today.getFullYear())
  const [viewMonth, setViewMonth] = useState(selMonth != null ? selMonth : today.getMonth())

  const prevMo = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) } else setViewMonth(m => m - 1) }
  const nextMo = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) } else setViewMonth(m => m + 1) }

  const dim   = daysInMonth(viewYear, viewMonth)
  const first = firstDayOf(viewYear, viewMonth)
  const cells = [...Array(first).fill(null), ...Array.from({ length: dim }, (_, i) => i + 1)]

  const displayStr = selDay
    ? `${MONTHS[selMonth]} ${selDay}, ${selYear}`
    : 'Select a date'

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(v => !v)}
        className="input flex items-center gap-2 text-left w-full">
        <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
        <span className={selDay ? 'text-slate-800' : 'text-slate-400'}>{displayStr}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50 w-72 animate-fade-in">
            {/* Month nav */}
            <div className="flex items-center justify-between mb-3">
              <button type="button" onClick={prevMo}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
              </button>
              <span className="text-sm font-bold text-slate-800">{MONTHS[viewMonth]} {viewYear}</span>
              <button type="button" onClick={nextMo}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
              </button>
            </div>
            {/* Day headers */}
            <div className="grid grid-cols-7 mb-1">
              {DAYS_SHORT.map((d, i) => <div key={i} className="text-center text-[10px] font-bold text-slate-400 py-1">{d}</div>)}
            </div>
            {/* Day cells */}
            <div className="grid grid-cols-7 gap-0.5">
              {cells.map((d, i) => {
                if (!d) return <div key={i} />
                const isSel = d === selDay && viewMonth === selMonth && viewYear === selYear
                const isTod = viewYear === today.getFullYear() && viewMonth === today.getMonth() && d === today.getDate()
                return (
                  <button key={i} type="button"
                    onClick={() => { onChange(viewYear, viewMonth, d); setOpen(false) }}
                    className={`w-full aspect-square rounded-full flex items-center justify-center text-xs font-semibold transition-all
                      ${isSel ? 'bg-brand-600 text-white' : isTod ? 'bg-brand-100 text-brand-700' : 'hover:bg-slate-100 text-slate-700'}`}>
                    {d}
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ── Location section ──────────────────────────────────────────────────────────
const VPLATFORMS: { id: VPlatform; label: string; icon: string; placeholder: string }[] = [
  { id: 'googlemeet', label: 'Google Meet', icon: '📹', placeholder: 'https://meet.google.com/abc-defg-hij' },
  { id: 'zoom',       label: 'Zoom',        icon: '💻', placeholder: 'https://zoom.us/j/1234567890' },
  { id: 'teams',      label: 'Teams',       icon: '🟦', placeholder: 'https://teams.microsoft.com/l/meetup-join/…' },
  { id: 'other',      label: 'Other',       icon: '🔗', placeholder: 'https://…' },
]

function LocationSection({ locationType, locationText, virtualPlatform, virtualUrl, onChange }: {
  locationType: LocType
  locationText: string
  virtualPlatform: VPlatform
  virtualUrl: string
  onChange: (patch: { locationType?: LocType; locationText?: string; virtualPlatform?: VPlatform; virtualUrl?: string }) => void
}) {
  return (
    <div>
      <label className="label">Location</label>
      {/* Segmented control */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-3">
        {([['', '—'], ['inperson', '📍 In Person'], ['virtual', '📹 Virtual']] as [LocType, string][]).map(([val, lbl]) => (
          <button key={val} type="button" onClick={() => onChange({ locationType: val })}
            className={`flex-1 py-1.5 rounded-lg text-sm font-semibold transition-all ${locationType === val ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>
            {lbl}
          </button>
        ))}
      </div>

      {locationType === 'inperson' && (
        <input className="input" placeholder="e.g. School Gymnasium, Room 204, or 123 Main St"
          value={locationText} onChange={e => onChange({ locationText: e.target.value })} />
      )}

      {locationType === 'virtual' && (
        <div className="space-y-3">
          {/* Platform pills */}
          <div className="flex flex-wrap gap-2">
            {VPLATFORMS.map(p => (
              <button key={p.id} type="button" onClick={() => onChange({ virtualPlatform: p.id })}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold border transition-all ${virtualPlatform === p.id ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300'}`}>
                {p.icon} {p.label}
              </button>
            ))}
          </div>
          {/* URL */}
          <div>
            <label className="label">
              {VPLATFORMS.find(p => p.id === virtualPlatform)?.label ?? 'Meeting'} Link
              <span className="text-slate-400 font-normal ml-1">(optional)</span>
            </label>
            <input className="input text-sm"
              placeholder={VPLATFORMS.find(p => p.id === virtualPlatform)?.placeholder ?? 'https://…'}
              value={virtualUrl} onChange={e => onChange({ virtualUrl: e.target.value })} />
          </div>
        </div>
      )}
    </div>
  )
}

// ── InviteSection ─────────────────────────────────────────────────────────────
function InviteSection({ invites, onChange }: { invites: Invite[]; onChange: (v: Invite[]) => void }) {
  const [input, setInput] = useState('')
  const add = () => {
    const email = input.trim().toLowerCase()
    if (!email || !email.includes('@')) return
    if (invites.find(i => i.email === email)) return
    onChange([...invites, { id: Date.now().toString(), email }])
    setInput('')
  }
  return (
    <div>
      <label className="label">Invite People</label>
      <div className="flex gap-2 mb-2">
        <input className="input flex-1 text-sm" type="email" placeholder="email@example.com"
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())} />
        <button type="button" onClick={add} className="btn-secondary text-sm px-3 flex-shrink-0">Add</button>
      </div>
      {invites.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-1">
          {invites.map(inv => (
            <span key={inv.id} className="flex items-center gap-1 px-2.5 py-1 bg-brand-50 text-brand-700 text-xs font-semibold rounded-full border border-brand-100">
              ✉ {inv.email}
              <button onClick={() => onChange(invites.filter(i => i.id !== inv.id))} className="ml-0.5 text-brand-400 hover:text-brand-700">×</button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// ── helpers to map form → CalEvent fields ─────────────────────────────────────
function locToEvent(locationType: LocType, locationText: string, virtualPlatform: VPlatform, virtualUrl: string) {
  if (locationType === 'inperson') {
    return { location: locationText || undefined, googleMeet: false, meetLink: undefined, virtualPlatform: undefined }
  }
  if (locationType === 'virtual') {
    const platform = VPLATFORMS.find(p => p.id === virtualPlatform)
    const link = virtualUrl || (virtualPlatform === 'googlemeet' ? 'https://meet.google.com/new' : undefined)
    return { location: undefined, googleMeet: true, meetLink: link, virtualPlatform: platform?.label }
  }
  return { location: undefined, googleMeet: false, meetLink: undefined, virtualPlatform: undefined }
}

function eventToLocForm(ev: CalEvent): { locationType: LocType; locationText: string; virtualPlatform: VPlatform; virtualUrl: string } {
  if (ev.googleMeet) {
    const plat = VPLATFORMS.find(p => p.label === ev.virtualPlatform)
    return { locationType: 'virtual', locationText: '', virtualPlatform: plat?.id ?? 'googlemeet', virtualUrl: ev.meetLink ?? '' }
  }
  if (ev.location) return { locationType: 'inperson', locationText: ev.location, virtualPlatform: 'googlemeet', virtualUrl: '' }
  return { locationType: '', locationText: '', virtualPlatform: 'googlemeet', virtualUrl: '' }
}

// ── Event Detail / Edit Modal ─────────────────────────────────────────────────
function EventModal({ event, onClose, onSave, onDelete }: {
  event: CalEvent; onClose: () => void; onSave: (e: CalEvent) => void; onDelete: (id: string) => void
}) {
  const [tab, setTab]       = useState<'detail' | 'edit' | 'signups'>('detail')
  const [confirmDelete, setConfirmDelete] = useState(false)

  const locInit = eventToLocForm(event)
  const [form, setForm] = useState({
    title: event.title,
    pickYear: event.year, pickMonth: event.month, pickDay: event.day,
    startMin: event.startMin != null ? String(event.startMin) : '',
    endMin:   event.endMin   != null ? String(event.endMin)   : '',
    type: event.type,
    description: event.description || '',
    locationType: locInit.locationType,
    locationText: locInit.locationText,
    virtualPlatform: locInit.virtualPlatform,
    virtualUrl: locInit.virtualUrl,
    maxSignups: event.maxSignups != null ? String(event.maxSignups) : '',
    signupsEnabled: event.signupsEnabled ?? false,
  })
  const [invites, setInvites] = useState<Invite[]>(event.invites)
  const [signupForm, setSignupForm] = useState({ name: '', email: '', role: '', note: '' })

  const set = (p: Partial<typeof form>) => setForm(f => ({ ...f, ...p }))

  const saveEdit = () => {
    const loc = locToEvent(form.locationType, form.locationText, form.virtualPlatform as VPlatform, form.virtualUrl)
    onSave({
      ...event,
      title: form.title,
      year: form.pickYear, month: form.pickMonth, day: form.pickDay,
      startMin: form.startMin ? parseInt(form.startMin) : undefined,
      endMin:   form.endMin   ? parseInt(form.endMin)   : undefined,
      type: form.type,
      description: form.description || undefined,
      ...loc,
      signupsEnabled: form.signupsEnabled,
      maxSignups: form.signupsEnabled && form.maxSignups ? parseInt(form.maxSignups) : undefined,
      invites,
    })
    setTab('detail')
  }

  const addSignup = () => {
    if (!signupForm.name.trim()) return
    onSave({ ...event, signups: [...event.signups, { id: Date.now().toString(), name: signupForm.name.trim(), email: signupForm.email || undefined, role: signupForm.role || undefined, note: signupForm.note || undefined }] })
    setSignupForm({ name: '', email: '', role: '', note: '' })
  }

  const removeSignup = (sid: string) => onSave({ ...event, signups: event.signups.filter(s => s.id !== sid) })

  const t = TYPE[event.type]
  const dateStr = `${DAYS[new Date(event.year, event.month, event.day).getDay()]}, ${MONTHS[event.month]} ${event.day}, ${event.year}`
  const spotsLeft = event.signupsEnabled && event.maxSignups != null ? event.maxSignups - event.signups.length : null

  const platformLabel = event.virtualPlatform || (event.googleMeet ? 'Virtual Meeting' : null)
  const platformIcon  = VPLATFORMS.find(p => p.label === event.virtualPlatform)?.icon ?? '📹'

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col animate-fade-in" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className={`bg-gradient-to-r ${t.gradient} p-5 rounded-t-2xl flex items-start justify-between`}>
          <div>
            <span className="text-white/70 text-xs font-semibold uppercase tracking-wider">{event.type}</span>
            <h2 className="text-white font-bold text-xl leading-tight mt-0.5">{event.title}</h2>
            <p className="text-white/75 text-sm mt-1">
              {dateStr}{event.startMin != null ? ` · ${fmt(event.startMin)}${event.endMin != null ? ` – ${fmt(event.endMin)}` : ''}` : ''}
            </p>
            {event.googleMeet && (
              <a href={event.meetLink || 'https://meet.google.com/new'} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-white text-xs font-semibold transition-colors">
                {platformIcon} Join {platformLabel}
              </a>
            )}
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white ml-4 flex-shrink-0 p-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100">
          {(['detail','edit', ...(event.signupsEnabled ? ['signups'] : [])] as const).map(tb => (
            <button key={tb} onClick={() => setTab(tb as typeof tab)}
              className={`flex-1 py-3 text-sm font-semibold capitalize transition-colors ${tab === tb ? 'text-brand-600 border-b-2 border-brand-600' : 'text-slate-500 hover:text-slate-700'}`}>
              {tb === 'signups' ? `Sign-Ups (${event.signups.length}${event.maxSignups ? `/${event.maxSignups}` : ''})` : tb === 'detail' ? 'Details' : 'Edit'}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5">

          {/* DETAIL TAB */}
          {tab === 'detail' && (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">📅</div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Date & Time</p>
                  <p className="text-sm text-slate-800">{dateStr}</p>
                  <p className="text-sm text-slate-500">{event.startMin != null ? `${fmt(event.startMin)}${event.endMin != null ? ` – ${fmt(event.endMin)}` : ''}` : 'All day'}</p>
                </div>
              </div>
              {event.location && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">📍</div>
                  <div><p className="text-xs text-slate-400 font-medium">Location</p><p className="text-sm text-slate-800">{event.location}</p></div>
                </div>
              )}
              {event.googleMeet && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 text-lg">{platformIcon}</div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium">{platformLabel}</p>
                    <a href={event.meetLink || 'https://meet.google.com/new'} target="_blank" rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline font-medium break-all">{event.meetLink || 'Open meeting link'}</a>
                  </div>
                </div>
              )}
              {event.description && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">📝</div>
                  <div><p className="text-xs text-slate-400 font-medium">Description</p><p className="text-sm text-slate-700 leading-relaxed">{event.description}</p></div>
                </div>
              )}
              {event.invites.length > 0 && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">✉️</div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Invited ({event.invites.length})</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {event.invites.map(inv => <span key={inv.id} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">{inv.email}</span>)}
                    </div>
                  </div>
                </div>
              )}
              {event.signupsEnabled && event.maxSignups != null && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">🙋</div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-400 font-medium">Sign-Ups</p>
                    <p className="text-sm text-slate-800">{event.signups.length} / {event.maxSignups} spots filled</p>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5">
                      <div className="gradient-brand h-1.5 rounded-full transition-all" style={{ width: `${Math.min(100, (event.signups.length / event.maxSignups) * 100)}%` }} />
                    </div>
                  </div>
                </div>
              )}
              <div className="pt-2 flex gap-2">
                <button onClick={() => setTab('edit')} className="btn-secondary flex-1 justify-center text-sm">✏️ Edit</button>
                {event.signupsEnabled && <button onClick={() => setTab('signups')} className="btn-primary flex-1 justify-center text-sm">🙋 Sign-Ups</button>}
              </div>
              <div>
                {!confirmDelete
                  ? <button onClick={() => setConfirmDelete(true)} className="w-full py-2 rounded-xl text-sm text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors font-medium">🗑 Delete Event</button>
                  : <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                      <p className="text-sm text-red-700 font-semibold mb-3">Delete "{event.title}"? This cannot be undone.</p>
                      <div className="flex gap-2">
                        <button onClick={() => setConfirmDelete(false)} className="btn-secondary flex-1 justify-center text-sm">Cancel</button>
                        <button onClick={() => onDelete(event.id)} className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold">Delete</button>
                      </div>
                    </div>
                }
              </div>
            </div>
          )}

          {/* EDIT TAB */}
          {tab === 'edit' && (
            <div className="space-y-4">
              <div>
                <label className="label">Title *</label>
                <input className="input" value={form.title} onChange={e => set({ title: e.target.value })} />
              </div>
              <div>
                <label className="label">Date</label>
                <DatePicker selYear={form.pickYear} selMonth={form.pickMonth} selDay={form.pickDay}
                  onChange={(y, m, d) => set({ pickYear: y, pickMonth: m, pickDay: d })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Start Time</label>
                  <TimeSelect value={form.startMin} onChange={v => set({ startMin: v, endMin: '' })} />
                </div>
                <div>
                  <label className="label">End Time</label>
                  <TimeSelect value={form.endMin} onChange={v => set({ endMin: v })} placeholder="—"
                    afterMin={form.startMin ? parseInt(form.startMin) : undefined} />
                </div>
              </div>
              <div>
                <label className="label">Type</label>
                <select className="input" value={form.type} onChange={e => set({ type: e.target.value as CalEvent['type'] })}>
                  <option value="event">Event</option><option value="meeting">Meeting</option>
                  <option value="fundraiser">Fundraiser</option><option value="deadline">Deadline</option>
                </select>
              </div>
              <LocationSection
                locationType={form.locationType as LocType}
                locationText={form.locationText}
                virtualPlatform={form.virtualPlatform as VPlatform}
                virtualUrl={form.virtualUrl}
                onChange={patch => set(patch as Partial<typeof form>)}
              />
              <div>
                <label className="label">Description</label>
                <textarea className="input" rows={2} value={form.description} onChange={e => set({ description: e.target.value })} />
              </div>
              <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                <Toggle checked={form.signupsEnabled} onChange={v => set({ signupsEnabled: v })} label="Enable sign-ups for this event" />
                {form.signupsEnabled && (
                  <div>
                    <label className="label">Max spots <span className="text-slate-400 font-normal">(blank = unlimited)</span></label>
                    <input className="input" type="number" min="1" placeholder="e.g. 50"
                      value={form.maxSignups} onChange={e => set({ maxSignups: e.target.value })} />
                  </div>
                )}
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <InviteSection invites={invites} onChange={setInvites} />
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
              {(spotsLeft == null || spotsLeft > 0) ? (
                <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
                  <p className="text-sm font-bold text-slate-700">Add a Sign-Up</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div><label className="label">Name *</label><input className="input text-sm" placeholder="Jane Smith" value={signupForm.name} onChange={e => setSignupForm(p => ({ ...p, name: e.target.value }))} /></div>
                    <div><label className="label">Email</label><input className="input text-sm" type="email" placeholder="jane@email.com" value={signupForm.email} onChange={e => setSignupForm(p => ({ ...p, email: e.target.value }))} /></div>
                    <div><label className="label">Role / Slot</label><input className="input text-sm" placeholder="e.g. Volunteer" value={signupForm.role} onChange={e => setSignupForm(p => ({ ...p, role: e.target.value }))} /></div>
                    <div><label className="label">Note</label><input className="input text-sm" placeholder="Optional" value={signupForm.note} onChange={e => setSignupForm(p => ({ ...p, note: e.target.value }))} /></div>
                  </div>
                  <button onClick={addSignup} className="btn-primary w-full justify-center text-sm">+ Add Sign-Up</button>
                </div>
              ) : (
                <div className="bg-red-50 rounded-xl p-4 text-center"><p className="text-red-600 font-semibold text-sm">This event is full ({event.maxSignups}/{event.maxSignups} spots taken)</p></div>
              )}
              {event.signups.length === 0
                ? <p className="text-sm text-slate-400 text-center py-4">No sign-ups yet</p>
                : <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{event.signups.length} Sign-Up{event.signups.length !== 1 ? 's' : ''}</p>
                    {event.signups.map((s, i) => (
                      <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 group">
                        <div className="w-7 h-7 rounded-full gradient-vivid flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{i + 1}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800">{s.name}</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            {s.email && <p className="text-xs text-slate-400">{s.email}</p>}
                            {s.role  && <span className="badge bg-brand-100 text-brand-700 text-xs">{s.role}</span>}
                          </div>
                        </div>
                        <button onClick={() => removeSignup(s.id)} className="text-slate-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                      </div>
                    ))}
                  </div>
              }
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Add Event Modal ───────────────────────────────────────────────────────────
function AddEventModal({ initYear, initMonth, onClose, onAdd }: {
  initYear: number; initMonth: number; onClose: () => void; onAdd: (e: Omit<CalEvent, 'id'>) => void
}) {
  const [form, setForm] = useState({
    title: '',
    pickYear: initYear, pickMonth: initMonth, pickDay: 0,
    startMin: String(18 * 60), endMin: String(19 * 60),
    type: 'event' as CalEvent['type'],
    description: '',
    locationType: '' as LocType,
    locationText: '',
    virtualPlatform: 'googlemeet' as VPlatform,
    virtualUrl: '',
    maxSignups: '',
    signupsEnabled: false,
  })
  const [invites, setInvites] = useState<Invite[]>([])
  const set = (p: Partial<typeof form>) => setForm(f => ({ ...f, ...p }))

  const submit = () => {
    if (!form.title || !form.pickDay) return
    const loc = locToEvent(form.locationType, form.locationText, form.virtualPlatform, form.virtualUrl)
    onAdd({
      year: form.pickYear, month: form.pickMonth, day: form.pickDay,
      startMin: form.startMin ? parseInt(form.startMin) : undefined,
      endMin:   form.endMin   ? parseInt(form.endMin)   : undefined,
      title: form.title, type: form.type,
      description: form.description || undefined,
      ...loc,
      signupsEnabled: form.signupsEnabled,
      maxSignups: form.signupsEnabled && form.maxSignups ? parseInt(form.maxSignups) : undefined,
      signups: [], invites,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-fade-in">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 text-lg">Add Event</h3>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="label">Title *</label>
            <input className="input" placeholder="e.g. Fall Carnival" value={form.title} onChange={e => set({ title: e.target.value })} autoFocus />
          </div>

          <div>
            <label className="label">Date *</label>
            <DatePicker selYear={form.pickYear} selMonth={form.pickMonth} selDay={form.pickDay}
              onChange={(y, m, d) => set({ pickYear: y, pickMonth: m, pickDay: d })} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Start Time</label>
              <TimeSelect value={form.startMin} onChange={v => set({ startMin: v, endMin: '' })} />
            </div>
            <div>
              <label className="label">End Time</label>
              <TimeSelect value={form.endMin} onChange={v => set({ endMin: v })} placeholder="—"
                afterMin={form.startMin ? parseInt(form.startMin) : undefined} />
            </div>
          </div>

          <div>
            <label className="label">Type</label>
            <select className="input" value={form.type} onChange={e => set({ type: e.target.value as CalEvent['type'] })}>
              <option value="event">Event</option><option value="meeting">Meeting</option>
              <option value="fundraiser">Fundraiser</option><option value="deadline">Deadline</option>
            </select>
          </div>

          <LocationSection
            locationType={form.locationType}
            locationText={form.locationText}
            virtualPlatform={form.virtualPlatform}
            virtualUrl={form.virtualUrl}
            onChange={patch => set(patch as Partial<typeof form>)}
          />

          <div>
            <label className="label">Description</label>
            <textarea className="input" rows={2} value={form.description} onChange={e => set({ description: e.target.value })} />
          </div>

          <div className="bg-slate-50 rounded-xl p-4 space-y-3">
            <Toggle checked={form.signupsEnabled} onChange={v => set({ signupsEnabled: v })} label="Enable sign-ups" />
            {form.signupsEnabled && (
              <div>
                <label className="label">Max spots <span className="text-slate-400 font-normal">(blank = unlimited)</span></label>
                <input className="input" type="number" min="1" placeholder="e.g. 50"
                  value={form.maxSignups} onChange={e => set({ maxSignups: e.target.value })} />
              </div>
            )}
          </div>

          <div className="bg-slate-50 rounded-xl p-4">
            <InviteSection invites={invites} onChange={setInvites} />
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
          <button onClick={submit} disabled={!form.title || !form.pickDay}
            className="btn-primary flex-1 justify-center disabled:opacity-40 disabled:cursor-not-allowed">
            Add Event
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function CalendarModule() {
  const today = new Date()

  const [view, setView]               = useState<ViewMode>('month')
  const [year, setYear]               = useState(today.getFullYear())
  const [month, setMonth]             = useState(today.getMonth())
  const [selectedDay, setSelectedDay] = useState(today.getDate())
  const [events, setEvents]           = useState<CalEvent[]>(SEED_EVENTS)
  const [showAdd, setShowAdd]         = useState(false)
  const [selected, setSelected]       = useState<CalEvent | null>(null)
  const [listFilter, setListFilter]   = useState('all')
  const [listSearch, setListSearch]   = useState('')
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [importMsg, setImportMsg]     = useState('')
  const [showImport, setShowImport]   = useState(false)

  const eventsFor = (y: number, m: number, d?: number) =>
    events.filter(e => e.year === y && e.month === m && (d == null || e.day === d))

  const openEvent   = (ev: CalEvent) => setSelected(ev)
  const closeEvent  = () => setSelected(null)
  const saveEvent   = (updated: CalEvent) => { setEvents(p => p.map(e => e.id === updated.id ? updated : e)); setSelected(updated) }
  const deleteEvent = (id: string) => { setEvents(p => p.filter(e => e.id !== id)); setSelected(null) }
  const addEvent    = (ev: Omit<CalEvent, 'id'>) => {
    const added = { ...ev, id: Date.now().toString() }
    setEvents(p => [...p, added])
    // If event falls in a different month/year, navigate there
    if (ev.month !== month || ev.year !== year) { setMonth(ev.month); setYear(ev.year) }
  }

  const handleSmartImport = (imported: ImportedEvent[]) => {
    setEvents(p => [...p, ...imported.map(ev => ({ ...ev, id: `imp_${Date.now()}_${Math.random()}`, signups: [], invites: [], signupsEnabled: false }))])
    setImportMsg(`Added ${imported.length} event${imported.length !== 1 ? 's' : ''} to your calendar`)
    setTimeout(() => setImportMsg(''), 5000)
  }

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y-1) } else setMonth(m => m-1) }
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y+1) } else setMonth(m => m+1) }
  const prevDay   = () => { const d = new Date(year,month,selectedDay-1); setYear(d.getFullYear()); setMonth(d.getMonth()); setSelectedDay(d.getDate()) }
  const nextDay   = () => { const d = new Date(year,month,selectedDay+1); setYear(d.getFullYear()); setMonth(d.getMonth()); setSelectedDay(d.getDate()) }
  const goToDay   = (d: number, m?: number, y?: number) => { if (m!=null) setMonth(m); if (y!=null) setYear(y); setSelectedDay(d); setView('day') }
  const goToday   = () => { setYear(today.getFullYear()); setMonth(today.getMonth()); setSelectedDay(today.getDate()) }

  const EventPill = ({ ev }: { ev: CalEvent }) => (
    <div onClick={e => { e.stopPropagation(); openEvent(ev) }}
      className={`${TYPE[ev.type].bg} ${TYPE[ev.type].text} text-[10px] px-1.5 py-0.5 rounded-md mb-0.5 truncate font-semibold cursor-pointer hover:opacity-80 transition-opacity`}>
      {ev.startMin != null ? `${fmt(ev.startMin)} ` : ''}{ev.title}
      {ev.googleMeet && <span className="ml-0.5 opacity-60">📹</span>}
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
    return (
      <div className="flex items-center gap-2">
        <button onClick={view === 'day' ? prevDay : prevMonth} className="btn-secondary !p-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
        </button>
        <span className="font-bold text-slate-800 min-w-[160px] text-center text-sm">
          {view === 'day' ? `${DAYS[new Date(year,month,selectedDay).getDay()]}, ${MONTHS[month]} ${selectedDay}` : `${MONTHS[month]} ${year}`}
        </span>
        <button onClick={view === 'day' ? nextDay : nextMonth} className="btn-secondary !p-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
        </button>
        <button onClick={goToday} className="btn-secondary text-xs">Today</button>
      </div>
    )
  }

  // ── MONTH VIEW ─────────────────────────────────────────────────────────────
  const MonthView = () => {
    const dim = daysInMonth(year, month), first = firstDayOf(year, month)
    const cells = [...Array(first).fill(null), ...Array.from({ length: dim }, (_, i) => i+1)]
    const monthEvs = eventsFor(year, month)
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6">
          <div className="grid grid-cols-7 mb-2">{DAYS.map(d => <div key={d} className="text-center text-xs font-bold text-slate-400 py-2">{d}</div>)}</div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              if (!day) return <div key={i} />
              const dayEvs = monthEvs.filter(e => e.day === day)
              const isToday = year===today.getFullYear() && month===today.getMonth() && day===today.getDate()
              return (
                <div key={i} onClick={() => goToDay(day)}
                  className={`min-h-[76px] rounded-xl p-1.5 border cursor-pointer transition-all hover:shadow-sm ${isToday ? 'border-brand-400 bg-brand-50' : 'border-transparent hover:bg-slate-50 hover:border-slate-200'}`}>
                  <p className={`text-xs font-bold mb-1 w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-brand-600 text-white' : 'text-slate-600'}`}>{day}</p>
                  {dayEvs.slice(0,2).map(ev => <EventPill key={ev.id} ev={ev} />)}
                  {dayEvs.length > 2 && <div className="text-[10px] text-slate-400 font-medium">+{dayEvs.length-2} more</div>}
                </div>
              )
            })}
          </div>
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
            {Object.entries(TYPE).map(([type, c]) => (
              <div key={type} className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${c.dot}`} /><span className="text-xs text-slate-500 capitalize">{type}</span>
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
                  {monthEvs.sort((a,b) => a.day-b.day || (a.startMin??0)-(b.startMin??0)).map(ev => (
                    <div key={ev.id} onClick={() => openEvent(ev)}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                      <div className={`w-8 h-8 rounded-lg ${TYPE[ev.type].bg} flex items-center justify-center flex-shrink-0`}>
                        <span className={`text-xs font-bold ${TYPE[ev.type].text}`}>{ev.day}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-800 truncate">{ev.title} {ev.googleMeet && '📹'}</p>
                        <p className={`text-xs ${TYPE[ev.type].text}`}>{ev.startMin != null ? fmt(ev.startMin) : 'All day'}</p>
                      </div>
                      {ev.signupsEnabled && ev.signups.length > 0 && <span className="badge bg-slate-100 text-slate-500 text-xs">{ev.signups.length} 🙋</span>}
                    </div>
                  ))}
                </div>
            }
          </div>
          <div className="card p-5">
            <h3 className="font-bold text-slate-800 mb-1">💡 Ideas for {MONTHS[month]}</h3>
            <p className="text-xs text-slate-400 mb-3">Click to add</p>
            <div className="space-y-1">
              {(monthlyEventSuggestions[month] || []).slice(0,5).map((s, i) => (
                <button key={i}
                  onClick={() => setEvents(p => [...p, { id: Date.now().toString(), year, month, day: 15, title: s, type: 'event', signups: [], invites: [], signupsEnabled: false }])}
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

  // ── DAY VIEW ───────────────────────────────────────────────────────────────
  const DayView = () => {
    const dayEvs = eventsFor(year, month, selectedDay)
    const allDay  = dayEvs.filter(e => e.startMin == null)
    const timed   = dayEvs.filter(e => e.startMin != null)
    const isToday = year===today.getFullYear() && month===today.getMonth() && selectedDay===today.getDate()
    const hours   = Array.from({ length: 15 }, (_, i) => i + 7)
    return (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 card overflow-hidden">
          <div className={`p-5 border-b border-slate-100 ${isToday ? 'bg-brand-50' : ''}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{DAYS[new Date(year,month,selectedDay).getDay()]}</p>
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
            {hours.map(h => {
              const hourEvs = timed.filter(e => e.startMin != null && Math.floor(e.startMin / 60) === h)
              const isNow   = isToday && today.getHours() === h
              return (
                <div key={h} className={`flex border-b border-slate-50 min-h-[60px] ${isNow ? 'bg-brand-50/50' : ''}`}>
                  <div className="w-16 flex-shrink-0 px-3 pt-2">
                    <span className={`text-xs font-semibold ${isNow ? 'text-brand-600' : 'text-slate-400'}`}>
                      {h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h-12} PM`}
                    </span>
                  </div>
                  <div className="flex-1 py-1 pr-3 space-y-1">
                    {isNow && <div className="flex items-center gap-2 mb-1"><div className="w-2 h-2 rounded-full bg-brand-500 pulse-dot" /><div className="flex-1 h-px bg-brand-400" /></div>}
                    {hourEvs.map(ev => (
                      <div key={ev.id} onClick={() => openEvent(ev)}
                        className={`px-3 py-2 rounded-xl bg-gradient-to-r ${TYPE[ev.type].gradient} text-white shadow-sm cursor-pointer hover:opacity-90 transition-opacity`}>
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-bold leading-tight">{ev.title}</p>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {ev.googleMeet && <span className="text-white/80 text-xs">📹</span>}
                            {ev.signupsEnabled && ev.signups.length > 0 && <span className="text-white/70 text-xs">{ev.signups.length}🙋</span>}
                          </div>
                        </div>
                        {ev.startMin != null && (
                          <p className="text-xs text-white/70 mt-0.5">
                            {fmt(ev.startMin)}{ev.endMin ? ` – ${fmt(ev.endMin)}` : ''}{ev.location ? ` · ${ev.location}` : ''}
                          </p>
                        )}
                        {ev.description && <p className="text-xs text-white/70 mt-0.5 truncate">{ev.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        {/* Mini date picker */}
        <div className="space-y-4">
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <button onClick={prevMonth} className="p-1 hover:bg-slate-100 rounded-lg"><svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg></button>
              <p className="text-sm font-bold text-slate-800">{MONTHS_SHORT[month]} {year}</p>
              <button onClick={nextMonth} className="p-1 hover:bg-slate-100 rounded-lg"><svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg></button>
            </div>
            <div className="grid grid-cols-7 mb-1">{DAYS_SHORT.map((d,i) => <div key={i} className="text-center text-[10px] font-bold text-slate-400 py-1">{d}</div>)}</div>
            <div className="grid grid-cols-7 gap-0.5">
              {[...Array(firstDayOf(year,month)).fill(null), ...Array.from({length:daysInMonth(year,month)},(_,i)=>i+1)].map((d,i) => {
                if (!d) return <div key={i} />
                const isSel=d===selectedDay, isTod=year===today.getFullYear()&&month===today.getMonth()&&d===today.getDate()
                const hasEv=eventsFor(year,month,d).length>0
                return (
                  <button key={i} onClick={() => setSelectedDay(d)}
                    className={`w-full aspect-square rounded-full flex items-center justify-center text-[11px] font-semibold transition-all relative ${isSel?'bg-brand-600 text-white':isTod?'bg-brand-100 text-brand-700':'hover:bg-slate-100 text-slate-700'}`}>
                    {d}
                    {hasEv&&!isSel&&<span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-400"/>}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="card p-4">
            <h3 className="font-bold text-slate-800 text-sm mb-3">This day</h3>
            {dayEvs.length===0
              ? <p className="text-xs text-slate-400">No events.</p>
              : <div className="space-y-2">
                  {dayEvs.sort((a,b)=>(a.startMin??-1)-(b.startMin??-1)).map(ev => (
                    <div key={ev.id} onClick={() => openEvent(ev)}
                      className={`p-2.5 rounded-xl border cursor-pointer hover:shadow-sm transition-all ${TYPE[ev.type].border} ${TYPE[ev.type].bg}`}>
                      <p className={`text-xs font-bold ${TYPE[ev.type].text}`}>{ev.startMin!=null?fmt(ev.startMin):'All day'}</p>
                      <p className="text-sm font-semibold text-slate-800">{ev.title} {ev.googleMeet&&'📹'}</p>
                    </div>
                  ))}
                </div>
            }
          </div>
        </div>
      </div>
    )
  }

  // ── YEAR VIEW ──────────────────────────────────────────────────────────────
  const YearView = () => (
    <div>
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => setYear(y=>y-1)} className="btn-secondary">← {year-1}</button>
        <h2 className="text-2xl font-bold text-slate-800">{year}</h2>
        <button onClick={() => setYear(y=>y+1)} className="btn-secondary">{year+1} →</button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {MONTHS.map((mName,mi) => {
          const dim=daysInMonth(year,mi), first=firstDayOf(year,mi)
          const cells=[...Array(first).fill(null), ...Array.from({length:dim},(_,i)=>i+1)]
          const mEvs=eventsFor(year,mi)
          const isCurrent=year===today.getFullYear()&&mi===today.getMonth()
          return (
            <div key={mi} onClick={() => { setMonth(mi); setView('month') }}
              className={`card p-4 cursor-pointer hover:shadow-md transition-all ${isCurrent?'ring-2 ring-brand-500':''}`}>
              <div className="flex items-center justify-between mb-2">
                <p className="font-bold text-slate-800 text-sm">{mName}</p>
                {mEvs.length>0&&<span className="badge bg-brand-100 text-brand-700 text-xs">{mEvs.length}</span>}
              </div>
              <div className="grid grid-cols-7 gap-px mb-1">{DAYS_SHORT.map((d,i)=><div key={i} className="text-center text-[8px] font-bold text-slate-300">{d}</div>)}</div>
              <div className="grid grid-cols-7 gap-px">
                {cells.map((d,i) => {
                  if (!d) return <div key={i}/>
                  const isT=isCurrent&&d===today.getDate(), hasEv=mEvs.some(e=>e.day===d)
                  return (
                    <div key={i} onClick={e=>{e.stopPropagation();goToDay(d,mi,year)}}
                      className={`aspect-square rounded-sm flex items-center justify-center text-[9px] font-semibold hover:bg-brand-100 cursor-pointer transition-colors ${isT?'bg-brand-600 text-white rounded-full':hasEv?'text-brand-700 font-bold':'text-slate-400'}`}>
                      {d}
                    </div>
                  )
                })}
              </div>
              {mEvs.length>0&&(
                <div className="mt-2 pt-2 border-t border-slate-100 space-y-0.5">
                  {mEvs.slice(0,2).map(ev=>(
                    <div key={ev.id} className="flex items-center gap-1">
                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${TYPE[ev.type].dot}`}/>
                      <p className="text-[10px] text-slate-600 truncate">{ev.title}</p>
                    </div>
                  ))}
                  {mEvs.length>2&&<p className="text-[10px] text-slate-400">+{mEvs.length-2} more</p>}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )

  // ── LIST VIEW ──────────────────────────────────────────────────────────────
  const ListView = () => {
    const filtered = [...events]
      .filter(e => listFilter==='all'||e.type===listFilter)
      .filter(e => !listSearch || e.title.toLowerCase().includes(listSearch.toLowerCase()) || e.location?.toLowerCase().includes(listSearch.toLowerCase()))
      .sort((a,b)=>new Date(a.year,a.month,a.day,a.startMin?Math.floor(a.startMin/60):0).getTime()-new Date(b.year,b.month,b.day,b.startMin?Math.floor(b.startMin/60):0).getTime())
    const grouped: Record<string,CalEvent[]> = {}
    filtered.forEach(e => { const k=`${e.year}-${e.month}`; if(!grouped[k]) grouped[k]=[]; grouped[k].push(e) })
    return (
      <div>
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input className="input pl-9" placeholder="Search events…" value={listSearch} onChange={e=>setListSearch(e.target.value)}/>
          </div>
          <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
            {['all','meeting','event','fundraiser','deadline'].map(f=>(
              <button key={f} onClick={()=>setListFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${listFilter===f?'bg-white shadow-sm text-slate-800':'text-slate-500 hover:text-slate-700'}`}>{f}</button>
            ))}
          </div>
        </div>
        {Object.keys(grouped).length===0
          ? <div className="card p-12 text-center"><p className="text-slate-400">No events found</p></div>
          : <div className="space-y-6">
              {Object.entries(grouped).map(([key,evs])=>{
                const [y,m]=key.split('-').map(Number)
                return (
                  <div key={key}>
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="font-bold text-slate-800">{MONTHS[m]} {y}</h3>
                      <div className="flex-1 h-px bg-slate-100"/>
                      <span className="text-xs text-slate-400">{evs.length} event{evs.length!==1?'s':''}</span>
                    </div>
                    <div className="space-y-2">
                      {evs.map(ev=>{
                        const isPast=new Date(ev.year,ev.month,ev.day)<today
                        return (
                          <div key={ev.id} onClick={()=>openEvent(ev)}
                            className={`card p-4 flex items-center gap-4 cursor-pointer hover:shadow-md transition-all ${isPast?'opacity-60':''}`}>
                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${TYPE[ev.type].gradient} flex flex-col items-center justify-center flex-shrink-0 shadow-sm`}>
                              <span className="text-white text-[10px] font-bold uppercase">{MONTHS_SHORT[ev.month]}</span>
                              <span className="text-white text-xl font-black leading-none">{ev.day}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <p className="font-bold text-slate-800 truncate">{ev.title}</p>
                                {ev.googleMeet&&<span className="text-xs">📹</span>}
                                {isPast&&<span className="badge bg-slate-100 text-slate-400 text-xs flex-shrink-0">Past</span>}
                              </div>
                              <p className="text-sm text-slate-500">
                                {DAYS[new Date(ev.year,ev.month,ev.day).getDay()]}, {MONTHS[ev.month]} {ev.day}
                                {ev.startMin!=null?` · ${fmt(ev.startMin)}`:''}
                                {ev.location?` · ${ev.location}`:''}
                              </p>
                              {ev.description&&<p className="text-xs text-slate-400 mt-0.5 truncate">{ev.description}</p>}
                            </div>
                            <div className="flex flex-col items-end gap-1 flex-shrink-0">
                              <span className={`badge ${TYPE[ev.type].bg} ${TYPE[ev.type].text}`}>{ev.type}</span>
                              {ev.signupsEnabled&&ev.signups.length>0&&<span className="text-xs text-slate-400">{ev.signups.length}🙋</span>}
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

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      <ModuleHeader title="Calendar & Events" subtitle="Plan, schedule, and discover event ideas for each month" gradient="gradient-cool" icon="📅" />

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <ViewToggle />
        <div className="flex items-center gap-2 flex-wrap">
          <NavBar />
          <button onClick={() => setShowImport(true)} className="btn-secondary text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
            Import Calendar
          </button>
          <div className="relative">
            <button onClick={() => setShowExportMenu(v=>!v)} className="btn-secondary text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
              Export ▾
            </button>
            {showExportMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden z-20 w-44">
                <button onClick={()=>{exportICS(events);setShowExportMenu(false)}} className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"><span>📅</span> Download .ics</button>
                <button onClick={()=>{exportCSV(events);setShowExportMenu(false)}} className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 border-t border-slate-50"><span>📊</span> Download .csv</button>
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
        <div className="mb-4 bg-green-50 border border-green-100 text-green-700 text-sm font-medium px-4 py-3 rounded-xl animate-fade-in">✓ {importMsg}</div>
      )}

      {view==='month' && <MonthView />}
      {view==='day'   && <DayView />}
      {view==='year'  && <YearView />}
      {view==='list'  && <ListView />}

      {selected   && <EventModal event={selected} onClose={closeEvent} onSave={saveEvent} onDelete={deleteEvent} />}
      {showAdd    && <AddEventModal initYear={year} initMonth={month} onClose={() => setShowAdd(false)} onAdd={addEvent} />}
      {showImport && <SmartImport onImport={handleSmartImport} onClose={() => setShowImport(false)} />}
      {showExportMenu && <div className="fixed inset-0 z-10" onClick={() => setShowExportMenu(false)} />}
    </div>
  )
}
