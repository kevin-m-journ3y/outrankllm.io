import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

/**
 * GET /api/report/[token]/domain
 * Get the domain associated with a report token
 * Used by the pricing page to determine which domain to create a subscription for
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const supabase = createServiceClient()

    // Get the report and its associated domain
    const { data: report, error } = await supabase
      .from('reports')
      .select(`
        id,
        scan_runs (
          id,
          leads (
            domain
          )
        )
      `)
      .eq('url_token', token)
      .single()

    if (error || !report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    // Extract domain from nested structure
    const scanRun = report.scan_runs as { id: string; leads: { domain: string } | null } | null
    const domain = scanRun?.leads?.domain

    if (!domain) {
      return NextResponse.json({ error: 'Domain not found' }, { status: 404 })
    }

    return NextResponse.json({ domain })
  } catch (error) {
    console.error('Error fetching domain:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
