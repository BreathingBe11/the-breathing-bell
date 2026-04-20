import Link from 'next/link'

export default function SessionsVerifyEmailPage() {
  return (
    <main
      className="flex flex-col items-center justify-center min-h-screen px-6 text-center"
      style={{ backgroundColor: '#141820' }}
    >
      <div className="flex flex-col items-center gap-6 max-w-sm">
        <p className="text-3xl" style={{ color: 'var(--accent)' }}>✉</p>
        <h2
          className="text-2xl font-medium"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}
        >
          Check your email
        </h2>
        <p
          className="text-sm leading-relaxed"
          style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
        >
          We sent a verification link to your email address. Click the link to
          verify your account — then come back here to book your discovery call.
        </p>
        <Link
          href="/sessions/discovery"
          className="text-xs tracking-[0.15em] uppercase"
          style={{ color: 'var(--muted)', textDecoration: 'underline', textUnderlineOffset: '3px', fontFamily: 'var(--font-body)' }}
        >
          I&apos;ve verified — book my call →
        </Link>
      </div>
    </main>
  )
}
