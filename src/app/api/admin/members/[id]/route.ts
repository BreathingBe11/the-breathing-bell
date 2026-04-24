import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/admin'

async function isAuthorized(): Promise<boolean> {
  const token = (await cookies()).get('tbb_admin_token')?.value
  return token === process.env.ADMIN_PASSWORD
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await isAuthorized()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const admin = createAdminClient()

  const [
    { data: { user } },
    { data: profile },
    { data: intake },
    { data: appSessions },
    { data: bookings },
    { data: notes },
  ] = await Promise.all([
    admin.auth.admin.getUserById(id),
    admin.from('profiles').select('*').eq('id', id).single(),
    admin.from('client_intake').select('*').eq('user_id', id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    admin.from('sessions').select('id, technique, domain, duration_minutes, completed_at').eq('user_id', id).order('completed_at', { ascending: false }),
    admin.from('bookings').select('*').eq('user_id', id).order('scheduled_at', { ascending: false }),
    admin.from('session_notes').select('*').eq('user_id', id).order('session_date', { ascending: false }),
  ])

  return NextResponse.json({
    user: {
      email: user?.email ?? '—',
      createdAt: user?.created_at ?? null,
      lastSignIn: user?.last_sign_in_at ?? null,
    },
    profile,
    intake,
    appSessions: appSessions ?? [],
    bookings: bookings ?? [],
    notes: notes ?? [],
  })
}
