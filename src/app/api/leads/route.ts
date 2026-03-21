import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory rate limiter: max 5 requests per IP per 10 minutes
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const LIMIT = 5
const WINDOW_MS = 10 * 60 * 1000

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return false
  }

  if (entry.count >= LIMIT) return true

  entry.count++
  return false
}

const VALID_AGE_RANGES = ['18-29', '30-39', '40-49', '50-59', '60+']
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'

  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const body = await req.json()
  const { name, email, age_range } = body

  // Validate presence
  if (!name || !email || !age_range) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  // Validate types and lengths
  if (
    typeof name !== 'string' || name.trim().length < 1 || name.trim().length > 100 ||
    typeof email !== 'string' || !EMAIL_REGEX.test(email) || email.length > 254 ||
    !VALID_AGE_RANGES.includes(age_range)
  ) {
    return NextResponse.json({ error: 'Invalid fields' }, { status: 400 })
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('leads')
    .upsert(
      { name: name.trim(), email: email.toLowerCase().trim(), age_range },
      { onConflict: 'email' }
    )

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
