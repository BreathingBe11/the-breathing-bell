'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import LogoBellAnimation from '@/components/animations/LogoBellAnimation'

const BOWL_DURATION = 60

export default function StillPage() {
  const router = useRouter()
  const [timeRemaining, setTimeRemaining] = useState(BOWL_DURATION)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
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

    return () => clearInterval(intervalRef.current!)
  }, [router])

  function skipToEcho() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (audioRef.current) audioRef.current.pause()
    router.push('/session/echo')
  }

  const progress = ((BOWL_DURATION - timeRemaining) / BOWL_DURATION) * 100

  return (
    <main
      className="flex flex-col items-center justify-center min-h-screen px-6 text-center"
      style={{ backgroundColor: 'var(--background)' }}
    >
      <div className="mb-6">
        <LogoBellAnimation variant="still" />
      </div>

      {/* Text */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="flex flex-col items-center gap-4 mb-10"
      >
        <h2
          className="text-2xl font-medium"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}
        >
          Be still.
        </h2>
        <p
          className="text-sm leading-relaxed max-w-xs"
          style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
        >
          Eyes closed. Breath natural.
          <br />
          Let the bowl carry you.
        </p>
      </motion.div>

      {/* Countdown */}
      <p
        className="text-4xl font-light mb-8"
        style={{ color: 'var(--accent)', fontFamily: 'var(--font-display)' }}
      >
        {timeRemaining}
      </p>

      {/* Progress arc */}
      <div className="w-48 h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: 'var(--accent)' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: 'linear' }}
        />
      </div>

      {/* Skip */}
      <button
        onClick={skipToEcho}
        className="mt-8 text-xs tracking-[0.15em] uppercase underline underline-offset-4 transition-opacity hover:opacity-70"
        style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
      >
        Skip to my echo
      </button>

      {/* Hidden audio — swap with real bowl recording */}
      <audio ref={audioRef} preload="auto">
        <source src="/audio/singing-bowl.mp3" type="audio/mpeg" />
      </audio>
    </main>
  )
}
