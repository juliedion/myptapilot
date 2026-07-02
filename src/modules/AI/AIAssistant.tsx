import { useState, useRef, useEffect } from 'react'
import { useWorkspace } from '../../contexts/WorkspaceContext'
import { useAuth } from '../../contexts/AuthContext'
import ModuleHeader from '../../components/ModuleHeader'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  loading?: boolean
}

const QUICK_PROMPTS = [
  { label: 'Draft a meeting agenda', icon: '📋', prompt: 'Draft a detailed meeting agenda for our next PTA general meeting. Include typical agenda items for a school PTA/PTO.' },
  { label: 'Write a parent email', icon: '✉️', prompt: 'Write a friendly, engaging email to send to all parents announcing our upcoming PTA meeting. Include reminders about what to expect and how to get involved.' },
  { label: 'Fundraiser ideas', icon: '💰', prompt: 'Suggest 5 creative fundraiser ideas that would work well for an elementary school PTA/PTO. Include estimated revenue potential and effort level for each.' },
  { label: 'Plan a school event', icon: '🎉', prompt: 'Help me plan a fun school event from start to finish. What are the key steps, volunteer roles, and timeline I should follow?' },
  { label: 'Volunteer recruitment', icon: '🙋', prompt: 'Write a compelling call-to-action for recruiting parent volunteers. We need help with events, fundraisers, and classroom support.' },
  { label: 'Welcome new families', icon: '👋', prompt: 'Draft a warm welcome message for families who are new to our school this year. Include what our PTA does and how they can get involved.' },
  { label: 'Budget talking points', icon: '📊', prompt: 'Help me prepare talking points for presenting our annual budget to PTA members at a general meeting. What should I highlight and how should I frame it?' },
  { label: 'Social media post', icon: '📱', prompt: 'Write 3 social media posts (Facebook/Instagram style) to promote excitement about our upcoming school events and PTA membership.' },
]

async function callClaude(apiKey: string, messages: { role: string; content: string }[], systemPrompt: string): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: { message?: string } }).error?.message || `API error ${res.status}`)
  }

  const data = await res.json() as { content: { type: string; text: string }[] }
  return data.content?.[0]?.text ?? ''
}

