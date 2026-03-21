'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

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

      <div className="relative z-10 flex flex-col items-center gap-8 w-full">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="relative flex items-center justify-center"
          style={{ width: 500, height: 273 }}
        >
          {/* Concentric expanding rings */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute rounded-full pointer-events-none"
              style={{
                width: 200,
                height: 200,
                border: '1.5px solid rgba(42,181,197,0.3)',
                top: '40%',
                left: '50%',
                translateX: '-50%',
                translateY: '-50%',
              }}
              animate={{ scale: [0.4, 3], opacity: [0, 0.3, 0] }}
              transition={{
                duration: 6,
                repeat: Infinity,
                delay: i * 2,
                ease: 'easeOut',
                times: [0, 0.2, 1],
              }}
            />
          ))}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/The_Breathing_Bell_logo.png"
            alt="The Breathing Bell"
            style={{ width: '100%' }}
          />
        </motion.div>

        {/* Text content — constrained width */}
        <div className="flex flex-col items-center gap-8 max-w-sm w-full px-6" style={{ marginTop: '-20px' }}>
          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="text-xs tracking-[0.25em] uppercase"
            style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
          >
            A breathwork experience by<br />Omi Bell
          </motion.p>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.1 }}
            className="text-lg md:text-xl italic leading-relaxed"
            style={{ color: '#FFFFFF', fontFamily: 'var(--font-display)' }}
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
                backgroundColor: '#2AB5C5',
                color: '#141820',
                fontFamily: 'var(--font-body)',
                fontWeight: 400,
              }}
              onMouseEnter={(e) => {
                ;(e.target as HTMLElement).style.backgroundColor = '#0C8E9E'
              }}
              onMouseLeave={(e) => {
                ;(e.target as HTMLElement).style.backgroundColor = '#2AB5C5'
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
      </div>
    </main>
  )
}
