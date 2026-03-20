'use client'

import { motion } from 'framer-motion'

// Original logo gold palette — unchanged from the brand asset
const G = '#C4A55A'          // main gold stroke
const GF = 'rgba(196,165,90,0.14)' // transparent gold fill
const GS = 'rgba(196,165,90,0.5)'  // semi-opaque gold fill

interface Props {
  variant?: 'landing' | 'still'
}

export default function LogoBellAnimation({ variant = 'landing' }: Props) {
  const isStill = variant === 'still'
  const W = isStill ? 220 : 260
  const H = isStill ? 220 : 260
  // Scale the 300×260 viewBox to fit our W×H container
  const scale = W / 300

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: W, height: H }}
    >
      {/* Ripple rings — centered on the bell body (~60% down) */}
      {[1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            border: `1px solid rgba(196,165,90,${0.35 - i * 0.05})`,
            width:  50 * scale + i * 38 * scale,
            height: 50 * scale + i * 38 * scale,
            top: '62%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
          animate={{ scale: [1, 1.7, 1], opacity: [0.5, 0, 0.5] }}
          transition={{
            duration: isStill ? 3 : 4,
            repeat: Infinity,
            delay: i * (isStill ? 0.7 : 1.0),
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* SVG logo — split into static layer + animated bell */}
      <svg
        width={W}
        height={H}
        viewBox="0 0 300 260"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0"
      >
        {/* ── STATIC LAYER: Crown + Arms + Bar ── */}

        {/* Crown band */}
        <path d={`M 116,44 L 184,44 L 184,36 L 116,36 Z`}
          stroke={G} strokeWidth="1.4" fill={GF} />

        {/* Crown base scallops */}
        <path d="M 116,44 Q 125,50 134,44 Q 143,50 150,44 Q 157,50 166,44 Q 175,50 184,44"
          stroke={G} strokeWidth="1" fill="none" opacity="0.6" />

        {/* Left crown spire */}
        <line x1="124" y1="36" x2="116" y2="14" stroke={G} strokeWidth="1.5" strokeLinecap="round" />
        <line x1="116" y1="14" x2="124" y2="36" stroke={G} strokeWidth="1.5" strokeLinecap="round" />
        <line x1="116" y1="36" x2="124" y2="14" stroke={G} strokeWidth="1.5" strokeLinecap="round" />

        {/* Center crown spire — tallest */}
        <line x1="150" y1="36" x2="150" y2="5" stroke={G} strokeWidth="1.6" strokeLinecap="round" />

        {/* Right crown spire */}
        <line x1="176" y1="36" x2="184" y2="14" stroke={G} strokeWidth="1.5" strokeLinecap="round" />
        <line x1="184" y1="14" x2="176" y2="36" stroke={G} strokeWidth="1.5" strokeLinecap="round" />
        <line x1="184" y1="36" x2="176" y2="14" stroke={G} strokeWidth="1.5" strokeLinecap="round" />

        {/* Crown spire balls */}
        <circle cx="116" cy="13" r="3.5" fill={G} fillOpacity="0.9" />
        <circle cx="150" cy="4"  r="4"   fill={G} />
        <circle cx="184" cy="13" r="3.5" fill={G} fillOpacity="0.9" />

        {/* Crown base corner pins */}
        <circle cx="116" cy="40" r="2" fill={GS} />
        <circle cx="184" cy="40" r="2" fill={GS} />

        {/* Vertical rod: crown → horizontal bar */}
        <line x1="150" y1="44" x2="150" y2="76" stroke={G} strokeWidth="1.8" strokeLinecap="round" />

        {/* Horizontal suspension bar */}
        <line x1="96" y1="76" x2="204" y2="76" stroke={G} strokeWidth="1.6" strokeLinecap="round" />
        {/* Bar end decorative caps */}
        <circle cx="96"  cy="76" r="3" fill={G} fillOpacity="0.7" />
        <circle cx="204" cy="76" r="3" fill={G} fillOpacity="0.7" />

        {/* ── LEFT BRACKET ARM ── */}
        {/* Main sweep: from bar left end, arcs outward-up then curls */}
        <path
          d="M 96,76 C 76,76 54,72 38,60 C 22,48 14,34 20,24 C 26,14 40,14 46,22 C 52,30 44,40 36,38"
          stroke={G} strokeWidth="1.6" strokeLinecap="round" fill="none"
        />
        {/* Left scroll curl */}
        <path
          d="M 36,38 C 28,46 32,56 40,52 C 48,48 44,38 36,38"
          stroke={G} strokeWidth="1.3" strokeLinecap="round" fill="none"
        />
        {/* Left arm accent line (double-line effect) */}
        <path
          d="M 96,80 C 76,80 56,76 42,65"
          stroke={G} strokeWidth="0.7" strokeLinecap="round" fill="none" opacity="0.4"
        />

        {/* ── RIGHT BRACKET ARM (mirror) ── */}
        <path
          d="M 204,76 C 224,76 246,72 262,60 C 278,48 286,34 280,24 C 274,14 260,14 254,22 C 248,30 256,40 264,38"
          stroke={G} strokeWidth="1.6" strokeLinecap="round" fill="none"
        />
        {/* Right scroll curl */}
        <path
          d="M 264,38 C 272,46 268,56 260,52 C 252,48 256,38 264,38"
          stroke={G} strokeWidth="1.3" strokeLinecap="round" fill="none"
        />
        {/* Right arm accent line */}
        <path
          d="M 204,80 C 224,80 244,76 258,65"
          stroke={G} strokeWidth="0.7" strokeLinecap="round" fill="none" opacity="0.4"
        />

        {/* ── ANIMATED BELL — only this group rings ── */}
        <motion.g
          style={{ transformBox: 'fill-box', transformOrigin: 'center top' }}
          animate={{ rotate: [0, -8, 8, -6, 6, -2, 2, 0] }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            repeatDelay: isStill ? 1.5 : 3.5,
            ease: 'easeInOut',
          }}
        >
          {/* Bell hanger ring */}
          <rect x="144" y="76" width="12" height="10" rx="3"
            stroke={G} strokeWidth="1.4" fill={GF} />

          {/* Bell body */}
          <path
            d={`
              M 150,86
              C 146,86 138,89 134,97
              C 128,108 122,126 115,144
              C 107,164 96,183 84,196
              C 78,203 74,208 78,212
              C 82,216 100,219 150,219
              C 200,219 218,216 222,212
              C 226,208 222,203 216,196
              C 204,183 193,164 185,144
              C 178,126 172,108 166,97
              C 162,89 154,86 150,86 Z
            `}
            stroke={G} strokeWidth="1.6" fill={GF}
          />

          {/* Bell rim flare */}
          <path
            d={`
              M 78,212
              C 74,219 78,226 96,229
              C 116,232 136,234 150,234
              C 164,234 184,232 204,229
              C 222,226 226,219 222,212
            `}
            stroke={G} strokeWidth="1.5" fill="rgba(196,165,90,0.10)"
          />

          {/* ── FILIGREE / SCROLLWORK ── */}
          {/* Center vertical spine */}
          <line x1="150" y1="96" x2="150" y2="210"
            stroke={G} strokeWidth="0.7" opacity="0.4" />

          {/* Upper decorative oval */}
          <ellipse cx="150" cy="116" rx="15" ry="10"
            stroke={G} strokeWidth="1" fill="none" opacity="0.5" />

          {/* Upper filigree loops */}
          <path d="M 138,110 C 132,104 126,110 132,116 C 138,122 144,112 138,110"
            stroke={G} strokeWidth="0.9" fill="none" opacity="0.45" />
          <path d="M 162,110 C 168,104 174,110 168,116 C 162,122 156,112 162,110"
            stroke={G} strokeWidth="0.9" fill="none" opacity="0.45" />

          {/* Central heart/teardrop motif */}
          <path d="M 150,128 C 144,122 136,126 138,134 C 140,142 150,148 150,148 C 150,148 160,142 162,134 C 164,126 156,122 150,128 Z"
            stroke={G} strokeWidth="1" fill="none" opacity="0.4" />

          {/* Mid scrollwork pair */}
          <path d="M 130,158 C 124,152 118,158 124,164 C 130,170 136,160 130,158"
            stroke={G} strokeWidth="0.9" fill="none" opacity="0.4" />
          <path d="M 170,158 C 176,152 182,158 176,164 C 170,170 164,160 170,158"
            stroke={G} strokeWidth="0.9" fill="none" opacity="0.4" />

          {/* Horizontal accent lines */}
          <path d="M 102,178 C 124,175 176,175 198,178"
            stroke={G} strokeWidth="0.7" fill="none" opacity="0.3" />

          {/* Clapper stem */}
          <line x1="150" y1="219" x2="150" y2="240" stroke={G} strokeWidth="1.3" />
          {/* Clapper ball */}
          <circle cx="150" cy="245" r="6" stroke={G} strokeWidth="1.3" fill={GS} />
        </motion.g>
      </svg>
    </div>
  )
}
