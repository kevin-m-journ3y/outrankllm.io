import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendWaitlistNotification } from '@/lib/email/resend'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Insert into waitlist (upsert to handle duplicates gracefully)
    const { error: dbError } = await supabase
      .from('waitlist')
      .upsert(
        { email: email.toLowerCase().trim(), source: 'coming-soon' },
        { onConflict: 'email', ignoreDuplicates: true }
      )

    if (dbError) {
      console.error('[Waitlist] Database error:', dbError)
      return NextResponse.json(
        { error: 'Failed to save email' },
        { status: 500 }
      )
    }

    // Send notification email (fire and forget - don't fail if this fails)
    sendWaitlistNotification(email).catch(err => {
      console.error('[Waitlist] Failed to send notification:', err)
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[Waitlist] Unexpected error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}