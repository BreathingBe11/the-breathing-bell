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
  const [emailChecking, setEmailChecking] = useState(false)
  const [ageRange, setAgeRange] = useState<AgeRange | null>(null)
  const [walkingInState, setWalkingInState] = useState<WalkingInState | null>(null)
  const [domain, setDomain] = useState<Domain | null>(null)
  const [technique, setTechnique] = useState<Technique | null>(null)
  const [duration, setDuration] = useState<number | null>(null)
  const [infoOpen, setInfoOpen] = useState<Technique | null>(null)

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
    // Validate email format and MX record on step 1
    if (step === 1) {
      if (!EMAIL_REGEX.test(email)) {
        setEmailError('Please enter a valid email address.')
        return
      }
      setEmailChecking(true)
      try {
        const res = await fetch('/api/validate-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        })
        const { valid } = await res.json()
        if (!valid) {
          setEmailError('That email address doesn\'t look valid. Please check and try again.')
          setEmailChecking(false)
          return
        }
      } catch {
        // If check fails, allow through — never block the user over a network error
      }
      setEmailChecking(false)
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
                disabled={!name.trim() || !email.trim() || !ageRange || emailChecking}
                className="w-full py-4 rounded-full text-sm tracking-[0.15em] uppercase transition-all"
                style={{
                  backgroundColor:
                    name.trim() && email.trim() && ageRange && !emailChecking ? 'var(--accent)' : 'var(--surface-2)',
                  color:
                    name.trim() && email.trim() && ageRange && !emailChecking ? 'var(--background)' : 'var(--muted)',
                  fontFamily: 'var(--font-body)',
                  cursor: name.trim() && email.trim() && ageRange && !emailChecking ? 'pointer' : 'not-allowed',
                }}
              >
                {emailChecking ? 'Checking...' : 'Continue'}
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
                    { value: 'on-the-edge', label: 'On the Edge', desc: 'Running on empty. I need to breathe.' },
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
                      value: 'box',
                      label: 'Box Breathing',
                      desc: '4-4-4-4 — balance and equilibrium',
                      info: 'Inhale for 4, hold for 4, exhale for 4, hold for 4. One of the most researched breathwork techniques — used by Navy SEALs and first responders to regulate the nervous system under pressure. Builds focus, reduces anxiety, and creates a steady internal rhythm. Great for beginners.',
                    },
                    {
                      value: 'double-inhale',
                      label: 'Double Inhale',
                      desc: 'Cyclic sighing — 2 inhales and one exhale',
                      info: 'Two inhales through the mouth followed by a slow exhale through the mouth. Stanford research shows this is the most effective real-time stress reduction technique. The double inhale fully inflates the lungs; the extended exhale signals safety to the nervous system. Fast-acting. You\'ll feel it within a few breaths.',
                    },
                    {
                      value: 'yoga-nidra',
                      label: 'Yoga Nidra',
                      desc: 'Conscious rest — body scan and deep surrender',
                      info: 'You stay awake, but your body enters a state between waking and sleep. Guided by audio, you move awareness through the body — releasing without effort. 20–30 minutes of Yoga Nidra is said to equal 2–4 hours of sleep in restorative value, making it especially powerful for improving sleep quality and recovering from sleep deprivation. You don\'t need to do anything. You may fall asleep. That\'s welcome here.',
                    },
                    ...(isLoggedIn
                      ? [
                          {
                            value: '4-7-8' as Technique,
                            label: '4-7-8 Breathing',
                            desc: 'Inhale 4 · Hold 7 · Exhale 8 — deep reset',
                            membersOnly: true,
                            info: 'Inhale for 4, hold for 7, exhale for 8. The long hold builds CO₂ tolerance; the extended exhale strongly activates the parasympathetic nervous system. More demanding than Box Breathing — the 7-count hold takes practice. Powerful for anxiety, racing thoughts, and trouble falling asleep. This one asks something of you.',
                          },
                        ]
                      : []),
                  ] as { value: Technique; label: string; desc: string; info: string; membersOnly?: boolean }[]
                ).map(({ value, label, desc, info, membersOnly }) => (
                  <div key={value} className="relative">
                    <button
                      onClick={() => {
                        setTechnique(value)
                        setDuration(null)
                      }}
                      className="w-full flex flex-col items-start px-5 py-4 rounded-xl text-left transition-all"
                      style={{
                        backgroundColor:
                          technique === value ? 'rgba(42,181,197,0.10)' : 'var(--surface-2)',
                        border: `1px solid ${technique === value ? 'var(--accent)' : 'var(--border)'}`,
                      }}
                    >
                      <span className="flex items-center gap-2 pr-7">
                        <span
                          className="text-base font-medium"
                          style={{
                            color: technique === value ? 'var(--accent)' : 'var(--foreground)',
                            fontFamily: 'var(--font-display)',
                          }}
                        >
                          {label}
                        </span>
                        {membersOnly && (
                          <span
                            className="text-xs px-1.5 py-0.5 rounded"
                            style={{
                              color: 'var(--accent)',
                              border: '1px solid var(--accent)',
                              fontFamily: 'var(--font-body)',
                              opacity: 0.7,
                            }}
                          >
                            Members
                          </span>
                        )}
                      </span>
                      <span
                        className="text-sm mt-0.5"
                        style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
                      >
                        {desc}
                      </span>
                    </button>
                    {/* ⓘ info button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setInfoOpen(value)
                      }}
                      className="absolute top-3.5 right-4 flex items-center justify-center w-5 h-5 rounded-full text-xs transition-opacity hover:opacity-100 opacity-50"
                      style={{
                        border: '1px solid var(--muted)',
                        color: 'var(--muted)',
                        fontFamily: 'var(--font-body)',
                        lineHeight: 1,
                      }}
                      aria-label={`About ${label}`}
                    >
                      i
                    </button>
                  </div>
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
                    {([5, 10, 15, 20, 25, 30] as number[]).filter(min => technique !== 'yoga-nidra' || min >= 10).map((min) => {
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

      {/* Technique info modal */}
      <AnimatePresence>
        {infoOpen && (() => {
          const allTechniques = [
            { value: 'box' as Technique, label: 'Box Breathing', info: 'Inhale for 4, hold for 4, exhale for 4, hold for 4. One of the most researched breathwork techniques — used by Navy SEALs and first responders to regulate the nervous system under pressure. Builds focus, reduces anxiety, and creates a steady internal rhythm. Great for beginners.' },
            { value: 'double-inhale' as Technique, label: 'Double Inhale', info: 'Two inhales through the mouth followed by a slow exhale through the mouth. Stanford research shows this is the most effective real-time stress reduction technique. The double inhale fully inflates the lungs; the extended exhale signals safety to the nervous system. Fast-acting. You\'ll feel it within a few breaths.' },
            { value: 'yoga-nidra' as Technique, label: 'Yoga Nidra', info: 'You stay awake, but your body enters a state between waking and sleep. Guided by audio, you move awareness through the body — releasing without effort. 20–30 minutes of Yoga Nidra is said to equal 2–4 hours of sleep in restorative value, making it especially powerful for improving sleep quality and recovering from sleep deprivation. You don\'t need to do anything. You may fall asleep. That\'s welcome here.' },
            { value: '4-7-8' as Technique, label: '4-7-8 Breathing', info: 'Inhale for 4, hold for 7, exhale for 8. The long hold builds CO₂ tolerance; the extended exhale strongly activates the parasympathetic nervous system. More demanding than Box Breathing — the 7-count hold takes practice. Powerful for anxiety, racing thoughts, and trouble falling asleep. This one asks something of you.' },
          ]
          const found = allTechniques.find(t => t.value === infoOpen)
          if (!found) return null
          return (
            <motion.div
              key="info-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-8"
              style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
              onClick={() => setInfoOpen(null)}
            >
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="w-full max-w-sm rounded-2xl p-6 flex flex-col gap-4"
                style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)' }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start justify-between gap-4">
                  <h3
                    className="text-lg font-medium"
                    style={{ color: 'var(--accent)', fontFamily: 'var(--font-display)' }}
                  >
                    {found.label}
                  </h3>
                  <button
                    onClick={() => setInfoOpen(null)}
                    className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-sm opacity-50 hover:opacity-100 transition-opacity"
                    style={{ border: '1px solid var(--muted)', color: 'var(--muted)' }}
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </div>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: 'var(--foreground)', fontFamily: 'var(--font-body)' }}
                >
                  {found.info}
                </p>
              </motion.div>
            </motion.div>
          )
        })()}
      </AnimatePresence>
    </main>
  )
}
