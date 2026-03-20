import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import QuietLogClient from './QuietLogClient'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/save')
  }

  const { data: sessions } = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', session.user.id)
    .order('completed_at', { ascending: false })

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  return <QuietLogClient sessions={sessions ?? []} profile={profile} />
}
