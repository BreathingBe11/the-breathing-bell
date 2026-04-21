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

  const [
    { data: sessions },
    { data: profile },
    { data: bookings },
  ] = await Promise.all([
    supabase
      .from('sessions')
      .select('*')
      .eq('user_id', session.user.id)
      .order('completed_at', { ascending: false }),
    supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single(),
    supabase
      .from('bookings')
      .select('*')
      .eq('user_id', session.user.id)
      .is('canceled_at', null)
      .order('scheduled_at', { ascending: true }),
  ])

  return (
    <QuietLogClient
      sessions={sessions ?? []}
      profile={profile}
      bookings={bookings ?? []}
    />
  )
}
