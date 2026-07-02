import { useState, useRef, useCallback } from 'react'
import * as pdfjsLib from 'pdfjs-dist'

// Use the bundled worker via a data URL approach — avoids CORS issues with vite
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ParsedEvent {
  id: string
  title: string
  date: string        // raw date string found in PDF
  year: number
  month: number       // 0-indexed
  day: number
  type: 'meeting' | 'fundraiser' | 'event' | 'deadline'
  description?: string
  selected: boolean
}

interface Props {
  onImport: (events: ParsedEvent[]) => void
  onClose: () => void
}

// ─── Month name → index map ───────────────────────────────────────────────────
const MONTH_MAP: Record<string, number> = {
  january:0, february:1, march:2, april:3, may:4, june:5,
  july:6, august:7, september:8, october:9, november:10, december:11,
  jan:0, feb:1, mar:2, apr:3, may4:4, jun:5, jul:6, aug:7, sep:8, oct:9, nov:10, dec:11,
}

// Keywords that hint at event types
const TYPE_HINTS = {
  meeting:    /\b(meeting|board|agenda|minutes|session|committee)\b/i,
  fundraiser: /\b(fundraiser?|walk.?a.?thon|carnival|auction|sale|bake|raffle|fair)\b/i,
  deadline:   /\b(deadline|due|last day|last chance|cutoff|submit)\b/i,
}

function guessType(text: string): ParsedEvent['type'] {
  if (TYPE_HINTS.meeting.test(text))    return 'meeting'
  if (TYPE_HINTS.fundraiser.test(text)) return 'fundraiser'
  if (TYPE_HINTS.deadline.test(text))   return 'deadline'
  return 'event'
}

// ─── Date extraction patterns ─────────────────────────────────────────────────
interface DateHit { year: number; month: number; day: number; raw: string; endIndex: number }

function parseDatesFromText(text: string, defaultYear: number): DateHit[] {
  const hits: DateHit[] = []
  const seen = new Set<string>()
  const now = new Date()

  const tryAdd = (y: number, m: number, d: number, raw: string, end: number) => {
    const key = `${y}-${m}-${d}`
    if (!seen.has(key) && d >= 1 && d <= 31 && m >= 0 && m <= 11) {
      seen.add(key)
      hits.push({ year: y, month: m, day: d, raw, endIndex: end })
    }
  }

  // Pattern 1: "September 5, 2025" / "Sep 5 2025"
  const p1 = /\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)\.?\s+(\d{1,2})(?:st|nd|rd|th)?[,\s]+(\d{4})\b/gi
  for (const m of text.matchAll(p1)) {
    const mo = MONTH_MAP[m[1].toLowerCase()]
    if (mo != null) tryAdd(parseInt(m[3]), mo, parseInt(m[2]), m[0], m.index! + m[0].length)
  }

  // Pattern 2: "September 5" / "Sep 5" (no year)
  const p2 = /\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)\.?\s+(\d{1,2})(?:st|nd|rd|th)?\b/gi
  for (const m of text.matchAll(p2)) {
    const mo = MONTH_MAP[m[1].toLowerCase()]
    if (mo != null) {
      // Guess year: if month is past and we're in the second half of the year, it's probably next year
      const y = defaultYear
      tryAdd(y, mo, parseInt(m[2]), m[0], m.index! + m[0].length)
    }
  }

  // Pattern 3: MM/DD/YYYY or MM-DD-YYYY
  const p3 = /\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})\b/g
  for (const m of text.matchAll(p3)) {
    const yr = parseInt(m[3]) < 100 ? 2000 + parseInt(m[3]) : parseInt(m[3])
    tryAdd(yr, parseInt(m[1]) - 1, parseInt(m[2]), m[0], m.index! + m[0].length)
  }

  // Pattern 4: MM/DD (no year)
  const p4 = /\b(\d{1,2})\/(\d{1,2})\b/g
  for (const m of text.matchAll(p4)) {
    const mo = parseInt(m[1]) - 1
    tryAdd(defaultYear, mo, parseInt(m[2]), m[0], m.index! + m[0].length)
  }

  return hits.sort((a, b) => {
    const da = new Date(a.year, a.month, a.day).getTime()
    const db = new Date(b.year, b.month, b.day).getTime()
    return da - db
  })
}

