import React, { createContext, useContext, useState, useCallback } from 'react'
import { User } from '../types'

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const STORAGE_KEY = 'pta_users'

const BUILT_IN_USERS: (User & { password: string })[] = [
  { id: '1', name: 'Sarah Mitchell', email: 'president@lincoln-pta.org', password: 'pta2024', role: 'president', phone: '(555) 234-5678' },
  { id: '2', name: 'Tom Rivera', email: 'vp@lincoln-pta.org', password: 'pta2024', role: 'vp', phone: '(555) 345-6789' },
  { id: '3', name: 'Jessica Park', email: 'secretary@lincoln-pta.org', password: 'pta2024', role: 'secretary', phone: '(555) 456-7890' },
  { id: '4', name: 'Michael Chen', email: 'treasurer@lincoln-pta.org', password: 'treasurer2024', role: 'treasurer', isTreasurer: true, phone: '(555) 567-8901' },
  { id: '5', name: 'Amanda Johnson', email: 'member@lincoln-pta.org', password: 'pta2024', role: 'member', phone: '(555) 678-9012' },
]

function loadRegisteredUsers(): (User & { password: string })[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function saveRegisteredUsers(users: (User & { password: string })[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    const allUsers = [...BUILT_IN_USERS, ...loadRegisteredUsers()]
    const found = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password)
    if (found) {
      const { password: _, ...userWithoutPass } = found
      setUser(userWithoutPass)
      return true
    }
    return false
  }, [])

  const register = useCallback(async (name: string, email: string, password: string): Promise<{ ok: boolean; error?: string }> => {
    const allUsers = [...BUILT_IN_USERS, ...loadRegisteredUsers()]
    if (allUsers.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { ok: false, error: 'An account with this email already exists.' }
    }
    const newUser: User & { password: string } = {
      id: `u_${Date.now()}`,
      name,
      email,
      password,
      role: 'president',
    }
    saveRegisteredUsers([...loadRegisteredUsers(), newUser])
    const { password: _, ...userWithoutPass } = newUser
    setUser(userWithoutPass)
    return { ok: true }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user }}>
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
