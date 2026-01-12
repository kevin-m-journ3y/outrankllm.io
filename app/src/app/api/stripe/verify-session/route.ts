import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServiceClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
})

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      )
    }

    // Get the lead from the metadata
    const leadId = session.metadata?.lead_id
    if (!leadId) {
      return NextResponse.json(
        { error: 'Lead not found in session' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Get the lead details
    const { data: lead, error } = await supabase
      .from('leads')
      .select('id, email, tier, password_hash')
      .eq('id', leadId)
      .single()

    if (error || !lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      )
    }

    // Check if this is a domain addition (has domain_subscription_id in metadata)
    const domainSubscriptionId = session.metadata?.domain_subscription_id
    let domain: string | null = session.metadata?.domain || null
    let isNewDomain = false
    let isUpgrade = false

    if (domainSubscriptionId) {
      // This is a domain addition - get the domain name
      const { data: domainSub } = await supabase
        .from('domain_subscriptions')
        .select('domain')
        .eq('id', domainSubscriptionId)
        .single()

      if (domainSub) {
        domain = domainSub.domain
        isNewDomain = true
      }
    } else if (domain) {
      // Not a domain addition - check if this is an upgrade (existing scan being enriched)
      // An upgrade means user had a free report and is now subscribing to get enrichment
      const { data: existingScan } = await supabase
        .from('scan_runs')
        .select('id')
        .eq('lead_id', leadId)
        .eq('domain', domain)
        .eq('status', 'complete')
        .limit(1)
        .single()

      if (existingScan) {
        // User has an existing completed scan - this is an upgrade, not a new scan
        isUpgrade = true
      }
    }

    return NextResponse.json({
      email: lead.email,
      tier: lead.tier,
      hasPassword: !!lead.password_hash,
      isNewDomain,
      isUpgrade,
      domain,
    })
  } catch (error) {
    console.error('Verify session error:', error)
    return NextResponse.json(
      { error: 'Failed to verify session' },
      { status: 500 }
    )
  }
}
