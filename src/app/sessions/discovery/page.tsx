'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

// Replace with your actual Calendly discovery call URL
const DISCOVERY_CALENDLY_URL = 'https://calendly.com/omitheintuitive/discoverycall'

export default function SessionsDiscoveryPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace('/sessions/signup')
        return
      }
      setLoading(false)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) return null

  return (
    <main
      className="flex flex-col items-center min-h-screen px-6 py-16"
      style={{ backgroundColor: 'var(--background)' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 30%, rgba(42,181,197,0.05) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 w-full max-w-2xl">

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center text-center gap-4 mb-12"
        >
          <p
            className="text-xs tracking-[0.25em] uppercase"
            style={{ color: 'var(--accent)', fontFamily: 'var(--font-body)' }}
          >
            You&apos;re in
          </p>
          <h1
            className="text-3xl font-medium leading-snug"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}
          >
            Book your free discovery call
          </h1>
          <p
            className="text-sm leading-relaxed max-w-sm"
            style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
          >
            This is a 20-minute call with Omi to talk about your goals and make sure
            the sessions are the right fit for you. No obligation.
          </p>
        </motion.div>

        {/* Calendly inline embed */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="w-full rounded-2xl overflow-hidden"
          style={{ border: '1px solid var(--border)' }}
        >
          <iframe
            src={`${DISCOVERY_CALENDLY_URL}?embed_type=Inline&hide_gdpr_banner=1&background_color=141820&text_color=e8e4dc&primary_color=2AB5C5`}
            width="100%"
            height="700"
            frameBorder="0"
            title="Book a discovery call with Omi Bell"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-col items-center gap-3 mt-8"
        >
          <p
            className="text-xs"
            style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
          >
            Already booked your call?
          </p>
          <Link
            href="/dashboard"
            className="text-xs tracking-[0.15em] uppercase"
            style={{ color: 'var(--muted)', textDecoration: 'underline', textUnderlineOffset: '3px', fontFamily: 'var(--font-body)' }}
          >
            Go to my dashboard →
          </Link>
        </motion.div>

      </div>
    </main>
  )
}
