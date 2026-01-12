import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

/**
 * GET /api/scan/enrichment-status?runId=xxx
 * Returns current enrichment status for polling
 */
export async function GET(request: NextRequest) {
  const runId = request.nextUrl.searchParams.get('runId')

  if (!runId) {
    return NextResponse.json(
      { error: 'Missing runId' },
      { status: 400 }
    )
  }

  const supabase = createServiceClient()

  try {
    const { data: scanRun, error } = await supabase
      .from('scan_runs')
      .select('enrichment_status')
      .eq('id', runId)
      .single()

    if (error || !scanRun) {
      return NextResponse.json(
        { error: 'Scan not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      status: scanRun.enrichment_status || 'not_applicable',
    })
  } catch (error) {
    console.error('Enrichment status check error:', error)
    return NextResponse.json(
      { error: 'Failed to check status' },
      { status: 500 }
    )
  }
}
