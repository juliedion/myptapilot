import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface Officer {
  id: string
  name: string
  email: string
  role: string
}

export interface WorkspaceState {
  orgName: string
  orgType: string
  primaryColor: string
  accentColor: string
  logoDataUrl: string | null
  officers: Officer[]
  completedSteps: string[]
  isOnboarded: boolean
  anthropicApiKey: string
}

const DEFAULT_STATE: WorkspaceState = {
  orgName: 'Lincoln Elementary PTO',
  orgType: 'PTO',
  primaryColor: '#7c3aed',
  accentColor: '#ec4899',
  logoDataUrl: null,
  officers: [],
  completedSteps: [],
  isOnboarded: false,
  anthropicApiKey: '',
}

interface WorkspaceContextType {
  workspace: WorkspaceState
  updateWorkspace: (partial: Partial<WorkspaceState>) => void
  completeStep: (stepId: string) => void
  resetWorkspace: () => void
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null)

const STORAGE_KEY = 'pta_workspace'

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [workspace, setWorkspace] = useState<WorkspaceState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) return { ...DEFAULT_STATE, ...JSON.parse(stored) }
    } catch {}
    return DEFAULT_STATE
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace))
  }, [workspace])

  const updateWorkspace = (partial: Partial<WorkspaceState>) => {
    setWorkspace(prev => ({ ...prev, ...partial }))
  }

  const completeStep = (stepId: string) => {
    setWorkspace(prev => ({
      ...prev,
      completedSteps: prev.completedSteps.includes(stepId)
        ? prev.completedSteps
        : [...prev.completedSteps, stepId],
    }))
  }

  const resetWorkspace = () => {
    setWorkspace(DEFAULT_STATE)
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <WorkspaceContext.Provider value={{ workspace, updateWorkspace, completeStep, resetWorkspace }}>
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext)
  if (!ctx) throw new Error('useWorkspace must be used within WorkspaceProvider')
  return ctx
}
