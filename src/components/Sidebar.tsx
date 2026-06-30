import { useAuth } from '../contexts/AuthContext'

interface NavItem {
  id: string
  label: string
  icon: React.ReactNode
  badge?: string
  treasurerOnly?: boolean
  officerOnly?: boolean
}

const Icon = ({ path, ...props }: { path: string; className?: string }) => (
  <svg className={props.className || 'w-5 h-5'} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
)

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: 'Main',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: <Icon path="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /> },
      { id: 'calendar', label: 'Calendar & Events', icon: <Icon path="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /> },
    ]
  },
  {
    label: 'Communication',
    items: [
      { id: 'chat', label: 'Community Chat', icon: <Icon path="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />, badge: '3' },
      { id: 'officer-chat', label: 'Officers Only', icon: <Icon path="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />, officerOnly: true },
    ]
  },
  {
    label: 'Organization',
    items: [
      { id: 'contacts', label: 'Contacts', icon: <Icon path="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /> },
      { id: 'documents', label: 'Documents & Bylaws', icon: <Icon path="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /> },
      { id: 'clubs', label: 'Clubs', icon: <Icon path="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /> },
      { id: 'programs', label: 'Programs & Initiatives', icon: <Icon path="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /> },
    ]
  },
  {
    label: 'Fundraising & Revenue',
    items: [
      { id: 'fundraisers', label: 'Fundraisers', icon: <Icon path="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> },
      { id: 'spiritwear', label: 'Spirit Wear', icon: <Icon path="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" /> },
      { id: 'treasurer', label: 'Treasurer Portal', icon: <Icon path="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />, treasurerOnly: true },
    ]
  },
  {
    label: 'Creative & Marketing',
    items: [
      { id: 'creative', label: 'Flyers & Graphics', icon: <Icon path="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /> },
      { id: 'website', label: 'Website Templates', icon: <Icon path="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" /> },
    ]
  },
]

interface Props {
  activeModule: string
  setActiveModule: (m: string) => void
  isOpen: boolean
  setIsOpen: (v: boolean) => void
}

export default function Sidebar({ activeModule, setActiveModule, isOpen, setIsOpen }: Props) {
  const { user, logout } = useAuth()

  const roleColors: Record<string, string> = {
    president: 'bg-purple-100 text-purple-700',
    vp: 'bg-blue-100 text-blue-700',
    secretary: 'bg-teal-100 text-teal-700',
    treasurer: 'bg-amber-100 text-amber-700',
    member: 'bg-slate-100 text-slate-600',
    teacher: 'bg-green-100 text-green-700',
    admin: 'bg-red-100 text-red-700',
  }

  const isOfficer = ['president', 'vp', 'secretary', 'treasurer', 'admin'].includes(user?.role || '')

  return (
    <aside className={`fixed left-0 top-0 h-full bg-white border-r border-slate-200 flex flex-col transition-all duration-300 z-30 ${isOpen ? 'w-64' : 'w-16'}`}>
      {/* Header */}
      <div className="flex items-center p-4 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-white rotate-45" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2.5 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
          </svg>
        </div>
        {isOpen && (
          <div className="ml-3 overflow-hidden">
            <h1 className="font-bold text-slate-800 text-sm leading-tight">My PTA Pilot</h1>
            <p className="text-xs text-slate-400 truncate">Lincoln Elementary</p>
          </div>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="ml-auto p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? 'M11 19l-7-7 7-7m8 14l-7-7 7-7' : 'M13 5l7 7-7 7M5 5l7 7-7 7'} />
          </svg>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-4">
        {NAV_GROUPS.map(group => {
          const visibleItems = group.items.filter(item => {
            if (item.treasurerOnly && user?.role !== 'treasurer') return true // still show, but gated
            if (item.officerOnly && !isOfficer) return false
            return true
          })

          if (!visibleItems.length) return null

          return (
            <div key={group.label}>
              {isOpen && (
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">{group.label}</p>
              )}
              <ul className="space-y-1">
                {visibleItems.map(item => {
                  const isActive = activeModule === item.id
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => setActiveModule(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          isActive
                            ? 'bg-brand-50 text-brand-700 shadow-sm'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                        }`}
                        title={!isOpen ? item.label : undefined}
                      >
                        <span className={`flex-shrink-0 ${isActive ? 'text-brand-600' : 'text-slate-400'}`}>
                          {item.icon}
                        </span>
                        {isOpen && (
                          <>
                            <span className="flex-1 text-left truncate">{item.label}</span>
                            {item.badge && (
                              <span className="bg-brand-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                                {item.badge}
                              </span>
                            )}
                            {item.treasurerOnly && (
                              <span className="text-amber-500 flex-shrink-0">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                </svg>
                              </span>
                            )}
                          </>
                        )}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </nav>

      {/* User */}
      <div className="border-t border-slate-100 p-3">
        <div className={`flex items-center gap-3 ${isOpen ? '' : 'justify-center'}`}>
          <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
            {user?.name.charAt(0)}
          </div>
          {isOpen && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">{user?.name}</p>
              <span className={`badge text-xs ${roleColors[user?.role || 'member']}`}>
                {user?.role?.charAt(0).toUpperCase()}{user?.role?.slice(1)}
              </span>
            </div>
          )}
          {isOpen && (
            <button
              onClick={logout}
              className="text-slate-400 hover:text-red-500 transition-colors p-1"
              title="Sign out"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}
