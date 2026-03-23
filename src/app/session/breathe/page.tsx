'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useSessionStore } from '@/store/sessionStore'
import BreathingCircle from '@/components/animations/BreathingCircle'
import ChakraFigure from '@/components/animations/ChakraFigure'
import RisingParticles from '@/components/animations/RisingParticles'
import { DOMAIN_LABELS, TECHNIQUE_LABELS } from '@/types'

export default function BreatheSessionPage() {
  const router = useRouter()
  const { intake } = useSessionStore()
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [started, setStarted] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const durationSeconds = (intake.durationMinutes ?? 10) * 60

  useEffect(() => {
    if (!intake.technique) {
      router.replace('/intake')
    }
  }, [intake.technique, router])

  useEffect(() => {
    setTimeRemaining(durationSeconds)
  }, [durationSeconds])

  function startSession() {
    setStarted(true)
    // Attempt to play audio if available
    if (audioRef.current) {
      audioRef.current.play().catch(() => {})
    }
    intervalRef.current = setInterval(() => {
      setTimeRemaining((t) => {
        if (t <= 1) {
          clearInterval(intervalRef.current!)
          router.push('/session/echo')
          return 0
        }
        return t - 1
      })
    }, 1000)
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const minutes = Math.floor(timeRemaining / 60)
  const seconds = timeRemaining % 60
  const timeDisplay = `${minutes}:${seconds.toString().padStart(2, '0')}`
  const progressPct = started ? ((durationSeconds - timeRemaining) / durationSeconds) * 100 : 0

  if (!intake.technique) return null

  const isYogaNidra = intake.technique === 'yoga-nidra'
  const isDoubleInhale = intake.technique === 'double-inhale'
  const useAmbientAnimation = isYogaNidra

  return (
    <main
      className="flex flex-col items-center justify-between min-h-screen px-6 py-12"
      style={{ backgroundColor: 'var(--background)' }}
    >
      {/* Progress bar */}
      <div className="w-full max-w-sm">
        <div
          className="h-[2px] rounded-full overflow-hidden"
          style={{ backgroundColor: 'var(--border)' }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: 'var(--accent)' }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 1, ease: 'linear' }}
          />
        </div>
      </div>

      {/* Center — animation */}
      <div className="flex flex-col items-center gap-8 flex-1 justify-center w-full max-w-sm">
        {!started ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-8"
          >
            <p
              className="text-center text-lg italic"
              style={{ color: 'var(--accent-soft)', fontFamily: 'var(--font-display)' }}
            >
              Find a comfortable position.
              <br />
              When you&apos;re ready, begin.
            </p>
            <button
              onClick={startSession}
              className="px-10 py-4 rounded-full text-sm tracking-[0.15em] uppercase transition-all"
              style={{
                backgroundColor: 'var(--accent)',
                color: 'var(--background)',
                fontFamily: 'var(--font-body)',
              }}
            >
              Begin
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center gap-6 w-full"
          >
            {/* Main animation */}
            {useAmbientAnimation ? (
              <ChakraFigure durationSeconds={durationSeconds} />
            ) : isDoubleInhale ? (
              <RisingParticles />
            ) : (
              <BreathingCircle technique={intake.technique} timeRemaining={timeRemaining} />
            )}

            {/* Timer */}
            <div className="text-center flex flex-col items-center gap-4">
              <p
                className="text-3xl font-light"
                style={{ color: 'var(--foreground)', fontFamily: 'var(--font-display)' }}
              >
                {timeDisplay}
              </p>
              <button
                onClick={() => {
                  if (intervalRef.current) clearInterval(intervalRef.current)
                  if (audioRef.current) audioRef.current.pause()
                  router.push('/session/echo')
                }}
                className="text-xs tracking-[0.15em] uppercase underline underline-offset-4 transition-opacity hover:opacity-70"
                style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
              >
                Skip to my echo
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Session metadata */}
      <div className="flex flex-col items-center gap-1 w-full max-w-sm">
        <p
          className="text-xs tracking-[0.15em] uppercase"
          style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
        >
          {intake.technique ? TECHNIQUE_LABELS[intake.technique] : ''}
          {intake.domain ? ` · ${DOMAIN_LABELS[intake.domain]}` : ''}
          {intake.durationMinutes ? ` · ${intake.durationMinutes}m` : ''}
        </p>

        {/* Audio — loaded by technique + duration */}
        {intake.technique && intake.durationMinutes && intake.technique !== 'yoga-nidra' && (
          <audio key={`${intake.technique}-${intake.durationMinutes}`} ref={audioRef} preload="auto" loop={false}>
            <source
              src={`/audio/${intake.technique}/${intake.durationMinutes}min.mp3`}
              type="audio/mpeg"
            />
          </audio>
        )}
        {intake.technique === 'yoga-nidra' && intake.durationMinutes && (
          <audio key={`yoga-nidra-${intake.durationMinutes}`} ref={audioRef} preload="auto" loop={false}>
            <source
              src={`/audio/yoga-nidra/${intake.durationMinutes}min.mp3`}
              type="audio/mpeg"
            />
          </audio>
        )}
      </div>
    </main>
  )
}
