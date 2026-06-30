import { useState } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import LoginPage from './components/LoginPage'
import Layout from './components/Layout'

function AppInner() {
  const { isAuthenticated } = useAuth()
  const [activeModule, setActiveModule] = useState('dashboard')

  if (!isAuthenticated) return <LoginPage />
  return <Layout activeModule={activeModule} setActiveModule={setActiveModule} />
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  )
}
