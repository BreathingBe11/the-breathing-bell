import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type')

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)

    // Password reset — send to reset page to set new password
    if (type === 'recovery') {
      return NextResponse.redirect(`${origin}/reset-password`)
    }

    // Email verification — send to dashboard
    return NextResponse.redirect(`${origin}/dashboard`)
  }

  // Something went wrong
  return NextResponse.redirect(`${origin}/login`)
}
