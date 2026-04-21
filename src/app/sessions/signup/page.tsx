'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

export default function SessionsSignupPage() {
  const router = useRouter()
  const supabase = createClient()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Redirect if disclaimer wasn't accepted
    if (!sessionStorage.getItem('tbb_terms_accepted')) {
      router.replace('/sessions/disclaimer')
    }
    // Already signed in — save intake data + T&Cs to their existing profile
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return

      const goals: string[] = JSON.parse(sessionStorage.getItem('tbb_intake_goals') ?? '[]')
      const healthFlags: string[] = JSON.parse(sessionStorage.getItem('tbb_intake_health') ?? '[]')

      // Save terms acceptance
      await supabase
        .from('profiles')
        .update({ terms_accepted_at: new Date().toISOString() })
        .eq('id', session.user.id)

      // Save intake data
      fetch('/api/sessions/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session.user.id, email: session.user.email, goals, healthFlags }),
      }).catch(() => {})

      // Clear sessionStorage
      sessionStorage.removeItem('tbb_terms_accepted')
      sessionStorage.removeItem('tbb_intake_goals')
      sessionStorage.removeItem('tbb_intake_health')

      // If already approved, go straight to booking — otherwise book discovery call
      const { data: profile } = await supabase
        .from('profiles')
        .select('approved_for_sessions')
        .eq('id', session.user.id)
        .single()

      router.replace(profile?.approved_for_sessions ? '/sessions/book' : '/sessions/discovery')
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (!data.user) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
      return
    }

    // If email confirmation required
    if (!data.session) {
      router.push('/sessions/verify-email')
      return
    }

    const goals: string[] = JSON.parse(sessionStorage.getItem('tbb_intake_goals') ?? '[]')
    const healthFlags: string[] = JSON.parse(sessionStorage.getItem('tbb_intake_health') ?? '[]')

    // Create profile with terms accepted
    await supabase.from('profiles').insert({
      id: data.user.id,
      name: firstName.trim(),
      last_name: lastName.trim() || null,
      age_range: '18-29', // Default — not collected in sessions flow
      subscription_tier: 'free',
      referral_source: 'sessions-page',
      terms_accepted_at: new Date().toISOString(),
    })

    // Save intake data (fire and forget — uses service role via API)
    fetch('/api/sessions/intake', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: data.user.id,
        email,
        goals,
        healthFlags,
      }),
    }).catch(() => {})

    // Clear sessionStorage
    sessionStorage.removeItem('tbb_terms_accepted')
    sessionStorage.removeItem('tbb_intake_goals')
    sessionStorage.removeItem('tbb_intake_health')

    router.push('/sessions/discovery')
  }

  return (
    <main
      className="flex flex-col items-center justify-center min-h-screen px-6"
      style={{ backgroundColor: 'var(--background)' }}
    >
      <div className="w-full max-w-sm">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col gap-8"
        >
          <div>
            <p
              className="text-xs tracking-[0.25em] uppercase mb-3"
              style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
            >
              One more step
            </p>
            <h2
              className="text-2xl font-medium"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}
            >
              Create your account
            </h2>
            <p
              className="text-sm mt-2"
              style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
            >
              Your account gives you access to your bookings, session notes, and the
              self-guided app.
            </p>
          </div>

          <form onSubmit={handleSignUp} className="flex flex-col gap-4">
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="flex-1 px-4 py-3.5 rounded-xl text-base outline-none"
                style={{
                  backgroundColor: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  color: 'var(--foreground)',
                  fontFamily: 'var(--font-body)',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
              />
              <input
                type="text"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="flex-1 px-4 py-3.5 rounded-xl text-base outline-none"
                style={{
                  backgroundColor: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  color: 'var(--foreground)',
                  fontFamily: 'var(--font-body)',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3.5 rounded-xl text-base outline-none"
              style={{
                backgroundColor: 'var(--surface-2)',
                border: '1px solid var(--border)',
                color: 'var(--foreground)',
                fontFamily: 'var(--font-body)',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
            />
            <input
              type="password"
              placeholder="Password (min. 8 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-4 py-3.5 rounded-xl text-base outline-none"
              style={{
                backgroundColor: 'var(--surface-2)',
                border: '1px solid var(--border)',
                color: 'var(--foreground)',
                fontFamily: 'var(--font-body)',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
            />

            {error && (
              <p className="text-sm text-red-400" style={{ fontFamily: 'var(--font-body)' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-full text-sm tracking-[0.15em] uppercase mt-2 transition-all"
              style={{
                backgroundColor: 'var(--accent)',
                color: 'var(--background)',
                fontFamily: 'var(--font-body)',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        </motion.div>
      </div>
    </main>
  )
}
