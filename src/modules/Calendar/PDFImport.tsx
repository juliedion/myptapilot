import { useState, useRef, useCallback } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import { useWorkspace } from '../../contexts/WorkspaceContext'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ParsedEvent {
  id: string
  title: string
  date: string
  year: number
  month: number   // 0-indexed
  day: number
  type: 'meeting' | 'fundraiser' | 'event' | 'deadline'
  description?: string
  selected: boolean
}

interface Props {
  onImport: (events: ParsedEvent[]) => void
  onClose: () => void
}

const ACCEPTED = '.pdf,.jpg,.jpeg,.png,.webp,.gif'
const IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']

// ─── Month map ────────────────────────────────────────────────────────────────
const MONTH_MAP: Record<string, number> = {
  january:0, february:1, march:2, april:3, may:4, june:5,
  july:6, august:7, september:8, october:9, november:10, december:11,
  jan:0, feb:1, mar:2, apr:3, jun:5, jul:6, aug:7, sep:8, oct:9, nov:10, dec:11,
}

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

// ─── PDF text extraction ──────────────────────────────────────────────────────
async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const pages: string[] = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    pages.push(content.items.map((item: any) => item.str).join(' '))
  }
  return pages.join('\n')
}

// ─── Date parsing from plain text (used for PDF path) ────────────────────────
interface DateHit { year: number; month: number; day: number; raw: string; endIndex: number }

function parseDatesFromText(text: string, defaultYear: number): DateHit[] {
  const hits: DateHit[] = []
  const seen = new Set<string>()
  const tryAdd = (y: number, m: number, d: number, raw: string, end: number) => {
    const key = `${y}-${m}-${d}`
    if (!seen.has(key) && d >= 1 && d <= 31 && m >= 0 && m <= 11) {
      seen.add(key)
      hits.push({ year: y, month: m, day: d, raw, endIndex: end })
    }
  }
  const p1 = /\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)\.?\s+(\d{1,2})(?:st|nd|rd|th)?[,\s]+(\d{4})\b/gi
  for (const m of text.matchAll(p1)) {
    const mo = MONTH_MAP[m[1].toLowerCase()]
    if (mo != null) tryAdd(parseInt(m[3]), mo, parseInt(m[2]), m[0], m.index! + m[0].length)
  }
  const p2 = /\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)\.?\s+(\d{1,2})(?:st|nd|rd|th)?\b/gi
  for (const m of text.matchAll(p2)) {
    const mo = MONTH_MAP[m[1].toLowerCase()]
    if (mo != null) tryAdd(defaultYear, mo, parseInt(m[2]), m[0], m.index! + m[0].length)
  }
  const p3 = /\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})\b/g
  for (const m of text.matchAll(p3)) {
    const yr = parseInt(m[3]) < 100 ? 2000 + parseInt(m[3]) : parseInt(m[3])
    tryAdd(yr, parseInt(m[1]) - 1, parseInt(m[2]), m[0], m.index! + m[0].length)
  }
  const p4 = /\b(\d{1,2})\/(\d{1,2})\b/g
  for (const m of text.matchAll(p4)) {
    tryAdd(defaultYear, parseInt(m[1]) - 1, parseInt(m[2]), m[0], m.index! + m[0].length)
  }
  return hits.sort((a, b) => new Date(a.year, a.month, a.day).getTime() - new Date(b.year, b.month, b.day).getTime())
}

function extractTitle(fullText: string, hit: DateHit): string {
  const after = fullText.slice(hit.endIndex, hit.endIndex + 200).replace(/\n+/g, ' ').trim()
  const before = fullText.slice(Math.max(0, hit.endIndex - 80), hit.endIndex).replace(/\n+/g, ' ').trim()
  const dashMatch = after.match(/^[\s\-–—•:]+(.{3,80}?)(?:\s{2,}|\n|$)/)
  if (dashMatch) return dashMatch[1].trim()
  const beforeChunk = before.split(/\s{2,}|\n/).pop()?.trim()
  if (beforeChunk && beforeChunk.length > 3 && beforeChunk.length < 80 && /[A-Za-z]/.test(beforeChunk)) return beforeChunk
  const words = after.split(/\s+/).slice(0, 6).join(' ')
  return words.length > 3 ? words : 'School Event'
}

function detectYear(text: string): number {
  const now = new Date()
  const yearMatches = [...text.matchAll(/\b(20\d{2})\b/g)].map(m => parseInt(m[1]))
  if (!yearMatches.length) return now.getFullYear()
  const freq: Record<number, number> = {}
  yearMatches.forEach(y => { freq[y] = (freq[y] || 0) + 1 })
  return parseInt(Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0])
}

