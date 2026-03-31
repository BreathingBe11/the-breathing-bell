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

  // Fetch templates
  const { data: templates } = await supabase.from('email_templates').select('*')
  if (!templates) return NextResponse.json({ sent: 0 })

  const templateMap = Object.fromEntries(templates.map(t => [t.id, t]))

  // Fetch due queue items
  const { data: queue } = await supabase
    .from('email_drip_queue')
    .select('*')
    .lte('send_at', new Date().toISOString())
    .is('sent_at', null)

  if (!queue || queue.length === 0) return NextResponse.json({ sent: 0 })

  let sent = 0
  for (const item of queue) {
    const templateId = `${item.sequence_type}-step-${item.step}`
    const template = templateMap[templateId]
    if (!template) continue

    const { error } = await resend.emails.send({
      from: `The Breathing Bell <${FROM}>`,
      to: item.email,
      subject: template.subject,
      text: template.body.replace(/\{\{name\}\}/g, item.name),
    })

    if (!error) {
      await supabase
        .from('email_drip_queue')
        .update({ sent_at: new Date().toISOString() })
        .eq('id', item.id)
      sent++
    }
  }

  return NextResponse.json({ sent })
}
