import { useState } from 'react'
import ModuleHeader from '../../components/ModuleHeader'
import { monthlyEventSuggestions } from '../../data/suggestions'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAYS  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const DAYS_SHORT = ['S','M','T','W','T','F','S']
const HOURS = Array.from({ length: 15 }, (_, i) => i + 7) // 7am–9pm

interface CalEvent {
  id: string
  year: number
  month: number
  day: number
  hour?: number   // 0-23, undefined = all-day
  title: string
  type: 'meeting' | 'fundraiser' | 'event' | 'deadline'
  description?: string
}

type ViewMode = 'month' | 'day' | 'year' | 'list'

const SEED_EVENTS: CalEvent[] = [
  { id: '1',  year: 2025, month: 6, day: 10, hour: 18, title: 'Board Meeting',         type: 'meeting',    description: 'Monthly board meeting via Zoom' },
  { id: '2',  year: 2025, month: 6, day: 22, hour: 17, title: 'Summer Planning',       type: 'meeting' },
  { id: '3',  year: 2025, month: 6, day: 30,           title: 'Walk-A-Thon End',       type: 'deadline' },
  { id: '4',  year: 2025, month: 7, day:  5, hour: 18, title: 'Back-to-School Night',  type: 'event',      description: 'Welcome families to the new school year' },
  { id: '5',  year: 2025, month: 7, day: 12,           title: 'Spirit Wear Deadline',  type: 'deadline' },
  { id: '6',  year: 2025, month: 7, day: 20, hour: 11, title: 'Welcome Picnic',        type: 'event' },
  { id: '7',  year: 2025, month: 7, day: 26, hour: 19, title: 'First PTO Meeting',     type: 'meeting' },
  { id: '8',  year: 2025, month: 8, day:  3, hour:  8, title: 'Walk-A-Thon Kickoff',  type: 'fundraiser', description: 'Kick off our biggest fundraiser of the year' },
  { id: '9',  year: 2025, month: 8, day: 15, hour:  9, title: 'Picture Day',           type: 'event' },
  { id: '10', year: 2025, month: 8, day: 23, hour: 18, title: 'General Meeting',       type: 'meeting' },
  { id: '11', year: 2025, month: 9, day: 18, hour: 17, title: 'Fall Carnival',         type: 'event',      description: 'Annual fall carnival with games and food' },
  { id: '12', year: 2025, month: 9, day:  1, hour:  9, title: 'Box Tops Drive Starts', type: 'fundraiser' },
  { id: '13', year: 2025, month:10, day: 11, hour: 19, title: 'November Board Meeting',type: 'meeting' },
  { id: '14', year: 2025, month:11, day: 14, hour: 10, title: 'Holiday Shop',          type: 'fundraiser' },
]

const TYPE = {
  meeting:    { bg: 'bg-blue-100',   text: 'text-blue-700',   dot: 'bg-blue-500',   border: 'border-blue-200',  gradient: 'from-blue-500 to-blue-600' },
  fundraiser: { bg: 'bg-amber-100',  text: 'text-amber-700',  dot: 'bg-amber-500',  border: 'border-amber-200', gradient: 'from-amber-400 to-orange-500' },
  event:      { bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-500', border: 'border-purple-200',gradient: 'from-violet-500 to-purple-600' },
  deadline:   { bg: 'bg-red-100',    text: 'text-red-600',    dot: 'bg-red-500',    border: 'border-red-200',   gradient: 'from-red-500 to-rose-500' },
}

function daysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate() }
function firstDayOf(y: number, m: number)  { return new Date(y, m, 1).getDay() }
function fmt12(h: number) {
  if (h === 0)  return '12 AM'
  if (h < 12)  return `${h} AM`
  if (h === 12) return '12 PM'
  return `${h - 12} PM`
}

