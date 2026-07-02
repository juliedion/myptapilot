import { useState, useRef, useCallback } from 'react'
import { useWorkspace } from '../../contexts/WorkspaceContext'

// ── Types ─────────────────────────────────────────────────────────────────────
export interface ImportedEvent {
  year: number; month: number; day: number
  title: string
  type: 'meeting' | 'fundraiser' | 'event' | 'deadline'
  description?: string
  startMin?: number
  location?: string
}

interface Props {
  onImport: (events: ImportedEvent[]) => void
  onClose: () => void
}

// ── ICS parser ────────────────────────────────────────────────────────────────
function pad2(n: number) { return String(n).padStart(2, '0') }

function parseICS(text: string): ImportedEvent[] {
  const vevents = text.split('BEGIN:VEVENT').slice(1)
  return vevents.flatMap(block => {
    const get = (key: string) => {
      const m = block.match(new RegExp(`(?:^|\\n)${key}[^:]*:([^\\r\\n]+)`, 'i'))
      return m ? m[1].trim() : ''
    }
    const dtstart = get('DTSTART')
    if (!dtstart) return []
    const y  = parseInt(dtstart.slice(0, 4))
    const mo = parseInt(dtstart.slice(4, 6)) - 1
    const d  = parseInt(dtstart.slice(6, 8))
    if (isNaN(y) || isNaN(mo) || isNaN(d)) return []
    const hasTime = dtstart.includes('T')
    const startMin = hasTime ? parseInt(dtstart.slice(9, 11)) * 60 + parseInt(dtstart.slice(11, 13)) : undefined
    const summary = get('SUMMARY') || 'Event'
    const location = get('LOCATION') || undefined
    const description = get('DESCRIPTION').replace(/\\n/g, ' ').replace(/\\,/g, ',') || undefined
    return [{ year: y, month: mo, day: d, startMin, title: summary, type: 'event' as const, description, location }]
  })
}

// ── CSV parser ────────────────────────────────────────────────────────────────
const MONTH_MAP: Record<string, number> = {
  jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11,
  january:0,february:1,march:2,april:3,june:5,july:6,august:7,september:8,
  october:9,november:10,december:11,
}

function parseDate(raw: string): { year: number; month: number; day: number } | null {
  raw = raw.trim()
  // MM/DD/YYYY or M/D/YY
  let m = raw.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/)
  if (m) {
    const yr = parseInt(m[3]) < 100 ? 2000 + parseInt(m[3]) : parseInt(m[3])
    return { year: yr, month: parseInt(m[1]) - 1, day: parseInt(m[2]) }
  }
  // Month DD, YYYY / Month DD YYYY
  m = raw.match(/^([A-Za-z]+)\.?\s+(\d{1,2})(?:st|nd|rd|th)?[,\s]+(\d{4})$/)
  if (m) {
    const mo = MONTH_MAP[m[1].toLowerCase()]
    if (mo != null) return { year: parseInt(m[3]), month: mo, day: parseInt(m[2]) }
  }
  // YYYY-MM-DD
  m = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (m) return { year: parseInt(m[1]), month: parseInt(m[2]) - 1, day: parseInt(m[3]) }
  return null
}

