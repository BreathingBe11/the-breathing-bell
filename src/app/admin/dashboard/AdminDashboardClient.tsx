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
  approvedForSessions: boolean
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
  members: initialMembers,
}: {
  leads: Lead[]
  members: Member[]
}) {
  const router = useRouter()
  const [tab, setTab] = useState<'leads' | 'members' | 'bookings' | 'email' | 'templates'>('leads')
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [members, setMembers] = useState<Member[]>(initialMembers)
  const [deletingMember, setDeletingMember] = useState<string | null>(null)
  const [approvingMember, setApprovingMember] = useState<string | null>(null)

  // Blast state
  const [blastSubject, setBlastSubject] = useState('')
  const [blastBody, setBlastBody] = useState('')
  const [blastAudience, setBlastAudience] = useState<'leads' | 'members' | 'both'>('leads')
  const [blastSending, setBlastSending] = useState(false)
  const [blastResult, setBlastResult] = useState<string | null>(null)

  // Bookings state
  const [bookings, setBookings] = useState<{
    id: string
    clientName: string
    email: string
    session_type: string
    scheduled_at: string | null
    canceled_at: string | null
    omi_notes: string | null
    user_id: string | null
  }[]>([])
  const [bookingsLoaded, setBookingsLoaded] = useState(false)
  const [editingNotes, setEditingNotes] = useState<string | null>(null)
  const [notesValue, setNotesValue] = useState('')
  const [notesSaving, setNotesSaving] = useState(false)
  const [approvingUser, setApprovingUser] = useState<string | null>(null)

  async function loadBookings() {
    const res = await fetch('/api/admin/bookings')
    if (res.ok) {
      setBookings(await res.json())
      setBookingsLoaded(true)
    }
  }

  async function saveNotes(id: string) {
    setNotesSaving(true)
    await fetch('/api/admin/bookings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, omi_notes: notesValue }),
    })
    setBookings(prev => prev.map(b => b.id === id ? { ...b, omi_notes: notesValue } : b))
    setEditingNotes(null)
    setNotesSaving(false)
  }

  async function approveClient(userId: string) {
    setApprovingUser(userId)
    await fetch('/api/admin/bookings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approved_user_id: userId }),
    })
    setApprovingUser(null)
  }

  function sessionTypeLabel(type: string) {
    if (type === 'discovery') return 'Discovery Call'
    if (type === '60-min') return '60-Min Session'
    if (type === '30-min') return '30-Min Session'
    if (type === 'group') return 'Group Session'
    return type
  }

  // Templates state
  const [templates, setTemplates] = useState<{ id: string; name: string; subject: string; body: string }[]>([])
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null)
  const [templateSubject, setTemplateSubject] = useState('')
  const [templateBody, setTemplateBody] = useState('')
  const [templateSaving, setTemplateSaving] = useState(false)

  async function loadTemplates() {
    const res = await fetch('/api/admin/email/templates')
    if (res.ok) setTemplates(await res.json())
  }

  function startEditTemplate(t: { id: string; name: string; subject: string; body: string }) {
    setEditingTemplate(t.id)
    setTemplateSubject(t.subject)
    setTemplateBody(t.body)
  }

  async function saveTemplate(id: string) {
    setTemplateSaving(true)
    await fetch('/api/admin/email/templates', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, subject: templateSubject, body: templateBody }),
    })
    await loadTemplates()
    setEditingTemplate(null)
    setTemplateSaving(false)
  }

  async function sendBlast(e: React.FormEvent) {
    e.preventDefault()
    setBlastSending(true)
    setBlastResult(null)
    const res = await fetch('/api/admin/email/blast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject: blastSubject, body: blastBody, audience: blastAudience }),
    })
    const data = await res.json()
    setBlastResult(res.ok ? `Sent to ${data.sent} recipient${data.sent !== 1 ? 's' : ''}.` : `Error: ${data.error}`)
    setBlastSending(false)
  }

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

  async function handleDeleteMember(id: string) {
    setDeletingMember(id)
    const res = await fetch('/api/admin/members', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (res.ok) {
      setMembers((prev) => prev.filter((m) => m.id !== id))
    }
    setDeletingMember(null)
  }

  async function approveMemberForSessions(id: string) {
    setApprovingMember(id)
    await fetch('/api/admin/bookings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approved_user_id: id }),
    })
    setMembers((prev) => prev.map((m) => m.id === id ? { ...m, approvedForSessions: true } : m))
    setApprovingMember(null)
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
          {([
            { key: 'leads', label: `Leads (${leads.length})` },
            { key: 'members', label: `Members (${members.length})` },
            { key: 'bookings', label: 'Bookings' },
            { key: 'email', label: 'Send Email' },
            { key: 'templates', label: 'Email Copy' },
          ] as { key: typeof tab; label: string }[]).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => {
              setTab(key)
              if (key === 'templates' && templates.length === 0) loadTemplates()
              if (key === 'bookings' && !bookingsLoaded) loadBookings()
            }}
              className="px-5 py-2.5 text-xs tracking-[0.15em] uppercase"
              style={{
                fontFamily: 'monospace',
                color: tab === key ? '#2ab5c5' : '#7a8a99',
                borderBottom: tab === key ? '2px solid #2ab5c5' : '2px solid transparent',
                marginBottom: '-1px',
              }}
            >
              {label}
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
                  {['Name', 'Email', 'Age Range', 'Sessions', 'Logins', 'Last Login', 'Member Since', 'Live Sessions', ''].map((h) => (
                    <th key={h} className={headerCell} style={{ color: '#7a8a99', fontFamily: 'monospace' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {members.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center" style={{ color: '#7a8a99', fontFamily: 'monospace' }}>
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
                    <td className={cell}>
                      {m.approvedForSessions ? (
                        <span style={{ color: '#2ab5c5', fontFamily: 'monospace' }}>✓ Approved</span>
                      ) : (
                        <button
                          onClick={() => approveMemberForSessions(m.id)}
                          disabled={approvingMember === m.id}
                          style={{
                            color: approvingMember === m.id ? '#7a8a99' : '#2ab5c5',
                            fontFamily: 'monospace',
                            fontSize: '0.7rem',
                            border: '1px solid rgba(42,181,197,0.4)',
                            borderRadius: '4px',
                            padding: '2px 8px',
                            opacity: approvingMember === m.id ? 0.5 : 1,
                          }}
                        >
                          {approvingMember === m.id ? 'Approving...' : 'Approve'}
                        </button>
                      )}
                    </td>
                    <td className={cell}>
                      <button
                        onClick={() => handleDeleteMember(m.id)}
                        disabled={deletingMember === m.id}
                        style={{
                          color: deletingMember === m.id ? '#7a8a99' : '#f87171',
                          fontFamily: 'monospace',
                          fontSize: '0.7rem',
                          opacity: deletingMember === m.id ? 0.5 : 1,
                        }}
                      >
                        {deletingMember === m.id ? 'removing…' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Bookings tab */}
        {tab === 'bookings' && (
          <div className="flex flex-col gap-4">
            {!bookingsLoaded && (
              <p className="text-xs" style={{ color: '#7a8a99', fontFamily: 'monospace' }}>Loading bookings...</p>
            )}
            {bookingsLoaded && bookings.length === 0 && (
              <p className="text-xs" style={{ color: '#7a8a99', fontFamily: 'monospace' }}>No bookings yet.</p>
            )}
            {bookings.map((b) => (
              <div
                key={b.id}
                className="rounded-xl p-5 flex flex-col gap-3"
                style={{
                  backgroundColor: '#1a2030',
                  border: `1px solid ${b.canceled_at ? '#3a2020' : '#2a3040'}`,
                  opacity: b.canceled_at ? 0.6 : 1,
                }}
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-semibold" style={{ color: '#e8e2d9', fontFamily: 'monospace' }}>
                      {b.clientName}
                    </p>
                    <p className="text-xs" style={{ color: '#2ab5c5', fontFamily: 'monospace' }}>{b.email}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className="text-xs px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: b.canceled_at ? '#3a2020' : 'rgba(42,181,197,0.15)',
                        color: b.canceled_at ? '#f87171' : '#2ab5c5',
                        fontFamily: 'monospace',
                      }}
                    >
                      {b.canceled_at ? 'Cancelled' : sessionTypeLabel(b.session_type)}
                    </span>
                    {b.scheduled_at && (
                      <p className="text-xs" style={{ color: '#7a8a99', fontFamily: 'monospace' }}>
                        {formatDate(b.scheduled_at)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Approve button */}
                {b.user_id && !b.canceled_at && (
                  <button
                    onClick={() => approveClient(b.user_id!)}
                    disabled={approvingUser === b.user_id}
                    className="text-xs tracking-[0.1em] uppercase self-start px-3 py-1.5 rounded"
                    style={{
                      backgroundColor: 'rgba(42,181,197,0.1)',
                      color: '#2ab5c5',
                      border: '1px solid rgba(42,181,197,0.3)',
                      fontFamily: 'monospace',
                      opacity: approvingUser === b.user_id ? 0.5 : 1,
                    }}
                  >
                    {approvingUser === b.user_id ? 'Approving...' : '✓ Approve for sessions'}
                  </button>
                )}

                {/* Notes */}
                {editingNotes === b.id ? (
                  <div className="flex flex-col gap-2">
                    <textarea
                      value={notesValue}
                      onChange={(e) => setNotesValue(e.target.value)}
                      rows={4}
                      placeholder="Add session notes for this client..."
                      className="w-full px-3 py-2 rounded text-xs outline-none resize-y"
                      style={{ backgroundColor: '#0d1117', border: '1px solid #2a3040', color: '#e8e2d9', fontFamily: 'monospace' }}
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={() => saveNotes(b.id)}
                        disabled={notesSaving}
                        className="px-4 py-1.5 rounded text-xs tracking-[0.1em] uppercase"
                        style={{ backgroundColor: '#2ab5c5', color: '#0d1117', fontFamily: 'monospace' }}
                      >
                        {notesSaving ? 'Saving...' : 'Save notes'}
                      </button>
                      <button
                        onClick={() => setEditingNotes(null)}
                        className="px-4 py-1.5 rounded text-xs tracking-[0.1em] uppercase"
                        style={{ color: '#7a8a99', border: '1px solid #2a3040', fontFamily: 'monospace' }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1">
                    {b.omi_notes && (
                      <p className="text-xs italic" style={{ color: '#7a8a99', fontFamily: 'monospace' }}>
                        &ldquo;{b.omi_notes}&rdquo;
                      </p>
                    )}
                    <button
                      onClick={() => { setEditingNotes(b.id); setNotesValue(b.omi_notes ?? '') }}
                      className="text-xs tracking-[0.1em] uppercase self-start"
                      style={{ color: '#7a8a99', fontFamily: 'monospace', textDecoration: 'underline' }}
                    >
                      {b.omi_notes ? 'Edit notes' : '+ Add notes'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Email blast tab */}
        {tab === 'email' && (
          <form onSubmit={sendBlast} className="flex flex-col gap-4 max-w-xl">
            <div className="flex gap-3">
              {(['leads', 'members', 'both'] as const).map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setBlastAudience(a)}
                  className="px-4 py-2 text-xs tracking-[0.1em] uppercase rounded"
                  style={{
                    fontFamily: 'monospace',
                    backgroundColor: blastAudience === a ? '#2ab5c5' : '#1a2030',
                    color: blastAudience === a ? '#0d1117' : '#7a8a99',
                    border: `1px solid ${blastAudience === a ? '#2ab5c5' : '#2a3040'}`,
                  }}
                >
                  {a}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Subject line"
              value={blastSubject}
              onChange={(e) => setBlastSubject(e.target.value)}
              required
              className="w-full px-4 py-3 rounded text-sm outline-none"
              style={{ backgroundColor: '#1a2030', border: '1px solid #2a3040', color: '#e8e2d9', fontFamily: 'monospace' }}
            />
            <textarea
              placeholder={`Body — use {{name}} to personalise\n\nHi {{name}},\n\n...`}
              value={blastBody}
              onChange={(e) => setBlastBody(e.target.value)}
              required
              rows={12}
              className="w-full px-4 py-3 rounded text-sm outline-none resize-y"
              style={{ backgroundColor: '#1a2030', border: '1px solid #2a3040', color: '#e8e2d9', fontFamily: 'monospace' }}
            />
            {blastResult && (
              <p className="text-xs" style={{ color: blastResult.startsWith('Error') ? '#f87171' : '#2ab5c5', fontFamily: 'monospace' }}>
                {blastResult}
              </p>
            )}
            <button
              type="submit"
              disabled={blastSending}
              className="px-6 py-3 rounded text-xs tracking-[0.15em] uppercase self-start"
              style={{
                backgroundColor: blastSending ? '#1a2030' : '#2ab5c5',
                color: blastSending ? '#7a8a99' : '#0d1117',
                fontFamily: 'monospace',
                border: '1px solid #2ab5c5',
              }}
            >
              {blastSending ? 'Sending...' : `Send to ${blastAudience}`}
            </button>
          </form>
        )}

        {/* Email templates tab */}
        {tab === 'templates' && (
          <div className="flex flex-col gap-6 max-w-xl">
            {templates.length === 0 && (
              <p className="text-xs" style={{ color: '#7a8a99', fontFamily: 'monospace' }}>Loading templates...</p>
            )}
            {templates.map((t) => (
              <div key={t.id} className="rounded-xl p-5 flex flex-col gap-3" style={{ backgroundColor: '#1a2030', border: '1px solid #2a3040' }}>
                <div className="flex items-center justify-between">
                  <p className="text-xs tracking-[0.1em] uppercase" style={{ color: '#2ab5c5', fontFamily: 'monospace' }}>{t.name}</p>
                  {editingTemplate !== t.id && (
                    <button
                      onClick={() => startEditTemplate(t)}
                      className="text-xs tracking-[0.1em] uppercase"
                      style={{ color: '#7a8a99', fontFamily: 'monospace' }}
                    >
                      Edit
                    </button>
                  )}
                </div>
                {editingTemplate === t.id ? (
                  <>
                    <input
                      type="text"
                      value={templateSubject}
                      onChange={(e) => setTemplateSubject(e.target.value)}
                      className="w-full px-3 py-2 rounded text-sm outline-none"
                      style={{ backgroundColor: '#0d1117', border: '1px solid #2a3040', color: '#e8e2d9', fontFamily: 'monospace' }}
                    />
                    <textarea
                      value={templateBody}
                      onChange={(e) => setTemplateBody(e.target.value)}
                      rows={10}
                      className="w-full px-3 py-2 rounded text-sm outline-none resize-y"
                      style={{ backgroundColor: '#0d1117', border: '1px solid #2a3040', color: '#e8e2d9', fontFamily: 'monospace' }}
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={() => saveTemplate(t.id)}
                        disabled={templateSaving}
                        className="px-4 py-2 rounded text-xs tracking-[0.1em] uppercase"
                        style={{ backgroundColor: '#2ab5c5', color: '#0d1117', fontFamily: 'monospace' }}
                      >
                        {templateSaving ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={() => setEditingTemplate(null)}
                        className="px-4 py-2 rounded text-xs tracking-[0.1em] uppercase"
                        style={{ color: '#7a8a99', fontFamily: 'monospace', border: '1px solid #2a3040' }}
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-xs" style={{ color: '#e8e2d9', fontFamily: 'monospace' }}>Subject: {t.subject}</p>
                    <pre className="text-xs whitespace-pre-wrap" style={{ color: '#7a8a99', fontFamily: 'monospace' }}>{t.body}</pre>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  )
}
