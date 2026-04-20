import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Omi Sessions — Live Breathwork with Omi Bell',
  description: 'Book a 1:1 or group breathwork session with Omi Bell. Personalized guidance for stress relief, better sleep, and peak performance.',
  alternates: { canonical: 'https://thebreathingbell.com/sessions' },
  openGraph: {
    title: 'Omi Sessions | The Breathing Bell',
    description: 'Work directly with Omi Bell in a live breathwork session tailored to your body, business, or belonging.',
    url: 'https://thebreathingbell.com/sessions',
  },
}

export default function SessionsPage() {
  return (
    <main
      className="flex flex-col items-center justify-center min-h-screen px-6 text-center"
      style={{ backgroundColor: 'var(--background)' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(42,181,197,0.05) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-10 max-w-sm w-full">

        <div className="flex flex-col items-center gap-4">
          <p
            className="text-xs tracking-[0.25em] uppercase"
            style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
          >
            Live breathwork with Omi Bell
          </p>
          <h1
            className="text-4xl font-medium leading-snug"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}
          >
            Welcome to Omi Sessions
          </h1>
          <p
            className="text-base leading-relaxed"
            style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
          >
            Personalized 1:1 and group sessions for your body, work, and life.
            Every session is tailored to where you are right now.
          </p>
        </div>

        <div className="flex flex-col gap-4 w-full">
          <Link
            href="/sessions/intake"
            className="block w-full py-4 px-8 text-center text-sm tracking-[0.15em] uppercase rounded-full transition-all"
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--background)',
              fontFamily: 'var(--font-body)',
            }}
          >
            New client
          </Link>
          <Link
            href="/login?next=/sessions/book"
            className="block w-full py-4 px-8 text-center text-sm tracking-[0.15em] uppercase rounded-full transition-all"
            style={{
              backgroundColor: 'transparent',
              color: 'var(--foreground)',
              border: '1px solid var(--border)',
              fontFamily: 'var(--font-body)',
            }}
          >
            Returning client
          </Link>
        </div>

        <Link
          href="/"
          className="text-xs tracking-[0.15em] uppercase"
          style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
        >
          ← The Breathing Bell
        </Link>

      </div>
    </main>
  )
}
