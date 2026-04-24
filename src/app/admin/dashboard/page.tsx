import { createAdminClient } from '@/lib/supabase/admin'
import AdminDashboardClient from './AdminDashboardClient'

export const dynamic = 'force-dynamic'

async function getLeads() {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })
  return data ?? []
}

async function getMembers() {
  const supabase = createAdminClient()

  // Get all auth users
  const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 1000 })

  // Get all profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name, last_name, age_range, login_count, subscription_tier, created_at, approved_for_sessions')

  // Get session counts per user
  const { data: sessions } = await supabase
    .from('sessions')
    .select('user_id')

  // Merge
  const members = users.map((user) => {
    const profile = profiles?.find((p) => p.id === user.id)
    const sessionCount = sessions?.filter((s) => s.user_id === user.id).length ?? 0
    return {
      id: user.id,
      email: user.email ?? '—',
      name: profile?.name ?? '—',
      lastName: profile?.last_name ?? null,
      ageRange: profile?.age_range ?? '—',
      subscriptionTier: profile?.subscription_tier ?? 'free',
      loginCount: profile?.login_count ?? 0,
      sessionCount,
      lastLogin: user.last_sign_in_at ?? null,
      memberSince: user.created_at,
      approvedForSessions: profile?.approved_for_sessions ?? false,
    }
  }).sort((a, b) => new Date(b.memberSince).getTime() - new Date(a.memberSince).getTime())

  return members
}

export default async function AdminDashboardPage() {
  const [leads, members] = await Promise.all([getLeads(), getMembers()])

  const memberEmails = new Set(members.map(m => m.email.toLowerCase()))
  const filteredLeads = leads.filter(l => !memberEmails.has(l.email.toLowerCase()))

  return <AdminDashboardClient leads={filteredLeads} members={members} />
}
