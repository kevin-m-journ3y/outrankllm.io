import { NextRequest, NextResponse } from 'next/server'
import { stripe, getPriceId, type SubscriptionTier, type PricingRegion } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tier, leadId, reportToken, region = 'INTL' } = body as {
      tier: SubscriptionTier
      leadId: string
      reportToken?: string
      region?: PricingRegion
    }

    // Validate tier
    const validTiers: SubscriptionTier[] = ['starter', 'pro', 'agency']
    if (!tier || !validTiers.includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid subscription tier' },
        { status: 400 }
      )
    }

    // Validate region
    const validRegions: PricingRegion[] = ['AU', 'INTL']
    if (!validRegions.includes(region)) {
      return NextResponse.json(
        { error: 'Invalid pricing region' },
        { status: 400 }
      )
    }

    if (!leadId) {
      return NextResponse.json(
        { error: 'Lead ID is required' },
        { status: 400 }
      )
    }

    // Get lead info from database (use service client to bypass RLS)
    const supabase = createServiceClient()
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('id, email, stripe_customer_id, domain')
      .eq('id', leadId)
      .single()

    if (leadError || !lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      )
    }

    // If report token provided, get the domain from the scan
    // This helps detect upgrades vs new subscriptions
    let domain = lead.domain
    if (reportToken) {
      const { data: report } = await supabase
        .from('reports')
        .select('scan_runs(domain)')
        .eq('url_token', reportToken)
        .single()

      if (report?.scan_runs) {
        const scanRun = report.scan_runs as { domain?: string } | { domain?: string }[]
        domain = Array.isArray(scanRun) ? scanRun[0]?.domain : scanRun?.domain
      }
    }

    // Get or create Stripe customer
    let customerId = lead.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: lead.email,
        metadata: {
          lead_id: lead.id,
        },
      })
      customerId = customer.id

      // Store customer ID in database
      await supabase
        .from('leads')
        .update({ stripe_customer_id: customerId })
        .eq('id', lead.id)
    }

    // Build success/cancel URLs
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const successUrl = reportToken
      ? `${baseUrl}/subscribe/success?session_id={CHECKOUT_SESSION_ID}&report=${reportToken}`
      : `${baseUrl}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`
    const cancelUrl = reportToken
      ? `${baseUrl}/pricing?from=report&cancelled=true`
      : `${baseUrl}/pricing?cancelled=true`

    // Get the correct price ID for this tier and region
    const priceId = getPriceId(tier, region)

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      allow_promotion_codes: true,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        lead_id: lead.id,
        tier: tier,
        region: region,
        report_token: reportToken || '',
        domain: domain || '',
      },
      subscription_data: {
        metadata: {
          lead_id: lead.id,
          tier: tier,
          region: region,
        },
      },
      // Enable automatic tax calculation if needed in future
      // automatic_tax: { enabled: true },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
