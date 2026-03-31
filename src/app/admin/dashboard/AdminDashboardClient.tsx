'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Lead {
  id: string
  name: string
  email: string
  age_range: string
  created_at: string
}

interface Member {
  id: string
  email: string
  name: string
  ageRange: string
  subscriptionTier: string
  loginCount: number
  sessionCount: number
  lastLogin: string | null
  memberSince: string
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

const cell = 'px-4 py-3 text-left text-xs whitespace-nowrap'
const headerCell = `${cell} font-semibold uppercase tracking-[0.1em]`

export default function AdminDashboardClient({
  leads: initialLeads,
  members,
}: {
  leads: Lead[]
  members: Member[]
}) {
  const router = useRouter()
  const [tab, setTab] = useState<'leads' | 'members'>('leads')
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleDeleteLead(id: string) {
    setDeleting(id)
    const res = await fetch('/api/admin/leads', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (res.ok) {
      setLeads((prev) => prev.filter((l) => l.id !== id))
    }
    setDeleting(null)
  }

  async function handleSignOut() {
    await fetch('/api/admin/auth', { method: 'DELETE' })
    router.push('/admin/login')
  }

  return (
    <main className="min-h-screen px-6 py-10" style={{ backgroundColor: '#0d1117', color: '#e8e2d9' }}>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs tracking-[0.25em] uppercase mb-1" style={{ color: '#7a8a99', fontFamily: 'monospace' }}>
              The Breathing Bell
            </p>
            <h1 className="text-2xl font-semibold" style={{ fontFamily: 'monospace' }}>Admin Dashboard</h1>
          </div>
          <button
            onClick={handleSignOut}
            className="text-xs tracking-[0.15em] uppercase"
            style={{ color: '#7a8a99', fontFamily: 'monospace' }}
          >
            Sign out
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {[
            { label: 'Total Leads', value: leads.length },
            { label: 'Total Members', value: members.length },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl px-6 py-5" style={{ backgroundColor: '#1a2030', border: '1px solid #2a3040' }}>
              <p className="text-3xl font-semibold mb-1" style={{ color: '#2ab5c5', fontFamily: 'monospace' }}>{value}</p>
              <p className="text-xs tracking-[0.1em] uppercase" style={{ color: '#7a8a99', fontFamily: 'monospace' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6" style={{ borderBottom: '1px solid #2a3040' }}>
          {(['leads', 'members'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-5 py-2.5 text-xs tracking-[0.15em] uppercase"
              style={{
                fontFamily: 'monospace',
                color: tab === t ? '#2ab5c5' : '#7a8a99',
                borderBottom: tab === t ? '2px solid #2ab5c5' : '2px solid transparent',
                marginBottom: '-1px',
              }}
            >
              {t} ({t === 'leads' ? leads.length : members.length})
            </button>
          ))}
        </div>

        {/* Leads table */}
        {tab === 'leads' && (
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #2a3040' }}>
            <table className="w-full text-xs" style={{ borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#1a2030' }}>
                <tr>
                  {['Name', 'Email', 'Age Range', 'Date Joined', ''].map((h) => (
                    <th key={h} className={headerCell} style={{ color: '#7a8a99', fontFamily: 'monospace' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center" style={{ color: '#7a8a99', fontFamily: 'monospace' }}>
                      No leads yet.
                    </td>
                  </tr>
                ) : leads.map((lead, i) => (
                  <tr
                    key={lead.id}
                    style={{
                      borderTop: '1px solid #2a3040',
                      backgroundColor: i % 2 === 0 ? 'transparent' : '#131920',
                    }}
                  >
                    <td className={cell} style={{ color: '#e8e2d9', fontFamily: 'monospace' }}>{lead.name}</td>
                    <td className={cell} style={{ color: '#2ab5c5', fontFamily: 'monospace' }}>{lead.email}</td>
                    <td className={cell} style={{ color: '#7a8a99', fontFamily: 'monospace' }}>{lead.age_range}</td>
                    <td className={cell} style={{ color: '#7a8a99', fontFamily: 'monospace' }}>{formatDate(lead.created_at)}</td>
                    <td className={cell}>
                      <button
                        onClick={() => handleDeleteLead(lead.id)}
                        disabled={deleting === lead.id}
                        style={{
                          color: deleting === lead.id ? '#7a8a99' : '#f87171',
                          fontFamily: 'monospace',
                          fontSize: '0.7rem',
                          opacity: deleting === lead.id ? 0.5 : 1,
                        }}
                      >
                        {deleting === lead.id ? 'removing…' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Members table */}
        {tab === 'members' && (
          <div className="rounded-xl overflow-auto" style={{ border: '1px solid #2a3040' }}>
            <table className="w-full text-xs" style={{ borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#1a2030' }}>
                <tr>
                  {['Name', 'Email', 'Age Range', 'Sessions', 'Logins', 'Last Login', 'Member Since'].map((h) => (
                    <th key={h} className={headerCell} style={{ color: '#7a8a99', fontFamily: 'monospace' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {members.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center" style={{ color: '#7a8a99', fontFamily: 'monospace' }}>
                      No members yet.
                    </td>
                  </tr>
                ) : members.map((m, i) => (
                  <tr
                    key={m.id}
                    style={{
                      borderTop: '1px solid #2a3040',
                      backgroundColor: i % 2 === 0 ? 'transparent' : '#131920',
                    }}
                  >
                    <td className={cell} style={{ color: '#e8e2d9', fontFamily: 'monospace' }}>{m.name}</td>
                    <td className={cell} style={{ color: '#2ab5c5', fontFamily: 'monospace' }}>{m.email}</td>
                    <td className={cell} style={{ color: '#7a8a99', fontFamily: 'monospace' }}>{m.ageRange}</td>
                    <td className={cell} style={{ color: '#e8e2d9', fontFamily: 'monospace' }}>{m.sessionCount}</td>
                    <td className={cell} style={{ color: '#e8e2d9', fontFamily: 'monospace' }}>{m.loginCount}</td>
                    <td className={cell} style={{ color: '#7a8a99', fontFamily: 'monospace' }}>{formatDate(m.lastLogin)}</td>
                    <td className={cell} style={{ color: '#7a8a99', fontFamily: 'monospace' }}>{formatDate(m.memberSince)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </main>
  )
}
