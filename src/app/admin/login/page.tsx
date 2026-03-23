'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      router.push('/admin/dashboard')
    } else {
      setError('Incorrect password.')
      setLoading(false)
    }
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6" style={{ backgroundColor: '#0d1117' }}>
      <div className="w-full max-w-xs flex flex-col gap-6">
        <div>
          <p className="text-xs tracking-[0.25em] uppercase mb-2" style={{ color: '#7a8a99', fontFamily: 'monospace' }}>
            The Breathing Bell
          </p>
          <h1 className="text-2xl font-semibold" style={{ color: '#e8e2d9', fontFamily: 'monospace' }}>
            Admin
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            required
            className="w-full px-4 py-3 rounded-lg text-sm outline-none"
            style={{
              backgroundColor: '#1a2030',
              border: '1px solid #2a3040',
              color: '#e8e2d9',
              fontFamily: 'monospace',
            }}
          />
          {error && (
            <p className="text-xs text-red-400" style={{ fontFamily: 'monospace' }}>{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg text-sm font-medium"
            style={{
              backgroundColor: '#2ab5c5',
              color: '#0d1117',
              fontFamily: 'monospace',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </main>
  )
}
