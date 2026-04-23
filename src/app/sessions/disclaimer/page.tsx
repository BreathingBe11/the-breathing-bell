'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SessionsDisclaimerPage() {
  const router = useRouter()
  const supabase = createClient()
  const [agreedHealth, setAgreedHealth] = useState(false)
  const [agreedTerms, setAgreedTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saveError, setSaveError] = useState('')

  async function handleContinue() {
    setLoading(true)
    setSaveError('')
    sessionStorage.setItem('tbb_terms_accepted', '1')

    // If already signed in, save intake + terms now and go straight to booking
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      const goals: string[] = JSON.parse(sessionStorage.getItem('tbb_intake_goals') ?? '[]')
      const healthFlags: string[] = JSON.parse(sessionStorage.getItem('tbb_intake_health') ?? '[]')

      const res = await fetch('/api/sessions/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session.user.id, email: session.user.email, goals, healthFlags }),
      })

      if (!res.ok) {
        setSaveError('Something went wrong saving your agreement. Please try again.')
        setLoading(false)
        return
      }

      sessionStorage.removeItem('tbb_terms_accepted')
      sessionStorage.removeItem('tbb_intake_goals')
      sessionStorage.removeItem('tbb_intake_health')

      router.push('/sessions/book')
      return
    }

    // Not signed in — go to signup to create an account
    router.push('/sessions/signup')
  }

  return (
    <main
      className="flex flex-col items-center min-h-screen px-6 py-16"
      style={{ backgroundColor: 'var(--background)' }}
    >
      <div className="w-full max-w-2xl">

        <Link
          href="/sessions/intake"
          className="text-xs tracking-[0.2em] uppercase mb-10 inline-block"
          style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
        >
          ← Back
        </Link>

        <p
          className="text-xs tracking-[0.2em] uppercase mb-4"
          style={{ color: 'var(--accent)', fontFamily: 'var(--font-body)' }}
        >
          Before we continue
        </p>

        <h1
          className="text-3xl font-medium mb-10 leading-snug"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}
        >
          Health Disclaimer &amp; Terms of Service
        </h1>

        <div className="mb-10" style={{ borderTop: '1px solid var(--border)' }} />

        {/* Disclaimer copy — placeholder for Omi/lawyer to edit */}
        <div
          className="flex flex-col gap-6 mb-12"
          style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)', fontSize: '0.9rem', lineHeight: '1.75' }}
        >
          <section>
            <h2
              className="text-base font-medium mb-2"
              style={{ color: 'var(--foreground)', fontFamily: 'var(--font-body)' }}
            >
              Health Disclaimer
            </h2>
            <p>
              The breathwork and wellness sessions provided by Omi Bell through The Breathing Bell
              are intended for general wellbeing purposes only. They do not constitute medical advice,
              diagnosis, or treatment. Breathwork is not a substitute for professional medical care.
            </p>
            <p className="mt-3">
              If you have any pre-existing medical conditions — including but not limited to
              cardiovascular conditions, epilepsy, pregnancy, severe anxiety disorders, PTSD,
              or respiratory conditions — please consult your physician before participating.
            </p>
            <p className="mt-3">
              By proceeding, you acknowledge that you are voluntarily participating in breathwork
              sessions and assume full responsibility for your physical and emotional wellbeing
              during and after each session.
            </p>
          </section>

          <section>
            <h2
              className="text-base font-medium mb-2"
              style={{ color: 'var(--foreground)', fontFamily: 'var(--font-body)' }}
            >
              Terms of Service
            </h2>
            <p>
              <strong style={{ color: 'var(--foreground)' }}>Sessions &amp; Booking.</strong>{' '}
              Sessions are booked subject to availability. Once booked, sessions are
              non-refundable unless cancelled at least 24 hours in advance. Omi Bell reserves the
              right to reschedule a session with reasonable notice.
            </p>
            <p className="mt-3">
              <strong style={{ color: 'var(--foreground)' }}>Packages &amp; Credits.</strong>{' '}
              Session packages expire 12 months from the date of purchase. Credits are
              non-transferable and have no cash value. No refunds are issued for unused credits
              after the expiry date.
            </p>
            <p className="mt-3">
              <strong style={{ color: 'var(--foreground)' }}>Privacy.</strong>{' '}
              Your session data, intake responses, and account information are stored securely
              and are never shared with third parties without your consent.
            </p>
            <p className="mt-3">
              <strong style={{ color: 'var(--foreground)' }}>Governing Law.</strong>{' '}
              These terms are governed by the laws of the applicable jurisdiction.
              Any disputes shall be resolved through good-faith negotiation.
            </p>

          </section>
        </div>

        {/* Checkboxes */}
        <div className="flex flex-col gap-4 mb-8">
          <motion.button
            onClick={() => setAgreedHealth(!agreedHealth)}
            className="flex items-start gap-3 text-left"
          >
            <span
              className="mt-0.5 w-5 h-5 rounded flex-shrink-0 flex items-center justify-center"
              style={{
                border: `1.5px solid ${agreedHealth ? 'var(--accent)' : 'var(--muted)'}`,
                backgroundColor: agreedHealth ? 'var(--accent)' : 'transparent',
                color: 'var(--background)',
                fontSize: '0.7rem',
              }}
            >
              {agreedHealth && '✓'}
            </span>
            <span
              className="text-sm leading-relaxed"
              style={{ color: 'var(--foreground)', fontFamily: 'var(--font-body)' }}
            >
              I understand that breathwork sessions are not medical advice and are not a
              substitute for professional medical care. I take full responsibility for my
              participation.
            </span>
          </motion.button>

          <motion.button
            onClick={() => setAgreedTerms(!agreedTerms)}
            className="flex items-start gap-3 text-left"
          >
            <span
              className="mt-0.5 w-5 h-5 rounded flex-shrink-0 flex items-center justify-center"
              style={{
                border: `1.5px solid ${agreedTerms ? 'var(--accent)' : 'var(--muted)'}`,
                backgroundColor: agreedTerms ? 'var(--accent)' : 'transparent',
                color: 'var(--background)',
                fontSize: '0.7rem',
              }}
            >
              {agreedTerms && '✓'}
            </span>
            <span
              className="text-sm leading-relaxed"
              style={{ color: 'var(--foreground)', fontFamily: 'var(--font-body)' }}
            >
              I agree to the Terms of Service, including the booking and cancellation policy.
            </span>
          </motion.button>
        </div>

        {saveError && (
          <p className="text-sm text-red-400 mb-4" style={{ fontFamily: 'var(--font-body)' }}>
            {saveError}
          </p>
        )}

        <button
          onClick={handleContinue}
          disabled={!agreedHealth || !agreedTerms || loading}
          className="w-full py-4 rounded-full text-sm tracking-[0.15em] uppercase transition-all"
          style={{
            backgroundColor: 'var(--accent)',
            color: 'var(--background)',
            fontFamily: 'var(--font-body)',
            opacity: agreedHealth && agreedTerms && !loading ? 1 : 0.4,
          }}
        >
          {loading ? 'Saving...' : 'I agree — continue'}
        </button>

      </div>
    </main>
  )
}
