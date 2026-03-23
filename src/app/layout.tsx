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
    'Guided wellness sessions with Omi Bell. Your nervous system called. Answer it.',
  openGraph: {
    title: 'The Breathing Bell',
    description: 'Guided wellness sessions with Omi Bell.',
    type: 'website',
    images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Breathing Bell',
    description: 'Guided wellness sessions with Omi Bell.',
    images: ['/opengraph-image'],
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
