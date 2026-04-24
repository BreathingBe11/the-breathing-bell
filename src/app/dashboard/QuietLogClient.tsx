'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Domain, DOMAIN_LABELS, TECHNIQUE_LABELS, STATE_LABELS, TIME_UNLOCK_THRESHOLDS } from '@/types'
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

interface BookingRow {
  id: string
  session_type: string
  scheduled_at: string | null
  omi_notes: string | null
  reschedule_url: string | null
  cancel_url: string | null
}

interface ProfileRow {
  name: string
  subscription_tier: string
}

interface NoteRow {
  id: string
  session_date: string
  content: string
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
  while (sessionDates.has(checkDate.toDateString())) {
    streak++
    checkDate.setDate(checkDate.getDate() - 1)
  }
  return streak
}

function getTopDomain(sessions: SessionRow[]): Domain | null {
  if (!sessions.length) return null
  const counts: Record<string, number> = {}
  sessions.forEach((s) => { counts[s.domain] = (counts[s.domain] || 0) + 1 })
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0] as Domain
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  })
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
  })
}

function sessionTypeLabel(type: string): string {
  if (type === 'discovery') return 'Discovery Call'
  if (type === '60-min') return '60-Min Session'
  if (type === '30-min') return '30-Min Session'
  if (type === 'group') return 'Group Session'
  return type
}

