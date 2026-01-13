import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { maskEmail } from '@/lib/utils/mask-email'

/**
 * GET /api/pricing/checkout-context
 *
 * Fetches checkout context for a lead, including masked email.
 * Used to show confirmation before checkout when coming from a shared report link.
 * Returns masked email to protect privacy while allowing user to verify identity.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const leadId = searchParams.get('leadId')

    if (!leadId) {
      return NextResponse.json(
        { error: 'Lead ID is required' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('id, email, domain')
      .eq('id', leadId)
      .single()

    if (leadError || !lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      maskedEmail: maskEmail(lead.email),
      domain: lead.domain,
    })
  } catch (error) {
    console.error('Error fetching checkout context:', error)
    return NextResponse.json(
      { error: 'Failed to fetch checkout context' },
      { status: 500 }
    )
  }
}
