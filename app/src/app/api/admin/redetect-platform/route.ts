import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getAdminSession } from '@/lib/admin'
import { detectPlatformFromUrl, formatPlatformSummary } from '@/lib/ai/platform-detect'

/**
 * Admin endpoint to re-run platform detection on an existing report
 * This allows testing platform detection without triggering a full rescan
 *
 * POST /api/admin/redetect-platform
 * Body: { reportToken: string, save?: boolean }
 *
 * - reportToken: The report URL token
 * - save: If true, saves the detection results to the database (default: false for testing)
 */
export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const adminSecret = request.headers.get('x-admin-secret')
    const hasValidSecret = adminSecret && adminSecret === process.env.ADMIN_SECRET
    const adminSession = await getAdminSession()

    if (!hasValidSecret && !adminSession) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { reportToken, save = false } = body

    if (!reportToken) {
      return NextResponse.json(
        { error: 'Must provide reportToken' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Look up the domain from the report
    const { data: report, error: reportError } = await supabase
      .from('reports')
      .select(`
        id,
        scan_runs (
          id,
          domain,
          leads (
            domain
          )
        )
      `)
      .eq('url_token', reportToken)
      .single()

    if (reportError || !report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      )
    }

    // Get domain from scan_run or lead
    const scanRun = report.scan_runs as { id: string; domain: string | null; leads: { domain: string } | null } | null
    const domain = scanRun?.domain || scanRun?.leads?.domain

    if (!domain) {
      return NextResponse.json(
        { error: 'Could not determine domain for report' },
        { status: 400 }
      )
    }

    // Run platform detection
    console.log(`[redetect-platform] Running detection for ${domain}...`)
    const detection = await detectPlatformFromUrl(domain)
    const summary = formatPlatformSummary(detection)

    console.log(`[redetect-platform] Detection complete:`, {
      cms: detection.cms,
      framework: detection.framework,
      hasAiReadabilityIssues: detection.hasAiReadabilityIssues,
      signalCount: detection.detectedSignals.length,
    })

    // Optionally save to database
    if (save && scanRun?.id) {
      // Use 'unknown' if detection ran but didn't identify a CMS
      // This distinguishes "detection ran, nothing found" from "detection never ran"
      const detectedCms = detection.cms || 'unknown'

      const { error: updateError } = await supabase
        .from('site_analyses')
        .update({
          detected_cms: detectedCms,
          detected_cms_confidence: detection.cmsConfidence,
          detected_framework: detection.framework,
          detected_css_framework: detection.cssFramework,
          detected_ecommerce: detection.ecommerce,
          detected_hosting: detection.hosting,
          detected_analytics: detection.analytics,
          detected_lead_capture: detection.leadCapture,
          has_blog: detection.contentSections.hasBlog,
          has_case_studies: detection.contentSections.hasCaseStudies,
          has_resources: detection.contentSections.hasResources,
          has_faq: detection.contentSections.hasFaq,
          has_about_page: detection.contentSections.hasAboutPage,
          has_team_page: detection.contentSections.hasTeamPage,
          has_testimonials: detection.contentSections.hasTestimonials,
          is_ecommerce: detection.isEcommerce,
          has_ai_readability_issues: detection.hasAiReadabilityIssues,
          ai_readability_issues: detection.aiReadabilityIssues,
          renders_client_side: detection.rendersClientSide,
          likely_ai_generated: detection.likelyAiGenerated,
          ai_generated_signals: detection.aiSignals,
          platform_detection_signals: detection.detectedSignals,
        })
        .eq('run_id', scanRun.id)

      if (updateError) {
        console.error(`[redetect-platform] Failed to save:`, updateError)
        return NextResponse.json(
          { error: 'Failed to save detection results', details: updateError.message },
          { status: 500 }
        )
      }

      console.log(`[redetect-platform] Saved detection results to site_analyses`)
    }

    return NextResponse.json({
      success: true,
      domain,
      saved: save,
      detection,
      summary,
    })
  } catch (error) {
    console.error('[redetect-platform] Error:', error)
    return NextResponse.json(
      { error: 'Failed to detect platform', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}
