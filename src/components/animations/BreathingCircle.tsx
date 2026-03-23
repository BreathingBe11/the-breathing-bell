'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { Technique } from '@/types'

// 4-7-8: Inhale 4 (count up 1→4), Exhale 7 (count down 7→1), Hold 8 (count up 1→8)
// Box:   Inhale 4, Hold 4, Exhale 4, Hold 4
interface Phase {
  label: string
  duration: number
  direction: 'up' | 'down' | 'hold'
}

function getPhases(technique: Technique): Phase[] {
  if (technique === '4-7-8') {
    return [
      { label: 'Inhale',   duration: 4, direction: 'up' },
      { label: 'Exhale',   duration: 7, direction: 'down' },
      { label: 'Hold',     duration: 8, direction: 'up' },
    ]
  }
  if (technique === 'double-inhale') {
    return [
      { label: 'Inhale',   duration: 4, direction: 'up' },
      { label: 'Inhale +', duration: 2, direction: 'up' },
      { label: 'Exhale',   duration: 6, direction: 'down' },
    ]
  }
  // box (default)
  return [
    { label: 'Inhale', duration: 4, direction: 'up' },
    { label: 'Hold',   duration: 4, direction: 'up' },
    { label: 'Exhale', duration: 4, direction: 'down' },
    { label: 'Hold',   duration: 4, direction: 'up' },
  ]
}

// Natural breathing wind-down: simple 4s inhale / 4s exhale
const NATURAL_PHASES: Phase[] = [
  { label: 'Inhale', duration: 4, direction: 'up' },
  { label: 'Exhale', duration: 4, direction: 'down' },
]

// Switch to natural breathing in the last 30 seconds
const WINDDOWN_THRESHOLD = 30

interface Props {
  technique: Technique
  timeRemaining: number
}

function startingCounter(phase: Phase): number {
  return phase.direction === 'down' ? phase.duration : 1
}

export default function BreathingCircle({ technique, timeRemaining }: Props) {
  const isWindDown = timeRemaining <= WINDDOWN_THRESHOLD && timeRemaining > 0
  const phases = isWindDown ? NATURAL_PHASES : getPhases(technique)

  // Use refs to avoid stale closures in the interval
  const phaseIndexRef = useRef(0)
  const counterRef = useRef(startingCounter(phases[0]))

  // Display state (driven by refs)
  const [displayPhase, setDisplayPhase] = useState(phases[0])
  const [displayCounter, setDisplayCounter] = useState(counterRef.current)

  // When winddown kicks in, reset to natural phases
  useEffect(() => {
    if (isWindDown) {
      phaseIndexRef.current = 0
      counterRef.current = startingCounter(NATURAL_PHASES[0])
      setDisplayPhase(NATURAL_PHASES[0])
      setDisplayCounter(counterRef.current)
    }
  }, [isWindDown])

  useEffect(() => {
    const activePhasesRef = { current: isWindDown ? NATURAL_PHASES : getPhases(technique) }

    const interval = setInterval(() => {
      const currentPhases = activePhasesRef.current
      const phase = currentPhases[phaseIndexRef.current]
      const counter = counterRef.current

      let nextPhaseIndex = phaseIndexRef.current
      let nextCounter: number

      if (phase.direction === 'down') {
        if (counter <= 1) {
          nextPhaseIndex = (phaseIndexRef.current + 1) % currentPhases.length
          nextCounter = startingCounter(currentPhases[nextPhaseIndex])
        } else {
          nextCounter = counter - 1
        }
      } else {
        // 'up' or 'hold'
        if (counter >= phase.duration) {
          nextPhaseIndex = (phaseIndexRef.current + 1) % currentPhases.length
          nextCounter = startingCounter(currentPhases[nextPhaseIndex])
        } else {
          nextCounter = counter + 1
        }
      }

      phaseIndexRef.current = nextPhaseIndex
      counterRef.current = nextCounter
      setDisplayPhase(currentPhases[nextPhaseIndex])
      setDisplayCounter(nextCounter)
    }, 1000)

    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [technique, isWindDown])

  const isInhale = displayPhase.label === 'Inhale'
  const isExhale = displayPhase.label === 'Exhale'
  const isHold   = displayPhase.label === 'Hold'

  // Circle size: inhale=large, hold=medium-large, exhale=small
  const circleSize = isInhale ? 200 : isHold ? 165 : 120
  const glowOpacity = isInhale ? 1 : isHold ? 0.7 : 0.4

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="relative flex items-center justify-center w-64 h-64">
        {/* Ambient glow */}
        <motion.div
          className="absolute rounded-full pointer-events-none"
          animate={{
            width:  isInhale ? 240 : isHold ? 200 : 150,
            height: isInhale ? 240 : isHold ? 200 : 150,
            opacity: glowOpacity * 0.15,
          }}
          transition={{ duration: displayPhase.duration, ease: 'easeInOut' }}
          style={{ background: 'radial-gradient(circle, rgba(42,181,197,1) 0%, transparent 70%)' }}
        />

        {/* Exhale pulse rings */}
        {isExhale && (
          <>
            {[1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute rounded-full border pointer-events-none"
                style={{ borderColor: 'rgba(42,181,197,0.2)', width: 140, height: 140 }}
                animate={{ scale: [1, 1.8], opacity: [0.5, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.7, ease: 'easeOut' }}
              />
            ))}
          </>
        )}

        {/* Main circle */}
        <motion.div
          className="absolute rounded-full"
          animate={{
            width: circleSize,
            height: circleSize,
            opacity: isExhale ? [1, 0.75, 1] : 1,
          }}
          transition={{
            width:   { duration: displayPhase.duration, ease: 'easeInOut' },
            height:  { duration: displayPhase.duration, ease: 'easeInOut' },
            opacity: isExhale
              ? { duration: 1.4, repeat: Infinity, ease: 'easeInOut' }
              : { duration: 0.3 },
          }}
          style={{
            background: 'radial-gradient(circle, rgba(42,181,197,0.18) 0%, rgba(42,181,197,0.04) 70%)',
            border: '1px solid rgba(42,181,197,0.45)',
          }}
        />

        {/* Center label + counter */}
        <div className="relative z-10 flex flex-col items-center gap-1">
          <AnimatePresence mode="wait">
            <motion.span
              key={displayPhase.label}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25 }}
              className="text-xs tracking-[0.2em] uppercase"
              style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
            >
              {isWindDown && displayPhase.label === 'Inhale' ? 'Natural breath' : displayPhase.label}
            </motion.span>
          </AnimatePresence>

          <motion.span
            key={`${displayPhase.label}-${displayCounter}`}
            initial={{ opacity: 0.4, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="text-4xl font-light"
            style={{ color: 'var(--accent)', fontFamily: 'var(--font-display)' }}
          >
            {displayCounter}
          </motion.span>
        </div>
      </div>

      {/* Wind-down notice */}
      {isWindDown && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm italic text-center"
          style={{ color: 'var(--muted)', fontFamily: 'var(--font-display)' }}
        >
          Return to natural breathing
        </motion.p>
      )}
    </div>
  )
}
