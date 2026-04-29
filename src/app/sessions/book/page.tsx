'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  window.location.href = '/'
}

const SESSIONS = [
  {
    title: 'Discovery Call',
    description: 'A free 20-minute conversation with Omi to talk about your goals and see if sessions are the right fit.',
    duration: '20 min',
    price: 'Free',
    url: 'https://calendly.com/omitheintuitive/discoverycall',
    requiresApproval: false,
  },
  {
    title: '60-Minute Session',
    description: 'A full-length session with your choice of modality — breathwork, sound, yoga nidra, or a mix.',
    duration: '60 min',
    price: null, // Set in Calendly
    url: 'https://calendly.com/omitheintuitive/60min',
    requiresApproval: true,
  },
  {
    title: '30-Minute Session',
    description: 'A focused half-hour session. Choose your modality when you book.',
    duration: '30 min',
    price: null,
    url: 'https://calendly.com/omitheintuitive/30mins',
    requiresApproval: true,
  },
]

export default function SessionsBookPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [approved, setApproved] = useState(false)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/login?next=/sessions/book')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('approved_for_sessions, terms_accepted_at')
        .eq('id', user.id)
        .single()

      // First-time session client: gate them through intake + T&Cs
      if (!profile?.terms_accepted_at) {
        router.replace('/sessions/intake')
        return
      }

      setApproved(profile?.approved_for_sessions ?? false)
      setLoading(false)
    }

    init()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) return null

  const visible = SESSIONS.filter(s => !s.requiresApproval || approved)

  return (
    <main
      className="flex flex-col items-center min-h-screen px-6 py-16"
      style={{ backgroundColor: 'var(--background)' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 20%, rgba(42,181,197,0.05) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 w-full max-w-2xl">

        <div className="flex items-center justify-between mb-10">
          <Link
            href="/sessions"
            className="text-xs tracking-[0.2em] uppercase"
            style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
          >
            ← Omi Sessions
          </Link>
          <button
            onClick={signOut}
            className="text-xs tracking-[0.15em] uppercase"
            style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
          >
            Sign out
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col gap-3 mb-10"
        >
          <h1
            className="text-3xl font-medium leading-snug"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}
          >
            Book a session
          </h1>
          <p
            className="text-sm"
            style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
          >
            {approved
              ? 'Choose a session type below. You\'ll select your modality when you book.'
              : 'Start with a free discovery call. Paid sessions unlock after your call with Omi.'}
          </p>
        </motion.div>

        <div className="flex flex-col gap-4">
          {visible.map((session, i) => (
            <motion.a
              key={session.title}
              href={session.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="learn-card flex flex-col px-6 py-5 rounded-xl"
              style={{
                backgroundColor: 'var(--surface-2)',
                border: '1px solid var(--border)',
                textDecoration: 'none',
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1.5">
                  <span
                    className="text-lg font-medium leading-snug"
                    style={{ color: 'var(--foreground)', fontFamily: 'var(--font-display)' }}
                  >
                    {session.title}
                  </span>
                  <span
                    className="text-sm leading-relaxed"
                    style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
                  >
                    {session.description}
                  </span>
                </div>
                <div
                  className="flex flex-col items-end gap-1 flex-shrink-0 pt-0.5"
                  style={{ minWidth: '60px' }}
                >
                  <span
                    className="text-xs tracking-[0.15em] uppercase"
                    style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
                  >
                    {session.duration}
                  </span>
                  {session.price && (
                    <span
                      className="text-sm font-medium"
                      style={{ color: 'var(--accent)', fontFamily: 'var(--font-body)' }}
                    >
                      {session.price}
                    </span>
                  )}
                </div>
              </div>
              <span
                className="text-xs tracking-[0.15em] uppercase mt-4"
                style={{ color: 'var(--accent)', fontFamily: 'var(--font-body)' }}
              >
                Book on Calendly →
              </span>
            </motion.a>
          ))}

          {!approved && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="px-6 py-4 rounded-xl"
              style={{
                backgroundColor: 'var(--surface-2)',
                border: '1px solid var(--border)',
                opacity: 0.5,
              }}
            >
              <p
                className="text-sm"
                style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
              >
                60 &amp; 30-minute sessions unlock after your discovery call.
              </p>
            </motion.div>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-10 flex justify-center"
        >
          <Link
            href="/dashboard"
            className="text-xs tracking-[0.15em] uppercase"
            style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
          >
            ← My dashboard
          </Link>
        </motion.div>

      </div>
    </main>
  )
}
