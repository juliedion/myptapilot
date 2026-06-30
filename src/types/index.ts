export type UserRole = 'president' | 'vp' | 'secretary' | 'treasurer' | 'member' | 'teacher' | 'admin'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  phone?: string
  isTreasurer?: boolean
}

export interface Message {
  id: string
  senderId: string
  senderName: string
  content: string
  timestamp: Date
  channel: 'general' | 'officers' | 'fundraising' | 'events'
}

export interface CalendarEvent {
  id: string
  title: string
  date: Date
  type: 'meeting' | 'fundraiser' | 'event' | 'deadline' | 'holiday'
  description?: string
  location?: string
  isSuggested?: boolean
}

export interface Document {
  id: string
  name: string
  category: 'bylaws' | 'legal' | 'meeting-minutes' | 'financial' | 'forms' | 'other'
  uploadedBy: string
  uploadedAt: Date
  size: string
  url?: string
}

export interface Contact {
  id: string
  name: string
  email: string
  phone?: string
  role: string
  type: 'parent' | 'officer' | 'member' | 'teacher' | 'vendor'
  grade?: string
  children?: string[]
  committee?: string
}

export interface Fundraiser {
  id: string
  name: string
  type: string
  status: 'planned' | 'active' | 'completed'
  goalAmount: number
  raisedAmount: number
  startDate: Date
  endDate: Date
  description: string
  vendor?: string
  isSuggested?: boolean
}

export interface SpiritWearOrder {
  id: string
  ordererName: string
  email: string
  items: SpiritWearItem[]
  total: number
  status: 'pending' | 'paid' | 'fulfilled' | 'shipped'
  orderedAt: Date
  notes?: string
}

export interface SpiritWearItem {
  name: string
  size: string
  color: string
  quantity: number
  price: number
}

export interface Program {
  id: string
  name: string
  category: 'academic' | 'arts' | 'wellness' | 'community' | 'stem'
  description: string
  status: 'idea' | 'planning' | 'active' | 'completed'
  budget?: number
  lead?: string
  isSuggested?: boolean
}

export interface Club {
  id: string
  name: string
  type: string
  description: string
  advisor?: string
  meetingDay?: string
  meetingTime?: string
  memberCount?: number
  status: 'proposed' | 'active' | 'inactive'
  isSuggested?: boolean
}

export interface Transaction {
  id: string
  date: Date
  description: string
  category: string
  type: 'income' | 'expense'
  amount: number
  paymentMethod?: string
  notes?: string
  taxDeductible?: boolean
}
