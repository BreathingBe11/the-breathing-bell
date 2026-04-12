import type { Metadata } from 'next'
import { Cormorant_Garamond, Tenor_Sans } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import JsonLd from '@/components/JsonLd'

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
  metadataBase: new URL('https://thebreathingbell.com'),
  title: {
    default: 'Guided Breathwork & Yoga Nidra App | The Breathing Bell',
    template: '%s | The Breathing Bell',
  },
  description:
    'Calm your nervous system with guided breathwork and yoga nidra sessions for stress relief, better sleep, and deep relaxation. Start your free session now.',
  keywords: [
    'breathwork app', 'yoga nidra app', 'guided breathwork', 'nervous system reset',
    'stress relief app', 'yoga nidra for sleep', 'somatic breathwork',
    'breathing exercises for anxiety', 'how to regulate your nervous system',
    'guided yoga nidra', 'free breathwork app', 'parasympathetic nervous system activation',
    'deep relaxation app', 'sleep meditation app', 'somatic healing app',
    'nervous system regulation exercises', 'how to calm anxiety quickly',
  ],
  authors: [{ name: 'Omi Bell', url: 'https://www.omibell.com' }],
  creator: 'Omi Bell',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    title: 'Guided Breathwork & Yoga Nidra App | The Breathing Bell',
    description:
      'Reset your nervous system with guided breathwork and yoga nidra. For stress relief, better sleep, and deep relaxation — wherever you are in the world.',
    type: 'website',
    url: 'https://thebreathingbell.com',
    siteName: 'The Breathing Bell',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'The Breathing Bell — Guided Breathwork & Yoga Nidra App by Omi Bell',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Guided Breathwork & Yoga Nidra App | The Breathing Bell',
    description:
      'Reset your nervous system with guided breathwork and yoga nidra for stress relief, better sleep, and deep relaxation.',
    images: ['/opengraph-image'],
  },
  alternates: {
    canonical: 'https://thebreathingbell.com',
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
        <JsonLd data={{
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          'name': 'The Breathing Bell',
          'applicationCategory': 'HealthApplication',
          'operatingSystem': 'Web, iOS, Android',
          'url': 'https://thebreathingbell.com',
          'description': 'A guided breathwork and yoga nidra app for nervous system regulation, stress relief, and deep sleep. Designed for anyone seeking rest, clarity, and sustainable wellness.',
          'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
          'creator': { '@type': 'Person', 'name': 'Omi Bell', 'url': 'https://www.omibell.com' },
        }} />
        <JsonLd data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          'mainEntity': [
            { '@type': 'Question', 'name': 'What is The Breathing Bell?', 'acceptedAnswer': { '@type': 'Answer', 'text': 'The Breathing Bell is a free guided breathwork and yoga nidra web app created by Omi Bell. It offers personalised sessions for nervous system regulation, stress relief, and deep sleep — organised around three pillars: Body, Business, and Belonging.' } },
            { '@type': 'Question', 'name': 'How does breathwork reduce stress?', 'acceptedAnswer': { '@type': 'Answer', 'text': 'Breathwork activates the parasympathetic nervous system — your body\'s built-in rest-and-digest response — which lowers cortisol, slows heart rate, and signals safety to the brain. Techniques like Double Inhale (cyclic sighing) have been shown in Stanford research to be the most effective real-time stress reduction method.' } },
            { '@type': 'Question', 'name': 'Is The Breathing Bell app free?', 'acceptedAnswer': { '@type': 'Answer', 'text': 'Yes. The Breathing Bell is free to start. Guest users can access Box Breathing, Double Inhale, and Yoga Nidra sessions. Creating a free account unlocks your Quiet Log (session history) and access to the 4-7-8 breathing technique.' } },
            { '@type': 'Question', 'name': 'How long are the breathwork sessions?', 'acceptedAnswer': { '@type': 'Answer', 'text': 'Sessions start at 5 minutes and unlock up to 30 minutes as you build a practice. Yoga Nidra sessions require a minimum of 10 minutes.' } },
            { '@type': 'Question', 'name': 'What is yoga nidra and how is it different from meditation?', 'acceptedAnswer': { '@type': 'Answer', 'text': 'Yoga nidra is guided conscious rest. Unlike meditation, which asks you to focus or observe thoughts, yoga nidra guides you into a state between waking and sleep through a body scan. 20–30 minutes is said to equal 2–4 hours of restorative sleep, making it especially powerful for sleep deprivation and burnout recovery.' } },
            { '@type': 'Question', 'name': 'Can breathwork help me sleep better?', 'acceptedAnswer': { '@type': 'Answer', 'text': 'Yes. Yoga Nidra and 4-7-8 breathing are both highly effective for sleep. The extended exhale in 4-7-8 strongly activates the parasympathetic nervous system, while Yoga Nidra guides the body into deep restorative rest — even if you don\'t fully fall asleep.' } },
            { '@type': 'Question', 'name': 'How do I regulate my nervous system with breathwork?', 'acceptedAnswer': { '@type': 'Answer', 'text': 'Each technique on The Breathing Bell targets nervous system regulation differently. Box Breathing (4-4-4-4) builds steadiness and focus. Double Inhale provides the fastest real-time stress reset. 4-7-8 is ideal for anxiety and racing thoughts. All techniques work by shifting the body out of fight-or-flight and into rest-and-digest.' } },
            { '@type': 'Question', 'name': 'What is the Body, Business, and Belonging framework?', 'acceptedAnswer': { '@type': 'Answer', 'text': 'The Breathing Bell organises sessions around three pillars: Body (physical presence, rest, and somatic release), Business (clarity, leadership, and performance under pressure), and Belonging (connection, self-worth, and showing up for yourself). You choose your pillar at the start of each session so the experience is personalised to where you need support most.' } },
          ],
        }} />
        {children}

        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-BX4QW1C37K"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-BX4QW1C37K');
          `}
        </Script>
      </body>
    </html>
  )
}
