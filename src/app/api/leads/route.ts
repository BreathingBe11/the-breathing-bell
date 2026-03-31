import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

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

  const { error } = await supabase
    .from('leads')
    .insert({ name: name.trim(), email: email.toLowerCase().trim(), age_range })

  if (error) {
    // Duplicate email — lead already captured, treat as success
    if (error.code === '23505') {
      return NextResponse.json({ ok: true })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Enroll in lead drip sequence (fire and forget)
  const cleanName = name.trim()
  const cleanEmail = email.toLowerCase().trim()
  const admin = createAdminClient()
  const now = Date.now()
  admin.from('email_drip_queue').insert([
    { email: cleanEmail, name: cleanName, sequence_type: 'lead', step: 1, send_at: new Date(now).toISOString() },
    { email: cleanEmail, name: cleanName, sequence_type: 'lead', step: 2, send_at: new Date(now + 2 * 24 * 60 * 60 * 1000).toISOString() },
    { email: cleanEmail, name: cleanName, sequence_type: 'lead', step: 3, send_at: new Date(now + 5 * 24 * 60 * 60 * 1000).toISOString() },
  ]).then(() => {}).catch(() => {})

  return NextResponse.json({ ok: true })
}
