import type { Metadata } from 'next'
import { Cormorant_Garamond, Tenor_Sans } from 'next/font/google'
import './globals.css'

const cormorant = Cormorant_Garamond({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
})

const tenorSans = Tenor_Sans({
  variable: '--font-body',
  subsets: ['latin'],
  weight: ['400'],
})

export const metadata: Metadata = {
  title: 'The Breathing Bell',
  description:
    'A breathwork experience by Omi Bell. Your nervous system called. Answer it.',
  openGraph: {
    title: 'The Breathing Bell',
    description: 'A breathwork experience by Omi Bell.',
    type: 'website',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${cormorant.variable} ${tenorSans.variable} h-full`}>
      <body
        className="min-h-full flex flex-col"
        style={{ backgroundColor: '#141820', color: 'var(--color-text-primary)' }}
      >
        {children}
      </body>
    </html>
  )
}
