import { NextRequest, NextResponse } from 'next/server'
import { stripe, PRODUCTS, ProductKey } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { productKey } = await req.json() as { productKey: ProductKey }

    if (!productKey || !PRODUCTS[productKey]) {
      return NextResponse.json({ error: 'Invalid product' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const product = PRODUCTS[productKey]
    const origin = req.headers.get('origin') ?? 'https://thebreathingbell.com'

    let session

    if (product.mode === 'subscription') {
      // Create a recurring subscription price on the fly
      const stripePrice = await stripe.prices.create({
        currency: 'usd',
        unit_amount: product.price,
        recurring: { interval: 'month' },
        product_data: { name: product.label },
      })

      session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        line_items: [{ price: stripePrice.id, quantity: 1 }],
        success_url: `${origin}/sessions/book/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/sessions/book`,
        customer_email: user.email,
        metadata: { userId: user.id, productKey, credits: String(product.credits) },
        subscription_data: { metadata: { userId: user.id, productKey, credits: String(product.credits) } },
      })
    } else {
      session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: [{
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: product.price,
            product_data: { name: product.label, description: product.description },
          },
        }],
        success_url: `${origin}/sessions/book/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/sessions/book`,
        customer_email: user.email,
        metadata: { userId: user.id, productKey, credits: String(product.credits) },
      })
    }

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