export default function QuietLogClient({
  sessions,
  profile,
  bookings,
  notes,
}: {
  sessions: SessionRow[]
  profile: ProfileRow | null
  bookings: BookingRow[]
  notes: NoteRow[]
}) {
  const router = useRouter()
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState<'app' | 'live'>('app')

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  const streak = calculateStreak(sessions)
  const topDomain = getTopDomain(sessions)
  const totalSessions = sessions.length

  const now = new Date()
  const upcoming = bookings.filter(b => b.scheduled_at && new Date(b.scheduled_at) > now)
  const past = bookings.filter(b => b.scheduled_at && new Date(b.scheduled_at) <= now)

  const stats = [
    { label: 'App Sessions', value: totalSessions.toString() },
    { label: 'Top Domain', value: topDomain ? DOMAIN_LABELS[topDomain] : '—' },
    { label: 'Day Streak', value: streak > 0 ? `${streak}` : '0' },
  ]

  const nextUnlock = TIME_UNLOCK_THRESHOLDS.find(t => totalSessions < t.sessions)
  const prevUnlock = nextUnlock
    ? TIME_UNLOCK_THRESHOLDS.filter(t => totalSessions >= t.sessions).slice(-1)[0]
    : null
  const unlockProgress = nextUnlock && prevUnlock
    ? ((totalSessions - prevUnlock.sessions) / (nextUnlock.sessions - prevUnlock.sessions)) * 100
    : 100

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
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/BBLogo2.svg" alt="The Breathing Bell" style={{ width: 48, height: 'auto' }} />
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
              style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)' }}
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

        {/* Unlock progress */}
        {nextUnlock && activeTab === 'app' && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-8 flex flex-col gap-2"
          >
            <p
              className="text-xs italic"
              style={{ color: 'var(--muted)', fontFamily: 'var(--font-display)' }}
            >
              ✦ {nextUnlock.sessions - totalSessions === 1
                ? `One more session unlocks ${nextUnlock.minutes} minutes.`
                : `${nextUnlock.sessions - totalSessions} more sessions unlock ${nextUnlock.minutes} minutes.`} Keep showing up.
            </p>
            <div
              className="h-[2px] w-full rounded-full overflow-hidden"
              style={{ backgroundColor: 'var(--border)' }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: 'var(--accent)' }}
                initial={{ width: 0 }}
                animate={{ width: `${unlockProgress}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
              />
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex gap-6 mb-8 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          {[
            { key: 'app', label: 'App Sessions' },
            { key: 'live', label: 'Live Sessions' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as 'app' | 'live')}
              className="pb-3 text-xs tracking-[0.15em] uppercase transition-all relative"
              style={{
                color: activeTab === tab.key ? 'var(--foreground)' : 'var(--muted)',
                fontFamily: 'var(--font-body)',
              }}
            >
              {tab.label}
              {activeTab === tab.key && (
                <motion.div
                  layoutId="tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-[1.5px]"
                  style={{ backgroundColor: 'var(--accent)' }}
                />
              )}
            </button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">

          {/* App Sessions tab */}
          {activeTab === 'app' && (
            <motion.div
              key="app"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {/* New session CTA */}
              <div className="mb-8">
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
              </div>

              {sessions.length === 0 ? (
                <div className="text-center py-16 flex flex-col items-center gap-4">
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
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {sessions.map((session, i) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex flex-col gap-3 p-5 rounded-2xl"
                      style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)' }}
                    >
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
                            {TECHNIQUE_LABELS[session.technique as keyof typeof TECHNIQUE_LABELS] ?? session.technique}
                          </span>
                        </div>
                        <span
                          className="text-xs"
                          style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
                        >
                          {formatDate(session.completed_at)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className="text-xs"
                          style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
                        >
                          Walked in:{' '}
                          <span style={{ color: 'var(--foreground)' }}>
                            {STATE_LABELS[session.walking_in_state as keyof typeof STATE_LABELS] ?? session.walking_in_state}
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
            </motion.div>
          )}

          {/* Live Sessions tab */}
          {activeTab === 'live' && (
            <motion.div
              key="live"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col gap-8"
            >
              {/* Book CTA */}
              <div className="flex flex-col gap-3">
                <Link
                  href="/sessions/book"
                  className="block w-full py-4 text-center rounded-full text-sm tracking-[0.15em] uppercase transition-all"
                  style={{
                    backgroundColor: 'var(--accent)',
                    color: 'var(--background)',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  Book a live session with Omi
                </Link>
                <p
                  className="text-xs text-center leading-relaxed"
                  style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
                >
                  Available for breathwork, sound healing, and yoga nidra — 30 or 60 minutes.
                </p>
              </div>

              {/* Upcoming */}
              {upcoming.length > 0 && (
                <div className="flex flex-col gap-3">
                  <p
                    className="text-xs tracking-[0.2em] uppercase"
                    style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
                  >
                    Upcoming
                  </p>
                  {upcoming.map((booking, i) => (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex flex-col gap-3 p-5 rounded-2xl"
                      style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)' }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex flex-col gap-1">
                          <span
                            className="text-base font-medium"
                            style={{ color: 'var(--foreground)', fontFamily: 'var(--font-display)' }}
                          >
                            {sessionTypeLabel(booking.session_type)}
                          </span>
                          {booking.scheduled_at && (
                            <span
                              className="text-sm"
                              style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
                            >
                              {formatDate(booking.scheduled_at)} · {formatTime(booking.scheduled_at)}
                            </span>
                          )}
                        </div>
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
                          Upcoming
                        </span>
                      </div>
                      {booking.reschedule_url && (
                        <a
                          href={booking.reschedule_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs tracking-[0.1em] uppercase"
                          style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)', textDecoration: 'underline', textUnderlineOffset: '3px' }}
                        >
                          Reschedule →
                        </a>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Past sessions */}
              {past.length > 0 && (
                <div className="flex flex-col gap-3">
                  <p
                    className="text-xs tracking-[0.2em] uppercase"
                    style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
                  >
                    Past sessions
                  </p>
                  {past.map((booking, i) => (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex flex-col gap-3 p-5 rounded-2xl"
                      style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)' }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex flex-col gap-1">
                          <span
                            className="text-base font-medium"
                            style={{ color: 'var(--foreground)', fontFamily: 'var(--font-display)' }}
                          >
                            {sessionTypeLabel(booking.session_type)}
                          </span>
                          {booking.scheduled_at && (
                            <span
                              className="text-sm"
                              style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
                            >
                              {formatDate(booking.scheduled_at)}
                            </span>
                          )}
                        </div>
                      </div>
                      {booking.omi_notes && (
                        <p
                          className="text-sm italic leading-relaxed"
                          style={{
                            color: 'var(--accent-soft)',
                            fontFamily: 'var(--font-display)',
                            borderTop: '1px solid var(--border)',
                            paddingTop: '12px',
                          }}
                        >
                          &ldquo;{booking.omi_notes}&rdquo;
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Notes from Omi */}
              {notes.length > 0 && (
                <div className="flex flex-col gap-3">
                  <p
                    className="text-xs tracking-[0.2em] uppercase"
                    style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
                  >
                    Notes from Omi
                  </p>
                  {notes.map((note, i) => (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex flex-col gap-3 p-5 rounded-2xl"
                      style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)' }}
                    >
                      <p
                        className="text-xs tracking-[0.1em] uppercase"
                        style={{ color: 'var(--accent)', fontFamily: 'var(--font-body)' }}
                      >
                        {new Date(note.session_date + 'T00:00:00').toLocaleDateString('en-US', {
                          weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
                        })}
                      </p>
                      <p
                        className="text-sm leading-relaxed"
                        style={{ color: 'var(--foreground)', fontFamily: 'var(--font-body)', whiteSpace: 'pre-wrap' }}
                      >
                        {note.content}
                      </p>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Empty state */}
              {bookings.length === 0 && notes.length === 0 && (
                <div className="text-center py-16 flex flex-col items-center gap-4">
                  <p
                    className="text-2xl italic"
                    style={{ color: 'var(--foreground)', fontFamily: 'var(--font-display)' }}
                  >
                    No sessions yet.
                  </p>
                  <p
                    className="text-sm leading-relaxed max-w-xs"
                    style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
                  >
                    Book a live session with Omi — 1:1 or group, in-person or virtual.
                  </p>
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </main>
  )
}