function parseCSV(text: string): ImportedEvent[] {
  const lines = text.split(/\r?\n/).filter(l => l.trim())
  if (lines.length < 2) return []
  const header = lines[0].split(',').map(h => h.replace(/"/g, '').toLowerCase().trim())
  const dateCol    = header.findIndex(h => /date|start/i.test(h))
  const titleCol   = header.findIndex(h => /title|summary|event|name|subject/i.test(h))
  const descCol    = header.findIndex(h => /desc|note|detail/i.test(h))
  const locCol     = header.findIndex(h => /loc|location|place/i.test(h))
  if (dateCol === -1 || titleCol === -1) return []

  return lines.slice(1).flatMap(line => {
    const cols = line.match(/(".*?"|[^,]+)/g)?.map(c => c.replace(/^"|"$/g, '').trim()) ?? []
    const dateStr = cols[dateCol] ?? ''
    const title   = cols[titleCol] ?? ''
    if (!dateStr || !title) return []
    const parsed = parseDate(dateStr)
    if (!parsed) return []
    return [{
      ...parsed, title, type: 'event' as const,
      description: descCol >= 0 ? cols[descCol] : undefined,
      location:    locCol  >= 0 ? cols[locCol]  : undefined,
    }]
  })
}

// ── Claude smart categorisation ───────────────────────────────────────────────
async function enrichWithClaude(
  apiKey: string,
  raw: ImportedEvent[],
  orgName: string,
): Promise<ImportedEvent[]> {
  if (!raw.length) return raw

  const list = raw.map((e, i) =>
    `${i}: ${e.year}-${pad2(e.month+1)}-${pad2(e.day)} | ${e.title}${e.description ? ' | ' + e.description.slice(0, 80) : ''}`
  ).join('\n')

  const prompt = `You are helping a PTA/PTO ("${orgName}") import a school calendar.
Below is a list of raw calendar entries. For each one:
1. Decide if it is relevant to parents/PTA (exclude purely internal staff days that parents don't need to know about, unless they affect school attendance)
2. Assign the best type: "event", "meeting", "fundraiser", or "deadline"
3. Write a clean, concise title (fix typos, expand abbreviations)

Return ONLY valid JSON — an array in this exact shape, preserving the original index:
[{"i":0,"keep":true,"title":"Clean Title","type":"event"}, ...]

Entries:
${list}`

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!res.ok) throw new Error(`Claude API error ${res.status}`)
  const json = await res.json()
  const text = json.content?.[0]?.text ?? ''
  const match = text.match(/\[[\s\S]*\]/)
  if (!match) return raw   // fallback: return all as-is

  const decisions = JSON.parse(match[0]) as Array<{ i: number; keep: boolean; title: string; type: string }>
  return decisions
    .filter(d => d.keep)
    .map(d => ({
      ...raw[d.i],
      title: d.title || raw[d.i].title,
      type: (['event','meeting','fundraiser','deadline'].includes(d.type) ? d.type : 'event') as ImportedEvent['type'],
    }))
}

// ── Component ─────────────────────────────────────────────────────────────────
type Phase = 'upload' | 'parsing' | 'preview' | 'done' | 'error'

export default function SmartImport({ onImport, onClose }: Props) {
  const { workspace } = useWorkspace()
  const fileRef = useRef<HTMLInputElement>(null)
  const [phase, setPhase]     = useState<Phase>('upload')
  const [fileName, setFileName] = useState('')
  const [events, setEvents]   = useState<ImportedEvent[]>([])
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [error, setError]     = useState('')
  const [isDrag, setIsDrag]   = useState(false)
  const [statusMsg, setStatus] = useState('')
  const [useAI, setUseAI]     = useState(!!workspace.anthropicApiKey)

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const TYPE_COLORS: Record<string, string> = {
    event: 'bg-purple-100 text-purple-700',
    meeting: 'bg-blue-100 text-blue-700',
    fundraiser: 'bg-amber-100 text-amber-700',
    deadline: 'bg-red-100 text-red-600',
  }
  const TYPE_ICONS: Record<string, string> = { event:'🎉', meeting:'📋', fundraiser:'💰', deadline:'⏰' }

  const process = useCallback(async (file: File) => {
    const name = file.name.toLowerCase()
    const isICS = name.endsWith('.ics') || name.endsWith('.ical')
    const isCSV = name.endsWith('.csv')
    if (!isICS && !isCSV) {
      setError('Please upload an .ics or .csv calendar file.')
      setPhase('error')
      return
    }

    setFileName(file.name)
    setPhase('parsing')
    setStatus('Reading file…')

    try {
      const text = await file.text()
      let raw: ImportedEvent[] = isICS ? parseICS(text) : parseCSV(text)

      if (!raw.length) {
        setError('No events were found in this file. Make sure it is a valid .ics or .csv calendar export.')
        setPhase('error')
        return
      }

      // Sort chronologically
      raw = raw.sort((a, b) =>
        new Date(a.year, a.month, a.day).getTime() - new Date(b.year, b.month, b.day).getTime()
      )

      if (useAI && workspace.anthropicApiKey) {
        setStatus(`Found ${raw.length} entries — asking Claude to filter and categorize…`)
        const enriched = await enrichWithClaude(workspace.anthropicApiKey, raw, workspace.orgName)
        setEvents(enriched)
        setSelected(new Set(enriched.map((_, i) => i)))
      } else {
        setEvents(raw)
        setSelected(new Set(raw.map((_, i) => i)))
      }

      setPhase('preview')
    } catch (err: any) {
      setError(err?.message || 'Something went wrong reading the file.')
      setPhase('error')
    }
  }, [useAI, workspace.anthropicApiKey, workspace.orgName])

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (f) process(f); e.target.value = ''
  }
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDrag(false)
    const f = e.dataTransfer.files[0]; if (f) process(f)
  }

  const toggle = (i: number) => setSelected(s => {
    const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n
  })
  const toggleAll  = () => setSelected(new Set(events.map((_, i) => i)))
  const clearAll   = () => setSelected(new Set())
  const changeType = (i: number, type: ImportedEvent['type']) =>
    setEvents(ev => ev.map((e, idx) => idx === i ? { ...e, type } : e))

  const doImport = () => {
    const chosen = events.filter((_, i) => selected.has(i))
    onImport(chosen)
    setPhase('done')
  }

  const selCount = selected.size

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col animate-fade-in" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-800 text-lg">Import School Calendar</h2>
            {fileName && <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">{fileName}</p>}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">

          {/* UPLOAD */}
          {phase === 'upload' && (
            <div className="p-6 space-y-5">
              <div
                onDragOver={e => { e.preventDefault(); setIsDrag(true) }}
                onDragLeave={() => setIsDrag(false)}
                onDrop={onDrop}
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all
                  ${isDrag ? 'border-brand-400 bg-brand-50' : 'border-slate-200 hover:border-brand-300 hover:bg-slate-50'}`}>
                <div className="text-4xl mb-3">📅</div>
                <p className="font-semibold text-slate-700 mb-1">Drop your school calendar file here</p>
                <p className="text-sm text-slate-400 mb-5">Supports .ics and .csv</p>
                <span className="btn-primary text-sm pointer-events-none">Choose File</span>
                <p className="text-xs text-slate-400 mt-4">Most school districts offer an .ics download from their website</p>
              </div>
              <input ref={fileRef} type="file" accept=".ics,.ical,.csv" className="hidden" onChange={onPick} />

              {/* AI option */}
              {workspace.anthropicApiKey ? (
                <label className="flex items-center gap-3 p-4 bg-violet-50 rounded-xl cursor-pointer">
                  <input type="checkbox" checked={useAI} onChange={e => setUseAI(e.target.checked)}
                    className="w-4 h-4 rounded accent-brand-600" />
                  <div>
                    <p className="text-sm font-semibold text-violet-800">✨ Smart filter with AI</p>
                    <p className="text-xs text-violet-600">Claude will automatically categorize events and remove internal staff-only entries</p>
                  </div>
                </label>
              ) : (
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-xs text-slate-500">💡 Add your Claude API key in <strong>AI Assistant</strong> to enable smart filtering — Claude will automatically categorize events and remove irrelevant entries.</p>
                </div>
              )}
            </div>
          )}

          {/* PARSING */}
          {phase === 'parsing' && (
            <div className="p-12 text-center">
              <div className="w-14 h-14 gradient-vivid rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3V4a10 10 0 100 20v-2a8 8 0 01-8-8z"/>
                </svg>
              </div>
              <p className="font-semibold text-slate-700">{statusMsg || 'Processing…'}</p>
            </div>
          )}

          {/* ERROR */}
          {phase === 'error' && (
            <div className="p-8 space-y-4">
              <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
                <div className="text-3xl mb-3">⚠️</div>
                <p className="font-semibold text-red-700 mb-1">Could not read the file</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
              <button onClick={() => { setPhase('upload'); setError('') }} className="btn-secondary w-full justify-center">
                Try another file
              </button>
            </div>
          )}

          {/* PREVIEW */}
          {phase === 'preview' && (
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">
                  <span className="font-bold text-slate-800">{selCount}</span> of {events.length} events selected
                </p>
                <div className="flex gap-3">
                  <button onClick={toggleAll} className="text-xs text-brand-600 font-semibold hover:underline">Select all</button>
                  <button onClick={clearAll}  className="text-xs text-slate-400 font-semibold hover:underline">Clear</button>
                </div>
              </div>

              <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1">
                {events.map((ev, i) => (
                  <div key={i}
                    onClick={() => toggle(i)}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all select-none
                      ${selected.has(i) ? 'border-brand-200 bg-brand-50/40 hover:bg-brand-50' : 'border-slate-100 bg-slate-50 opacity-50 hover:opacity-70'}`}>
                    <input type="checkbox" checked={selected.has(i)} onChange={() => toggle(i)}
                      onClick={e => e.stopPropagation()}
                      className="w-4 h-4 rounded accent-brand-600 flex-shrink-0" />
                    <div className="w-12 flex-shrink-0 text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{MONTHS[ev.month]}</p>
                      <p className="text-lg font-black text-slate-800 leading-none">{ev.day}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 leading-tight truncate">{ev.title}</p>
                      {ev.location && <p className="text-xs text-slate-400 truncate">📍 {ev.location}</p>}
                    </div>
                    <select
                      value={ev.type}
                      onChange={e => { e.stopPropagation(); changeType(i, e.target.value as ImportedEvent['type']) }}
                      onClick={e => e.stopPropagation()}
                      className={`text-xs font-semibold rounded-lg px-2 py-1 border-0 cursor-pointer flex-shrink-0 ${TYPE_COLORS[ev.type]}`}>
                      <option value="event">🎉 Event</option>
                      <option value="meeting">📋 Meeting</option>
                      <option value="fundraiser">💰 Fundraiser</option>
                      <option value="deadline">⏰ Deadline</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DONE */}
          {phase === 'done' && (
            <div className="p-10 text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">✅</div>
              <p className="font-bold text-slate-800 text-lg mb-1">Calendar imported!</p>
              <p className="text-sm text-slate-500">{selCount} event{selCount !== 1 ? 's' : ''} added to your calendar.</p>
              <button onClick={onClose} className="btn-primary mt-6">Done</button>
            </div>
          )}

        </div>

        {/* Footer */}
        {phase === 'preview' && (
          <div className="p-5 border-t border-slate-100 flex gap-3 justify-end">
            <button onClick={onClose} className="btn-secondary">Cancel</button>
            <button onClick={doImport} disabled={selCount === 0}
              className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed">
              Import {selCount} Event{selCount !== 1 ? 's' : ''}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
