import React, { createContext, useContext, useState, useCallback } from 'react'
import { User, UserRole } from '../types'

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const DEMO_USERS: (User & { password: string })[] = [
  { id: '1', name: 'Sarah Mitchell', email: 'president@lincoln-pta.org', password: 'pta2024', role: 'president', phone: '(555) 234-5678' },
  { id: '2', name: 'Tom Rivera', email: 'vp@lincoln-pta.org', password: 'pta2024', role: 'vp', phone: '(555) 345-6789' },
  { id: '3', name: 'Jessica Park', email: 'secretary@lincoln-pta.org', password: 'pta2024', role: 'secretary', phone: '(555) 456-7890' },
  { id: '4', name: 'Michael Chen', email: 'treasurer@lincoln-pta.org', password: 'treasurer2024', role: 'treasurer', isTreasurer: true, phone: '(555) 567-8901' },
  { id: '5', name: 'Amanda Johnson', email: 'member@lincoln-pta.org', password: 'pta2024', role: 'member', phone: '(555) 678-9012' },
]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    const found = DEMO_USERS.find(u => u.email === email && u.password === password)
    if (found) {
      const { password: _, ...userWithoutPass } = found
      setUser(userWithoutPass)
      return true
    }
    return false
  }, [])

  const logout = useCallback(() => {
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export const DEMO_CREDENTIALS = [
  { email: 'president@lincoln-pta.org', password: 'pta2024', role: 'President' },
  { email: 'treasurer@lincoln-pta.org', password: 'treasurer2024', role: 'Treasurer (Private)' },
  { email: 'member@lincoln-pta.org', password: 'pta2024', role: 'Member' },
]