export default function CalendarModule() {
  const today = new Date()
  const [view, setView]           = useState<ViewMode>('month')
  const [year, setYear]           = useState(today.getFullYear())
  const [month, setMonth]         = useState(today.getMonth())
  const [selectedDay, setSelectedDay] = useState(today.getDate())
  const [events, setEvents]       = useState<CalEvent[]>(SEED_EVENTS)
  const [showAdd, setShowAdd]     = useState(false)
  const [listFilter, setListFilter] = useState<string>('all')
  const [listSearch, setListSearch] = useState('')
  const [newEvent, setNewEvent]   = useState({
    title: '', day: String(today.getDate()), hour: '18', type: 'event' as CalEvent['type'], description: '',
  })

  // ── helpers ──────────────────────────────────────────────────────────
  const eventsFor = (y: number, m: number, d?: number) =>
    events.filter(e => e.year === y && e.month === m && (d == null || e.day === d))

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1) }
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1) }
  const prevDay   = () => {
    const d = new Date(year, month, selectedDay - 1)
    setYear(d.getFullYear()); setMonth(d.getMonth()); setSelectedDay(d.getDate())
  }
  const nextDay   = () => {
    const d = new Date(year, month, selectedDay + 1)
    setYear(d.getFullYear()); setMonth(d.getMonth()); setSelectedDay(d.getDate())
  }

  const addEvent = () => {
    if (!newEvent.title || !newEvent.day) return
    setEvents(prev => [...prev, {
      id: Date.now().toString(),
      year, month, day: parseInt(newEvent.day),
      hour: newEvent.hour ? parseInt(newEvent.hour) : undefined,
      title: newEvent.title,
      type: newEvent.type,
      description: newEvent.description || undefined,
    }])
    setNewEvent({ title: '', day: String(today.getDate()), hour: '18', type: 'event', description: '' })
    setShowAdd(false)
  }

  const goToDay = (d: number, m?: number, y?: number) => {
    if (m != null) setMonth(m)
    if (y != null) setYear(y)
    setSelectedDay(d)
    setView('day')
  }

  // ── view toggle bar ───────────────────────────────────────────────────
  const ViewToggle = () => (
    <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
      {(['month','day','year','list'] as ViewMode[]).map(v => (
        <button key={v} onClick={() => setView(v)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${view === v ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>
          {v === 'month' ? '📅 Month' : v === 'day' ? '🕐 Day' : v === 'year' ? '📆 Year' : '📋 List'}
        </button>
      ))}
    </div>
  )

  // ── MONTH VIEW ────────────────────────────────────────────────────────
  const MonthView = () => {
    const dim = daysInMonth(year, month)
    const first = firstDayOf(year, month)
    const cells: (number | null)[] = [...Array(first).fill(null), ...Array.from({ length: dim }, (_, i) => i + 1)]
    const monthEvs = eventsFor(year, month)

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6">
          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map(d => <div key={d} className="text-center text-xs font-bold text-slate-400 py-2">{d}</div>)}
          </div>
          {/* Cells */}
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              if (!day) return <div key={i} />
              const dayEvs = monthEvs.filter(e => e.day === day)
              const isToday = year === today.getFullYear() && month === today.getMonth() && day === today.getDate()
              return (
                <div key={i}
                  onClick={() => goToDay(day)}
                  className={`min-h-[76px] rounded-xl p-1.5 border cursor-pointer transition-all hover:shadow-sm ${isToday ? 'border-brand-400 bg-brand-50' : 'border-transparent hover:bg-slate-50 hover:border-slate-200'}`}>
                  <p className={`text-xs font-bold mb-1 w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-brand-600 text-white' : 'text-slate-600'}`}>{day}</p>
                  {dayEvs.slice(0, 2).map(ev => (
                    <div key={ev.id} className={`${TYPE[ev.type].bg} ${TYPE[ev.type].text} text-[10px] px-1.5 py-0.5 rounded-md mb-0.5 truncate font-semibold`}>
                      {ev.hour != null ? `${fmt12(ev.hour)} ` : ''}{ev.title}
                    </div>
                  ))}
                  {dayEvs.length > 2 && <div className="text-[10px] text-slate-400 font-medium">+{dayEvs.length - 2} more</div>}
                </div>
              )
            })}
          </div>
          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
            {Object.entries(TYPE).map(([type, c]) => (
              <div key={type} className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${c.dot}`} />
                <span className="text-xs text-slate-500 capitalize">{type}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="font-bold text-slate-800 mb-3">{MONTHS[month]} Events</h3>
            {monthEvs.length === 0
              ? <p className="text-sm text-slate-400">No events yet. Add one!</p>
              : <div className="space-y-2">
                  {monthEvs.sort((a, b) => a.day - b.day || (a.hour ?? 0) - (b.hour ?? 0)).map(ev => (
                    <div key={ev.id} onClick={() => goToDay(ev.day)}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                      <div className={`w-8 h-8 rounded-lg ${TYPE[ev.type].bg} flex items-center justify-center flex-shrink-0`}>
                        <span className={`text-xs font-bold ${TYPE[ev.type].text}`}>{ev.day}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{ev.title}</p>
                        <p className={`text-xs ${TYPE[ev.type].text}`}>{ev.hour != null ? fmt12(ev.hour) : 'All day'} · {ev.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
            }
          </div>
          <div className="card p-5">
            <h3 className="font-bold text-slate-800 mb-1">💡 Ideas for {MONTHS[month]}</h3>
            <p className="text-xs text-slate-400 mb-3">Click to add to calendar</p>
            <div className="space-y-1">
              {(monthlyEventSuggestions[month] || []).slice(0, 5).map((s, i) => (
                <button key={i} onClick={() => setEvents(p => [...p, { id: Date.now().toString(), year, month, day: 15, title: s, type: 'event' }])}
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

  // ── DAY VIEW ──────────────────────────────────────────────────────────
  const DayView = () => {
    const dayEvs = eventsFor(year, month, selectedDay)
    const allDay  = dayEvs.filter(e => e.hour == null)
    const timed   = dayEvs.filter(e => e.hour != null)
    const isToday = year === today.getFullYear() && month === today.getMonth() && selectedDay === today.getDate()

    return (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 card overflow-hidden">
          {/* Day header */}
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
                  <div key={ev.id} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${TYPE[ev.type].bg}`}>
                    <div className={`w-2 h-2 rounded-full ${TYPE[ev.type].dot}`} />
                    <span className={`text-sm font-semibold ${TYPE[ev.type].text}`}>{ev.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Hourly grid */}
          <div className="overflow-y-auto" style={{ maxHeight: '560px' }}>
            {HOURS.map(h => {
              const hourEvs = timed.filter(e => e.hour === h)
              const isNow = isToday && today.getHours() === h
              return (
                <div key={h} className={`flex border-b border-slate-50 min-h-[60px] ${isNow ? 'bg-brand-50/50' : ''}`}>
                  <div className="w-16 flex-shrink-0 px-3 pt-2">
                    <span className={`text-xs font-semibold ${isNow ? 'text-brand-600' : 'text-slate-400'}`}>{fmt12(h)}</span>
                  </div>
                  <div className="flex-1 py-1 pr-3 space-y-1">
                    {isNow && (
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-brand-500 pulse-dot" />
                        <div className="flex-1 h-px bg-brand-400" />
                      </div>
                    )}
                    {hourEvs.map(ev => (
                      <div key={ev.id} className={`px-3 py-2 rounded-xl bg-gradient-to-r ${TYPE[ev.type].gradient} text-white shadow-sm`}>
                        <p className="text-sm font-bold leading-tight">{ev.title}</p>
                        {ev.description && <p className="text-xs text-white/75 mt-0.5">{ev.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Mini month picker */}
        <div className="space-y-4">
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <button onClick={prevMonth} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
                <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
              </button>
              <p className="text-sm font-bold text-slate-800">{MONTHS_SHORT[month]} {year}</p>
              <button onClick={nextMonth} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
                <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
              </button>
            </div>
            <div className="grid grid-cols-7 mb-1">
              {DAYS_SHORT.map((d, i) => <div key={i} className="text-center text-[10px] font-bold text-slate-400 py-1">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-0.5">
              {[...Array(firstDayOf(year, month)).fill(null), ...Array.from({ length: daysInMonth(year, month) }, (_, i) => i + 1)].map((d, i) => {
                if (!d) return <div key={i} />
                const hasEv = eventsFor(year, month, d).length > 0
                const isSel = d === selectedDay
                const isTod = year === today.getFullYear() && month === today.getMonth() && d === today.getDate()
                return (
                  <button key={i} onClick={() => setSelectedDay(d)}
                    className={`w-full aspect-square rounded-full flex items-center justify-center text-[11px] font-semibold transition-all ${isSel ? 'bg-brand-600 text-white' : isTod ? 'bg-brand-100 text-brand-700' : 'hover:bg-slate-100 text-slate-700'}`}>
                    {d}
                    {hasEv && !isSel && <span className="absolute mt-4 w-1 h-1 rounded-full bg-brand-400" />}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="card p-4">
            <h3 className="font-bold text-slate-800 text-sm mb-3">Events on the {selectedDay}{['st','nd','rd'][((selectedDay % 10) - 1)] || 'th'}</h3>
            {dayEvs.length === 0
              ? <p className="text-xs text-slate-400">No events. Click + Add Event to create one.</p>
              : <div className="space-y-2">
                  {dayEvs.sort((a,b) => (a.hour ?? -1) - (b.hour ?? -1)).map(ev => (
                    <div key={ev.id} className={`p-2.5 rounded-xl border ${TYPE[ev.type].border} ${TYPE[ev.type].bg}`}>
                      <p className={`text-xs font-bold ${TYPE[ev.type].text}`}>{ev.hour != null ? fmt12(ev.hour) : 'All day'}</p>
                      <p className="text-sm font-semibold text-slate-800 mt-0.5">{ev.title}</p>
                    </div>
                  ))}
                </div>
            }
          </div>
        </div>
      </div>
    )
  }

  // ── YEAR VIEW ─────────────────────────────────────────────────────────
  const YearView = () => (
    <div>
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => setYear(y => y - 1)} className="btn-secondary">← {year - 1}</button>
        <h2 className="text-2xl font-bold text-slate-800">{year}</h2>
        <button onClick={() => setYear(y => y + 1)} className="btn-secondary">{year + 1} →</button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {MONTHS.map((mName, mi) => {
          const dim = daysInMonth(year, mi)
          const first = firstDayOf(year, mi)
          const cells = [...Array(first).fill(null), ...Array.from({ length: dim }, (_, i) => i + 1)]
          const mEvs = eventsFor(year, mi)
          const isCurrent = year === today.getFullYear() && mi === today.getMonth()
          return (
            <div key={mi}
              onClick={() => { setMonth(mi); setView('month') }}
              className={`card p-4 cursor-pointer hover:shadow-md transition-all ${isCurrent ? 'ring-2 ring-brand-500' : ''}`}>
              <div className="flex items-center justify-between mb-2">
                <p className="font-bold text-slate-800 text-sm">{mName}</p>
                {mEvs.length > 0 && (
                  <span className="badge bg-brand-100 text-brand-700 text-xs">{mEvs.length}</span>
                )}
              </div>
              <div className="grid grid-cols-7 gap-px mb-1">
                {DAYS_SHORT.map((d, i) => <div key={i} className="text-center text-[8px] font-bold text-slate-300">{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-px">
                {cells.map((d, i) => {
                  if (!d) return <div key={i} />
                  const dayEvs = mEvs.filter(e => e.day === d)
                  const isT = isCurrent && d === today.getDate()
                  return (
                    <div key={i}
                      onClick={e => { e.stopPropagation(); goToDay(d, mi, year) }}
                      className={`aspect-square rounded-sm flex items-center justify-center text-[9px] font-semibold transition-colors hover:bg-brand-100 ${isT ? 'bg-brand-600 text-white rounded-full' : dayEvs.length ? 'text-brand-700' : 'text-slate-400'}`}>
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

  // ── LIST VIEW ─────────────────────────────────────────────────────────
  const ListView = () => {
    const allEvs = [...events]
      .filter(e => listFilter === 'all' || e.type === listFilter)
      .filter(e => !listSearch || e.title.toLowerCase().includes(listSearch.toLowerCase()))
      .sort((a, b) => {
        const da = new Date(a.year, a.month, a.day, a.hour ?? 0)
        const db = new Date(b.year, b.month, b.day, b.hour ?? 0)
        return da.getTime() - db.getTime()
      })

    const grouped: Record<string, CalEvent[]> = {}
    allEvs.forEach(e => {
      const k = `${e.year}-${e.month}`
      if (!grouped[k]) grouped[k] = []
      grouped[k].push(e)
    })

    return (
      <div>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input className="input pl-9" placeholder="Search events…" value={listSearch} onChange={e => setListSearch(e.target.value)} />
          </div>
          <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
            {['all','meeting','event','fundraiser','deadline'].map(f => (
              <button key={f} onClick={() => setListFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${listFilter === f ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {Object.keys(grouped).length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-slate-400 text-lg mb-2">No events found</p>
            <p className="text-slate-300 text-sm">Try adjusting your search or filter</p>
          </div>
        ) : (
          <div className="space-y-6">
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
                      const date = new Date(ev.year, ev.month, ev.day)
                      const isPast = date < today
                      return (
                        <div key={ev.id}
                          onClick={() => goToDay(ev.day, ev.month, ev.year)}
                          className={`card p-4 flex items-center gap-4 cursor-pointer hover:shadow-md transition-all ${isPast ? 'opacity-60' : ''}`}>
                          {/* Date block */}
                          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${TYPE[ev.type].gradient} flex flex-col items-center justify-center flex-shrink-0 shadow-sm`}>
                            <span className="text-white text-[10px] font-bold uppercase">{MONTHS_SHORT[ev.month]}</span>
                            <span className="text-white text-xl font-black leading-none">{ev.day}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="font-bold text-slate-800 truncate">{ev.title}</p>
                              {isPast && <span className="badge bg-slate-100 text-slate-400 text-xs flex-shrink-0">Past</span>}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-500">
                              <span>{DAYS[new Date(ev.year, ev.month, ev.day).getDay()]}, {MONTHS[ev.month]} {ev.day}</span>
                              {ev.hour != null && <span>· {fmt12(ev.hour)}</span>}
                            </div>
                            {ev.description && <p className="text-xs text-slate-400 mt-1 truncate">{ev.description}</p>}
                          </div>
                          <span className={`badge ${TYPE[ev.type].bg} ${TYPE[ev.type].text} flex-shrink-0`}>{ev.type}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // ── nav title per view ────────────────────────────────────────────────
  const NavTitle = () => {
    if (view === 'year') return null
    if (view === 'list') return null
    if (view === 'day') return (
      <div className="flex items-center gap-3">
        <button onClick={prevDay} className="btn-secondary !p-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
        </button>
        <span className="font-bold text-slate-800 min-w-[180px] text-center">
          {DAYS[new Date(year, month, selectedDay).getDay()]}, {MONTHS[month]} {selectedDay}
        </span>
        <button onClick={nextDay} className="btn-secondary !p-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
        </button>
        <button onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth()); setSelectedDay(today.getDate()) }}
          className="btn-secondary text-xs">Today</button>
      </div>
    )
    return (
      <div className="flex items-center gap-3">
        <button onClick={prevMonth} className="btn-secondary !p-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
        </button>
        <span className="font-bold text-slate-800 min-w-[160px] text-center">{MONTHS[month]} {year}</span>
        <button onClick={nextMonth} className="btn-secondary !p-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
        </button>
        <button onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth()) }}
          className="btn-secondary text-xs">Today</button>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      <ModuleHeader title="Calendar & Events" subtitle="Plan, schedule, and discover event ideas for each month" gradient="gradient-cool" icon="📅" />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <ViewToggle />
        <div className="flex items-center gap-3">
          <NavTitle />
          <button onClick={() => setShowAdd(true)} className="btn-primary">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
            Add Event
          </button>
        </div>
      </div>

      {view === 'month' && <MonthView />}
      {view === 'day'   && <DayView />}
      {view === 'year'  && <YearView />}
      {view === 'list'  && <ListView />}

      {/* Add Event Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in">
            <h3 className="font-bold text-slate-800 text-lg mb-4">Add Event</h3>
            <div className="space-y-4">
              <div>
                <label className="label">Event Title *</label>
                <input className="input" placeholder="e.g. Fall Carnival" value={newEvent.title}
                  onChange={e => setNewEvent(p => ({ ...p, title: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Day</label>
                  <input className="input" type="number" min="1" max={daysInMonth(year, month)} value={newEvent.day}
                    onChange={e => setNewEvent(p => ({ ...p, day: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Time (optional)</label>
                  <select className="input" value={newEvent.hour}
                    onChange={e => setNewEvent(p => ({ ...p, hour: e.target.value }))}>
                    <option value="">All day</option>
                    {HOURS.map(h => <option key={h} value={h}>{fmt12(h)}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Type</label>
                <select className="input" value={newEvent.type}
                  onChange={e => setNewEvent(p => ({ ...p, type: e.target.value as CalEvent['type'] }))}>
                  <option value="event">Event</option>
                  <option value="meeting">Meeting</option>
                  <option value="fundraiser">Fundraiser</option>
                  <option value="deadline">Deadline</option>
                </select>
              </div>
              <div>
                <label className="label">Description (optional)</label>
                <textarea className="input" rows={2} placeholder="Brief description…" value={newEvent.description}
                  onChange={e => setNewEvent(p => ({ ...p, description: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAdd(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button onClick={addEvent} className="btn-primary flex-1 justify-center">Add Event</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
