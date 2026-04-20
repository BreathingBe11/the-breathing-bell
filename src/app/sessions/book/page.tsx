'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { PRODUCTS, ProductKey } from '@/lib/stripe'

type Credits = { credits_total: number; credits_used: number }

export default function SessionsBookPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [approved, setApproved] = useState(false)
  const [creditsRemaining, setCreditsRemaining] = useState(0)
  const [purchasing, setPurchasing] = useState<ProductKey | null>(null)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/login?next=/sessions/book')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('approved_for_sessions')
        .eq('id', user.id)
        .single()

      setApproved(profile?.approved_for_sessions ?? false)

      const { data: credits } = await supabase
        .from('session_credits')
        .select('credits_total, credits_used')
        .eq('user_id', user.id)

      if (credits) {
        const remaining = (credits as Credits[]).reduce(
          (sum, c) => sum + c.credits_total - c.credits_used,
          0
        )
        setCreditsRemaining(remaining)
      }

      setLoading(false)
    }

    init()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handlePurchase(productKey: ProductKey) {
    setPurchasing(productKey)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productKey }),
      })
      const { url, error } = await res.json()
      if (error || !url) {
        setPurchasing(null)
        return
      }
      window.location.href = url
    } catch {
      setPurchasing(null)
    }
  }

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
            'radial-gradient(ellipse 60% 40% at 50% 20%, rgba(42,181,197,0.05) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 w-full max-w-2xl">

        <Link
          href="/sessions"
          className="text-xs tracking-[0.2em] uppercase mb-10 inline-block"
          style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
        >
          ← Omi Sessions
        </Link>

        {!approved ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center text-center gap-6 py-20"
          >
            <p
              className="text-xs tracking-[0.2em] uppercase"
              style={{ color: 'var(--accent)', fontFamily: 'var(--font-body)' }}
            >
              Almost there
            </p>
            <h1
              className="text-3xl font-medium leading-snug"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}
            >
              Your discovery call is pending
            </h1>
            <p
              className="text-sm leading-relaxed max-w-sm"
              style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
            >
              Once you&apos;ve completed your discovery call, Omi will confirm your access
              and you&apos;ll be able to book sessions here.
            </p>
            <Link
              href="/sessions/discovery"
              className="px-8 py-3 rounded-full text-sm tracking-[0.15em] uppercase"
              style={{
                backgroundColor: 'var(--accent)',
                color: 'var(--background)',
                fontFamily: 'var(--font-body)',
              }}
            >
              Book my discovery call
            </Link>
          </motion.div>
        ) : creditsRemaining > 0 ? (
          // Has credits — show Calendly directly
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col gap-8"
          >
            <div className="flex flex-col gap-2">
              <p
                className="text-xs tracking-[0.2em] uppercase"
                style={{ color: 'var(--accent)', fontFamily: 'var(--font-body)' }}
              >
                {creditsRemaining} session{creditsRemaining !== 1 ? 's' : ''} remaining
              </p>
              <h1
                className="text-3xl font-medium leading-snug"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}
              >
                Pick your time
              </h1>
            </div>

            <div
              className="w-full rounded-2xl overflow-hidden"
              style={{ border: '1px solid var(--border)' }}
            >
              <iframe
                src="https://calendly.com/omitheintuitive/discoverycall?embed_type=Inline&hide_gdpr_banner=1&background_color=141820&text_color=e8e4dc&primary_color=2AB5C5"
                width="100%"
                height="700"
                frameBorder="0"
                title="Book your session with Omi Bell"
              />
            </div>
          </motion.div>
        ) : (
          // No credits — show pricing
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col gap-10"
          >
            <div className="flex flex-col gap-2">
              <p
                className="text-xs tracking-[0.2em] uppercase"
                style={{ color: 'var(--accent)', fontFamily: 'var(--font-body)' }}
              >
                Ready to begin
              </p>
              <h1
                className="text-3xl font-medium leading-snug"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}
              >
                Choose your sessions
              </h1>
              <p
                className="text-sm"
                style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
              >
                All sessions are 60 minutes with Omi Bell.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {(Object.entries(PRODUCTS) as [ProductKey, typeof PRODUCTS[ProductKey]][]).map(
                ([key, product]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between px-6 py-5 rounded-xl"
                    style={{
                      backgroundColor: 'var(--surface-2)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <div className="flex flex-col gap-1">
                      <span
                        className="text-base font-medium"
                        style={{ color: 'var(--foreground)', fontFamily: 'var(--font-display)' }}
                      >
                        {product.label}
                      </span>
                      <span
                        className="text-sm"
                        style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
                      >
                        {product.description}
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-2 ml-4 flex-shrink-0">
                      <span
                        className="text-lg font-medium"
                        style={{ color: 'var(--foreground)', fontFamily: 'var(--font-display)' }}
                      >
                        ${(product.price / 100).toLocaleString()}
                        {product.mode === 'subscription' && (
                          <span
                            className="text-sm font-normal"
                            style={{ color: 'var(--muted)' }}
                          >
                            /mo
                          </span>
                        )}
                      </span>
                      <button
                        onClick={() => handlePurchase(key)}
                        disabled={purchasing !== null}
                        className="px-5 py-2 rounded-full text-xs tracking-[0.15em] uppercase transition-all"
                        style={{
                          backgroundColor: 'var(--accent)',
                          color: 'var(--background)',
                          fontFamily: 'var(--font-body)',
                          opacity: purchasing !== null ? 0.6 : 1,
                        }}
                      >
                        {purchasing === key ? 'Loading...' : 'Select'}
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          </motion.div>
        )}

      </div>
    </main>
  )
}
