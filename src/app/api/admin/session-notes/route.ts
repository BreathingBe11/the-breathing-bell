import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/admin'

async function isAuthorized(): Promise<boolean> {
  const token = (await cookies()).get('tbb_admin_token')?.value
  return token === process.env.ADMIN_PASSWORD
}

export async function POST(req: NextRequest) {
  if (!await isAuthorized()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { userId, sessionDate, content } = await req.json()

  if (!userId || !content?.trim()) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('session_notes')
    .insert({
      user_id: userId,
      session_date: sessionDate || new Date().toISOString().split('T')[0],
      content: content.trim(),
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
