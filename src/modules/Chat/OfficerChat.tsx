import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'

const OFFICER_CHANNELS = [
  { id: 'exec', label: 'Executive Board', icon: '🏛️' },
  { id: 'finance', label: 'Finance', icon: '💵' },
  { id: 'planning', label: 'Strategic Planning', icon: '📌' },
]

interface Msg {
  id: string
  sender: string
  avatar: string
  text: string
  time: string
  isMe?: boolean
}

const SEED: Record<string, Msg[]> = {
  exec: [
    { id: '1', sender: 'Sarah Mitchell', avatar: 'S', text: 'Board members — please review the proposed 2025-2026 budget draft before our Thursday meeting. Link in Documents.', time: 'Mon 8:30 AM' },
    { id: '2', sender: 'Michael Chen', avatar: 'M', text: 'Budget looks solid. I flagged a couple line items for discussion. My notes are on page 3.', time: 'Mon 9:45 AM' },
    { id: '3', sender: 'Tom Rivera', avatar: 'T', text: 'Should we schedule a pre-meeting call for the exec team to align before Thursday?', time: 'Mon 2:00 PM' },
    { id: '4', sender: 'Jessica Park', avatar: 'J', text: 'Good idea. How about Wednesday at 7pm? I can send a calendar invite.', time: 'Mon 2:20 PM' },
    { id: '5', sender: 'Sarah Mitchell', avatar: 'S', text: 'Wednesday works for me. Let\'s keep it to 30 min max. Agenda: budget review + Fall Carnival logistics.', time: 'Mon 2:35 PM' },
  ],
  finance: [
    { id: '1', sender: 'Michael Chen', avatar: 'M', text: 'Q2 is looking great. We\'re $2,200 ahead of last year at this point. Walk-A-Thon was a big driver.', time: 'Fri 10:00 AM' },
    { id: '2', sender: 'Sarah Mitchell', avatar: 'S', text: 'Excellent! Any concerns about the Fall Carnival budget?', time: 'Fri 10:15 AM' },
    { id: '3', sender: 'Michael Chen', avatar: 'M', text: 'We budgeted $3,500 for carnival and should come in under that if we reuse our existing vendor contracts.', time: 'Fri 10:30 AM' },
  ],
  planning: [
    { id: '1', sender: 'Tom Rivera', avatar: 'T', text: 'I\'d like to propose we launch a new Family STEM Nights program this fall. Could bring in 100+ families per event.', time: 'Thu 6:00 PM' },
    { id: '2', sender: 'Sarah Mitchell', avatar: 'S', text: 'Love this idea! Let\'s add it to the Programs agenda for next meeting.', time: 'Thu 6:45 PM' },
  ],
}

const avatarColors = ['bg-purple-500', 'bg-blue-500', 'bg-teal-500', 'bg-amber-500', 'bg-indigo-500']
const getColor = (name: string) => avatarColors[name.charCodeAt(0) % avatarColors.length]

export default function OfficerChat() {
  const { user } = useAuth()
  const [channel, setChannel] = useState('exec')
  const [messages, setMessages] = useState<Record<string, Msg[]>>(SEED)
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, channel])

  const send = () => {
    if (!input.trim()) return
    const msg: Msg = {
      id: Date.now().toString(),
      sender: user?.name || 'You',
      avatar: user?.name.charAt(0) || 'Y',
      text: input.trim(),
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      isMe: true,
    }
    setMessages(prev => ({ ...prev, [channel]: [...(prev[channel] || []), msg] }))
    setInput('')
  }

  const current = messages[channel] || []

  return (
    <div className="flex h-full">
      <div className="w-56 bg-white border-r border-slate-100 p-3">
        <div className="px-2 mb-3">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Officers Only</p>
          </div>
          <p className="text-xs text-slate-400">Private board communications</p>
        </div>
        {OFFICER_CHANNELS.map(ch => (
          <button
            key={ch.id}
            onClick={() => setChannel(ch.id)}
            className={`w-full text-left flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-1 ${
              channel === ch.id ? 'bg-amber-50 text-amber-800' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>{ch.icon}</span>
            <span>{ch.label}</span>
          </button>
        ))}
        <div className="mt-6 mx-2 p-3 bg-amber-50 rounded-xl border border-amber-100">
          <p className="text-xs text-amber-700 font-medium">🔒 Restricted Access</p>
          <p className="text-xs text-amber-600 mt-1">This chat is visible only to elected PTA officers and board members.</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-slate-50">
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
            <span className="text-base">{OFFICER_CHANNELS.find(c => c.id === channel)?.icon}</span>
          </div>
          <div>
            <h2 className="font-semibold text-slate-800">{OFFICER_CHANNELS.find(c => c.id === channel)?.label}</h2>
            <p className="text-xs text-slate-400">Officers & Board Members · {current.length} messages</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="badge bg-amber-100 text-amber-700">🔒 Private</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
          {current.map(msg => (
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

        <div className="bg-white border-t border-slate-200 px-6 py-4">
          <div className="flex items-center gap-3 bg-slate-50 rounded-xl border border-slate-200 px-4 py-3">
            <input
              type="text"
              className="flex-1 bg-transparent text-sm outline-none text-slate-700 placeholder-slate-400"
              placeholder={`Message ${OFFICER_CHANNELS.find(c => c.id === channel)?.label}…`}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
            />
            <button
              onClick={send}
              disabled={!input.trim()}
              className="w-8 h-8 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 rounded-lg flex items-center justify-center text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
