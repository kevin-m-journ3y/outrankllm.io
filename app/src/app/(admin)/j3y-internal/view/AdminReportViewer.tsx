'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { FloatingPixels } from '@/components/landing/FloatingPixels'
import { ReportTabs } from '@/components/report/ReportTabs'
import { AdminOverlay } from './AdminOverlay'
import {
  Search,
  AlertCircle,
  Loader2,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react'
import type { FeatureFlags } from '@/lib/features/flags'

type EnrichmentStatus = 'pending' | 'processing' | 'complete' | 'failed' | 'not_applicable'

interface ReportData {
  report: {
    id: string
    url_token: string
    visibility_score: number
    platform_scores: Record<string, number>
    top_competitors: { name: string; count: number }[]
    summary: string
    run_id: string
    created_at: string
    completed_at: string | null
    requires_verification: boolean
    expires_at: string | null
    subscriber_only: boolean
    enrichment_status: EnrichmentStatus
  }
  analysis: {
    business_type: string
    business_name: string | null
    services: string[]
    location: string | null
    target_audience?: string | null
    key_phrases?: string[]
    industry?: string
  } | null
  crawlData: {
    hasSitemap: boolean
    hasRobotsTxt: boolean
    pagesCrawled: number
    schemaTypes: string[]
    hasMetaDescriptions: boolean
  } | null
  responses: {
    platform: string
    response_text: string
    domain_mentioned: boolean
    prompt: { prompt_text: string } | null
  }[] | null
  prompts: {
    id: string
    prompt_text: string
    category: string
  }[] | null
  subscriberQuestions: {
    id: string
    prompt_text: string
    category: string
    source: 'ai_generated' | 'user_created'
  }[] | null
  brandAwareness: {
    platform: string
    query_type: string
    tested_entity: string
    tested_attribute: string | null
    entity_recognized: boolean
    attribute_mentioned: boolean
    response_text: string
    confidence_score: number
    compared_to: string | null
    positioning: string | null
  }[] | null
  competitiveSummary: {
    strengths: string[]
    weaknesses: string[]
    opportunities: string[]
    overallPosition: string
  } | null
  email: string
  domain: string
  leadId: string
  runId: string
  domainSubscriptionId: string | null
  isVerified: boolean
  featureFlags: FeatureFlags
  sitemapUsed: boolean
  hasMarketingOptIn: boolean | null
}

interface UserInfo {
  email: string
  leadId: string
  signedUpAt: string
  emailVerified: boolean
  termsAcceptedAt: string | null
  lastLoginAt: string | null
  hasPassword: boolean
  passwordSetAt: string | null
  stripeCustomerId: string | null
  marketingOptIn: boolean | null
  tier: string
  isSubscriber: boolean
  location: {
    country: string | null
    city: string | null
    region: string | null
    timezone: string | null
  }
  subscription: {
    id: string
    domain: string
    tier: string
    status: string
    stripeSubscriptionId: string | null
    currentPeriodStart: string | null
    currentPeriodEnd: string | null
    createdAt: string
  } | null
  reportViews: number
  scanHistory: {
    id: string
    created_at: string
    completed_at: string | null
    status: string
    domain: string | null
  }[]
}

interface AdminReportViewerProps {
  adminEmail: string
}

export function AdminReportViewer({ adminEmail }: AdminReportViewerProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tokenFromUrl = searchParams.get('token') || ''

  const [token, setToken] = useState(tokenFromUrl)
  const [inputToken, setInputToken] = useState(tokenFromUrl)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)

  // Fetch report when token changes
  useEffect(() => {
    if (!token) return

    const fetchReport = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/admin/report?token=${encodeURIComponent(token)}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch report')
        }

        setReportData(data.reportData)
        setUserInfo(data.userInfo)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        setReportData(null)
        setUserInfo(null)
      } finally {
        setLoading(false)
      }
    }

    fetchReport()
  }, [token])

  // Update URL when viewing a report
  useEffect(() => {
    if (token && token !== tokenFromUrl) {
      router.replace(`/j3y-internal/view?token=${encodeURIComponent(token)}`)
    }
  }, [token, tokenFromUrl, router])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedToken = inputToken.trim()
    if (trimmedToken) {
      setToken(trimmedToken)
    }
  }

  // Dummy upgrade handler (admin can't upgrade for user)
  const handleUpgradeClick = () => {
    // No-op for admin view
  }

  return (
    <>
      {/* Background */}
      <div className="grid-bg" />
      <FloatingPixels />

      {/* Admin mode banner */}
      <div
        className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white font-mono text-sm flex items-center justify-center gap-2"
        style={{ padding: '8px 16px' }}
      >
        <ShieldAlert size={16} />
        ADMIN MODE - Viewing as {adminEmail}
      </div>

      {/* Main content */}
      <main className="relative z-10 min-h-screen" style={{ paddingTop: '56px' }}>
        {/* Search form */}
        <div
          className="bg-[var(--surface)] border-b border-[var(--border)]"
          style={{ padding: '24px' }}
        >
          <div style={{ maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
            <h1
              className="font-mono text-[var(--text)] text-center"
              style={{ fontSize: '1.25rem', marginBottom: '16px' }}
            >
              Admin Report Viewer
            </h1>

            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={inputToken}
                onChange={(e) => setInputToken(e.target.value)}
                placeholder="Enter report token..."
                className="flex-1 bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] font-mono text-sm"
                style={{ padding: '12px 16px' }}
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-[var(--green)] text-[var(--bg)] font-mono text-sm flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                style={{ padding: '12px 20px' }}
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                View
              </button>
            </form>

            <p className="text-[var(--text-dim)] text-xs font-mono text-center" style={{ marginTop: '12px' }}>
              Paste a report token (e.g., &quot;abc123xyz789&quot;) to view any user&apos;s report
            </p>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div
            className="flex items-center justify-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 font-mono text-sm"
            style={{ padding: '16px', margin: '24px' }}
          >
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center" style={{ padding: '80px 24px' }}>
            <Loader2 size={32} className="animate-spin text-[var(--green)]" />
          </div>
        )}

        {/* Report view */}
        {!loading && reportData && userInfo && (
          <div style={{ padding: '24px' }}>
            <div style={{ maxWidth: '960px', marginLeft: 'auto', marginRight: 'auto' }}>
              {/* Report header */}
              <div className="text-center" style={{ marginBottom: '48px' }}>
                <h1
                  className="font-medium text-[var(--text)]"
                  style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', marginBottom: '16px' }}
                >
                  AI Visibility Report
                </h1>
                <a
                  href={`https://${reportData.domain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-mono text-[var(--text-mid)] hover:text-[var(--green)] transition-colors"
                  style={{ fontSize: '15px' }}
                >
                  {reportData.domain}
                  <ExternalLink className="w-4 h-4" />
                </a>
                <p
                  className="text-[var(--text-dim)] font-mono"
                  style={{ marginTop: '12px', fontSize: '13px' }}
                >
                  {reportData.analysis?.business_type && reportData.analysis.business_type !== 'Business website' && (
                    <>
                      {reportData.analysis.business_type}
                      {reportData.analysis.location && ` • ${reportData.analysis.location}`}
                      {' • '}
                    </>
                  )}
                  Scanned {new Date(reportData.report.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })} at {new Date(reportData.report.created_at).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </p>

                {/* Expiry warning for admin */}
                {reportData.report.expires_at && (
                  <p
                    className="font-mono text-xs"
                    style={{
                      marginTop: '8px',
                      color: new Date(reportData.report.expires_at) < new Date() ? 'var(--red, #ef4444)' : 'var(--gold)',
                    }}
                  >
                    {new Date(reportData.report.expires_at) < new Date()
                      ? `EXPIRED: ${new Date(reportData.report.expires_at).toLocaleDateString()}`
                      : `Expires: ${new Date(reportData.report.expires_at).toLocaleDateString()}`
                    }
                  </p>
                )}
              </div>

              {/* Report tabs - showing exactly what user sees */}
              <ReportTabs
                analysis={reportData.analysis}
                responses={reportData.responses}
                prompts={reportData.featureFlags.isSubscriber && reportData.subscriberQuestions?.length
                  ? reportData.subscriberQuestions
                  : reportData.prompts}
                brandAwareness={reportData.brandAwareness}
                competitiveSummary={reportData.competitiveSummary}
                crawlData={reportData.crawlData ?? undefined}
                visibilityScore={reportData.report.visibility_score}
                platformScores={reportData.report.platform_scores}
                competitors={reportData.report.top_competitors}
                domain={reportData.domain}
                domainSubscriptionId={reportData.domainSubscriptionId}
                onUpgradeClick={handleUpgradeClick}
                isSubscriber={reportData.featureFlags.isSubscriber}
                tier={reportData.featureFlags.tier}
                customQuestionLimit={reportData.featureFlags.customQuestionLimit}
                currentRunId={reportData.report.run_id}
                enrichmentStatus={reportData.report.enrichment_status}
              />
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && !reportData && (
          <div className="flex flex-col items-center justify-center text-[var(--text-dim)]" style={{ padding: '80px 24px' }}>
            <Search size={48} className="opacity-30" style={{ marginBottom: '16px' }} />
            <p className="font-mono text-sm">Enter a report token above to view</p>
          </div>
        )}
      </main>

      {/* Admin overlay with user info - floating button */}
      {userInfo && <AdminOverlay userInfo={userInfo} reportToken={token} />}
    </>
  )
}
