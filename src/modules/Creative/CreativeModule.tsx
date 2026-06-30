import { useState } from 'react'

const TEMPLATES = [
  {
    id: 'flyer-event',
    label: 'Event Flyer',
    category: 'flyer',
    icon: '📅',
    preview: { bg: 'from-brand-600 to-purple-700', accent: '#f59e0b' },
  },
  {
    id: 'flyer-fundraiser',
    label: 'Fundraiser Flyer',
    category: 'flyer',
    icon: '💰',
    preview: { bg: 'from-emerald-600 to-teal-700', accent: '#fbbf24' },
  },
  {
    id: 'flyer-meeting',
    label: 'Meeting Notice',
    category: 'flyer',
    icon: '📋',
    preview: { bg: 'from-slate-700 to-slate-900', accent: '#6366f1' },
  },
  {
    id: 'social-square',
    label: 'Social Square (1:1)',
    category: 'social',
    icon: '📸',
    preview: { bg: 'from-rose-500 to-pink-600', accent: '#fbbf24' },
  },
  {
    id: 'social-story',
    label: 'Story (9:16)',
    category: 'social',
    icon: '📱',
    preview: { bg: 'from-amber-500 to-orange-600', accent: '#fff' },
  },
  {
    id: 'social-banner',
    label: 'Facebook Cover',
    category: 'social',
    icon: '🖥️',
    preview: { bg: 'from-blue-600 to-indigo-700', accent: '#fbbf24' },
  },
  {
    id: 'brochure-trifold',
    label: 'Tri-Fold Brochure',
    category: 'brochure',
    icon: '📰',
    preview: { bg: 'from-teal-600 to-cyan-700', accent: '#fbbf24' },
  },
  {
    id: 'brochure-membership',
    label: 'Membership Drive',
    category: 'brochure',
    icon: '🎫',
    preview: { bg: 'from-purple-600 to-indigo-700', accent: '#fbbf24' },
  },
]

const CATEGORY_TABS = [
  { id: 'all', label: 'All Templates' },
  { id: 'flyer', label: '🗓️ Flyers' },
  { id: 'social', label: '📱 Social Media' },
  { id: 'brochure', label: '📰 Brochures' },
]

interface DesignState {
  title: string
  subtitle: string
  body: string
  date: string
  location: string
  contact: string
  templateId: string
  schoolName: string
  emoji: string
}

