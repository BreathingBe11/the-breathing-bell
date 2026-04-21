'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useSessionStore } from '@/store/sessionStore'
import { Session } from '@/types'

const DOMAIN_ARTICLE: Record<string, { slug: string; label: string }> = {
  body: { slug: 'how-breathwork-resets-your-nervous-system', label: 'How breathwork resets your nervous system' },
  business: { slug: 'breathwork-for-founders-and-executives', label: 'Breathwork for founders and executives' },
  belonging: { slug: 'breathwork-for-parents', label: 'Breathwork for parents' },
}

export default function EchoPage() {
  const router = useRouter()
  const { intake, _hasHydrated, setCurrentSession } = useSessionStore()
  const [echo, setEcho] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const bellRef = useRef<HTMLAudioElement | null>(null)

  // Start bell looping on mount, clean up on unmount
  useEffect(() => {
    const bell = new Audio('/audio/bell/bell.mp3')
    bell.loop = true
    bell.volume = 1
    bell.play().catch(() => {})
    bellRef.current = bell
    return () => {
      bell.pause()
      bell.src = ''
    }
  }, [])

  useEffect(() => {
    if (!_hasHydrated) return
    if (!intake.technique) {
      router.replace('/intake')
      return
    }

    async function fetchEcho() {
      try {
        const res = await fetch('/api/echo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: intake.name,
            domain: intake.domain,
            walkingInState: intake.walkingInState,
            technique: intake.technique,
            durationMinutes: intake.durationMinutes,
          }),
        })

        if (!res.ok) throw new Error('Failed to fetch echo')
        const data = await res.json()
        setEcho(data.echo)

        // Fade bell out over 2 seconds, starting 2 seconds after echo appears
        setTimeout(() => {
          const bell = bellRef.current
          if (!bell) return
          const steps = 40
          const interval = 2000 / steps
          let step = 0
          const fade = setInterval(() => {
            step++
            bell.volume = Math.max(0, 1 - step / steps)
            if (step >= steps) {
              clearInterval(fade)
              bell.pause()
            }
          }, interval)
        }, 2000)

        // Build session object for saving
        const session: Session = {
          id: crypto.randomUUID(),
          userId: null,
          name: intake.name!,
          ageRange: intake.ageRange!,
          technique: intake.technique!,
          domain: intake.domain!,
          walkingInState: intake.walkingInState!,
          durationMinutes: intake.durationMinutes!,
          echoText: data.echo,
          completedAt: new Date().toISOString(),
        }
        setCurrentSession(session)
      } catch {
        setError(true)
        setLoading(false)
      } finally {
        setLoading(false)
      }
    }

    fetchEcho()
  }, [_hasHydrated, intake, router, setCurrentSession])

  return (
    <main
      className="flex flex-col items-center justify-center min-h-screen px-6 text-center"
      style={{ backgroundColor: 'var(--background)' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(42,181,197,0.05) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-10 max-w-sm w-full">
        {/* Label */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="text-xs tracking-[0.25em] uppercase"
          style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
        >
          Your Echo
        </motion.p>

        {/* Echo text */}
        {loading ? (
          <motion.div
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center gap-3"
          >
            <div
              className="w-48 h-[2px] rounded-full"
              style={{ backgroundColor: 'var(--border)' }}
            />
            <div
              className="w-32 h-[2px] rounded-full"
              style={{ backgroundColor: 'var(--border)' }}
            />
            <div
              className="w-40 h-[2px] rounded-full"
              style={{ backgroundColor: 'var(--border)' }}
            />
            <p
              className="text-xs mt-4"
              style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
            >
              Listening...
            </p>
          </motion.div>
        ) : error ? (
          <p
            className="text-lg italic"
            style={{ color: 'var(--muted)', fontFamily: 'var(--font-display)' }}
          >
            You showed up. That is the practice.
          </p>
        ) : (
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="text-xl md:text-2xl italic leading-relaxed"
            style={{ color: 'var(--foreground)', fontFamily: 'var(--font-display)' }}
          >
            &ldquo;{echo}&rdquo;
          </motion.p>
        )}

        {/* Domain tag */}
        {!loading && intake.domain && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-xs tracking-[0.2em] uppercase"
            style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
          >
            {intake.domain} · {intake.technique}
          </motion.p>
        )}

        {/* CTA */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col gap-3 w-full"
          >
            <button
              onClick={() => router.push('/save')}
              className="w-full py-4 rounded-full text-sm tracking-[0.15em] uppercase transition-all"
              style={{
                backgroundColor: 'var(--accent)',
                color: 'var(--background)',
                fontFamily: 'var(--font-body)',
              }}
            >
              Save this session
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full py-3 text-sm tracking-[0.1em] uppercase"
              style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
            >
              Return home
            </button>
            {intake.domain && DOMAIN_ARTICLE[intake.domain] && (
              <Link
                href={`/learn/${DOMAIN_ARTICLE[intake.domain].slug}`}
                className="w-full py-3 text-xs text-center tracking-[0.1em]"
                style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
              >
                Want to go deeper?{' '}
                <span style={{ textDecoration: 'underline', textUnderlineOffset: '3px' }}>
                  {DOMAIN_ARTICLE[intake.domain].label} →
                </span>
              </Link>
            )}
          </motion.div>
        )}
      </div>
    </main>
  )
}
