import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json()
    const { event, payload: data } = payload

    if (!event || !data) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const admin = createAdminClient()

    if (event === 'invitee.created') {
      const email = data.email as string
      const eventUri = data.event as string
      const startTime = data.scheduled_event?.start_time as string | undefined
      const eventName = data.scheduled_event?.name as string | undefined
      const cancelUrl = data.cancel_url as string | undefined
      const rescheduleUrl = data.reschedule_url as string | undefined

      // Determine session type from event name
      let sessionType = '1:1'
      if (eventName) {
        const lower = eventName.toLowerCase()
        if (lower.includes('30')) sessionType = '30-min'
        else if (lower.includes('60') || lower.includes('hour')) sessionType = '60-min'
        else if (lower.includes('discovery')) sessionType = 'discovery'
        else if (lower.includes('group')) sessionType = 'group'
      }

      // Look up user by email
      const { data: users } = await admin.auth.admin.listUsers()
      const user = users?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase())

      if (!user) {
        // Client doesn't have an account yet — store with email only
        await admin.from('bookings').insert({
          user_id: null,
          session_type: sessionType,
          calendly_event_id: eventUri,
          scheduled_at: startTime ?? null,
          cancel_url: cancelUrl ?? null,
          reschedule_url: rescheduleUrl ?? null,
          invitee_email: email,
        })
      } else {
        await admin.from('bookings').insert({
          user_id: user.id,
          session_type: sessionType,
          calendly_event_id: eventUri,
          scheduled_at: startTime ?? null,
          cancel_url: cancelUrl ?? null,
          reschedule_url: rescheduleUrl ?? null,
          invitee_email: email,
        })
      }
    }

    if (event === 'invitee.canceled') {
      const eventUri = data.event as string

      await admin
        .from('bookings')
        .update({ canceled_at: new Date().toISOString() })
        .eq('calendly_event_id', eventUri)
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Calendly webhook error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
