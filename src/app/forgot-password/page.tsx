'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSent(true)
  }

  if (sent) {
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
          <p className="text-3xl" style={{ color: 'var(--accent)' }}>✉</p>
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
            We sent a password reset link to{' '}
            <span style={{ color: 'var(--foreground)' }}>{email}</span>.
            Click the link to set a new password.
          </p>
          <Link
            href="/login"
            className="text-sm"
            style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)', textDecoration: 'underline', textUnderlineOffset: '3px' }}
          >
            Back to sign in
          </Link>
        </motion.div>
      </main>
    )
  }

  return (
    <main
      className="flex flex-col items-center justify-center min-h-screen px-6"
      style={{ backgroundColor: '#141820' }}
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
              Reset your password
            </p>
            <h2
              className="text-2xl font-medium"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}
            >
              Forgot your password?
            </h2>
            <p
              className="text-sm mt-2"
              style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
            >
              Enter your email and we&apos;ll send you a reset link.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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

            {error && (
              <p className="text-sm text-red-400" style={{ fontFamily: 'var(--font-body)' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-full text-sm tracking-[0.15em] uppercase mt-2"
              style={{
                backgroundColor: 'var(--accent)',
                color: '#141820',
                fontFamily: 'var(--font-body)',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Sending...' : 'Send reset link'}
            </button>
          </form>

          <Link
            href="/login"
            className="text-sm text-center"
            style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
          >
            ← Back to sign in
          </Link>
        </motion.div>
      </div>
    </main>
  )
}
