import { useState } from 'react'
import ModuleHeader from '../../components/ModuleHeader'
import { monthlyEventSuggestions } from '../../data/suggestions'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface CalEvent {
  id: string
  day: number
  title: string
  type: 'meeting' | 'fundraiser' | 'event' | 'deadline'
}

const SAMPLE_EVENTS: Record<string, CalEvent[]> = {
  '2025-6': [ // July
    { id: '1', day: 10, title: 'Board Meeting', type: 'meeting' },
    { id: '2', day: 22, title: 'Summer Planning', type: 'meeting' },
    { id: '3', day: 30, title: 'Walk-A-Thon End', type: 'deadline' },
  ],
  '2025-7': [ // August
    { id: '4', day: 5, title: 'Back-to-School Night', type: 'event' },
    { id: '5', day: 12, title: 'Spirit Wear Deadline', type: 'deadline' },
    { id: '6', day: 20, title: 'Welcome Picnic', type: 'event' },
    { id: '7', day: 26, title: 'First PTA Meeting', type: 'meeting' },
  ],
  '2025-8': [ // September
    { id: '8', day: 3, title: 'Walk-A-Thon Kickoff', type: 'fundraiser' },
    { id: '9', day: 15, title: 'Picture Day', type: 'event' },
    { id: '10', day: 23, title: 'General Meeting', type: 'meeting' },
  ],
}

