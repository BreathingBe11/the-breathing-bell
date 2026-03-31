import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/admin'
import { resend, FROM } from '@/lib/resend'

async function isAuthorized(): Promise<boolean> {
  const token = (await cookies()).get('tbb_admin_token')?.value
  return token === process.env.ADMIN_PASSWORD
}

export async function POST(req: NextRequest) {
  if (!await isAuthorized()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { subject, body, audience } = await req.json()
  if (!subject || !body || !audience) {
    return NextResponse.json({ error: 'Missing subject, body, or audience' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const emails: { email: string; name: string }[] = []

  if (audience === 'leads' || audience === 'both') {
    const { data: leads } = await supabase.from('leads').select('email, name')
    if (leads) emails.push(...leads)
  }

  if (audience === 'members' || audience === 'both') {
    const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 1000 })
    const { data: profiles } = await supabase.from('profiles').select('id, name')
    for (const user of users) {
      if (!user.email) continue
      const profile = profiles?.find(p => p.id === user.id)
      emails.push({ email: user.email, name: profile?.name ?? 'Friend' })
    }
  }

  if (emails.length === 0) {
    return NextResponse.json({ sent: 0 })
  }

  // Deduplicate by email
  const unique = Array.from(new Map(emails.map(e => [e.email, e])).values())

  // Send in batches of 100 (Resend batch limit)
  let sent = 0
  for (let i = 0; i < unique.length; i += 100) {
    const batch = unique.slice(i, i + 100).map(({ email, name }) => ({
      from: `The Breathing Bell <${FROM}>`,
      to: email,
      subject,
      text: body.replace(/\{\{name\}\}/g, name),
    }))
    await resend.batch.send(batch)
    sent += batch.length
  }

  return NextResponse.json({ sent })
}
