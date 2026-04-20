import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// Session products — update prices here if they change
export const PRODUCTS = {
  single: {
    label: 'Single Session',
    description: '60-minute 1:1 breathwork session with Omi',
    price: 17500, // $175.00 in cents
    credits: 1,
    mode: 'payment' as const,
  },
  pack4: {
    label: '4-Session Pack',
    description: 'Four 60-minute sessions — save $80',
    price: 62000, // $620.00 in cents
    credits: 4,
    mode: 'payment' as const,
  },
  pack8: {
    label: '8-Session Pack',
    description: 'Eight 60-minute sessions — save $280',
    price: 112000, // $1,120.00 in cents
    credits: 8,
    mode: 'payment' as const,
  },
  membership: {
    label: 'Monthly Membership',
    description: 'Two sessions per month, ongoing',
    price: 25000, // $250.00/mo in cents
    credits: 2, // credits added per billing cycle
    mode: 'subscription' as const,
  },
} satisfies Record<string, {
  label: string
  description: string
  price: number
  credits: number
  mode: 'payment' | 'subscription'
}>

export type ProductKey = keyof typeof PRODUCTS