const typeColors: Record<string, { bg: string; text: string; dot: string }> = {
  meeting: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
  fundraiser: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  event: { bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-500' },
  deadline: { bg: 'bg-red-100', text: 'text-red-600', dot: 'bg-red-500' },
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

export default function CalendarModule() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [view, setView] = useState<'calendar' | 'suggestions'>('calendar')
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [newEvent, setNewEvent] = useState({ title: '', day: '', type: 'event' as CalEvent['type'] })
  const [events, setEvents] = useState(SAMPLE_EVENTS)

  const key = `${year}-${month}`
  const monthEvents = events[key] || []
  const suggestions = monthlyEventSuggestions[month] || []

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  const prev = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  const next = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  const addEvent = () => {
    if (!newEvent.title || !newEvent.day) return
    const ev: CalEvent = {
      id: Date.now().toString(),
      day: parseInt(newEvent.day),
      title: newEvent.title,
      type: newEvent.type,
    }
    setEvents(prev => ({ ...prev, [key]: [...(prev[key] || []), ev] }))
    setNewEvent({ title: '', day: '', type: 'event' })
    setShowAddEvent(false)
  }

  const addSuggestion = (title: string) => {
    const ev: CalEvent = {
      id: Date.now().toString(),
      day: 15,
      title,
      type: 'event',
    }
    setEvents(prev => ({ ...prev, [key]: [...(prev[key] || []), ev] }))
  }

  const cells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      <ModuleHeader title="Calendar & Events" subtitle="Plan, schedule, and discover event ideas for each month" gradient="gradient-cool" icon="📅" />
      <div className="flex items-center justify-between mb-6">
        <div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-xl border border-slate-200 overflow-hidden bg-white">
            <button onClick={() => setView('calendar')} className={`px-4 py-2 text-sm font-medium transition-colors ${view === 'calendar' ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
              📅 Calendar
            </button>
            <button onClick={() => setView('suggestions')} className={`px-4 py-2 text-sm font-medium transition-colors ${view === 'suggestions' ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
              💡 Ideas
            </button>
          </div>
          <button onClick={() => setShowAddEvent(true)} className="btn-primary">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add Event
          </button>
        </div>
      </div>

      {/* Month nav */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={prev} className="btn-secondary p-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h2 className="text-xl font-bold text-slate-800">{MONTHS[month]} {year}</h2>
        <button onClick={next} className="btn-secondary p-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>

      {view === 'calendar' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Grid */}
          <div className="lg:col-span-2 card p-6">
            <div className="grid grid-cols-7 mb-2">
              {DAYS.map(d => (
                <div key={d} className="text-center text-xs font-semibold text-slate-400 py-2">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {cells.map((day, i) => {
                if (!day) return <div key={i} />
                const dayEvents = monthEvents.filter(e => e.day === day)
                const isToday = year === today.getFullYear() && month === today.getMonth() && day === today.getDate()
                return (
                  <div key={i} className={`min-h-[70px] rounded-xl p-1.5 border transition-all ${isToday ? 'border-brand-400 bg-brand-50' : 'border-transparent hover:bg-slate-50'}`}>
                    <p className={`text-xs font-semibold mb-1 w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-brand-600 text-white' : 'text-slate-600'}`}>{day}</p>
                    {dayEvents.map(ev => {
                      const c = typeColors[ev.type]
                      return (
                        <div key={ev.id} className={`${c.bg} ${c.text} text-xs px-1.5 py-0.5 rounded-md mb-0.5 truncate font-medium`}>
                          {ev.title}
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
              {Object.entries(typeColors).map(([type, c]) => (
                <div key={type} className="flex items-center gap-1.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${c.dot}`} />
                  <span className="text-xs text-slate-500 capitalize">{type}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Events list + suggestions */}
          <div className="space-y-4">
            <div className="card p-5">
              <h3 className="font-semibold text-slate-800 mb-3">{MONTHS[month]} Events</h3>
              {monthEvents.length === 0 ? (
                <p className="text-sm text-slate-400">No events this month. Add one!</p>
              ) : (
                <div className="space-y-2">
                  {monthEvents.sort((a, b) => a.day - b.day).map(ev => {
                    const c = typeColors[ev.type]
                    return (
                      <div key={ev.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50">
                        <div className={`w-8 h-8 rounded-lg ${c.bg} flex items-center justify-center flex-shrink-0`}>
                          <span className={`text-sm font-bold ${c.text}`}>{ev.day}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-700">{ev.title}</p>
                          <span className={`text-xs ${c.text}`}>{ev.type}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="card p-5">
              <h3 className="font-semibold text-slate-800 mb-1">💡 Suggested for {MONTHS[month]}</h3>
              <p className="text-xs text-slate-400 mb-3">Click to add to your calendar</p>
              <div className="space-y-2">
                {suggestions.slice(0, 5).map((s, i) => (
                  <button key={i} onClick={() => addSuggestion(s)} className="w-full text-left p-2 rounded-lg hover:bg-brand-50 hover:text-brand-700 text-sm text-slate-600 transition-colors flex items-center gap-2 group">
                    <span className="text-brand-400 opacity-0 group-hover:opacity-100">+</span>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Suggestions View — Full Year */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MONTHS.map((m, mi) => (
            <div key={m} className={`card p-5 ${mi === month ? 'ring-2 ring-brand-500' : ''}`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-800">{m}</h3>
                {mi === month && <span className="badge bg-brand-100 text-brand-700">Current</span>}
              </div>
              <ul className="space-y-1.5">
                {(monthlyEventSuggestions[mi] || []).map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="text-brand-400 mt-0.5 flex-shrink-0">•</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Add Event Modal */}
      {showAddEvent && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in">
            <h3 className="font-bold text-slate-800 text-lg mb-4">Add Event — {MONTHS[month]} {year}</h3>
            <div className="space-y-4">
              <div>
                <label className="label">Event Title</label>
                <input className="input" placeholder="e.g. Fall Carnival" value={newEvent.title} onChange={e => setNewEvent(p => ({ ...p, title: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Day</label>
                  <input className="input" type="number" min="1" max={daysInMonth} placeholder="15" value={newEvent.day} onChange={e => setNewEvent(p => ({ ...p, day: e.target.value }))} />
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
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddEvent(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button onClick={addEvent} className="btn-primary flex-1 justify-center">Add Event</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
