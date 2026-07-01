import { useState, lazy, Suspense } from 'react'
import Sidebar from './Sidebar'
import Dashboard from './Dashboard'
import Chat from '../modules/Chat/Chat'
import CalendarModule from '../modules/Calendar/CalendarModule'
import DocumentsModule from '../modules/Documents/DocumentsModule'
import ContactsModule from '../modules/Contacts/ContactsModule'
import FundraisersModule from '../modules/Fundraisers/FundraisersModule'
import SpiritWearModule from '../modules/SpiritWear/SpiritWearModule'
import ProgramsModule from '../modules/Programs/ProgramsModule'
import ClubsModule from '../modules/Clubs/ClubsModule'
import CreativeModule from '../modules/Creative/CreativeModule'
import WebsiteModule from '../modules/Website/WebsiteModule'
import OfficerChat from '../modules/Chat/OfficerChat'
import { useAuth } from '../contexts/AuthContext'

const TreasurerModule = lazy(() => import('../modules/Treasurer/TreasurerModule'))

interface LayoutProps {
  activeModule: string
  setActiveModule: (m: string) => void
}

export default function Layout({ activeModule, setActiveModule }: LayoutProps) {
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const renderModule = () => {
    if (activeModule === 'treasurer' && !user?.isTreasurer && user?.role !== 'treasurer') {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center p-8 card max-w-sm">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m2-11V4m0 0L8 8m4-4l4 4" />
              </svg>
            </div>
            <h3 className="font-semibold text-slate-800 text-lg mb-2">Treasurer Access Only</h3>
            <p className="text-slate-500 text-sm">This module is restricted to the PTA Treasurer. Please log in with treasurer credentials.</p>
          </div>
        </div>
      )
    }

    switch (activeModule) {
      case 'dashboard': return <Dashboard setActiveModule={setActiveModule} />
      case 'chat': return <Chat />
      case 'officer-chat': return <OfficerChat />
      case 'calendar': return <CalendarModule />
      case 'documents': return <DocumentsModule />
      case 'contacts': return <ContactsModule />
      case 'fundraisers': return <FundraisersModule />
      case 'spiritwear': return <SpiritWearModule />
      case 'programs': return <ProgramsModule />
      case 'clubs': return <ClubsModule />
      case 'treasurer': return <Suspense fallback={<div className="flex items-center justify-center h-full text-slate-400">Loading…</div>}><TreasurerModule /></Suspense>
      case 'creative': return <CreativeModule />
      case 'website': return <WebsiteModule />
      default: return <Dashboard setActiveModule={setActiveModule} />
    }
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />
      <main className={`flex-1 overflow-auto transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <div className="h-full">
          {renderModule()}
        </div>
      </main>
    </div>
  )
}
