import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resend, FROM } from '@/lib/resend'

function isAuthorized(req: NextRequest): boolean {
  const secret = req.headers.get('x-cron-secret')
  return secret === process.env.CRON_SECRET
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  // Fetch nudge template
  const { data: template } = await supabase
    .from('email_templates')
    .select('*')
    .eq('id', 'nudge')
    .single()

  if (!template) return NextResponse.json({ sent: 0 })

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()

  // Find members with no session in 7+ days
  const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 1000 })
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name, last_nudge_sent')
  const { data: recentSessions } = await supabase
    .from('sessions')
    .select('user_id, completed_at')
    .gte('completed_at', sevenDaysAgo)

  const recentUserIds = new Set((recentSessions ?? []).map(s => s.user_id))

  let sent = 0
  for (const user of users) {
    if (!user.email) continue
    if (recentUserIds.has(user.id)) continue // active recently — skip

    const profile = profiles?.find(p => p.id === user.id)
    if (!profile) continue

    // Skip if nudged within last 14 days
    if (profile.last_nudge_sent && profile.last_nudge_sent > fourteenDaysAgo) continue

    const { error } = await resend.emails.send({
      from: `The Breathing Bell <${FROM}>`,
      to: user.email,
      subject: template.subject,
      text: template.body.replace(/\{\{name\}\}/g, profile.name ?? 'Friend'),
    })

    if (!error) {
      await supabase
        .from('profiles')
        .update({ last_nudge_sent: new Date().toISOString() })
        .eq('id', user.id)
      sent++
    }
  }

  return NextResponse.json({ sent })
}
