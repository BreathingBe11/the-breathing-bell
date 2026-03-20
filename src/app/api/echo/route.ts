import { NextRequest, NextResponse } from 'next/server'
import { generateEcho } from '@/lib/claude/echo'
import { Domain, WalkingInState, Technique } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, domain, walkingInState, technique, durationMinutes } = body as {
      name: string
      domain: Domain
      walkingInState: WalkingInState
      technique: Technique
      durationMinutes: number
    }

    if (!name || !domain || !walkingInState || !technique || !durationMinutes) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const echo = await generateEcho({ name, domain, walkingInState, technique, durationMinutes })
    return NextResponse.json({ echo })
  } catch (err) {
    console.error('Echo generation error:', err)
    return NextResponse.json({ error: 'Failed to generate reflection' }, { status: 500 })
  }
}
