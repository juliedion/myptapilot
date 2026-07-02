import { useState, useRef } from 'react'
import { useWorkspace, Officer } from '../contexts/WorkspaceContext'

interface Props {
  onComplete: () => void
}

const PRIMARY_PRESETS = [
  '#7c3aed', '#2563eb', '#0d9488', '#059669',
  '#ea580c', '#dc2626', '#db2777', '#475569',
]
const ACCENT_PRESETS = [
  '#ec4899', '#f59e0b', '#06b6d4', '#65a30d',
  '#f43f5e', '#9333ea', '#6366f1', '#f97316',
]

const ORG_TYPES = ['PTA', 'PTO', 'Booster Club', 'Parent Council', 'Other']

const DEFAULT_OFFICERS = [
  { id: '1', role: 'President', name: '', email: '' },
  { id: '2', role: 'Vice President', name: '', email: '' },
  { id: '3', role: 'Secretary', name: '', email: '' },
  { id: '4', role: 'Treasurer', name: '', email: '' },
]

function CheckIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  )
}

export default function OnboardingWizard({ onComplete }: Props) {
  const { updateWorkspace } = useWorkspace()
  const [step, setStep] = useState(1)

  // Step 1
  const [orgName, setOrgName] = useState('Lincoln Elementary PTO')
  const [orgType, setOrgType] = useState('PTO')

  // Step 2
  const [primaryColor, setPrimaryColor] = useState('#7c3aed')
  const [accentColor, setAccentColor] = useState('#ec4899')

  // Step 3
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Step 4
  const [officers, setOfficers] = useState<Officer[]>(DEFAULT_OFFICERS.map(o => ({ ...o })))

  const handleLogoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setLogoDataUrl(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const addOfficer = () => {
    setOfficers(prev => [...prev, { id: Date.now().toString(), role: '', name: '', email: '' }])
  }

  const updateOfficer = (id: string, field: keyof Officer, value: string) => {
    setOfficers(prev => prev.map(o => o.id === id ? { ...o, [field]: value } : o))
  }

  const removeOfficer = (id: string) => {
    setOfficers(prev => prev.filter(o => o.id !== id))
  }

  const handleFinish = () => {
    updateWorkspace({
      orgName,
      orgType,
      primaryColor,
      accentColor,
      logoDataUrl,
      officers: officers.filter(o => o.name || o.email),
      isOnboarded: true,
    })
    setStep(5)
  }

  const progressPct = ((step - 1) / 4) * 100

  if (step === 5) {
    return (
      <div className="min-h-screen gradient-vivid flex flex-col items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/10 rounded-full" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/10 rounded-full" />
        <div className="relative text-center max-w-md">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">You're all set! 🚀</h1>
          <p className="text-white/70 text-lg mb-8">Your workspace is ready. Let's start building your best school year yet.</p>
          <div className="flex flex-wrap gap-3 justify-center mb-8">
            {['📅 Calendar ready', '💬 Chat enabled', '💰 Fundraiser tracker'].map(pill => (
              <span key={pill} className="bg-white/20 text-white text-sm font-medium px-4 py-2 rounded-full backdrop-blur-sm">
                {pill}
              </span>
            ))}
          </div>
          <button
            onClick={onComplete}
            className="bg-white text-violet-700 font-bold text-base px-8 py-3.5 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            Go to Dashboard →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-slate-400 mb-2">
            <span>Step {step} of 4</span>
            <span>{Math.round(progressPct)}% complete</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full gradient-vivid rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            {['Org Info', 'Colors', 'Logo', 'Team'].map((label, i) => (
              <div key={label} className="flex flex-col items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mb-1 transition-all ${
                  i + 1 < step ? 'bg-green-500 text-white' : i + 1 === step ? 'gradient-vivid text-white' : 'bg-slate-200 text-slate-400'
                }`}>
                  {i + 1 < step ? <CheckIcon size={12} /> : i + 1}
                </div>
                <span className={`text-[10px] font-medium ${i + 1 === step ? 'text-violet-600' : 'text-slate-400'}`}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 animate-fade-in">

          {/* Step 1 */}
          {step === 1 && (
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">Welcome to My PTA Pilot 🎉</h1>
              <p className="text-slate-500 mb-8">Let's set up your workspace in just a few steps.</p>
              <div className="space-y-5">
                <div>
                  <label className="label">Organization Name</label>
                  <input
                    className="input"
                    value={orgName}
                    onChange={e => setOrgName(e.target.value)}
                    placeholder="Lincoln Elementary PTO"
                  />
                </div>
                <div>
                  <label className="label">Organization Type</label>
                  <select
                    className="input"
                    value={orgType}
                    onChange={e => setOrgType(e.target.value)}
                  >
                    {ORG_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <button
                onClick={() => setStep(2)}
                disabled={!orgName.trim()}
                className="btn-primary w-full mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Get Started →
              </button>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div>
              <h1 className="text-2xl font-bold text-slate-800 mb-1">Make it yours</h1>
              <p className="text-slate-500 mb-6">Pick colors that match your school's brand</p>

              <div className="space-y-6">
                <div>
                  <label className="label mb-3">Primary Color</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {PRIMARY_PRESETS.map(c => (
                      <button
                        key={c}
                        onClick={() => setPrimaryColor(c)}
                        className="w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all hover:scale-110"
                        style={{ backgroundColor: c, borderColor: primaryColor === c ? '#1e293b' : 'transparent' }}
                      >
                        {primaryColor === c && <CheckIcon size={14} />}
                      </button>
                    ))}
                    <label className="w-10 h-10 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:border-slate-400 overflow-hidden" title="Custom color">
                      <input type="color" className="opacity-0 w-0 h-0 absolute" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} />
                      <span className="text-slate-400 text-lg">+</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="label mb-3">Accent Color</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {ACCENT_PRESETS.map(c => (
                      <button
                        key={c}
                        onClick={() => setAccentColor(c)}
                        className="w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all hover:scale-110"
                        style={{ backgroundColor: c, borderColor: accentColor === c ? '#1e293b' : 'transparent' }}
                      >
                        {accentColor === c && <CheckIcon size={14} />}
                      </button>
                    ))}
                    <label className="w-10 h-10 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:border-slate-400 overflow-hidden" title="Custom color">
                      <input type="color" className="opacity-0 w-0 h-0 absolute" value={accentColor} onChange={e => setAccentColor(e.target.value)} />
                      <span className="text-slate-400 text-lg">+</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="label mb-2">Preview</label>
                  <div
                    className="h-12 rounded-xl shadow-sm"
                    style={{ background: `linear-gradient(to right, ${primaryColor}, ${accentColor})` }}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button onClick={() => setStep(1)} className="btn-secondary flex-1">← Back</button>
                <button onClick={() => setStep(3)} className="btn-primary flex-1">Continue →</button>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div>
              <h1 className="text-2xl font-bold text-slate-800 mb-1">Add your logo</h1>
              <p className="text-slate-500 mb-6">Optional — you can always add this later</p>

              <div
                className="border-2 border-dashed border-slate-300 rounded-2xl h-48 flex flex-col items-center justify-center cursor-pointer hover:border-violet-400 hover:bg-violet-50/50 transition-all relative overflow-hidden"
                onClick={() => fileInputRef.current?.click()}
              >
                {logoDataUrl ? (
                  <img src={logoDataUrl} alt="Logo preview" className="max-h-40 max-w-full object-contain" />
                ) : (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-slate-500 text-sm font-medium">Click to upload your logo</p>
                    <p className="text-slate-400 text-xs mt-1">PNG, JPG, SVG up to 5MB</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoFile}
                />
              </div>

              {logoDataUrl && (
                <button
                  onClick={() => setLogoDataUrl(null)}
                  className="text-sm text-red-400 hover:text-red-600 mt-2 block mx-auto"
                >
                  Remove logo
                </button>
              )}

              <div className="flex gap-3 mt-8">
                <button onClick={() => setStep(2)} className="btn-secondary flex-1">← Back</button>
                <button onClick={() => setStep(4)} className="btn-primary flex-1">Continue →</button>
              </div>
            </div>
          )}

          {/* Step 4 */}
          {step === 4 && (
            <div>
              <h1 className="text-2xl font-bold text-slate-800 mb-1">Set up your team</h1>
              <p className="text-slate-500 mb-6">Add your board members and officers</p>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {officers.map((officer, idx) => (
                  <div key={officer.id} className="bg-slate-50 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-2">
                      {idx >= 4 ? (
                        <input
                          className="input text-xs py-1.5 flex-1"
                          placeholder="Role (e.g. Volunteer Coordinator)"
                          value={officer.role}
                          onChange={e => updateOfficer(officer.id, 'role', e.target.value)}
                        />
                      ) : (
                        <span className="text-xs font-semibold text-slate-600 bg-white px-2 py-1 rounded-lg border border-slate-200 flex-1">{officer.role}</span>
                      )}
                      {idx >= 4 && (
                        <button onClick={() => removeOfficer(officer.id)} className="text-slate-400 hover:text-red-500 transition-colors w-6 h-6 flex items-center justify-center">×</button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        className="input text-xs py-1.5"
                        placeholder="Full name"
                        value={officer.name}
                        onChange={e => updateOfficer(officer.id, 'name', e.target.value)}
                      />
                      <input
                        className="input text-xs py-1.5"
                        placeholder="Email address"
                        type="email"
                        value={officer.email}
                        onChange={e => updateOfficer(officer.id, 'email', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={addOfficer}
                className="mt-3 w-full py-2 border-2 border-dashed border-slate-300 rounded-xl text-sm text-slate-500 hover:border-violet-400 hover:text-violet-600 transition-all"
              >
                + Add Officer
              </button>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(3)} className="btn-secondary flex-1">← Back</button>
                <button onClick={handleFinish} className="btn-primary flex-1">Finish Setup →</button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
