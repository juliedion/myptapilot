import { useState } from 'react'

const TEMPLATES = [
  {
    id: 'modern-bright',
    name: 'Modern Bright',
    description: 'Clean white design with bold color accents. Perfect for active, energetic PTAs.',
    palette: ['#6366f1', '#f59e0b', '#ffffff'],
    preview: 'modern',
  },
  {
    id: 'classic-navy',
    name: 'Classic Navy',
    description: 'Trusted navy and gold color scheme. Professional and traditional.',
    palette: ['#1e3a8a', '#f59e0b', '#ffffff'],
    preview: 'classic',
  },
  {
    id: 'spring-green',
    name: 'Fresh & Green',
    description: 'Nature-inspired green tones. Great for eco-conscious or garden-focused schools.',
    palette: ['#059669', '#fbbf24', '#f0fdf4'],
    preview: 'green',
  },
  {
    id: 'warm-coral',
    name: 'Warm & Welcoming',
    description: 'Warm coral and peach tones. Friendly, inviting, community-focused feel.',
    palette: ['#e11d48', '#f97316', '#fff7ed'],
    preview: 'coral',
  },
]

const SECTIONS = [
  { id: 'hero', label: 'Hero / Banner', icon: '🖼️', desc: 'Welcome message, school name, and call-to-action button' },
  { id: 'about', label: 'About Us', icon: '📌', desc: 'Mission, vision, and history of your PTA/PTO' },
  { id: 'events', label: 'Events Calendar', icon: '📅', desc: 'Upcoming events pulled from your calendar' },
  { id: 'fundraisers', label: 'Fundraisers', icon: '💰', desc: 'Active campaigns with progress bars' },
  { id: 'news', label: 'News & Updates', icon: '📰', desc: 'Latest PTA news and announcements' },
  { id: 'board', label: 'Meet the Board', icon: '👥', desc: 'Officer photos, names, and roles' },
  { id: 'volunteer', label: 'Volunteer Sign-Up', icon: '🙌', desc: 'Embedded form for volunteer registration' },
  { id: 'contact', label: 'Contact Us', icon: '📧', desc: 'Contact form and social media links' },
  { id: 'membership', label: 'Join PTA', icon: '🎫', desc: 'Membership signup with online payment' },
  { id: 'gallery', label: 'Photo Gallery', icon: '🖼️', desc: 'Recent event photos and school memories' },
]