// ─── Claude vision extraction (for images + scanned PDFs) ────────────────────
async function extractEventsWithClaude(apiKey: string, base64: string, mediaType: string): Promise<ParsedEvent[]> {
  const currentYear = new Date().getFullYear()
  const prompt = `This is a school calendar image. Extract ALL events and dates you can see.

Return ONLY a JSON array with no extra text, in this exact format:
[
  { "title": "Event Name", "year": 2025, "month": 8, "day": 15, "type": "event" },
  ...
]

Rules:
- month is 0-indexed (January=0, February=1, ... December=11)
- type must be one of: "event", "meeting", "fundraiser", "deadline"
- If the year is not shown, assume ${currentYear} or ${currentYear + 1} based on context
- Include EVERY date entry you can see, even if the description is short
- For recurring entries like "No School" that span multiple days, list each day separately
- Clean up titles (remove extra spaces, fix capitalization)
- Return an empty array [] if no events are found`

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
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
          { type: 'text', text: prompt },
        ],
      }],
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `API error ${res.status}`)
  }

  const json = await res.json()
  const text = json.content?.[0]?.text ?? ''
  const match = text.match(/\[[\s\S]*\]/)
  if (!match) throw new Error('No JSON array found in response')
  const items = JSON.parse(match[0]) as Array<{ title: string; year: number; month: number; day: number; type: string }>
  return items.map((item, i) => ({
    id: `img_${i}_${Date.now()}`,
    title: item.title || 'School Event',
    date: `${item.month + 1}/${item.day}/${item.year}`,
    year: item.year,
    month: item.month,
    day: item.day,
    type: (['event','meeting','fundraiser','deadline'].includes(item.type) ? item.type : 'event') as ParsedEvent['type'],
    selected: true,
  }))
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result.split(',')[1]) // strip data:...;base64, prefix
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function PDFImport({ onImport, onClose }: Props) {
  const { workspace } = useWorkspace()
  const fileRef = useRef<HTMLInputElement>(null)
  const [phase, setPhase] = useState<'upload' | 'parsing' | 'review' | 'error' | 'no-key'>('upload')
  const [errorMsg, setErrorMsg] = useState('')
  const [parsed, setParsed] = useState<ParsedEvent[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [fileName, setFileName] = useState('')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [parseMode, setParseMode] = useState<'pdf' | 'image'>('pdf')

  const processFile = useCallback(async (file: File) => {
    const isImage = IMAGE_TYPES.includes(file.type) || /\.(jpe?g|png|webp|gif)$/i.test(file.name)
    const isPDF   = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')

    if (!isImage && !isPDF) {
      setErrorMsg('Please upload a PDF or image file (JPG, PNG, WebP).')
      setPhase('error')
      return
    }

    setFileName(file.name)
    setParseMode(isImage ? 'image' : 'pdf')
    setPhase('parsing')

    try {
      if (isImage) {
        // Image path: use Claude vision
        if (!workspace.anthropicApiKey) {
          setPhase('no-key')
          return
        }
        const mediaType = (file.type || 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif'
        const base64 = await fileToBase64(file)
        const events = await extractEventsWithClaude(workspace.anthropicApiKey, base64, mediaType)
        if (!events.length) {
          setErrorMsg('No calendar events were found in this image. Make sure the image is clear and contains dates and event names.')
          setPhase('error')
          return
        }
        setParsed(events)
        setPhase('review')
        return
      }

      // PDF path: extract text first
      const text = await extractTextFromPDF(file)
      const year  = detectYear(text)
      const hits  = parseDatesFromText(text, year)

      if (!hits.length) {
        // Scanned PDF — try Claude vision on page 1 rendered as image
        if (!workspace.anthropicApiKey) {
          setErrorMsg('No text was found in this PDF — it may be a scanned image. Add your Claude API key in settings to enable AI-powered image extraction.')
          setPhase('error')
          return
        }
        // Render first PDF page to canvas → base64 for Claude
        const arrayBuffer = await file.arrayBuffer()
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
        const page = await pdf.getPage(1)
        const viewport = page.getViewport({ scale: 2 })
        const canvas = document.createElement('canvas')
        canvas.width = viewport.width
        canvas.height = viewport.height
        const renderTask = (page.render as any)({ canvasContext: canvas.getContext('2d'), viewport })
        await renderTask.promise
        const base64 = canvas.toDataURL('image/jpeg', 0.9).split(',')[1]
        const events = await extractEventsWithClaude(workspace.anthropicApiKey, base64, 'image/jpeg')
        if (!events.length) {
          setErrorMsg('No calendar events were found. Make sure the PDF contains a visible calendar with dates.')
          setPhase('error')
          return
        }
        setParsed(events)
        setPhase('review')
        return
      }

      const events: ParsedEvent[] = hits.map((hit, i) => ({
        id: `pdf_${i}_${Date.now()}`,
        title: extractTitle(text, hit),
        date: hit.raw,
        year: hit.year, month: hit.month, day: hit.day,
        type: guessType(extractTitle(text, hit)),
        selected: true,
      }))
      setParsed(events)
      setPhase('review')
    } catch (err: any) {
      console.error(err)
      setErrorMsg(err?.message || 'Could not process this file. Please try again.')
      setPhase('error')
    }
  }, [workspace.anthropicApiKey])

  const onFilePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
    e.target.value = ''
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }

  const toggleAll = (val: boolean) => setParsed(p => p.map(e => ({ ...e, selected: val })))
  const toggleOne = (id: string) => setParsed(p => p.map(e => e.id === id ? { ...e, selected: !e.selected } : e))
  const setType  = (id: string, type: ParsedEvent['type']) => setParsed(p => p.map(e => e.id === id ? { ...e, type } : e))
  const setTitle = (id: string, title: string) => setParsed(p => p.map(e => e.id === id ? { ...e, title } : e))

  const doImport = () => {
    onImport(parsed.filter(e => e.selected))
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
  const visibleEvents = parsed.filter(e =>
    (typeFilter === 'all' || e.type === typeFilter) &&
    (!search || e.title.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-fade-in" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-800 text-lg">Import School Calendar</h2>
            {fileName && <p className="text-xs text-slate-400 mt-0.5">{fileName}</p>}
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
                <div className="flex justify-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-xl">📄</div>
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-xl">🖼️</div>
                </div>
                <p className="font-semibold text-slate-700 mb-1">Drop your school calendar here</p>
                <p className="text-sm text-slate-400 mb-4">PDF, JPG, PNG, or WebP</p>
                <span className="btn-primary text-sm pointer-events-none">Choose File</span>
              </div>
              <input ref={fileRef} type="file" accept={ACCEPTED} className="hidden" onChange={onFilePicked} />

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs font-semibold text-slate-700 mb-1">📄 PDF calendars</p>
                  <p className="text-xs text-slate-500">Text-based PDFs are parsed directly. Scanned PDFs use AI vision (requires API key).</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="text-xs font-semibold text-blue-700 mb-1">🖼️ Image calendars (JPG/PNG)</p>
                  <p className="text-xs text-blue-600">Uses your Claude API key to read the image. Set it up in AI Assistant settings.</p>
                </div>
              </div>
            </div>
          )}

          {/* PARSING */}
          {phase === 'parsing' && (
            <div className="p-12 text-center">
              <div className="w-14 h-14 gradient-vivid rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                {parseMode === 'image'
                  ? <span className="text-2xl">🔍</span>
                  : <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                }
              </div>
              <p className="font-semibold text-slate-700">
                {parseMode === 'image' ? 'Reading calendar image with AI…' : 'Extracting dates from PDF…'}
              </p>
              <p className="text-sm text-slate-400 mt-1">This may take a few seconds</p>
            </div>
          )}

          {/* NO API KEY */}
          {phase === 'no-key' && (
            <div className="p-8">
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 text-center">
                <div className="text-3xl mb-3">🔑</div>
                <p className="font-semibold text-amber-800 mb-2">Claude API key required for images</p>
                <p className="text-sm text-amber-700 mb-4">
                  Reading a JPG or PNG calendar requires your Claude API key. Add it in the <strong>AI Assistant</strong> module, then come back to try again.
                </p>
                <button onClick={onClose} className="btn-primary">Go to AI Assistant</button>
              </div>
            </div>
          )}

          {/* ERROR */}
          {phase === 'error' && (
            <div className="p-8">
              <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
                <div className="text-3xl mb-3">⚠️</div>
                <p className="font-semibold text-red-700 mb-2">Could not extract events</p>
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
                  <p className="font-semibold text-emerald-800 text-sm">Found {parsed.length} events</p>
                  <p className="text-xs text-emerald-600 mt-0.5">Edit titles, change types, uncheck any you want to skip.</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => toggleAll(true)} className="text-xs text-emerald-700 font-semibold hover:underline">All</button>
                  <span className="text-emerald-300">·</span>
                  <button onClick={() => toggleAll(false)} className="text-xs text-emerald-700 font-semibold hover:underline">None</button>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                <div className="relative flex-1 min-w-36">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                  <input className="input pl-8 text-sm py-1.5" placeholder="Filter…" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
                  {['all','event','meeting','fundraiser','deadline'].map(t => (
                    <button key={t} onClick={() => setTypeFilter(t)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${typeFilter === t ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                {visibleEvents.length === 0 && <p className="text-sm text-slate-400 text-center py-4">No events match</p>}
                {visibleEvents.map(ev => (
                  <div key={ev.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${ev.selected ? 'border-brand-200 bg-brand-50/40' : 'border-slate-100 bg-slate-50 opacity-50'}`}>
                    <input type="checkbox" checked={ev.selected} onChange={() => toggleOne(ev.id)}
                      className="w-4 h-4 rounded accent-brand-600 flex-shrink-0 cursor-pointer" />
                    <div className="w-12 flex-shrink-0 text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{MONTHS[ev.month]}</p>
                      <p className="text-lg font-black text-slate-800 leading-none">{ev.day}</p>
                      <p className="text-[10px] text-slate-400">{ev.year}</p>
                    </div>
                    <input
                      className="flex-1 min-w-0 text-sm font-semibold text-slate-800 bg-transparent border-0 border-b border-transparent hover:border-slate-200 focus:border-brand-400 focus:outline-none py-0.5 transition-colors"
                      value={ev.title}
                      onChange={e => setTitle(ev.id, e.target.value)}
                    />
                    <select value={ev.type} onChange={e => setType(ev.id, e.target.value as ParsedEvent['type'])}
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
            <p className="text-sm text-slate-500">{selectedCount} of {parsed.length} selected</p>
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