function MarkdownText({ text }: { text: string }) {
  // Simple markdown: bold, bullet lists, numbered lists, headings
  const lines = text.split('\n')
  const elements: React.ReactNode[] = []
  let listItems: string[] = []
  let numberedItems: string[] = []

  const flushList = () => {
    if (listItems.length) {
      elements.push(<ul key={elements.length} className="list-disc list-inside space-y-1 my-2 text-sm">{listItems.map((li, i) => <li key={i} className="text-slate-700 leading-relaxed">{renderInline(li)}</li>)}</ul>)
      listItems = []
    }
    if (numberedItems.length) {
      elements.push(<ol key={elements.length} className="list-decimal list-inside space-y-1 my-2 text-sm">{numberedItems.map((li, i) => <li key={i} className="text-slate-700 leading-relaxed">{renderInline(li)}</li>)}</ol>)
      numberedItems = []
    }
  }

  const renderInline = (s: string) => {
    const parts = s.split(/(\*\*[^*]+\*\*)/g)
    return parts.map((p, i) => p.startsWith('**') && p.endsWith('**')
      ? <strong key={i} className="font-semibold text-slate-900">{p.slice(2, -2)}</strong>
      : p
    )
  }

  lines.forEach((line, i) => {
    const bullet = line.match(/^[-*•]\s+(.+)/)
    const numbered = line.match(/^\d+\.\s+(.+)/)
    const heading = line.match(/^#{1,3}\s+(.+)/)

    if (bullet) {
      flushList()
      listItems.push(bullet[1])
    } else if (numbered) {
      flushList()
      numberedItems.push(numbered[1])
    } else {
      flushList()
      if (heading) {
        elements.push(<p key={i} className="font-bold text-slate-900 text-base mt-3 mb-1">{heading[1]}</p>)
      } else if (line.trim() === '') {
        elements.push(<div key={i} className="h-2" />)
      } else {
        elements.push(<p key={i} className="text-sm text-slate-700 leading-relaxed">{renderInline(line)}</p>)
      }
    }
  })
  flushList()
  return <div className="space-y-0.5">{elements}</div>
}

export default function AIAssistant() {
  const { workspace, updateWorkspace } = useWorkspace()
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showKeySetup, setShowKeySetup] = useState(!workspace.anthropicApiKey)
  const [keyInput, setKeyInput] = useState(workspace.anthropicApiKey)
  const [showKey, setShowKey] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const systemPrompt = `You are a knowledgeable, friendly AI assistant built into My PTA Pilot — a management portal for school PTAs and PTOs.

You are helping ${user?.name || 'an officer'} (role: ${user?.role || 'member'}) at ${workspace.orgName} (${workspace.orgType}).

Your job is to help with all things PTA/PTO: writing emails and newsletters, drafting agendas, brainstorming fundraisers, planning events, advising on governance and bylaws, creating volunteer sign-up plans, and general organizational support.

Be warm, practical, and specific. When drafting content (emails, agendas, posts), produce ready-to-use text. Keep responses concise but complete. Use bullet points and structure where it helps readability.`

  const send = async (text?: string) => {
    const content = (text ?? input).trim()
    if (!content || loading) return
    if (!workspace.anthropicApiKey) { setShowKeySetup(true); return }

    setInput('')
    setError('')
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content }
    const thinkingMsg: Message = { id: `t_${Date.now()}`, role: 'assistant', content: '', loading: true }
    setMessages(prev => [...prev, userMsg, thinkingMsg])
    setLoading(true)

    try {
      const history = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }))
      const reply = await callClaude(workspace.anthropicApiKey, history, systemPrompt)
      setMessages(prev => prev.map(m => m.loading ? { ...m, content: reply, loading: false } : m))
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Something went wrong'
      setMessages(prev => prev.filter(m => !m.loading))
      setError(msg)
    } finally {
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  const saveKey = () => {
    if (!keyInput.trim()) return
    updateWorkspace({ anthropicApiKey: keyInput.trim() })
    setShowKeySetup(false)
    setError('')
  }

  const clearChat = () => setMessages([])

  return (
    <div className="flex flex-col h-full max-h-full overflow-hidden">
      <div className="p-6 pb-0 flex-shrink-0">
        <ModuleHeader
          title="AI Assistant"
          subtitle={`Ask anything about running ${workspace.orgName}`}
          gradient="gradient-vivid"
          icon="✨"
          actions={
            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <button onClick={clearChat} className="bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-3 py-1.5 rounded-xl transition-colors">
                  Clear chat
                </button>
              )}
              <button onClick={() => setShowKeySetup(v => !v)}
                className="bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>
                {workspace.anthropicApiKey ? 'API Key ✓' : 'Set API Key'}
              </button>
            </div>
          }
        />
      </div>

      {/* API Key setup panel */}
      {showKeySetup && (
        <div className="mx-6 mt-4 flex-shrink-0">
          <div className="card p-5 border-2 border-brand-100">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 gradient-vivid rounded-xl flex items-center justify-center text-white text-lg flex-shrink-0">🔑</div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-800 mb-1">Connect your Anthropic API Key</h3>
                <p className="text-sm text-slate-500 mb-3">
                  Get a free key at <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline font-medium">console.anthropic.com</a>. Your key is stored only in your browser and never sent to our servers.
                </p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showKey ? 'text' : 'password'}
                      className="input pr-10 font-mono text-sm"
                      placeholder="sk-ant-..."
                      value={keyInput}
                      onChange={e => setKeyInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && saveKey()}
                    />
                    <button onClick={() => setShowKey(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {showKey
                          ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                          : <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></>
                        }
                      </svg>
                    </button>
                  </div>
                  <button onClick={saveKey} className="btn-primary flex-shrink-0">Save Key</button>
                  {workspace.anthropicApiKey && <button onClick={() => setShowKeySetup(false)} className="btn-secondary flex-shrink-0">Cancel</button>}
                </div>
                {workspace.anthropicApiKey && (
                  <p className="text-xs text-green-600 mt-2 font-medium">✓ API key saved — you're ready to chat!</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main chat area */}
      <div className="flex flex-1 min-h-0 gap-0 px-6 mt-4 pb-6">

        {/* Quick prompts sidebar */}
        <div className="w-56 flex-shrink-0 mr-4 space-y-1.5 overflow-y-auto">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Quick Prompts</p>
          {QUICK_PROMPTS.map((q, i) => (
            <button key={i} onClick={() => send(q.prompt)}
              className="w-full text-left flex items-start gap-2.5 px-3 py-2.5 rounded-xl hover:bg-brand-50 hover:text-brand-700 text-slate-600 text-xs font-medium transition-colors group">
              <span className="text-base flex-shrink-0 mt-0.5">{q.icon}</span>
              <span className="leading-snug group-hover:text-brand-700">{q.label}</span>
            </button>
          ))}
        </div>

        {/* Chat column */}
        <div className="flex-1 flex flex-col min-w-0 bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center pb-8">
                <div className="w-16 h-16 gradient-vivid rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-brand">✨</div>
                <h3 className="font-bold text-slate-800 text-lg mb-2">How can I help today?</h3>
                <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
                  I'm your PTA AI assistant. Ask me to draft emails, plan events, brainstorm fundraisers, write agendas — anything to make running {workspace.orgName} easier.
                </p>
                {!workspace.anthropicApiKey && (
                  <div className="mt-5 bg-amber-50 border border-amber-100 rounded-xl p-4 max-w-xs">
                    <p className="text-sm text-amber-700 font-medium">⚠️ Set your API key above to start chatting.</p>
                  </div>
                )}
              </div>
            )}

            {messages.map(msg => (
              <div key={msg.id} className={`flex items-start gap-3 animate-fade-in ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                  msg.role === 'user' ? 'gradient-vivid text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {msg.role === 'user' ? (user?.name.charAt(0) ?? 'Y') : '✨'}
                </div>

                {/* Bubble */}
                <div className={`max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                  <p className={`text-[10px] font-semibold mb-1.5 text-slate-400 ${msg.role === 'user' ? 'text-right' : ''}`}>
                    {msg.role === 'user' ? (user?.name ?? 'You') : 'AI Assistant'}
                  </p>
                  <div className={`rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'gradient-vivid text-white rounded-tr-sm'
                      : 'bg-slate-50 border border-slate-100 rounded-tl-sm'
                  }`}>
                    {msg.loading ? (
                      <div className="flex items-center gap-1.5 py-1">
                        {[0,1,2].map(i => (
                          <div key={i} className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                        ))}
                      </div>
                    ) : msg.role === 'user' ? (
                      <p className="text-sm text-white leading-relaxed">{msg.content}</p>
                    ) : (
                      <MarkdownText text={msg.content} />
                    )}
                  </div>

                  {/* Copy button for assistant messages */}
                  {msg.role === 'assistant' && !msg.loading && (
                    <button
                      onClick={() => navigator.clipboard.writeText(msg.content)}
                      className="mt-1.5 text-[10px] text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors ml-1"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                      Copy
                    </button>
                  )}
                </div>
              </div>
            ))}

            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-600 flex items-start gap-2 animate-fade-in">
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                <div>
                  <p className="font-semibold">Error</p>
                  <p className="mt-0.5">{error}</p>
                  {error.includes('401') && <p className="mt-1 text-xs">Check that your API key is correct.</p>}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input bar */}
          <div className="border-t border-slate-100 p-4">
            <div className="flex items-end gap-3">
              <textarea
                ref={inputRef}
                className="flex-1 input resize-none min-h-[44px] max-h-32 py-2.5 text-sm leading-relaxed"
                placeholder={workspace.anthropicApiKey ? `Ask anything about running ${workspace.orgName}…` : 'Set your API key above to start chatting'}
                value={input}
                disabled={!workspace.anthropicApiKey}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
                }}
                rows={1}
              />
              <button
                onClick={() => send()}
                disabled={!input.trim() || loading || !workspace.anthropicApiKey}
                className="btn-primary flex-shrink-0 h-11 px-4 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading
                  ? <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
                  : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
                }
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 text-center">Press Enter to send · Shift+Enter for new line · Responses powered by Claude</p>
          </div>
        </div>
      </div>
    </div>
  )
}
