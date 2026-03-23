import { NextRequest, NextResponse } from 'next/server'
import dns from 'dns/promises'

export async function POST(req: NextRequest) {
  const { email } = await req.json()

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ valid: false, reason: 'Missing email' }, { status: 400 })
  }

  const domain = email.split('@')[1]?.toLowerCase()

  if (!domain) {
    return NextResponse.json({ valid: false, reason: 'Invalid email format' })
  }

  try {
    const records = await dns.resolveMx(domain)
    const valid = records && records.length > 0
    return NextResponse.json({ valid })
  } catch {
    // DNS lookup failed — domain doesn't exist or has no mail servers
    return NextResponse.json({ valid: false })
  }
}
