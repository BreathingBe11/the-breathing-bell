'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

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
              Almost there
            </p>
            <h2
              className="text-2xl font-medium"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}
            >
              Set a new password
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
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
              placeholder="Confirm new password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={8}
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
              {loading ? 'Saving...' : 'Save new password'}
            </button>
          </form>
        </motion.div>
      </div>
    </main>
  )
}
