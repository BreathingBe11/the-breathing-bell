import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resend, FROM } from '@/lib/resend'

export async function POST(req: NextRequest) {
  const { email, name } = await req.json()
  if (!email || !name) return NextResponse.json({ error: 'Missing email or name' }, { status: 400 })

  const supabase = createAdminClient()

  // Fetch member step 1 template
  const { data: template } = await supabase
    .from('email_templates')
    .select('*')
    .eq('id', 'member-step-1')
    .single()

  if (!template) return NextResponse.json({ ok: true }) // fail silently

  await resend.emails.send({
    from: `The Breathing Bell <${FROM}>`,
    to: email,
    subject: template.subject,
    text: template.body.replace(/\{\{name\}\}/g, name),
  })

  // Queue step 2
  const sendAt2 = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
  await supabase.from('email_drip_queue').insert({
    email, name, sequence_type: 'member', step: 2, send_at: sendAt2,
  })

  return NextResponse.json({ ok: true })
}
