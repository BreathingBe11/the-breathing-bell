'use client'

import { useEffect, useState } from 'react'

interface GateResult {
  allowed: boolean
  loading: boolean
  sessionsThisMonth: number
  tier: string
}

export function useSessionGate(): GateResult {
  const [allowed, setAllowed] = useState(true)
  const [loading, setLoading] = useState(true)
  const [sessionsThisMonth, setSessionsThisMonth] = useState(0)
  const [tier, setTier] = useState('free')

  useEffect(() => {
    async function check() {
      try {
        const res = await fetch('/api/session-count')
        const data = await res.json()

        const currentTier = data.tier ?? 'free'
        setTier(currentTier)

        // Paid tiers have unlimited sessions
        if (currentTier !== 'free') {
          setAllowed(true)
          setLoading(false)
          return
        }

        // Count sessions this calendar month from the total
        // For free tier: simple check — backend returns total, we gate at 3/month
        // A full implementation would filter by month on the backend
        // For now we store monthly count in localStorage
        const monthKey = `tbb_monthly_${new Date().toISOString().slice(0, 7)}`
        const monthCount = parseInt(localStorage.getItem(monthKey) || '0', 10)

        setSessionsThisMonth(monthCount)
        setAllowed(monthCount < 3)
      } catch {
        // If check fails, allow the session
        setAllowed(true)
      } finally {
        setLoading(false)
      }
    }

    check()
  }, [])

  return { allowed, loading, sessionsThisMonth, tier }
}

export function incrementMonthlyCount() {
  const monthKey = `tbb_monthly_${new Date().toISOString().slice(0, 7)}`
  const count = parseInt(localStorage.getItem(monthKey) || '0', 10)
  localStorage.setItem(monthKey, String(count + 1))
}
