import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { SessionIntake, Session } from '@/types'

interface SessionStore {
  _hasHydrated: boolean
  intake: Partial<SessionIntake>
  currentSession: Session | null
  setHasHydrated: (value: boolean) => void
  setIntake: (data: Partial<SessionIntake>) => void
  setCurrentSession: (session: Session) => void
  resetSession: () => void
}

export const useSessionStore = create<SessionStore>()(
  persist(
    (set) => ({
      _hasHydrated: false,
      intake: {},
      currentSession: null,
      setHasHydrated: (value) => set({ _hasHydrated: value }),
      setIntake: (data) =>
        set((state) => ({ intake: { ...state.intake, ...data } })),
      setCurrentSession: (session) => set({ currentSession: session }),
      resetSession: () => set({ intake: {}, currentSession: null }),
    }),
    {
      name: 'tbb-session',
      partialize: (state) => ({ intake: state.intake }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)
