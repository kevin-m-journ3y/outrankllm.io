/**
 * HiringBrand PPTX Export API
 * POST — Generates and returns a branded PowerPoint presentation
 * No auth required (report is public via token, same as viewing)
 */

export const maxDuration = 30

import { NextRequest, NextResponse } from 'next/server'
import { fetchHBReportData } from '@/lib/hiringbrand-report-data'
import { generatePresentation } from '@/lib/pptx/generate-presentation'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    // Fetch report data using the shared fetcher
    const reportData = await fetchHBReportData(token)

    if (!reportData) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    // Generate the PPTX
    const pptxBuffer = await generatePresentation({
      ...reportData,
      trends: reportData.trends,
    })

    // Build filename from company name
    const slug = reportData.company.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    const filename = `${slug}-hiringbrand-report.pptx`

    // Return as downloadable file
    return new NextResponse(pptxBuffer, {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('PPTX export error:', error)
    const message = error instanceof Error ? error.message : 'Export failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
