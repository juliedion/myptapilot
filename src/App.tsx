import { useState } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { WorkspaceProvider, useWorkspace } from './contexts/WorkspaceContext'
import LoginPage from './components/LoginPage'
import Layout from './components/Layout'
import OnboardingWizard from './components/OnboardingWizard'

function AppInner() {
  const { isAuthenticated } = useAuth()
  const { workspace, updateWorkspace } = useWorkspace()
  const [activeModule, setActiveModule] = useState('dashboard')

  if (!isAuthenticated) return <LoginPage />
  if (!workspace.isOnboarded) {
    return <OnboardingWizard onComplete={() => updateWorkspace({ isOnboarded: true })} />
  }
  return <Layout activeModule={activeModule} setActiveModule={setActiveModule} />
}

export default function App() {
  return (
    <AuthProvider>
      <WorkspaceProvider>
        <AppInner />
      </WorkspaceProvider>
    </AuthProvider>
  )
}
