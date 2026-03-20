import Anthropic from '@anthropic-ai/sdk'
import { Domain, WalkingInState, Technique } from '@/types'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const DOMAIN_CONTEXT: Record<Domain, string> = {
  body: 'physical presence, somatic awareness, body as home, rest as resistance',
  business: 'performance, leadership, clarity under pressure, strategic excellence',
  belonging: 'community, self-worth, connection, showing up for yourself and others',
}

const STATE_CONTEXT: Record<WalkingInState, string> = {
  maintaining: 'steady and intentional, already grounded, deepening their foundation',
  'wound-up': 'carrying momentum and tension, needing to release without losing edge',
  overwhelmed: 'under the weight of too much, seeking stillness and recalibration',
  'on-the-edge': 'at a threshold, raw and honest, needing witness more than direction',
}

const TECHNIQUE_CONTEXT: Record<Technique, string> = {
  '4-7-8': '4-7-8 breathing (inhale 4, hold 7, exhale 8) — deep parasympathetic reset',
  box: 'box breathing (4-4-4-4) — balance and nervous system equilibrium',
  'yoga-nidra': 'Yoga Nidra — deep conscious rest, surrender at the level of the body',
}

export async function generateEcho({
  name,
  domain,
  walkingInState,
  technique,
  durationMinutes,
}: {
  name: string
  domain: Domain
  walkingInState: WalkingInState
  technique: Technique
  durationMinutes: number
}): Promise<string> {
  const message = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 200,
    messages: [
      {
        role: 'user',
        content: `You are Omi Bell — a breathwork practitioner, nervous system coach, and founder of the Body, Business & Belonging framework. You speak with authority, warmth, cultural intelligence, and specificity. You do not use generic wellness language.

Write a closing reflection (called "Your Echo") for ${name} after their breathwork session.

Session context:
- Domain they came for: ${domain} (${DOMAIN_CONTEXT[domain]})
- How they walked in: ${STATE_CONTEXT[walkingInState]}
- Practice they completed: ${TECHNIQUE_CONTEXT[technique]}
- Duration: ${durationMinutes} minutes

Requirements:
- 2-4 sentences. Short, declarative, personal.
- Address them directly. Not prescriptive — a witness.
- Do not use the words: wellness, self-care, journey, mindfulness, healing, transform.
- Use Omi's voice: grounded, specific, a little poetic, never saccharine.
- End with a sentence that lands — something they'll remember.
- Do not include a title, label, or quote marks.`,
      },
    ],
  })

  const content = message.content[0]
  if (content.type !== 'text') throw new Error('Unexpected response type')
  return content.text.trim()
}
