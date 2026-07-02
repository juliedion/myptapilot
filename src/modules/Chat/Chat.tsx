import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'

const CHANNELS = [
  { id: 'general', label: 'General', icon: '💬' },
  { id: 'fundraising', label: 'Fundraising', icon: '💰' },
  { id: 'events', label: 'Events', icon: '📅' },
  { id: 'volunteers', label: 'Volunteers', icon: '🙌' },
]

interface Msg {
  id: string
  sender: string
  avatar: string
  text: string
  time: string
  isMe?: boolean
}

const SEED_MESSAGES: Record<string, Msg[]> = {
  general: [], fundraising: [], events: [], volunteers: [],
}

const avatarColors = ['bg-purple-500', 'bg-blue-500', 'bg-teal-500', 'bg-amber-500', 'bg-rose-500', 'bg-indigo-500']
const getColor = (name: string) => avatarColors[name.charCodeAt(0) % avatarColors.length]

export default function Chat() {
  const { user } = useAuth()
  const [channel, setChannel] = useState('general')
  const [messages, setMessages] = useState<Record<string, Msg[]>>(SEED_MESSAGES)
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, channel])

  const send = () => {
    if (!input.trim()) return
    const newMsg: Msg = {
      id: Date.now().toString(),
      sender: user?.name || 'You',
      avatar: user?.name.charAt(0) || 'Y',
      text: input.trim(),
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      isMe: true,
    }
    setMessages(prev => ({ ...prev, [channel]: [...(prev[channel] || []), newMsg] }))
    setInput('')
  }

  const currentMessages = messages[channel] || []

  return (
    <div className="flex h-full">
      {/* Channel list */}
      <div className="w-56 bg-white border-r border-slate-100 p-3">
        <div className="px-2 mb-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Channels</p>
        </div>
        {CHANNELS.map(ch => (
          <button
            key={ch.id}
            onClick={() => setChannel(ch.id)}
            className={`w-full text-left flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-1 ${
              channel === ch.id ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>{ch.icon}</span>
            <span># {ch.label}</span>
          </button>
        ))}

        <div className="mt-6 px-2 mb-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Direct Messages</p>
        </div>
        <p className="text-xs text-slate-400 px-3 py-2">Members will appear here once they join your portal.</p>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col bg-slate-50">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-3">
          <span className="text-xl">{CHANNELS.find(c => c.id === channel)?.icon}</span>
          <div>
            <h2 className="font-semibold text-slate-800">#{CHANNELS.find(c => c.id === channel)?.label}</h2>
            <p className="text-xs text-slate-400">{currentMessages.length} messages</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
          {currentMessages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center pb-12">
              <div className="text-4xl mb-3">{CHANNELS.find(c => c.id === channel)?.icon}</div>
              <h3 className="font-bold text-slate-700 mb-1">#{CHANNELS.find(c => c.id === channel)?.label}</h3>
              <p className="text-sm text-slate-400 max-w-xs">This is the beginning of the #{CHANNELS.find(c => c.id === channel)?.label.toLowerCase()} channel. Say hello!</p>
            </div>
          )}
          {currentMessages.map(msg => (
            <div key={msg.id} className={`flex items-start gap-3 animate-fade-in ${msg.isMe ? 'flex-row-reverse' : ''}`}>
              <div className={`w-9 h-9 rounded-full ${getColor(msg.sender)} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                {msg.avatar}
              </div>
              <div className={msg.isMe ? 'items-end' : 'items-start'}>
                <div className={`flex items-baseline gap-2 mb-1 ${msg.isMe ? 'flex-row-reverse' : ''}`}>
                  <span className="text-sm font-semibold text-slate-800">{msg.isMe ? 'You' : msg.sender}</span>
                  <span className="text-xs text-slate-400">{msg.time}</span>
                </div>
                <div className={msg.isMe ? 'chat-bubble-sent' : 'chat-bubble-received'}>
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                </div>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="bg-white border-t border-slate-200 px-6 py-4">
          <div className="flex items-center gap-3 bg-slate-50 rounded-xl border border-slate-200 px-4 py-3">
            <input
              type="text"
              className="flex-1 bg-transparent text-sm outline-none text-slate-700 placeholder-slate-400"
              placeholder={`Message #${CHANNELS.find(c => c.id === channel)?.label}…`}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
            />
            <div className="flex items-center gap-2">
              <button className="text-slate-400 hover:text-slate-600 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </button>
              <button
                onClick={send}
                disabled={!input.trim()}
                className="w-8 h-8 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-200 rounded-lg flex items-center justify-center text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
