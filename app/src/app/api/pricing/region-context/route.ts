import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { detectAustralianBusinessSignals } from '@/lib/geo/pricing-region'

/**
 * GET /api/pricing/region-context
 *
 * Fetches lead data to help determine pricing region.
 * Returns Australian business signals (ABN, phone, domain TLD).
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

    // Get lead with domain info
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('id, domain, location')
      .eq('id', leadId)
      .single()

    if (leadError || !lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      )
    }

    // Try to get the latest report to check for Australian signals in crawled content
    const { data: report } = await supabase
      .from('reports')
      .select('id')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    let hasABN = false
    let hasAustralianPhone = false

    if (report) {
      // Check crawled pages for Australian business signals
      const { data: crawledPages } = await supabase
        .from('crawled_pages')
        .select('meta_description, title')
        .eq('report_id', report.id)
        .limit(10)

      if (crawledPages && crawledPages.length > 0) {
        // Combine all text content for analysis
        const combinedContent = crawledPages
          .map((page: { title: string | null; meta_description: string | null }) =>
            `${page.title || ''} ${page.meta_description || ''}`
          )
          .join(' ')

        const signals = detectAustralianBusinessSignals(combinedContent)
        hasABN = signals.hasABN
        hasAustralianPhone = signals.hasAustralianPhone
      }

      // Also check scan_analysis for more comprehensive content
      const { data: scanAnalysis } = await supabase
        .from('scan_analysis')
        .select('raw_content')
        .eq('report_id', report.id)
        .limit(1)
        .single()

      if (scanAnalysis?.raw_content) {
        const signals = detectAustralianBusinessSignals(scanAnalysis.raw_content)
        hasABN = hasABN || signals.hasABN
        hasAustralianPhone = hasAustralianPhone || signals.hasAustralianPhone
      }
    }

    return NextResponse.json({
      domain: lead.domain,
      location: lead.location,
      hasABN,
      hasAustralianPhone,
    })
  } catch (error) {
    console.error('Error fetching region context:', error)
    return NextResponse.json(
      { error: 'Failed to fetch region context' },
      { status: 500 }
    )
  }
}
