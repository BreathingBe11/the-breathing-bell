import { create } from 'zustand'
import { SessionIntake, Session } from '@/types'

interface SessionStore {
  intake: Partial<SessionIntake>
  currentSession: Session | null
  setIntake: (data: Partial<SessionIntake>) => void
  setCurrentSession: (session: Session) => void
  resetSession: () => void
}

export const useSessionStore = create<SessionStore>((set) => ({
  intake: {},
  currentSession: null,
  setIntake: (data) =>
    set((state) => ({ intake: { ...state.intake, ...data } })),
  setCurrentSession: (session) => set({ currentSession: session }),
  resetSession: () => set({ intake: {}, currentSession: null }),
}))
