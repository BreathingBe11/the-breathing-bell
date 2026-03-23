'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }

    fetch('/api/track-login', { method: 'POST' }).catch(() => {})
    router.push('/dashboard')
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
              Welcome back
            </p>
            <h2
              className="text-2xl font-medium"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}
            >
              Sign in to your account
            </h2>
          </div>

          <form onSubmit={handleSignIn} className="flex flex-col gap-4">
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
              {loading ? 'Signing in...' : 'Sign in'}
            </button>

            <Link
              href="/forgot-password"
              className="text-xs text-center"
              style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
            >
              Forgot your password?
            </Link>
          </form>

          <Link
            href="/"
            className="text-sm text-center"
            style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
          >
            ← Back to home
          </Link>
        </motion.div>
      </div>
    </main>
  )
}