// Extract a short event title from the text around a date hit
function extractTitle(fullText: string, hit: DateHit): string {
  // Take up to 120 chars after the date reference
  const after = fullText.slice(hit.endIndex, hit.endIndex + 200).replace(/\n+/g, ' ').trim()
  // Take up to 60 chars before
  const before = fullText.slice(Math.max(0, hit.endIndex - 80), hit.endIndex).replace(/\n+/g, ' ').trim()

  // Try "- Event Name" or "• Event Name" patterns right after date
  const dashMatch = after.match(/^[\s\-–—•:]+(.{3,80}?)(?:\s{2,}|\n|$)/)
  if (dashMatch) return dashMatch[1].trim()

  // Grab the chunk right before (often "Event Name Sep 5")
  const beforeChunk = before.split(/\s{2,}|\n/).pop()?.trim()
  if (beforeChunk && beforeChunk.length > 3 && beforeChunk.length < 80 && /[A-Za-z]/.test(beforeChunk)) {
    return beforeChunk
  }

  // Fall back to first meaningful words after the date
  const words = after.split(/\s+/).slice(0, 6).join(' ')
  return words.length > 3 ? words : 'School Event'
}

// ─── Main PDF text extraction ─────────────────────────────────────────────────
async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const pages: string[] = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const pageText = content.items
      .map((item: any) => item.str)
      .join(' ')
    pages.push(pageText)
  }
  return pages.join('\n')
}

