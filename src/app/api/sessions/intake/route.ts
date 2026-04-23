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
      const now = new Date().toISOString()

      // .update() returns no error when zero rows are matched, so use .select() to verify
      const { data: updated, error: updateError } = await admin
        .from('profiles')
        .update({ terms_accepted_at: now })
        .eq('id', userId)
        .select('id')

      if (updateError) {
        console.error('Failed to update terms_accepted_at:', updateError)
        return NextResponse.json({ error: 'Failed to save terms acceptance' }, { status: 500 })
      }

      // If no row was updated, the profile doesn't exist yet — create a minimal one
      if (!updated || updated.length === 0) {
        const { error: insertError } = await admin.from('profiles').insert({
          id: userId,
          name: email.split('@')[0],
          age_range: '18-29',
          subscription_tier: 'free',
          referral_source: 'sessions-page',
          terms_accepted_at: now,
        })
        if (insertError) {
          console.error('Failed to create profile for terms:', insertError)
          return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
        }
      }
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
