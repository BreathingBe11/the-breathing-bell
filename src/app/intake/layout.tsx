import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Begin Your Breathwork Session',
  description:
    'Choose your breathwork technique — Box Breathing, Double Inhale, Yoga Nidra, or 4-7-8. Personalise your session for stress relief, sleep, or nervous system reset.',
  alternates: { canonical: 'https://thebreathingbell.com/intake' },
  openGraph: {
    title: 'Begin Your Breathwork Session | The Breathing Bell',
    description:
      'Choose your breathwork technique and begin a guided session for stress relief, better sleep, or nervous system regulation.',
    url: 'https://thebreathingbell.com/intake',
  },
}

export default function IntakeLayout({ children }: { children: React.ReactNode }) {
  return children
}
