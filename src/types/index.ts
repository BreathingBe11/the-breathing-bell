export type AgeRange = '18-29' | '30-39' | '40-49' | '50-59' | '60+'

export type WalkingInState = 'maintaining' | 'wound-up' | 'overwhelmed' | 'on-the-edge'

export type Domain = 'body' | 'business' | 'belonging'

export type Technique = '4-7-8' | 'box' | 'yoga-nidra'

export type SubscriptionTier = 'free' | 'bell' | 'bell-annual' | '3b-society' | 'enterprise'

export interface SessionIntake {
  name: string
  email: string
  ageRange: AgeRange
  walkingInState: WalkingInState
  domain: Domain
  technique: Technique
  durationMinutes: number
}

export interface Session {
  id: string
  userId: string | null
  name: string
  ageRange: AgeRange
  technique: Technique
  domain: Domain
  walkingInState: WalkingInState
  durationMinutes: number
  echoText: string
  completedAt: string
}

export interface UserProfile {
  id: string
  email: string
  name: string
  ageRange: AgeRange
  subscriptionTier: SubscriptionTier
  createdAt: string
}

export interface QuietLogStats {
  totalSessions: number
  topDomain: Domain | null
  currentStreak: number
}

// Time unlock thresholds based on total sessions completed
export const TIME_UNLOCK_THRESHOLDS: { sessions: number; minutes: number }[] = [
  { sessions: 0, minutes: 10 },
  { sessions: 3, minutes: 15 },
  { sessions: 6, minutes: 20 },
  { sessions: 10, minutes: 25 },
  { sessions: 15, minutes: 30 },
]

export function getAvailableDurations(totalSessions: number): number[] {
  return TIME_UNLOCK_THRESHOLDS.filter((t) => totalSessions >= t.sessions).map((t) => t.minutes)
}

export const TECHNIQUE_LABELS: Record<Technique, string> = {
  '4-7-8': '4-7-8 Breathing',
  box: 'Box Breathing',
  'yoga-nidra': 'Yoga Nidra',
}

export const DOMAIN_LABELS: Record<Domain, string> = {
  body: 'Body',
  business: 'Business',
  belonging: 'Belonging',
}

export const STATE_LABELS: Record<WalkingInState, string> = {
  maintaining: 'Maintaining',
  'wound-up': 'Wound Up',
  overwhelmed: 'Overwhelmed',
  'on-the-edge': 'On the Edge',
}
