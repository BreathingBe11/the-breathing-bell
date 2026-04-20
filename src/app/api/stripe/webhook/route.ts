import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: ReturnType<typeof stripe.webhooks.constructEvent>

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const admin = createAdminClient()

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const { userId, productKey, credits } = session.metadata ?? {}

    if (!userId || !credits) {
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
    }

    const creditCount = parseInt(credits, 10)

    // Add session credits
    await admin.from('session_credits').insert({
      user_id: userId,
      credits_total: creditCount,
      credits_used: 0,
      stripe_payment_intent_id: typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.id,
    })

    // If membership, update subscription tier
    if (productKey === 'membership') {
      await admin
        .from('profiles')
        .update({ subscription_tier: 'bell' })
        .eq('id', userId)
    }
  }

  if (event.type === 'invoice.paid') {
    // Recurring membership renewal — add credits each billing cycle
    const invoice = event.data.object as { subscription?: string | null }
    const sub = invoice.subscription

    if (typeof sub === 'string') {
      const subscription = await stripe.subscriptions.retrieve(sub)
      const { userId, credits } = subscription.metadata ?? {}

      if (userId && credits) {
        await admin.from('session_credits').insert({
          user_id: userId,
          credits_total: parseInt(credits, 10),
          credits_used: 0,
          stripe_payment_intent_id: sub,
        })
      }
    }
  }

  return NextResponse.json({ received: true })
}
