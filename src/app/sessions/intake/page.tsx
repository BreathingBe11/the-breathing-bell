'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

const GOALS = [
  'Stress & anxiety',
  'Better sleep',
  'Performance & focus',
  'Emotional processing',
  'General wellness',
  'Other',
]

const HEALTH_FLAGS = [
  'Pregnancy',
  'Cardiovascular conditions',
  'Epilepsy or seizures',
  'Recent surgery',
  'Severe anxiety or PTSD',
  'Respiratory conditions',
  'None of the above',
]

export default function SessionsIntakePage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [goals, setGoals] = useState<string[]>([])
  const [healthFlags, setHealthFlags] = useState<string[]>([])

  function toggleGoal(goal: string) {
    setGoals(prev =>
      prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]
    )
  }

  function toggleHealth(flag: string) {
    if (flag === 'None of the above') {
      setHealthFlags(['None of the above'])
      return
    }
    setHealthFlags(prev => {
      const without = prev.filter(f => f !== 'None of the above')
      return without.includes(flag)
        ? without.filter(f => f !== flag)
        : [...without, flag]
    })
  }

  function handleContinue() {
    if (step === 1) {
      setStep(2)
      return
    }
    // Store answers and advance to disclaimer
    sessionStorage.setItem('tbb_intake_goals', JSON.stringify(goals))
    sessionStorage.setItem('tbb_intake_health', JSON.stringify(healthFlags))
    router.push('/sessions/disclaimer')
  }

  const hasHealthFlag =
    healthFlags.length > 0 && !healthFlags.includes('None of the above')

  return (
    <main
      className="flex flex-col items-center min-h-screen px-6 py-16"
      style={{ backgroundColor: 'var(--background)' }}
    >
      <div className="w-full max-w-sm">

        {/* Back link */}
        <button
          onClick={() => step === 1 ? router.push('/sessions') : setStep(1)}
          className="text-xs tracking-[0.2em] uppercase mb-10 inline-block"
          style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
        >
          ← Back
        </button>

        {/* Step indicator */}
        <p
          className="text-xs tracking-[0.2em] uppercase mb-6"
          style={{ color: 'var(--accent)', fontFamily: 'var(--font-body)' }}
        >
          Step {step} of 2
        </p>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-6"
            >
              <div>
                <h1
                  className="text-3xl font-medium mb-2 leading-snug"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}
                >
                  What brings you here?
                </h1>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
                >
                  Select everything that resonates. This helps Omi personalise your sessions.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {GOALS.map(goal => (
                  <button
                    key={goal}
                    onClick={() => toggleGoal(goal)}
                    className="px-4 py-2 rounded-full text-sm transition-all"
                    style={{
                      fontFamily: 'var(--font-body)',
                      backgroundColor: goals.includes(goal) ? 'var(--accent)' : 'var(--surface-2)',
                      color: goals.includes(goal) ? 'var(--background)' : 'var(--foreground)',
                      border: `1px solid ${goals.includes(goal) ? 'var(--accent)' : 'var(--border)'}`,
                    }}
                  >
                    {goal}
                  </button>
                ))}
              </div>

              <button
                onClick={handleContinue}
                disabled={goals.length === 0}
                className="w-full py-4 rounded-full text-sm tracking-[0.15em] uppercase mt-4 transition-all"
                style={{
                  backgroundColor: 'var(--accent)',
                  color: 'var(--background)',
                  fontFamily: 'var(--font-body)',
                  opacity: goals.length === 0 ? 0.4 : 1,
                }}
              >
                Continue
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-6"
            >
              <div>
                <h1
                  className="text-3xl font-medium mb-2 leading-snug"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}
                >
                  A quick health check
                </h1>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
                >
                  Select any that apply to you. Breathwork is safe for most people,
                  but some conditions require extra care.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                {HEALTH_FLAGS.map(flag => (
                  <button
                    key={flag}
                    onClick={() => toggleHealth(flag)}
                    className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl transition-all"
                    style={{
                      fontFamily: 'var(--font-body)',
                      backgroundColor: healthFlags.includes(flag) ? 'rgba(42,181,197,0.1)' : 'var(--surface-2)',
                      border: `1px solid ${healthFlags.includes(flag) ? 'var(--accent)' : 'var(--border)'}`,
                      color: 'var(--foreground)',
                      fontSize: '0.875rem',
                    }}
                  >
                    <span
                      className="w-4 h-4 rounded flex-shrink-0 flex items-center justify-center"
                      style={{
                        border: `1.5px solid ${healthFlags.includes(flag) ? 'var(--accent)' : 'var(--muted)'}`,
                        backgroundColor: healthFlags.includes(flag) ? 'var(--accent)' : 'transparent',
                        color: 'var(--background)',
                        fontSize: '0.65rem',
                      }}
                    >
                      {healthFlags.includes(flag) && '✓'}
                    </span>
                    {flag}
                  </button>
                ))}
              </div>

              {hasHealthFlag && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="px-4 py-3 rounded-xl"
                  style={{
                    backgroundColor: 'rgba(42,181,197,0.08)',
                    border: '1px solid rgba(42,181,197,0.2)',
                  }}
                >
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
                  >
                    Please consult your physician before beginning breathwork.
                    Omi will discuss this with you on your discovery call.
                  </p>
                </motion.div>
              )}

              <button
                onClick={handleContinue}
                disabled={healthFlags.length === 0}
                className="w-full py-4 rounded-full text-sm tracking-[0.15em] uppercase mt-2 transition-all"
                style={{
                  backgroundColor: 'var(--accent)',
                  color: 'var(--background)',
                  fontFamily: 'var(--font-body)',
                  opacity: healthFlags.length === 0 ? 0.4 : 1,
                }}
              >
                Continue
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </main>
  )
}
