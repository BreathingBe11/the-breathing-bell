'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useSessionStore } from '@/store/sessionStore'
import { createClient } from '@/lib/supabase/client'
import { TIME_UNLOCK_THRESHOLDS } from '@/types'

type SaveMode = 'new-user' | 'returning' | 'saving' | 'saved' | 'verify-email'

export default function SavePage() {
  const router = useRouter()
  const { currentSession, intake, resetSession } = useSessionStore()
  const [mode, setMode] = useState<SaveMode>('new-user')
  const [email, setEmail] = useState(intake.email ?? '')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [unlockMessage, setUnlockMessage] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    // Compute next unlock based on sessions saved so far (pre-save)
    const count = parseInt(localStorage.getItem('tbb_session_count') || '0', 10)
    const next = TIME_UNLOCK_THRESHOLDS.find(t => count < t.sessions)
    if (next) {
      const needed = next.sessions - count
      setUnlockMessage(
        needed === 1
          ? `One more session unlocks ${next.minutes} minutes.`
          : `${needed} more sessions unlock ${next.minutes} minutes.`
      )
    }
  }, [])

  useEffect(() => {
    // Check if already signed in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setMode('returning')
        handleSaveForUser(session.user.id)
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSaveForUser(userId: string) {
    if (!currentSession) return
    setMode('saving')

    const { error } = await supabase.from('sessions').insert({
      user_id: userId,
      name: currentSession.name,
      age_range: currentSession.ageRange,
      technique: currentSession.technique,
      domain: currentSession.domain,
      walking_in_state: currentSession.walkingInState,
      duration_minutes: currentSession.durationMinutes,
      echo_text: currentSession.echoText,
      completed_at: currentSession.completedAt,
    })

    if (error) {
      setError('Something went wrong saving your session.')
      setMode('new-user')
      return
    }

    // Increment local session count for time unlock
    const count = parseInt(localStorage.getItem('tbb_session_count') || '0', 10)
    const newCount = count + 1
    localStorage.setItem('tbb_session_count', String(newCount))

    // Compute next unlock message
    const next = TIME_UNLOCK_THRESHOLDS.find(t => newCount < t.sessions)
    if (next) {
      const needed = next.sessions - newCount
      setUnlockMessage(
        needed === 1
          ? `One more session unlocks ${next.minutes} minutes.`
          : `${needed} more sessions unlock ${next.minutes} minutes.`
      )
    }

    setMode('saved')
    resetSession()

    setTimeout(() => {
      router.push('/dashboard')
    }, 2000)
  }

  async function handleSignUp(e: { preventDefault(): void }) {
    e.preventDefault()
    setError('')

    if (!currentSession) return

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      return
    }

    if (!data.user) {
      setError('Something went wrong. Please try again.')
      return
    }

    // If no session, email confirmation is required — show verify screen
    if (!data.session) {
      setMode('verify-email')
      return
    }

    // Create profile
    await supabase.from('profiles').insert({
      id: data.user.id,
      name: currentSession.name,
      age_range: currentSession.ageRange,
      subscription_tier: 'free',
    })

    // Send member welcome email (fire and forget)
    fetch('/api/email/welcome-member', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name: currentSession.name }),
    }).catch(() => {})

    await handleSaveForUser(data.user.id)
  }

  async function handleSignIn(e: { preventDefault(): void }) {
    e.preventDefault()
    setError('')

    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError) {
      setError(signInError.message)
      return
    }

    if (data.user) {
      fetch('/api/track-login', { method: 'POST' }).catch(() => {})
      await handleSaveForUser(data.user.id)
    }
  }

  if (mode === 'verify-email') {
    return (
      <main
        className="flex flex-col items-center justify-center min-h-screen px-6 text-center"
        style={{ backgroundColor: '#141820' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center gap-6 max-w-sm"
        >
          <p
            className="text-3xl"
            style={{ color: 'var(--accent)' }}
          >
            ✉
          </p>
          <h2
            className="text-2xl font-medium"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}
          >
            Check your email
          </h2>
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
          >
            We sent a verification link to <span style={{ color: 'var(--foreground)' }}>{email}</span>.
            Click the link to verify your account and your session will be waiting for you.
          </p>
          <p
            className="text-xs tracking-[0.15em] uppercase"
            style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
          >
            You can close this tab
          </p>
        </motion.div>
      </main>
    )
  }

  if (mode === 'saving') {
    return (
      <main
        className="flex flex-col items-center justify-center min-h-screen px-6 text-center"
        style={{ backgroundColor: 'var(--background)' }}
      >
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center gap-4"
        >
          <p
            className="text-xl italic"
            style={{ color: 'var(--accent-soft)', fontFamily: 'var(--font-display)' }}
          >
            Saving your session...
          </p>
        </motion.div>
      </main>
    )
  }

  if (mode === 'saved') {
    return (
      <main
        className="flex flex-col items-center justify-center min-h-screen px-6 text-center"
        style={{ backgroundColor: 'var(--background)' }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4 max-w-sm"
        >
          <p
            className="text-xl italic"
            style={{ color: 'var(--accent-soft)', fontFamily: 'var(--font-display)' }}
          >
            Session saved to your Quiet Log.
          </p>
          {unlockMessage && (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-sm italic"
              style={{ color: 'var(--muted)', fontFamily: 'var(--font-display)' }}
            >
              ✦ {unlockMessage} Keep showing up.
            </motion.p>
          )}
          <p
            className="text-xs tracking-[0.2em] uppercase mt-2"
            style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
          >
            Opening your log...
          </p>
        </motion.div>
      </main>
    )
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
              Save to your Quiet Log
            </p>
            <h2
              className="text-2xl font-medium"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}
            >
              {mode === 'new-user' ? 'Create your profile' : 'Welcome back'}
            </h2>
            <p
              className="text-sm mt-2"
              style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
            >
              {mode === 'new-user'
                ? 'Your session is waiting. Create a free account to keep it.'
                : 'Sign in to save this session to your log.'}
            </p>
            {unlockMessage && (
              <p
                className="text-xs mt-3 italic"
                style={{ color: 'var(--accent-soft)', fontFamily: 'var(--font-display)' }}
              >
                ✦ {unlockMessage} Keep showing up.
              </p>
            )}
          </div>

          <form
            onSubmit={mode === 'new-user' ? handleSignUp : handleSignIn}
            className="flex flex-col gap-4"
          >
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
              placeholder="Password"
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
              className="w-full py-4 rounded-full text-sm tracking-[0.15em] uppercase mt-2"
              style={{
                backgroundColor: 'var(--accent)',
                color: 'var(--background)',
                fontFamily: 'var(--font-body)',
              }}
            >
              {mode === 'new-user' ? 'Create account & save' : 'Sign in & save'}
            </button>
          </form>

          <button
            onClick={() => setMode(mode === 'new-user' ? 'returning' : 'new-user')}
            className="text-sm text-center"
            style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
          >
            {mode === 'new-user'
              ? 'Already have an account? Sign in'
              : 'New here? Create an account'}
          </button>
        </motion.div>
      </div>
    </main>
  )
}
