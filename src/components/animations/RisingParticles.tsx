'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface Particle {
  id: number
  x: number
  size: number
  duration: number
  delay: number
  opacity: number
}

function generateParticle(id: number): Particle {
  return {
    id,
    x: 20 + Math.random() * 60,       // % across the container
    size: 2 + Math.random() * 4,       // px
    duration: 4 + Math.random() * 5,   // seconds to rise
    delay: Math.random() * 6,          // stagger start
    opacity: 0.3 + Math.random() * 0.5,
  }
}

const PARTICLE_COUNT = 22

export default function RisingParticles() {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    setParticles(Array.from({ length: PARTICLE_COUNT }, (_, i) => generateParticle(i)))
  }, [])

  return (
    <div className="relative flex items-center justify-center" style={{ width: 260, height: 260 }}>
      {/* Soft ambient glow at base */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 120,
          height: 120,
          bottom: 20,
          left: '50%',
          translateX: '-50%',
          background: 'radial-gradient(circle, rgba(42,181,197,0.12) 0%, transparent 70%)',
        }}
        animate={{ opacity: [0.4, 0.8, 0.4], scale: [0.95, 1.05, 0.95] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            bottom: 0,
            backgroundColor: 'rgba(42,181,197,1)',
          }}
          animate={{
            y: [0, -220],
            opacity: [0, p.opacity, p.opacity * 0.6, 0],
            scale: [0.5, 1, 0.8, 0.3],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      ))}

      {/* Center label */}
      <motion.p
        className="relative z-10 text-sm tracking-[0.2em] uppercase text-center"
        style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
        animate={{ opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        Breathe
      </motion.p>
    </div>
  )
}
