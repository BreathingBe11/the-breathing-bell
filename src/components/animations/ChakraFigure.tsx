'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

const CHAKRAS = [
  { id: 'crown',      label: 'Crown',        color: '#9b59b6', symbol: '☽' },
  { id: 'third-eye',  label: 'Third Eye',    color: '#5b8dd9', symbol: '◈' },
  { id: 'throat',     label: 'Throat',       color: '#5bc4d9', symbol: '◉' },
  { id: 'heart',      label: 'Heart',        color: '#5bd98a', symbol: '✦' },
  { id: 'solar',      label: 'Solar Plexus', color: '#d9c45b', symbol: '△' },
  { id: 'sacral',     label: 'Sacral',       color: '#d9845b', symbol: '○' },
  { id: 'root',       label: 'Root',         color: '#d95b5b', symbol: '◆' },
]

interface Props {
  durationSeconds: number
}

export default function ChakraFigure({ durationSeconds: _durationSeconds }: Props) {
  const [activeIndex, setActiveIndex] = useState(0)

  // Rotate every 5 seconds, loop indefinitely
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((i) => (i + 1) % CHAKRAS.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const chakra = CHAKRAS[activeIndex]

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Stacked chakra circles — all visible, active one glows */}
      <div className="flex flex-col items-center gap-3">
        {CHAKRAS.map((c, i) => {
          const isActive = i === activeIndex
          return (
            <div key={c.id} className="relative flex items-center justify-center">
              {/* Outer pulse ring on active */}
              {isActive && (
                <motion.div
                  className="absolute rounded-full"
                  style={{
                    width: 80,
                    height: 80,
                    border: `1px solid ${c.color}`,
                    opacity: 0,
                  }}
                  animate={{ scale: [1, 1.7], opacity: [0.7, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                />
              )}

              {/* Circle */}
              <motion.div
                className="rounded-full flex items-center justify-center select-none"
                animate={{
                  width: isActive ? 68 : 48,
                  height: isActive ? 68 : 48,
                  opacity: isActive ? 1 : 0.35,
                  backgroundColor: c.color,
                  boxShadow: isActive
                    ? `0 0 28px 6px ${c.color}55`
                    : '0 0 0px 0px transparent',
                }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
              >
                <motion.span
                  animate={{ fontSize: isActive ? '22px' : '14px' }}
                  transition={{ duration: 0.6, ease: 'easeInOut' }}
                  style={{
                    color: '#fff',
                    fontFamily: 'serif',
                    lineHeight: 1,
                    display: 'block',
                  }}
                >
                  {c.symbol}
                </motion.span>
              </motion.div>
            </div>
          )
        })}
      </div>

      {/* Active chakra label */}
      <AnimatePresence mode="wait">
        <motion.p
          key={chakra.id}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.4 }}
          className="text-xs tracking-[0.25em] uppercase"
          style={{ color: chakra.color, fontFamily: 'var(--font-body)' }}
        >
          {chakra.label}
        </motion.p>
      </AnimatePresence>
    </div>
  )
}
