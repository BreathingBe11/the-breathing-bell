'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Domain, DOMAIN_LABELS, TECHNIQUE_LABELS, STATE_LABELS } from '@/types'
import { createClient } from '@/lib/supabase/client'

interface SessionRow {
  id: string
  name: string
  technique: string
  domain: string
  walking_in_state: string
  duration_minutes: number
  echo_text: string
  completed_at: string
}

interface ProfileRow {
  name: string
  subscription_tier: string
}

function calculateStreak(sessions: SessionRow[]): number {
  if (!sessions.length) return 0

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let streak = 0
  let checkDate = new Date(today)

  const sessionDates = new Set(
    sessions.map((s) => {
      const d = new Date(s.completed_at)
      d.setHours(0, 0, 0, 0)
      return d.toDateString()
    })
  )

  // Check consecutive days back from today
  while (sessionDates.has(checkDate.toDateString())) {
    streak++
    checkDate.setDate(checkDate.getDate() - 1)
  }

  return streak
}

function getTopDomain(sessions: SessionRow[]): Domain | null {
  if (!sessions.length) return null
  const counts: Record<string, number> = {}
  sessions.forEach((s) => {
    counts[s.domain] = (counts[s.domain] || 0) + 1
  })
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0] as Domain
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function QuietLogClient({
  sessions,
  profile,
}: {
  sessions: SessionRow[]
  profile: ProfileRow | null
}) {
  const router = useRouter()
  const supabase = createClient()
  const streak = calculateStreak(sessions)

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
  }
  const topDomain = getTopDomain(sessions)
  const totalSessions = sessions.length

  const stats = [
    { label: 'Sessions', value: totalSessions.toString() },
    { label: 'Top Domain', value: topDomain ? DOMAIN_LABELS[topDomain] : '—' },
    { label: 'Day Streak', value: streak > 0 ? `${streak}` : '0' },
  ]

  return (
    <main
      className="min-h-screen px-6 py-12"
      style={{ backgroundColor: 'var(--background)' }}
    >
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between mb-10"
        >
          <div>
            <p
              className="text-xs tracking-[0.25em] uppercase mb-2"
              style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
            >
              {profile?.name ?? 'Your'}&apos;s practice
            </p>
            <h1
              className="text-3xl font-medium"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}
            >
              The Quiet Log
            </h1>
          </div>
          <button
            onClick={handleSignOut}
            className="text-xs tracking-[0.15em] uppercase mt-1"
            style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
          >
            Sign out
          </button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3 mb-10"
        >
          {stats.map(({ label, value }) => (
            <div
              key={label}
              className="flex flex-col items-center py-5 px-3 rounded-2xl"
              style={{
                backgroundColor: 'var(--surface-2)',
                border: '1px solid var(--border)',
              }}
            >
              <span
                className="text-2xl font-medium mb-1"
                style={{ color: 'var(--accent)', fontFamily: 'var(--font-display)' }}
              >
                {value}
              </span>
              <span
                className="text-xs tracking-[0.1em] uppercase text-center"
                style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
              >
                {label}
              </span>
            </div>
          ))}
        </motion.div>

        {/* New session CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-10"
        >
          <Link
            href="/intake"
            className="block w-full py-4 text-center rounded-full text-sm tracking-[0.15em] uppercase transition-all"
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--background)',
              fontFamily: 'var(--font-body)',
            }}
          >
            Begin a new session
          </Link>
        </motion.div>

        {/* Session log */}
        {sessions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center py-16 flex flex-col items-center gap-4"
          >
            <p
              className="text-2xl italic"
              style={{ color: 'var(--foreground)', fontFamily: 'var(--font-display)' }}
            >
              Welcome{profile?.name ? `, ${profile.name}` : ''}.
            </p>
            <p
              className="text-sm leading-relaxed max-w-xs"
              style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
            >
              Your Quiet Log is ready. Every session you complete will be recorded here — your techniques, your states, your reflections.
            </p>
            <p
              className="text-sm italic mt-2"
              style={{ color: 'var(--muted)', fontFamily: 'var(--font-display)' }}
            >
              Begin when you&apos;re ready.
            </p>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-4">
            <p
              className="text-xs tracking-[0.2em] uppercase"
              style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
            >
              Sessions
            </p>
            {sessions.map((session, i) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.04 }}
                className="flex flex-col gap-3 p-5 rounded-2xl"
                style={{
                  backgroundColor: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                }}
              >
                {/* Top row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs px-2.5 py-1 rounded-full"
                      style={{
                        backgroundColor: 'rgba(42,181,197,0.10)',
                        color: 'var(--accent)',
                        fontFamily: 'var(--font-body)',
                        fontSize: '10px',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                      }}
                    >
                      {DOMAIN_LABELS[session.domain as Domain] ?? session.domain}
                    </span>
                    <span
                      className="text-xs"
                      style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
                    >
                      {TECHNIQUE_LABELS[session.technique as keyof typeof TECHNIQUE_LABELS] ??
                        session.technique}
                    </span>
                  </div>
                  <span
                    className="text-xs"
                    style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
                  >
                    {formatDate(session.completed_at)}
                  </span>
                </div>

                {/* State + duration */}
                <div className="flex items-center gap-3">
                  <span
                    className="text-xs"
                    style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
                  >
                    Walked in:{' '}
                    <span style={{ color: 'var(--foreground)' }}>
                      {STATE_LABELS[session.walking_in_state as keyof typeof STATE_LABELS] ??
                        session.walking_in_state}
                    </span>
                  </span>
                  <span style={{ color: 'var(--border)' }}>·</span>
                  <span
                    className="text-xs"
                    style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
                  >
                    {session.duration_minutes}m
                  </span>
                </div>

                {/* Echo */}
                <p
                  className="text-sm italic leading-relaxed"
                  style={{
                    color: 'var(--accent-soft)',
                    fontFamily: 'var(--font-display)',
                    borderTop: '1px solid var(--border)',
                    paddingTop: '12px',
                  }}
                >
                  &ldquo;{session.echo_text}&rdquo;
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
