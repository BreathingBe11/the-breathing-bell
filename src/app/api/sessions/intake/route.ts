import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const { userId, email, goals, healthFlags } = await req.json()

    if (!email || !Array.isArray(goals) || !Array.isArray(healthFlags)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const admin = createAdminClient()
    await admin.from('client_intake').insert({
      user_id: userId ?? null,
      email,
      goals,
      health_flags: healthFlags,
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