const WebsitePreview = ({ templateId, sections, schoolName, tagline }: {
  templateId: string
  sections: string[]
  schoolName: string
  tagline: string
}) => {
  const template = TEMPLATES.find(t => t.id === templateId) || TEMPLATES[0]
  const [primary, accent] = template.palette

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-lg text-left" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Browser chrome */}
      <div className="bg-slate-100 px-3 py-2 flex items-center gap-2 border-b border-slate-200">
        <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-400" /><div className="w-3 h-3 rounded-full bg-yellow-400" /><div className="w-3 h-3 rounded-full bg-green-400" /></div>
        <div className="flex-1 bg-white rounded-lg px-3 py-1 text-xs text-slate-400 ml-2">www.lincoln-pta.org</div>
      </div>

      {/* Nav */}
      <div className="flex items-center justify-between px-4 py-2 border-b" style={{ backgroundColor: primary }}>
        <span className="text-white font-bold text-xs">{schoolName}</span>
        <div className="flex gap-3">
          {['Events', 'About', 'Join'].map(item => (
            <span key={item} className="text-white text-opacity-90 text-xs cursor-pointer">{item}</span>
          ))}
        </div>
      </div>

      {/* Hero */}
      {sections.includes('hero') && (
        <div className="px-6 py-8 text-center" style={{ background: `linear-gradient(135deg, ${primary} 0%, ${accent} 100%)` }}>
          <h1 className="text-white font-black text-lg leading-tight">{schoolName}</h1>
          <p className="text-white text-opacity-90 text-xs mt-1">{tagline}</p>
          <div className="mt-3 flex gap-2 justify-center">
            <button className="bg-white text-xs font-semibold px-3 py-1.5 rounded-full" style={{ color: primary }}>Join PTA</button>
            <button className="border border-white text-white text-xs font-semibold px-3 py-1.5 rounded-full">See Events</button>
          </div>
        </div>
      )}

      {/* Content blocks */}
      <div className="bg-white px-4 py-3 space-y-3">
        {sections.includes('events') && (
          <div>
            <p className="text-xs font-bold text-slate-800 mb-1.5" style={{ color: primary }}>📅 Upcoming Events</p>
            <div className="space-y-1">
              {['Back-to-School Night · Aug 5', 'Walk-A-Thon · Sep 3', 'Fall Carnival · Oct 18'].map(ev => (
                <div key={ev} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: accent }} />
                  <span className="text-xs text-slate-600">{ev}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {sections.includes('fundraisers') && (
          <div>
            <p className="text-xs font-bold mb-1.5" style={{ color: primary }}>💰 Walk-A-Thon 2025</p>
            <div className="bg-slate-100 rounded-full h-2 mb-0.5">
              <div className="h-2 rounded-full" style={{ width: '83%', backgroundColor: accent }} />
            </div>
            <p className="text-xs text-slate-500">$12,400 raised of $15,000 goal · 83%</p>
          </div>
        )}

        {sections.includes('news') && (
          <div>
            <p className="text-xs font-bold mb-1.5" style={{ color: primary }}>📰 Latest News</p>
            <p className="text-xs text-slate-600 leading-relaxed">Walk-A-Thon results are in! We raised an incredible $12,400 — the most ever in school history. Thank you to all families who participated!</p>
          </div>
        )}

        {sections.includes('board') && (
          <div>
            <p className="text-xs font-bold mb-2" style={{ color: primary }}>👥 Meet the Board</p>
            <div className="flex gap-2">
              {[['S', 'Sarah M.', 'President'], ['T', 'Tom R.', 'VP'], ['J', 'Jessica P.', 'Secretary']].map(([init, name, role]) => (
                <div key={init} className="text-center">
                  <div className="w-8 h-8 rounded-full mx-auto flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: primary }}>{init}</div>
                  <p className="text-xs font-medium text-slate-700 mt-1">{name}</p>
                  <p className="text-xs text-slate-400">{role}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {sections.includes('contact') && (
          <div className="text-center pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-500">📧 president@lincoln-pta.org · 📘 Facebook · 📸 Instagram</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function WebsiteModule() {
  const [selectedTemplate, setSelectedTemplate] = useState('modern-bright')
  const [sections, setSections] = useState(['hero', 'events', 'fundraisers', 'news', 'board', 'contact'])
  const [schoolName, setSchoolName] = useState('Lincoln Elementary PTA')
  const [tagline, setTagline] = useState('Building Community, Empowering Students')

  const toggleSection = (id: string) => {
    setSections(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])
  }

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Website Templates</h1>
          <p className="text-slate-500 text-sm mt-1">Design and customize your public-facing PTA website</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary">Copy HTML</button>
          <button className="btn-primary">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
            Publish Site
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Config */}
        <div className="space-y-5">
          {/* Template */}
          <div className="card p-5">
            <h3 className="font-semibold text-slate-800 mb-3">Color Theme</h3>
            <div className="grid grid-cols-2 gap-3">
              {TEMPLATES.map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTemplate(t.id)}
                  className={`p-3 rounded-xl border-2 transition-all text-left ${selectedTemplate === t.id ? 'border-brand-500 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}
                >
                  <div className="flex gap-1.5 mb-2">
                    {t.palette.map((c, i) => (
                      <div key={i} className="w-5 h-5 rounded-full border border-slate-200" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <p className="text-xs font-semibold text-slate-700">{t.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5 leading-tight">{t.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* School info */}
          <div className="card p-5">
            <h3 className="font-semibold text-slate-800 mb-3">School Info</h3>
            <div className="space-y-3">
              <div>
                <label className="label">School / PTA Name</label>
                <input className="input" value={schoolName} onChange={e => setSchoolName(e.target.value)} />
              </div>
              <div>
                <label className="label">Tagline</label>
                <input className="input" value={tagline} onChange={e => setTagline(e.target.value)} placeholder="Building Community…" />
              </div>
            </div>
          </div>

          {/* Sections */}
          <div className="card p-5">
            <h3 className="font-semibold text-slate-800 mb-3">Page Sections</h3>
            <div className="space-y-2">
              {SECTIONS.map(s => (
                <label key={s.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sections.includes(s.id)}
                    onChange={() => toggleSection(s.id)}
                    className="mt-0.5 rounded"
                  />
                  <div>
                    <span className="text-sm font-medium text-slate-700">{s.icon} {s.label}</span>
                    <p className="text-xs text-slate-400">{s.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="lg:col-span-2">
          <div className="sticky top-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-800">Live Preview</h3>
              <span className="badge bg-green-100 text-green-700 text-xs">Auto-updating</span>
            </div>
            <WebsitePreview
              templateId={selectedTemplate}
              sections={sections}
              schoolName={schoolName}
              tagline={tagline}
            />

            {/* Platform export */}
            <div className="mt-6 card p-5">
              <h3 className="font-semibold text-slate-800 mb-3">📤 Export / Publish To</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: 'Google Sites', icon: '🌐', desc: 'Free, easy hosting by Google' },
                  { name: 'Wix', icon: '✨', desc: 'Drag-and-drop website builder' },
                  { name: 'Squarespace', icon: '⬛', desc: 'Premium design platform' },
                  { name: 'WordPress', icon: '📝', desc: 'Most flexible CMS platform' },
                  { name: 'Weebly', icon: '🔷', desc: 'Simple school-friendly builder' },
                  { name: 'Download HTML', icon: '💾', desc: 'Raw code for any host' },
                ].map(p => (
                  <button key={p.name} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-brand-300 hover:bg-brand-50 transition-all text-left group">
                    <span className="text-xl">{p.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 group-hover:text-brand-700">{p.name}</p>
                      <p className="text-xs text-slate-400">{p.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="mt-4 card p-5">
              <h3 className="font-semibold text-slate-800 mb-3">🏆 Best Practices</h3>
              <ul className="space-y-2">
                {[
                  'Update your site at least monthly with new events and news',
                  'Include a "Join PTA" button prominently — make membership easy',
                  'Keep contact info visible on every page',
                  'Add social media links so parents can follow updates',
                  'Use real photos of your school and events when possible',
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="text-brand-400 flex-shrink-0 mt-0.5">✓</span>
                    {tip}
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
