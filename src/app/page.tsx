'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import LogoBellAnimation from '@/components/animations/LogoBellAnimation'

export default function LandingPage() {
  return (
    <main
      className="flex flex-col items-center justify-center min-h-screen px-6 text-center"
      style={{ backgroundColor: 'var(--background)' }}
    >
      {/* Background ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(42,181,197,0.06) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-10 max-w-sm w-full">
        {/* Bell */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        >
          <LogoBellAnimation variant="landing" />
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="flex flex-col gap-2"
        >
          <p
            className="text-xs tracking-[0.25em] uppercase"
            style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
          >
            A breathwork experience by Omi Bell
          </p>
          <h1
            className="text-4xl md:text-5xl font-medium leading-tight"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}
          >
            The Breathing Bell
          </h1>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.1 }}
          className="text-lg md:text-xl italic leading-relaxed"
          style={{ color: 'var(--accent-soft)', fontFamily: 'var(--font-display)' }}
        >
          &ldquo;Your nervous system called. Answer it.&rdquo;
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.6 }}
          className="w-full"
        >
          <Link
            href="/intake"
            className="block w-full py-4 px-8 text-center text-sm tracking-[0.15em] uppercase transition-all duration-300 rounded-full"
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--background)',
              fontFamily: 'var(--font-body)',
              fontWeight: 400,
            }}
            onMouseEnter={(e) => {
              ;(e.target as HTMLElement).style.backgroundColor = 'var(--accent-soft)'
            }}
            onMouseLeave={(e) => {
              ;(e.target as HTMLElement).style.backgroundColor = 'var(--accent)'
            }}
          >
            Begin my session
          </Link>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2 }}
          className="text-xs"
          style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
        >
          Body · Business · Belonging
        </motion.p>
      </div>
    </main>
  )
}