export default function CreativeModule() {
  const [catFilter, setCatFilter] = useState('all')
  const [selected, setSelected] = useState<string | null>(null)
  const [design, setDesign] = useState<DesignState>({
    title: 'Fall Carnival 2025!',
    subtitle: 'Fun for the Whole Family',
    body: 'Join us for games, food, prizes, and community! All proceeds support Lincoln Elementary PTA programs.',
    date: 'Saturday, October 18 · 11am–3pm',
    location: 'Lincoln Elementary School Grounds',
    contact: 'events@lincoln-pta.org',
    templateId: 'flyer-event',
    schoolName: 'Lincoln Elementary PTA',
    emoji: '🎪',
  })

  const filtered = TEMPLATES.filter(t => catFilter === 'all' || t.category === catFilter)
  const activeTemplate = TEMPLATES.find(t => t.id === (selected || design.templateId))

  const isStory = selected === 'social-story'
  const isBanner = selected === 'social-banner'

  const previewClass = isStory
    ? 'w-48 h-80'
    : isBanner
    ? 'w-full h-32'
    : 'w-64 h-80'

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Flyers & Graphics Studio</h1>
          <p className="text-slate-500 text-sm mt-1">Create high-quality flyers, brochures, and social media graphics</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Download PNG
          </button>
          <button className="btn-gold">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
            Share
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Template picker + editor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Templates */}
          <div className="card p-5">
            <h3 className="font-semibold text-slate-800 mb-3">Choose a Template</h3>
            <div className="flex gap-1 mb-4 bg-slate-100 rounded-xl p-1 w-fit">
              {CATEGORY_TABS.map(t => (
                <button key={t.id} onClick={() => setCatFilter(t.id)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${catFilter === t.id ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'}`}>
                  {t.label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-3">
              {filtered.map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelected(t.id)}
                  className={`rounded-xl overflow-hidden border-2 transition-all ${selected === t.id || (!selected && t.id === design.templateId) ? 'border-brand-500 shadow-md' : 'border-transparent hover:border-slate-200'}`}
                >
                  <div className={`h-20 bg-gradient-to-br ${t.preview.bg} flex flex-col items-center justify-center`}>
                    <span className="text-2xl">{t.icon}</span>
                  </div>
                  <div className="bg-white p-2">
                    <p className="text-xs font-medium text-slate-700 text-center">{t.label}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Editor */}
          <div className="card p-5">
            <h3 className="font-semibold text-slate-800 mb-4">✏️ Customize Content</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">School / Organization Name</label>
                <input className="input" value={design.schoolName} onChange={e => setDesign(p => ({ ...p, schoolName: e.target.value }))} />
              </div>
              <div>
                <label className="label">Headline Emoji</label>
                <input className="input" value={design.emoji} onChange={e => setDesign(p => ({ ...p, emoji: e.target.value }))} />
              </div>
              <div className="col-span-2">
                <label className="label">Title / Headline</label>
                <input className="input text-lg font-bold" value={design.title} onChange={e => setDesign(p => ({ ...p, title: e.target.value }))} />
              </div>
              <div className="col-span-2">
                <label className="label">Subtitle / Tagline</label>
                <input className="input" value={design.subtitle} onChange={e => setDesign(p => ({ ...p, subtitle: e.target.value }))} />
              </div>
              <div className="col-span-2">
                <label className="label">Body Text</label>
                <textarea className="input" rows={3} value={design.body} onChange={e => setDesign(p => ({ ...p, body: e.target.value }))} />
              </div>
              <div>
                <label className="label">Date & Time</label>
                <input className="input" value={design.date} onChange={e => setDesign(p => ({ ...p, date: e.target.value }))} />
              </div>
              <div>
                <label className="label">Location</label>
                <input className="input" value={design.location} onChange={e => setDesign(p => ({ ...p, location: e.target.value }))} />
              </div>
              <div className="col-span-2">
                <label className="label">Contact / Website</label>
                <input className="input" value={design.contact} onChange={e => setDesign(p => ({ ...p, contact: e.target.value }))} />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Live Preview */}
        <div className="sticky top-6">
          <div className="card p-5">
            <h3 className="font-semibold text-slate-800 mb-4">Live Preview</h3>
            <div className="flex justify-center">
              <div
                className={`${previewClass} rounded-xl overflow-hidden shadow-xl bg-gradient-to-br ${activeTemplate?.preview.bg || 'from-brand-600 to-purple-700'} relative flex flex-col`}
              >
                {/* Header stripe */}
                <div className="px-4 pt-5 pb-3 text-center">
                  <p className="text-white text-opacity-80 text-xs font-semibold uppercase tracking-widest">{design.schoolName}</p>
                  <p className="text-4xl mt-2">{design.emoji}</p>
                  <h2 className="text-white font-black text-lg leading-tight mt-2">{design.title}</h2>
                  <p className="text-white text-opacity-90 text-xs mt-1 font-medium">{design.subtitle}</p>
                </div>

                {/* Divider */}
                <div className="mx-4 h-px bg-white bg-opacity-20" />

                {/* Body */}
                <div className="flex-1 px-4 py-3">
                  <p className="text-white text-opacity-90 text-xs leading-relaxed">{design.body}</p>
                </div>

                {/* Details card */}
                <div className="mx-3 mb-3 bg-white bg-opacity-15 backdrop-blur-sm rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs">📅</span>
                    <p className="text-white text-xs font-semibold">{design.date}</p>
                  </div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs">📍</span>
                    <p className="text-white text-xs">{design.location}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs">✉️</span>
                    <p className="text-white text-xs">{design.contact}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <button className="btn-primary w-full justify-center text-sm">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Download PNG
              </button>
              <button className="btn-secondary w-full justify-center text-sm">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                Print PDF
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-500 mb-2">💡 Design Tips</p>
              <ul className="space-y-1">
                {['Use high contrast for readability', 'Keep text under 30 words for social posts', 'Always include contact info', 'Use school colors for brand consistency'].map((tip, i) => (
                  <li key={i} className="text-xs text-slate-400 flex items-start gap-1.5">
                    <span className="text-brand-400 flex-shrink-0">•</span>{tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
