import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { requireAdminSession } from '@/lib/admin'
import { getFeatureFlagsForLead } from '@/lib/features/flags'

/**
 * Admin endpoint to fetch report data with user information
 * Bypasses verification and expiry checks
 *
 * GET /api/admin/report?token=xxx
 */
export async function GET(request: NextRequest) {
  try {
    // Require admin session
    await requireAdminSession()

    const token = request.nextUrl.searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Report token is required' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Fetch report with all related data
    const { data: report, error: reportError } = await supabase
      .from('reports')
      .select(`
        *,
        competitive_summary,
        run:scan_runs(
          id,
          created_at,
          completed_at,
          enrichment_status,
          domain_subscription_id,
          domain,
          lead:leads(
            id,
            email,
            domain,
            email_verified,
            tier,
            marketing_opt_in,
            created_at,
            last_login_at,
            password_set_at,
            stripe_customer_id,
            ip_country,
            ip_city,
            ip_region,
            ip_timezone,
            terms_accepted_at
          ),
          domain_subscription:domain_subscriptions(
            id,
            domain,
            tier,
            status,
            stripe_subscription_id,
            current_period_start,
            current_period_end,
            created_at
          )
        )
      `)
      .eq('url_token', token)
      .single()

    if (reportError || !report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      )
    }

    const lead = report.run?.lead as {
      id: string
      email: string
      domain: string
      email_verified: boolean
      tier: string
      marketing_opt_in: boolean | null
      created_at: string
      last_login_at: string | null
      password_set_at: string | null
      stripe_customer_id: string | null
      ip_country: string | null
      ip_city: string | null
      ip_region: string | null
      ip_timezone: string | null
      terms_accepted_at: string | null
    } | null

    const runId = report.run?.id as string
    const runCreatedAt = report.run?.created_at as string
    const runCompletedAt = report.run?.completed_at as string | null
    const enrichmentStatus = report.run?.enrichment_status as string
    const domainSubscriptionId = report.run?.domain_subscription_id as string | null
    const scanDomain = report.run?.domain as string | null
    const domainSubscription = report.run?.domain_subscription as {
      id: string
      domain: string
      tier: string
      status: string
      stripe_subscription_id: string | null
      current_period_start: string | null
      current_period_end: string | null
      created_at: string
    } | null

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found for report' },
        { status: 404 }
      )
    }

    // Get domain from scan run, subscription, or lead (priority order)
    const reportDomain = scanDomain || domainSubscription?.domain || lead.domain

    // Get feature flags
    const featureFlags = await getFeatureFlagsForLead(lead.id)

    // Fetch site analysis
    const { data: analysis } = await supabase
      .from('site_analyses')
      .select(`
        business_type, business_name, services, location, target_audience, key_phrases, industry,
        pages_crawled, has_sitemap, has_robots_txt, schema_types, has_meta_descriptions
      `)
      .eq('run_id', runId)
      .single()

    // Fetch prompts
    const { data: prompts } = await supabase
      .from('scan_prompts')
      .select('id, prompt_text, category')
      .eq('run_id', runId)
      .order('created_at', { ascending: true })

    // Fetch subscriber questions if applicable
    let subscriberQuestions = null
    if (featureFlags.isSubscriber && domainSubscriptionId) {
      const { data } = await supabase
        .from('subscriber_questions')
        .select('id, prompt_text, category, source')
        .eq('domain_subscription_id', domainSubscriptionId)
        .eq('is_active', true)
        .eq('is_archived', false)
        .order('sort_order', { ascending: true })

      subscriberQuestions = data
    }

    // Fetch LLM responses
    const { data: responses } = await supabase
      .from('llm_responses')
      .select(`
        platform,
        response_text,
        domain_mentioned,
        prompt:scan_prompts(prompt_text)
      `)
      .eq('run_id', runId)
      .order('created_at', { ascending: true })

    // Fetch brand awareness
    const { data: brandAwareness } = await supabase
      .from('brand_awareness_results')
      .select(`
        platform, query_type, tested_entity, tested_attribute,
        entity_recognized, attribute_mentioned, response_text,
        confidence_score, compared_to, positioning
      `)
      .eq('run_id', runId)
      .order('created_at', { ascending: true })

    // Count how many times user has viewed the report
    const { data: viewStats } = await supabase
      .from('reports')
      .select('verified_views')
      .eq('url_token', token)
      .single()

    // Get all scan runs for this lead to see history (include report scores)
    const { data: scanHistory } = await supabase
      .from('scan_runs')
      .select('id, created_at, completed_at, status, domain, reports(url_token, visibility_score, platform_scores)')
      .eq('lead_id', lead.id)
      .order('created_at', { ascending: false })
      .limit(10)

    // Build user info for admin overlay
    const userInfo = {
      email: lead.email,
      leadId: lead.id,
      signedUpAt: lead.created_at,
      emailVerified: lead.email_verified,
      termsAcceptedAt: lead.terms_accepted_at,
      lastLoginAt: lead.last_login_at,
      hasPassword: !!lead.password_set_at,
      passwordSetAt: lead.password_set_at,
      stripeCustomerId: lead.stripe_customer_id,
      marketingOptIn: lead.marketing_opt_in,
      tier: featureFlags.tier,
      isSubscriber: featureFlags.isSubscriber,
      // Geo info
      location: {
        country: lead.ip_country,
        city: lead.ip_city,
        region: lead.ip_region,
        timezone: lead.ip_timezone,
      },
      // Subscription info
      subscription: domainSubscription ? {
        id: domainSubscription.id,
        domain: domainSubscription.domain,
        tier: domainSubscription.tier,
        status: domainSubscription.status,
        stripeSubscriptionId: domainSubscription.stripe_subscription_id,
        currentPeriodStart: domainSubscription.current_period_start,
        currentPeriodEnd: domainSubscription.current_period_end,
        createdAt: domainSubscription.created_at,
      } : null,
      // Report viewing stats
      reportViews: viewStats?.verified_views || 0,
      // Scan history (flatten report data into each scan entry)
      scanHistory: (scanHistory || []).map((scan: { id: string; created_at: string; completed_at: string | null; status: string; domain: string | null; reports: { url_token: string; visibility_score: number; platform_scores: Record<string, number> }[] | { url_token: string; visibility_score: number; platform_scores: Record<string, number> } | null }) => {
        const report = Array.isArray(scan.reports) ? scan.reports[0] : scan.reports
        return {
          id: scan.id,
          created_at: scan.created_at,
          completed_at: scan.completed_at,
          status: scan.status,
          domain: scan.domain,
          url_token: report?.url_token || null,
          visibility_score: report?.visibility_score ?? null,
          platform_scores: report?.platform_scores || null,
        }
      }),
    }

    // Build report data (same structure as normal report page)
    const reportData = {
      report: {
        id: report.id,
        url_token: report.url_token,
        visibility_score: report.visibility_score,
        platform_scores: report.platform_scores || {},
        top_competitors: report.top_competitors || [],
        summary: report.summary || '',
        run_id: runId,
        created_at: runCreatedAt,
        completed_at: runCompletedAt,
        requires_verification: report.requires_verification ?? true,
        expires_at: report.expires_at,
        subscriber_only: report.subscriber_only ?? false,
        enrichment_status: enrichmentStatus,
      },
      analysis: analysis ? {
        business_type: analysis.business_type,
        business_name: analysis.business_name,
        services: analysis.services || [],
        location: analysis.location,
        target_audience: analysis.target_audience,
        key_phrases: analysis.key_phrases || [],
        industry: analysis.industry,
      } : null,
      crawlData: analysis ? {
        hasSitemap: analysis.has_sitemap ?? false,
        hasRobotsTxt: analysis.has_robots_txt ?? false,
        pagesCrawled: analysis.pages_crawled ?? 0,
        schemaTypes: analysis.schema_types ?? [],
        hasMetaDescriptions: analysis.has_meta_descriptions ?? false,
      } : null,
      responses,
      prompts,
      subscriberQuestions,
      brandAwareness,
      competitiveSummary: report.competitive_summary,
      email: lead.email,
      domain: reportDomain,
      leadId: lead.id,
      runId,
      domainSubscriptionId,
      // Always mark as verified for admin view
      isVerified: true,
      featureFlags,
      sitemapUsed: analysis?.has_sitemap ?? false,
      hasMarketingOptIn: lead.marketing_opt_in,
    }

    return NextResponse.json({
      success: true,
      reportData,
      userInfo,
    })
  } catch (error) {
    console.error('Admin report fetch error:', error)

    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
