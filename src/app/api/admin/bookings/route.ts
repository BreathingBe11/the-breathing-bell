import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/admin'

async function isAuthorized(): Promise<boolean> {
  const token = (await cookies()).get('tbb_admin_token')?.value
  return token === process.env.ADMIN_PASSWORD
}

export async function GET() {
  if (!await isAuthorized()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()

  const { data: bookings } = await admin
    .from('bookings')
    .select('*')
    .order('scheduled_at', { ascending: false })

  if (!bookings?.length) return NextResponse.json([])

  // Enrich with email from auth.users
  const { data: { users } } = await admin.auth.admin.listUsers({ perPage: 1000 })

  const enriched = bookings.map(b => {
    const user = b.user_id ? users.find(u => u.id === b.user_id) : null
    return {
      ...b,
      email: user?.email ?? b.invitee_email ?? '—',
      memberName: user ? undefined : undefined, // will come from profiles below
    }
  })

  // Get profile names
  const userIds = bookings.map(b => b.user_id).filter(Boolean)
  const { data: profiles } = userIds.length
    ? await admin.from('profiles').select('id, name').in('id', userIds)
    : { data: [] }

  const final = enriched.map(b => ({
    ...b,
    clientName: profiles?.find(p => p.id === b.user_id)?.name ?? b.invitee_email ?? '—',
  }))

  return NextResponse.json(final)
}

export async function PATCH(req: NextRequest) {
  if (!await isAuthorized()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id, omi_notes, approved_user_id } = await req.json()
  const admin = createAdminClient()

  if (approved_user_id) {
    // Approve a client for sessions
    await admin
      .from('profiles')
      .update({ approved_for_sessions: true })
      .eq('id', approved_user_id)
    return NextResponse.json({ ok: true })
  }

  if (id && omi_notes !== undefined) {
    await admin
      .from('bookings')
      .update({ omi_notes })
      .eq('id', id)
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
}
