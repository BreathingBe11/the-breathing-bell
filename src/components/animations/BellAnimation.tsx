'use client'

import { motion } from 'framer-motion'

export default function BellAnimation() {
  return (
    <div className="relative flex items-center justify-center w-40 h-40 mx-auto">
      {/* Ambient glow */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(42,181,197,0.12) 0%, transparent 70%)' }}
      />

      {/* Ripple rings */}
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 80 + i * 40,
            height: 80 + i * 40,
            border: '1px solid rgba(42,181,197,0.3)',
          }}
          animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
          transition={{ duration: 4, repeat: Infinity, delay: i * 1.2, ease: 'easeInOut' }}
        />
      ))}

      {/* Bell SVG */}
      <motion.div
        animate={{ rotate: [0, -7, 7, -5, 5, -2, 2, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
        className="relative z-10"
      >
        <svg width="64" height="72" viewBox="0 0 64 72" fill="none">
          <path
            d="M32 4C32 4 14 16 14 40H50C50 16 32 4 32 4Z"
            fill="rgba(42,181,197,0.12)"
            stroke="#2AB5C5"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M10 40C10 40 14 48 32 48C50 48 54 40 54 40H10Z"
            fill="rgba(42,181,197,0.18)"
            stroke="#2AB5C5"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <circle cx="32" cy="52" r="3.5" fill="#2AB5C5" fillOpacity="0.6" />
          <line x1="32" y1="4" x2="32" y2="0" stroke="#2AB5C5" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="32" cy="0" r="2" fill="#2AB5C5" />
        </svg>
      </motion.div>
    </div>
  )
}
