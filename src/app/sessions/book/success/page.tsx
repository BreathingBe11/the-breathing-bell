'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

// Paid session Calendly link — update if different from discovery call
const PAID_SESSION_CALENDLY_URL = 'https://calendly.com/omitheintuitive/discoverycall'

export default function BookSuccessPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.replace('/login?next=/sessions/book')
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
            'radial-gradient(ellipse 60% 40% at 50% 20%, rgba(42,181,197,0.06) 0%, transparent 70%)',
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
            Payment confirmed
          </p>
          <h1
            className="text-3xl font-medium leading-snug"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}
          >
            Now pick your time
          </h1>
          <p
            className="text-sm leading-relaxed max-w-sm"
            style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
          >
            Your session credits have been added to your account. Choose a time
            that works for you below.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="w-full rounded-2xl overflow-hidden"
          style={{ border: '1px solid var(--border)' }}
        >
          <iframe
            src={`${PAID_SESSION_CALENDLY_URL}?embed_type=Inline&hide_gdpr_banner=1&background_color=141820&text_color=e8e4dc&primary_color=2AB5C5`}
            width="100%"
            height="700"
            frameBorder="0"
            title="Book your session with Omi Bell"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex justify-center mt-8"
        >
          <Link
            href="/dashboard"
            className="text-xs tracking-[0.15em] uppercase"
            style={{ color: 'var(--muted)', textDecoration: 'underline', textUnderlineOffset: '3px', fontFamily: 'var(--font-body)' }}
          >
            View my dashboard →
          </Link>
        </motion.div>

      </div>
    </main>
  )
}