// Detect the most common year mentioned in the text (or fall back to current/next year)
function detectYear(text: string): number {
  const now = new Date()
  const yearMatches = [...text.matchAll(/\b(20\d{2})\b/g)].map(m => parseInt(m[1]))
  if (yearMatches.length === 0) return now.getFullYear()
  const freq: Record<number, number> = {}
  yearMatches.forEach(y => { freq[y] = (freq[y] || 0) + 1 })
  return parseInt(Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0])
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function PDFImport({ onImport, onClose }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [phase, setPhase] = useState<'upload' | 'parsing' | 'review' | 'error'>('upload')
  const [errorMsg, setErrorMsg] = useState('')
  const [parsed, setParsed] = useState<ParsedEvent[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [pdfName, setPdfName] = useState('')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  const processFile = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('Please select a PDF file.')
      setPhase('error')
      return
    }
    setPdfName(file.name)
    setPhase('parsing')
    try {
      const text = await extractTextFromPDF(file)
      const year = detectYear(text)
      const dateHits = parseDatesFromText(text, year)

      if (dateHits.length === 0) {
        setErrorMsg('No dates were found in this PDF. The file might be a scanned image rather than text-based. Try copy-pasting the calendar text into the manual import instead.')
        setPhase('error')
        return
      }

      const events: ParsedEvent[] = dateHits.map((hit, i) => ({
        id: `pdf_${i}_${Date.now()}`,
        title: extractTitle(text, hit),
        date: hit.raw,
        year: hit.year,
        month: hit.month,
        day: hit.day,
        type: guessType(extractTitle(text, hit)),
        selected: true,
      }))

      setParsed(events)
      setPhase('review')
    } catch (err) {
      console.error(err)
      setErrorMsg('Could not read this PDF. Make sure it is a text-based PDF (not a scanned image).')
      setPhase('error')
    }
  }, [])

  const onFilePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
    e.target.value = ''
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }

  const toggleAll = (val: boolean) => setParsed(p => p.map(e => ({ ...e, selected: val })))
  const toggleOne = (id: string) => setParsed(p => p.map(e => e.id === id ? { ...e, selected: !e.selected } : e))
  const setEventType = (id: string, type: ParsedEvent['type']) => setParsed(p => p.map(e => e.id === id ? { ...e, type } : e))
  const setEventTitle = (id: string, title: string) => setParsed(p => p.map(e => e.id === id ? { ...e, title } : e))

  const doImport = () => {
    const selected = parsed.filter(e => e.selected)
    if (!selected.length) return
    onImport(selected)
    onClose()
  }

  const selectedCount = parsed.filter(e => e.selected).length
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const TYPE_COLORS: Record<string, string> = {
    event: 'bg-purple-100 text-purple-700',
    meeting: 'bg-blue-100 text-blue-700',
    fundraiser: 'bg-amber-100 text-amber-700',
    deadline: 'bg-red-100 text-red-600',
  }

  const visibleEvents = parsed.filter(e => {
    const matchType = typeFilter === 'all' || e.type === typeFilter
    const matchSearch = !search || e.title.toLowerCase().includes(search.toLowerCase())
    return matchType && matchSearch
  })

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-fade-in" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-800 text-lg">Import PDF Calendar</h2>
            {pdfName && <p className="text-xs text-slate-400 mt-0.5">{pdfName}</p>}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">

          {/* UPLOAD */}
          {phase === 'upload' && (
            <div className="p-8">
              <div
                onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={onDrop}
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${isDragging ? 'border-brand-400 bg-brand-50' : 'border-slate-200 hover:border-brand-300 hover:bg-slate-50'}`}>
                <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">📄</div>
                <p className="font-semibold text-slate-700 mb-1">Drop your school PDF calendar here</p>
                <p className="text-sm text-slate-400 mb-4">or click to browse</p>
                <span className="btn-primary text-sm pointer-events-none">Choose PDF</span>
                <p className="text-xs text-slate-400 mt-4">Works with text-based PDFs. Scanned images are not supported.</p>
              </div>
              <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={onFilePicked} />

              <div className="mt-5 bg-blue-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-blue-700 mb-1">💡 Tips for best results</p>
                <ul className="text-xs text-blue-600 space-y-1 list-disc list-inside">
                  <li>Use the PDF version of the school district calendar (not a scanned image)</li>
                  <li>Dates like "September 5", "Sep 5, 2025", or "9/5/2025" are recognized</li>
                  <li>You'll be able to review and edit all events before importing</li>
                </ul>
              </div>
            </div>
          )}

          {/* PARSING */}
          {phase === 'parsing' && (
            <div className="p-12 text-center">
              <div className="w-14 h-14 gradient-vivid rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              </div>
              <p className="font-semibold text-slate-700">Reading PDF and extracting dates…</p>
              <p className="text-sm text-slate-400 mt-1">This may take a few seconds</p>
            </div>
          )}

          {/* ERROR */}
          {phase === 'error' && (
            <div className="p-8">
              <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
                <div className="text-3xl mb-3">⚠️</div>
                <p className="font-semibold text-red-700 mb-2">Could not extract calendar events</p>
                <p className="text-sm text-red-600">{errorMsg}</p>
              </div>
              <button onClick={() => { setPhase('upload'); setErrorMsg('') }} className="btn-secondary w-full justify-center mt-4">
                Try another file
              </button>
            </div>
          )}

          {/* REVIEW */}
          {phase === 'review' && (
            <div className="p-5 space-y-4">
              <div className="bg-emerald-50 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-emerald-800 text-sm">Found {parsed.length} date entries</p>
                  <p className="text-xs text-emerald-600 mt-0.5">Review event names and types, then click Import.</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => toggleAll(true)} className="text-xs text-emerald-700 font-semibold hover:underline">Select all</button>
                  <span className="text-emerald-300">·</span>
                  <button onClick={() => toggleAll(false)} className="text-xs text-emerald-700 font-semibold hover:underline">Deselect all</button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-2 flex-wrap">
                <div className="relative flex-1 min-w-40">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                  <input className="input pl-8 text-sm py-1.5" placeholder="Filter events…" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
                  {['all', 'event', 'meeting', 'fundraiser', 'deadline'].map(t => (
                    <button key={t} onClick={() => setTypeFilter(t)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${typeFilter === t ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Event list */}
              <div className="space-y-2">
                {visibleEvents.length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-4">No events match your filter</p>
                )}
                {visibleEvents.map(ev => (
                  <div key={ev.id} className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${ev.selected ? 'border-brand-200 bg-brand-50/50' : 'border-slate-100 bg-slate-50 opacity-50'}`}>
                    <input type="checkbox" checked={ev.selected} onChange={() => toggleOne(ev.id)}
                      className="mt-1 w-4 h-4 rounded accent-brand-600 flex-shrink-0 cursor-pointer" />
                    <div className="w-12 flex-shrink-0 text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{MONTHS[ev.month]}</p>
                      <p className="text-lg font-black text-slate-800 leading-none">{ev.day}</p>
                      <p className="text-[10px] text-slate-400">{ev.year}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <input
                        className="w-full text-sm font-semibold text-slate-800 bg-transparent border-0 border-b border-transparent hover:border-slate-200 focus:border-brand-400 focus:outline-none py-0.5 transition-colors"
                        value={ev.title}
                        onChange={e => setEventTitle(ev.id, e.target.value)}
                      />
                    </div>
                    <select
                      value={ev.type}
                      onChange={e => setEventType(ev.id, e.target.value as ParsedEvent['type'])}
                      className={`text-xs font-semibold rounded-lg px-2 py-1 border-0 cursor-pointer flex-shrink-0 ${TYPE_COLORS[ev.type]}`}>
                      <option value="event">Event</option>
                      <option value="meeting">Meeting</option>
                      <option value="fundraiser">Fundraiser</option>
                      <option value="deadline">Deadline</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {phase === 'review' && (
          <div className="p-5 border-t border-slate-100 flex items-center justify-between gap-3">
            <p className="text-sm text-slate-500">{selectedCount} of {parsed.length} events selected</p>
            <div className="flex gap-3">
              <button onClick={onClose} className="btn-secondary">Cancel</button>
              <button onClick={doImport} disabled={selectedCount === 0} className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed">
                Import {selectedCount} Event{selectedCount !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
