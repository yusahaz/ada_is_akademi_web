import { create } from 'zustand'

export type ShiftStatus = 'confirmed' | 'active' | 'completed' | 'disputed'
export type ShiftAnomaly = 'none' | 'locationMismatch' | 'expiredToken'
export type WorkerDashboardTheme = 'light' | 'dark'

export type WorkerShiftTimelineItem = {
  id: string
  employerName: string
  category: string
  day: string
  timeRange: string
  status: ShiftStatus
  anomaly: ShiftAnomaly
}

type WorkerDashboardStore = {
  theme: WorkerDashboardTheme
  setTheme: (theme: WorkerDashboardTheme) => void
  userName: string
  setUserName: (name: string) => void
  aiMatchScore: number
  setAiMatchScore: (score: number) => void
  balance: number
  setBalance: (balance: number) => void
  timeline: WorkerShiftTimelineItem[]
  setTimeline: (items: WorkerShiftTimelineItem[]) => void
}

export const useWorkerDashboardStore = create<WorkerDashboardStore>((set) => ({
  theme: 'dark',
  setTheme: (theme) => set({ theme }),
  userName: '',
  setUserName: (userName) => set({ userName }),
  aiMatchScore: 0,
  setAiMatchScore: (aiMatchScore) => set({ aiMatchScore }),
  balance: 0,
  setBalance: (balance) => set({ balance }),
  timeline: [],
  setTimeline: (timeline) => set({ timeline }),
}))
