import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const { userId, email, goals, healthFlags } = await req.json()

    if (!email || !Array.isArray(goals) || !Array.isArray(healthFlags)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const admin = createAdminClient()

    // Save intake answers (ignore duplicates — terms update must still succeed)
    await admin.from('client_intake').insert({
      user_id: userId ?? null,
      email,
      goals,
      health_flags: healthFlags,
    })

    // Always stamp terms_accepted_at if we have a userId — this is the critical step
    if (userId) {
      const { error: updateError } = await admin
        .from('profiles')
        .update({ terms_accepted_at: new Date().toISOString() })
        .eq('id', userId)

      if (updateError) {
        console.error('Failed to update terms_accepted_at:', updateError)
        return NextResponse.json({ error: 'Failed to save terms acceptance' }, { status: 500 })
      }
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
