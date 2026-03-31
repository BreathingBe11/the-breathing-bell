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
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('email_templates')
    .select('id, name, subject, body')
    .order('id')
  return NextResponse.json(data ?? [])
}

export async function PATCH(req: NextRequest) {
  if (!await isAuthorized()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id, subject, body } = await req.json()
  if (!id || !subject || !body) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('email_templates')
    .update({ subject, body, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
