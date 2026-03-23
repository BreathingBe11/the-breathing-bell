import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'The Breathing Bell'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  const cinzel = await fetch(
    'https://fonts.gstatic.com/s/cinzel/v23/8vIU7ww63mVu7gtR-kwKxNvkNOjw-tbnTYrvDE5ZdqU.woff2'
  ).then((res) => res.arrayBuffer())

  return new ImageResponse(
    (
      <div
        style={{
          background: '#141820',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 32,
        }}
      >
        {/* Bell icon — simple SVG inline */}
        <svg
          width="90"
          height="90"
          viewBox="0 0 100 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M50 10 C30 10 18 28 18 50 L18 80 L10 90 L90 90 L82 80 L82 50 C82 28 70 10 50 10Z"
            fill="#e8e2d9"
          />
          <circle cx="50" cy="98" r="10" fill="#e8e2d9" />
          <rect x="43" y="4" width="14" height="10" rx="7" fill="#e8e2d9" />
        </svg>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div
            style={{
              fontFamily: 'Cinzel',
              fontSize: 72,
              fontWeight: 700,
              color: '#e8e2d9',
              letterSpacing: '0.08em',
            }}
          >
            THE BREATHING BELL
          </div>
          <div
            style={{
              fontFamily: 'Cinzel',
              fontSize: 22,
              fontWeight: 400,
              color: '#2ab5c5',
              letterSpacing: '0.2em',
            }}
          >
            BREATHWORK APP
          </div>
          <div
            style={{
              fontFamily: 'Cinzel',
              fontSize: 18,
              fontWeight: 400,
              color: '#7a8a99',
              letterSpacing: '0.15em',
              marginTop: 8,
            }}
          >
            Guided wellness sessions with Omi Bell
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: 'Cinzel',
          data: cinzel,
          style: 'normal',
          weight: 700,
        },
      ],
    }
  )
}
