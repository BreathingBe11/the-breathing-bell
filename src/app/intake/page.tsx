'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useSessionStore } from '@/store/sessionStore'
import { AgeRange, WalkingInState, Domain, Technique, getAvailableDurations, TIME_UNLOCK_THRESHOLDS } from '@/types'
import { createClient } from '@/lib/supabase/client'

// Stored total sessions from localStorage for time unlock (pre-auth)
function getStoredSessionCount(): number {
  if (typeof window === 'undefined') return 0
  return parseInt(localStorage.getItem('tbb_session_count') || '0', 10)
}

export default function IntakePage() {
  const router = useRouter()
  const { setIntake } = useSessionStore()
  const supabase = createClient()

  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [ageRange, setAgeRange] = useState<AgeRange | null>(null)
  const [walkingInState, setWalkingInState] = useState<WalkingInState | null>(null)
  const [domain, setDomain] = useState<Domain | null>(null)
  const [technique, setTechnique] = useState<Technique | null>(null)
  const [duration, setDuration] = useState<number | null>(null)

  const totalSessions = getStoredSessionCount()
  const availableDurations = getAvailableDurations(totalSessions)

  // If logged in, pre-fill from profile and skip to step 2
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return
      setIsLoggedIn(true)
      setEmail(session.user.email ?? '')

      const { data: profile } = await supabase
        .from('profiles')
        .select('name, age_range')
        .eq('id', session.user.id)
        .single()

      if (profile) {
        setName(profile.name ?? '')
        setAgeRange(profile.age_range ?? null)
      }

      setStep(2)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // For logged-in users, step 2 = display step 1 of 3, etc.
  const totalSteps = isLoggedIn ? 3 : 4
  const displayStep = isLoggedIn ? step - 1 : step

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  async function next() {
    // Validate email format on step 1
    if (step === 1) {
      if (!EMAIL_REGEX.test(email)) {
        setEmailError('Please enter a valid email address.')
        return
      }
      setEmailError('')
    }

    // Capture lead email silently on step 1
    if (step === 1 && name && email && ageRange) {
      fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, age_range: ageRange }),
      }).catch(() => {}) // fire and forget — never block the user
    }
    setStep((s) => s + 1)
  }

  function back() {
    if (isLoggedIn && step === 2) {
      router.push('/dashboard')
      return
    }
    setStep((s) => s - 1)
  }

  function handleBegin() {
    if (!walkingInState || !domain || !technique || !duration) return
    // For logged-in users, name/email/ageRange may not be on profile yet — use fallbacks
    setIntake({
      name: name || 'Guest',
      email: email || '',
      ageRange: ageRange || '30-39',
      walkingInState,
      domain,
      technique,
      durationMinutes: duration,
    })
    router.push('/session/breathe')
  }

  const slideVariants = {
    enter: { opacity: 0, x: 30 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
  }

  return (
    <main
      className="flex flex-col items-center justify-center min-h-screen px-6 py-12"
      style={{ backgroundColor: 'var(--background)' }}
    >
      {/* Progress bar */}
      <div className="w-full max-w-sm mb-10">
        <div className="flex gap-1.5">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className="h-[2px] flex-1 rounded-full transition-all duration-500"
              style={{
                backgroundColor: i < displayStep ? 'var(--accent)' : 'var(--border)',
              }}
            />
          ))}
        </div>
      </div>

      <div className="w-full max-w-sm">
        <AnimatePresence mode="wait">
          {/* Step 1 — Name + Age */}
          {step === 1 && (
            <motion.div
              key="step1"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35 }}
              className="flex flex-col gap-8"
            >
              <div>
                <p
                  className="text-xs tracking-[0.2em] uppercase mb-4"
                  style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
                >
                  Step 1 of 4
                </p>
                <h2
                  className="text-2xl font-medium mb-1"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}
                >
                  Who&apos;s arriving?
                </h2>
              </div>

              <div className="flex flex-col gap-4">
                <input
                  type="text"
                  placeholder="Your first name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl text-base outline-none transition-all"
                  style={{
                    backgroundColor: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    color: 'var(--foreground)',
                    fontFamily: 'var(--font-body)',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
                />
                <div className="flex flex-col gap-1">
                  <input
                    type="email"
                    placeholder="Your email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setEmailError('') }}
                    className="w-full px-4 py-3.5 rounded-xl text-base outline-none transition-all"
                    style={{
                      backgroundColor: 'var(--surface-2)',
                      border: `1px solid ${emailError ? '#f87171' : 'var(--border)'}`,
                      color: 'var(--foreground)',
                      fontFamily: 'var(--font-body)',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = emailError ? '#f87171' : 'var(--accent)')}
                    onBlur={(e) => (e.target.style.borderColor = emailError ? '#f87171' : 'var(--border)')}
                  />
                  {emailError && (
                    <p className="text-xs text-red-400 px-1" style={{ fontFamily: 'var(--font-body)' }}>
                      {emailError}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {(['18-29', '30-39', '40-49', '50-59', '60+'] as AgeRange[]).map((range) => (
                    <button
                      key={range}
                      onClick={() => setAgeRange(range)}
                      className="py-3 rounded-xl text-sm transition-all"
                      style={{
                        backgroundColor:
                          ageRange === range ? 'var(--accent)' : 'var(--surface-2)',
                        color: ageRange === range ? 'var(--background)' : 'var(--foreground)',
                        border: `1px solid ${ageRange === range ? 'var(--accent)' : 'var(--border)'}`,
                        fontFamily: 'var(--font-body)',
                      }}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={next}
                disabled={!name.trim() || !email.trim() || !ageRange}
                className="w-full py-4 rounded-full text-sm tracking-[0.15em] uppercase transition-all"
                style={{
                  backgroundColor:
                    name.trim() && email.trim() && ageRange ? 'var(--accent)' : 'var(--surface-2)',
                  color:
                    name.trim() && email.trim() && ageRange ? 'var(--background)' : 'var(--muted)',
                  fontFamily: 'var(--font-body)',
                  cursor: name.trim() && email.trim() && ageRange ? 'pointer' : 'not-allowed',
                }}
              >
                Continue
              </button>
            </motion.div>
          )}

          {/* Step 2 — Walking-in state */}
          {step === 2 && (
            <motion.div
              key="step2"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35 }}
              className="flex flex-col gap-8"
            >
              <div>
                <p
                  className="text-xs tracking-[0.2em] uppercase mb-4"
                  style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
                >
                  Step {displayStep} of {totalSteps}
                </p>
                <h2
                  className="text-2xl font-medium mb-1"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}
                >
                  How are you walking in?
                </h2>
              </div>

              <div className="flex flex-col gap-3">
                {(
                  [
                    { value: 'maintaining', label: 'Maintaining', desc: 'Steady. I\'m here to deepen.' },
                    { value: 'wound-up', label: 'Wound Up', desc: 'High energy. I need to release.' },
                    { value: 'overwhelmed', label: 'Overwhelmed', desc: 'Too much. I need stillness.' },
                    { value: 'on-the-edge', label: 'On the Edge', desc: 'Raw. I need to be witnessed.' },
                  ] as { value: WalkingInState; label: string; desc: string }[]
                ).map(({ value, label, desc }) => (
                  <button
                    key={value}
                    onClick={() => setWalkingInState(value)}
                    className="flex flex-col items-start px-5 py-4 rounded-xl text-left transition-all"
                    style={{
                      backgroundColor:
                        walkingInState === value ? 'rgba(42,181,197,0.10)' : 'var(--surface-2)',
                      border: `1px solid ${walkingInState === value ? 'var(--accent)' : 'var(--border)'}`,
                    }}
                  >
                    <span
                      className="text-base font-medium"
                      style={{
                        color:
                          walkingInState === value ? 'var(--accent)' : 'var(--foreground)',
                        fontFamily: 'var(--font-display)',
                      }}
                    >
                      {label}
                    </span>
                    <span
                      className="text-sm mt-0.5"
                      style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
                    >
                      {desc}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={back}
                  className="flex-1 py-4 rounded-full text-sm tracking-[0.15em] uppercase transition-all"
                  style={{
                    backgroundColor: 'var(--surface-2)',
                    color: 'var(--muted)',
                    border: '1px solid var(--border)',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  Back
                </button>
                <button
                  onClick={next}
                  disabled={!walkingInState}
                  className="flex-[2] py-4 rounded-full text-sm tracking-[0.15em] uppercase transition-all"
                  style={{
                    backgroundColor: walkingInState ? 'var(--accent)' : 'var(--surface-2)',
                    color: walkingInState ? 'var(--background)' : 'var(--muted)',
                    fontFamily: 'var(--font-body)',
                    cursor: walkingInState ? 'pointer' : 'not-allowed',
                  }}
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3 — Domain */}
          {step === 3 && (
            <motion.div
              key="step3"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35 }}
              className="flex flex-col gap-8"
            >
              <div>
                <p
                  className="text-xs tracking-[0.2em] uppercase mb-4"
                  style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
                >
                  Step {displayStep} of {totalSteps}
                </p>
                <h2
                  className="text-2xl font-medium mb-1"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}
                >
                  Where do you need it most?
                </h2>
              </div>

              <div className="flex flex-col gap-3">
                {(
                  [
                    {
                      value: 'body',
                      label: 'Body',
                      desc: 'Physical presence. Rest. Somatic release.',
                    },
                    {
                      value: 'business',
                      label: 'Business',
                      desc: 'Clarity. Leadership. Performance under pressure.',
                    },
                    {
                      value: 'belonging',
                      label: 'Belonging',
                      desc: 'Connection. Self-worth. Showing up for yourself.',
                    },
                  ] as { value: Domain; label: string; desc: string }[]
                ).map(({ value, label, desc }) => (
                  <button
                    key={value}
                    onClick={() => setDomain(value)}
                    className="flex flex-col items-start px-5 py-5 rounded-xl text-left transition-all"
                    style={{
                      backgroundColor:
                        domain === value ? 'rgba(42,181,197,0.10)' : 'var(--surface-2)',
                      border: `1px solid ${domain === value ? 'var(--accent)' : 'var(--border)'}`,
                    }}
                  >
                    <span
                      className="text-xl font-medium mb-1"
                      style={{
                        color: domain === value ? 'var(--accent)' : 'var(--foreground)',
                        fontFamily: 'var(--font-display)',
                      }}
                    >
                      {label}
                    </span>
                    <span
                      className="text-sm"
                      style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
                    >
                      {desc}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={back}
                  className="flex-1 py-4 rounded-full text-sm tracking-[0.15em] uppercase transition-all"
                  style={{
                    backgroundColor: 'var(--surface-2)',
                    color: 'var(--muted)',
                    border: '1px solid var(--border)',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  Back
                </button>
                <button
                  onClick={next}
                  disabled={!domain}
                  className="flex-[2] py-4 rounded-full text-sm tracking-[0.15em] uppercase transition-all"
                  style={{
                    backgroundColor: domain ? 'var(--accent)' : 'var(--surface-2)',
                    color: domain ? 'var(--background)' : 'var(--muted)',
                    fontFamily: 'var(--font-body)',
                    cursor: domain ? 'pointer' : 'not-allowed',
                  }}
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 4 — Technique + Duration */}
          {step === 4 && (
            <motion.div
              key="step4"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35 }}
              className="flex flex-col gap-8"
            >
              <div>
                <p
                  className="text-xs tracking-[0.2em] uppercase mb-4"
                  style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
                >
                  Step {displayStep} of {totalSteps}
                </p>
                <h2
                  className="text-2xl font-medium mb-1"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}
                >
                  Choose your practice
                </h2>
              </div>

              {/* Technique selection */}
              <div className="flex flex-col gap-3">
                {(
                  [
                    {
                      value: '4-7-8',
                      label: '4-7-8 Breathing',
                      desc: 'Inhale 4 · Hold 7 · Exhale 8 — deep reset',
                    },
                    {
                      value: 'box',
                      label: 'Box Breathing',
                      desc: '4-4-4-4 — balance and equilibrium',
                    },
                    {
                      value: 'double-inhale',
                      label: 'Double Inhale',
                      desc: 'Cyclic sighing — 2 inhales and one exhale',
                    },
                    {
                      value: 'yoga-nidra',
                      label: 'Yoga Nidra',
                      desc: 'Conscious rest — body scan and deep surrender',
                    },
                  ] as { value: Technique; label: string; desc: string }[]
                ).map(({ value, label, desc }) => (
                  <button
                    key={value}
                    onClick={() => {
                      setTechnique(value)
                      setDuration(null)
                    }}
                    className="flex flex-col items-start px-5 py-4 rounded-xl text-left transition-all"
                    style={{
                      backgroundColor:
                        technique === value ? 'rgba(42,181,197,0.10)' : 'var(--surface-2)',
                      border: `1px solid ${technique === value ? 'var(--accent)' : 'var(--border)'}`,
                    }}
                  >
                    <span
                      className="text-base font-medium"
                      style={{
                        color: technique === value ? 'var(--accent)' : 'var(--foreground)',
                        fontFamily: 'var(--font-display)',
                      }}
                    >
                      {label}
                    </span>
                    <span
                      className="text-sm mt-0.5"
                      style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
                    >
                      {desc}
                    </span>
                  </button>
                ))}
              </div>

              {/* Duration selection — shown after technique chosen */}
              {technique && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <p
                    className="text-xs tracking-[0.2em] uppercase mb-3"
                    style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
                  >
                    Duration
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {([10, 15, 20, 25, 30] as number[]).map((min) => {
                      const isUnlocked = availableDurations.includes(min)
                      return (
                        <button
                          key={min}
                          onClick={() => isUnlocked && setDuration(min)}
                          disabled={!isUnlocked}
                          className="relative px-5 py-2.5 rounded-full text-sm transition-all"
                          style={{
                            backgroundColor:
                              duration === min
                                ? 'var(--accent)'
                                : isUnlocked
                                ? 'var(--surface-2)'
                                : 'var(--surface)',
                            color:
                              duration === min
                                ? 'var(--background)'
                                : isUnlocked
                                ? 'var(--foreground)'
                                : 'var(--border)',
                            border: `1px solid ${
                              duration === min
                                ? 'var(--accent)'
                                : isUnlocked
                                ? 'var(--border)'
                                : 'var(--surface-2)'
                            }`,
                            fontFamily: 'var(--font-body)',
                            cursor: isUnlocked ? 'pointer' : 'not-allowed',
                          }}
                          title={
                            !isUnlocked
                              ? `Unlocks after more sessions`
                              : undefined
                          }
                        >
                          {min}m{!isUnlocked && <span className="ml-1 opacity-40">🔒</span>}
                        </button>
                      )
                    })}
                  </div>
                  {(() => {
                    const next = TIME_UNLOCK_THRESHOLDS.find(t => totalSessions < t.sessions)
                    if (!next) return null
                    const sessionsNeeded = next.sessions - totalSessions
                    return (
                      <p
                        className="text-xs mt-2"
                        style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
                      >
                        {sessionsNeeded === 1
                          ? `1 more session to unlock ${next.minutes}m`
                          : `${sessionsNeeded} more sessions to unlock ${next.minutes}m`}
                      </p>
                    )
                  })()}
                </motion.div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={back}
                  className="flex-1 py-4 rounded-full text-sm tracking-[0.15em] uppercase"
                  style={{
                    backgroundColor: 'var(--surface-2)',
                    color: 'var(--muted)',
                    border: '1px solid var(--border)',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  Back
                </button>
                <button
                  onClick={handleBegin}
                  disabled={!technique || !duration}
                  className="flex-[2] py-4 rounded-full text-sm tracking-[0.15em] uppercase transition-all"
                  style={{
                    backgroundColor:
                      technique && duration ? 'var(--accent)' : 'var(--surface-2)',
                    color:
                      technique && duration ? 'var(--background)' : 'var(--muted)',
                    fontFamily: 'var(--font-body)',
                    cursor: technique && duration ? 'pointer' : 'not-allowed',
                  }}
                >
                  Begin
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}
