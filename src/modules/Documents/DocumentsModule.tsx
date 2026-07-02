import { useState } from 'react'
import ModuleHeader from '../../components/ModuleHeader'

interface Doc {
  id: string
  name: string
  category: string
  uploadedBy: string
  uploadedAt: string
  size: string
  icon: string
}

const CATEGORIES = [
  { id: 'all', label: 'All Documents' },
  { id: 'bylaws', label: 'Bylaws & Governance' },
  { id: 'legal', label: 'Legal & Tax' },
  { id: 'minutes', label: 'Meeting Minutes' },
  { id: 'financial', label: 'Financial Reports' },
  { id: 'forms', label: 'Forms & Templates' },
  { id: 'other', label: 'Other' },
]

const SEED_DOCS: Doc[] = []

const DOC_PROMPTS = [
  { category: 'bylaws',    icon: '📜', label: 'Bylaws & Governance',  hint: 'Upload your PTA/PTO bylaws and standing rules' },
  { category: 'legal',     icon: '🏛️', label: 'Legal & Tax Docs',     hint: 'IRS determination letter, EIN, Form 990-N' },
  { category: 'minutes',   icon: '📝', label: 'Meeting Minutes',       hint: 'Upload minutes after each board or general meeting' },
  { category: 'financial', icon: '📊', label: 'Financial Reports',     hint: 'Annual budget, quarterly reports' },
  { category: 'forms',     icon: '📄', label: 'Forms & Templates',     hint: 'Volunteer forms, membership forms, permission slips' },
]

export default function DocumentsModule() {
  const [category, setCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [docs, setDocs] = useState(SEED_DOCS)
  const [showUpload, setShowUpload] = useState(false)
  const [newDoc, setNewDoc] = useState({ name: '', category: 'other' })

  const filtered = docs.filter(d => {
    const matchCat = category === 'all' || d.category === category
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const uploadDoc = () => {
    if (!newDoc.name) return
    const doc: Doc = {
      id: Date.now().toString(),
      name: newDoc.name,
      category: newDoc.category,
      uploadedBy: 'You',
      uploadedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      size: '— KB',
      icon: '📄',
    }
    setDocs(prev => [...prev, doc])
    setNewDoc({ name: '', category: 'other' })
    setShowUpload(false)
  }

  const categoryCount = (cat: string) => cat === 'all' ? docs.length : docs.filter(d => d.category === cat).length

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      <ModuleHeader title="Documents & Bylaws" subtitle="Store, organize, and access all important PTO documents" gradient="gradient-sky" icon="📋" />
      <div className="flex items-center justify-between mb-6">
        <div>
        </div>
        <button onClick={() => setShowUpload(true)} className="btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
          Upload Document
        </button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-52 flex-shrink-0">
          <div className="card p-3">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`w-full text-left flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-1 ${
                  category === cat.id ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="truncate">{cat.label}</span>
                <span className={`text-xs rounded-full px-2 py-0.5 flex-shrink-0 ml-2 ${category === cat.id ? 'bg-brand-100 text-brand-600' : 'bg-slate-100 text-slate-500'}`}>
                  {categoryCount(cat.id)}
                </span>
              </button>
            ))}
          </div>

          <div className="card p-4 mt-4">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Quick Guide</h4>
            <div className="space-y-2">
              {[
                { emoji: '📜', text: 'Keep bylaws updated after any amendments' },
                { emoji: '🏛️', text: 'Store 501(c)(3) letter permanently' },
                { emoji: '📋', text: 'File IRS 990-N annually by May 15' },
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-sm">{tip.emoji}</span>
                  <p className="text-xs text-slate-500 leading-snug">{tip.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Documents */}
        <div className="flex-1">
          <div className="mb-4">
            <div className="relative">
              <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input className="input pl-9" placeholder="Search documents…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="grid grid-cols-12 text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3 border-b border-slate-100 bg-slate-50">
              <div className="col-span-6">Name</div>
              <div className="col-span-2">Category</div>
              <div className="col-span-2">Uploaded By</div>
              <div className="col-span-1">Date</div>
              <div className="col-span-1 text-right">Size</div>
            </div>
            {filtered.length === 0 && docs.length === 0 ? (
              <div className="p-8">
                <p className="text-center text-slate-500 font-semibold mb-6">Get your document vault started — here's what to upload first:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {DOC_PROMPTS.map(p => (
                    <button key={p.category} onClick={() => { setNewDoc({ name: '', category: p.category }); setShowUpload(true) }}
                      className="flex items-start gap-3 p-4 rounded-xl border-2 border-dashed border-slate-200 hover:border-brand-400 hover:bg-brand-50 transition-all text-left group">
                      <span className="text-2xl flex-shrink-0">{p.icon}</span>
                      <div>
                        <p className="font-semibold text-slate-700 group-hover:text-brand-700 text-sm">{p.label}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{p.hint}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <p className="text-4xl mb-3">📂</p>
                <p className="text-sm">No documents found</p>
              </div>
            ) : (
              filtered.map(doc => (
                <div key={doc.id} className="grid grid-cols-12 items-center px-4 py-3.5 border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                  <div className="col-span-6 flex items-center gap-3">
                    <span className="text-xl">{doc.icon}</span>
                    <span className="text-sm font-medium text-slate-700 group-hover:text-brand-700 truncate">{doc.name}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="badge bg-slate-100 text-slate-600 text-xs">{doc.category}</span>
                  </div>
                  <div className="col-span-2 text-sm text-slate-500 truncate">{doc.uploadedBy}</div>
                  <div className="col-span-1 text-xs text-slate-400">{doc.uploadedAt}</div>
                  <div className="col-span-1 text-xs text-slate-400 text-right">{doc.size}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showUpload && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in">
            <h3 className="font-bold text-slate-800 text-lg mb-4">Upload Document</h3>
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center mb-4 cursor-pointer hover:border-brand-400 transition-colors">
              <div className="text-4xl mb-2">📎</div>
              <p className="text-sm text-slate-500">Click to browse or drag & drop a file</p>
              <p className="text-xs text-slate-400 mt-1">PDF, DOCX, XLSX, PNG up to 25MB</p>
            </div>
            <div className="space-y-3">
              <div>
                <label className="label">Document Name</label>
                <input className="input" placeholder="e.g. Meeting Minutes — July 2025.pdf" value={newDoc.name} onChange={e => setNewDoc(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <label className="label">Category</label>
                <select className="input" value={newDoc.category} onChange={e => setNewDoc(p => ({ ...p, category: e.target.value }))}>
                  {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowUpload(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button onClick={uploadDoc} className="btn-primary flex-1 justify-center">Upload</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
