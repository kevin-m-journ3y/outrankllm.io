'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { MessageSquare, Filter, CheckCircle2, ChevronDown, AlertCircle, Sparkles, Download } from 'lucide-react'
import type { Response, Analysis } from '../shared'
import { platformColors, platformNames, formatResponseText, handlePricingClick, FilterButton } from '../shared'
import { UpgradeModal } from '../UpgradeModal'

// Individual response card component with animations
function ResponseCard({
  response,
  isExpanded,
  onToggleExpand,
  highlightKeywords,
  animationDelay,
}: {
  response: Response
  isExpanded: boolean
  onToggleExpand: () => void
  highlightKeywords: string[]
  animationDelay: number
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [badgeAnimated, setBadgeAnimated] = useState(false)

  // Default collapsed - show first ~3 lines worth of text
  const previewLength = 280
  const responseText = response.response_text || ''
  const shouldTruncate = responseText.length > previewLength
  const displayText = isExpanded || !shouldTruncate
    ? responseText
    : responseText.slice(0, previewLength) + '...'

  // Observe when card becomes visible
  useEffect(() => {
    const element = cardRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          // Staggered reveal
          setTimeout(() => setIsVisible(true), animationDelay)
          // Badge animation triggers slightly after card appears
          if (response.domain_mentioned) {
            setTimeout(() => setBadgeAnimated(true), animationDelay + 400)
          }
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [animationDelay, response.domain_mentioned])

  return (
    <div
      ref={cardRef}
      className="card"
      style={{
        padding: '28px',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity 0.4s ease-out, transform 0.4s ease-out',
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between" style={{ marginBottom: '20px' }}>
        <div className="flex items-center gap-3">
          <div
            style={{
              width: '10px',
              height: '10px',
              backgroundColor: platformColors[response.platform] || 'var(--text-dim)',
            }}
          />
          <span className="font-mono text-sm text-[var(--text)]">
            {platformNames[response.platform] || response.platform}
          </span>
        </div>

        {response.domain_mentioned && (
          <span
            className="text-[var(--green)] font-mono flex items-center gap-1"
            style={{
              fontSize: '12px',
              transform: badgeAnimated ? 'scale(1)' : 'scale(0.8)',
              opacity: badgeAnimated ? 1 : 0,
              transition: 'transform 0.3s ease-out, opacity 0.3s ease-out',
            }}
          >
            <span
              style={{
                fontSize: '14px',
                display: 'inline-block',
                animation: badgeAnimated ? 'popIn 0.4s ease-out' : 'none',
              }}
            >
              ✓
            </span>{' '}
            Mentioned
          </span>
        )}
      </div>

      {/* Question */}
      {response.prompt?.prompt_text && (
        <div
          className="bg-[var(--surface-elevated)] border-l-2 border-[var(--border)]"
          style={{ padding: '16px 20px', marginBottom: '20px' }}
        >
          <span className="text-[var(--text-ghost)] font-mono text-xs block" style={{ marginBottom: '8px' }}>
            QUESTION
          </span>
          <p className="text-[var(--text-mid)]" style={{ fontSize: '14px', lineHeight: '1.6' }}>
            {response.prompt.prompt_text}
          </p>
        </div>
      )}

      {/* Response */}
      <div>
        <span className="text-[var(--text-ghost)] font-mono text-xs block" style={{ marginBottom: '12px' }}>
          RESPONSE
        </span>
        <div
          className="text-[var(--text-mid)]"
          style={{
            fontSize: '14px',
            lineHeight: '1.7',
            maxHeight: isExpanded ? 'none' : '120px',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {formatResponseText(displayText, highlightKeywords)}
          {/* Fade overlay when collapsed */}
          {!isExpanded && shouldTruncate && (
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '40px',
                background: 'linear-gradient(transparent, var(--surface))',
                pointerEvents: 'none',
              }}
            />
          )}
        </div>

        {shouldTruncate && (
          <button
            onClick={onToggleExpand}
            className="text-[var(--green)] font-mono text-sm hover:underline flex items-center gap-1"
            style={{ marginTop: '12px' }}
          >
            {isExpanded ? 'Show less' : 'Read full response'}
            <ChevronDown
              size={14}
              style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
            />
          </button>
        )}
      </div>
    </div>
  )
}

export function ResponsesTab({
  responses,
  platformFilter,
  onFilterChange,
  domain,
  tier = 'free',
  analysis,
}: {
  responses: Response[] | null
  platformFilter: string
  onFilterChange: (filter: string) => void
  domain: string
  tier?: 'free' | 'starter' | 'pro' | 'agency'
  analysis?: Analysis | null
}) {
  const [expandedIndices, setExpandedIndices] = useState<Set<number>>(new Set())
  const [mentionsOnly, setMentionsOnly] = useState(false)
  const [showStickyUpsell, setShowStickyUpsell] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  // Build highlight keywords from domain and business name
  const highlightKeywords = useMemo(() => {
    const keywords: string[] = []

    // Add domain (without TLD for flexibility)
    if (domain) {
      keywords.push(domain)
      // Also add domain without extension
      const domainWithoutTld = domain.replace(/\.(com|io|org|net|co|com\.au|co\.uk|ai)$/i, '')
      if (domainWithoutTld !== domain) {
        keywords.push(domainWithoutTld)
      }
    }

    // Add business name if available
    if (analysis?.business_name) {
      keywords.push(analysis.business_name)
    }

    return keywords.filter(k => k.length > 2) // Filter out very short strings
  }, [domain, analysis?.business_name])

  // Generate and download AI responses as markdown
  const downloadResponses = () => {
    const date = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    const mentionCount = responses?.filter(r => r.domain_mentioned).length || 0
    const totalCount = responses?.length || 0

    let markdown = `# AI Responses Report\n`
    markdown += `**${domain}** | Generated ${date}\n\n`
    markdown += `---\n\n`
    markdown += `## Summary\n\n`
    markdown += `- **Total Responses**: ${totalCount}\n`
    markdown += `- **Mentions**: ${mentionCount} (${totalCount > 0 ? Math.round((mentionCount / totalCount) * 100) : 0}%)\n\n`

    // Group responses by platform
    const byPlatform = new Map<string, Response[]>()
    for (const response of responses || []) {
      const platform = response.platform
      if (!byPlatform.has(platform)) {
        byPlatform.set(platform, [])
      }
      byPlatform.get(platform)!.push(response)
    }

    markdown += `---\n\n`

    // Output responses grouped by platform
    for (const [platform, platformResponses] of byPlatform) {
      const platformLabel = platformNames[platform] || platform
      const platformMentions = platformResponses.filter(r => r.domain_mentioned).length
      markdown += `## ${platformLabel}\n\n`
      markdown += `*${platformResponses.length} responses, ${platformMentions} mentions*\n\n`

      for (const response of platformResponses) {
        const mentioned = response.domain_mentioned ? '✓ MENTIONED' : ''
        const question = response.prompt?.prompt_text || 'Unknown question'

        markdown += `### Q: ${question}\n\n`
        if (mentioned) {
          markdown += `**${mentioned}**\n\n`
        }
        markdown += `${response.response_text || 'No response'}\n\n`
        markdown += `---\n\n`
      }
    }

    markdown += `*Generated by OutrankLLM - outrankllm.io*\n`

    // Create and trigger download
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ai-responses-${domain.replace(/\./g, '-')}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Track scroll to show sticky upsell as soon as user starts scrolling
  useEffect(() => {
    const handleScroll = () => {
      // Show sticky upsell after minimal scroll (50px)
      setShowStickyUpsell(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!responses || responses.length === 0) {
    return (
      <div className="text-center text-[var(--text-dim)]" style={{ padding: '80px 0' }}>
        <MessageSquare size={48} className="mx-auto mb-4 opacity-30" />
        <p>No AI responses recorded yet</p>
      </div>
    )
  }

  // Apply platform filter first
  let filteredResponses = platformFilter === 'all'
    ? responses
    : responses.filter(r => r.platform === platformFilter)

  // Then apply mentions filter
  if (mentionsOnly) {
    filteredResponses = filteredResponses.filter(r => r.domain_mentioned)
  }

  // Count by platform
  const platformCounts = responses.reduce((acc, r) => {
    acc[r.platform] = (acc[r.platform] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Count mentions
  const mentionCount = responses.filter(r => r.domain_mentioned).length

  return (
    <div style={{ display: 'grid', gap: '32px' }}>
      {/* Description Box */}
      <div
        className="bg-[var(--surface-elevated)] border border-[var(--border)]"
        style={{ padding: '20px 24px' }}
      >
        <div className="flex items-start" style={{ gap: '16px' }}>
          <MessageSquare size={20} className="text-[var(--green)] flex-shrink-0" style={{ marginTop: '2px' }} />
          <div>
            <p className="text-[var(--text-mid)] text-sm" style={{ lineHeight: '1.6' }}>
              <strong className="text-[var(--text)]">Organic Visibility Test:</strong> We asked each AI assistant questions that a potential customer might ask (like &quot;recommend a plumber near me&quot;). These are the actual responses — look for whether your brand was mentioned organically.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div
        className="flex items-center justify-between flex-wrap border-b border-[var(--border)]"
        style={{ paddingBottom: '20px', gap: '16px' }}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-[var(--text-dim)]" />
            <span className="text-[var(--text-dim)] font-mono text-sm">Filter by:</span>
          </div>

          {/* Mentions Only Toggle */}
          <button
            onClick={() => setMentionsOnly(!mentionsOnly)}
            className={`
              flex items-center gap-2 font-mono text-xs transition-all
              ${mentionsOnly
                ? 'bg-[var(--green)]/10 text-[var(--green)] border-[var(--green)]/30'
                : 'bg-transparent text-[var(--text-dim)] border-[var(--border)] hover:text-[var(--text-mid)]'
              }
            `}
            style={{
              padding: '6px 12px',
              border: '1px solid',
            }}
          >
            <CheckCircle2 size={12} />
            Mentions only ({mentionCount})
          </button>
        </div>

        <div className="flex items-center flex-wrap" style={{ gap: '8px' }}>
          <FilterButton
            active={platformFilter === 'all'}
            onClick={() => onFilterChange('all')}
          >
            All
          </FilterButton>
          {Object.entries(platformCounts).map(([platform]) => (
            <FilterButton
              key={platform}
              active={platformFilter === platform}
              onClick={() => onFilterChange(platform)}
              color={platformColors[platform]}
            >
              {platformNames[platform] || platform}
            </FilterButton>
          ))}
          {/* Download button */}
          <button
            onClick={downloadResponses}
            className="flex items-center text-[var(--text-dim)] hover:text-[var(--green)] font-mono text-xs border border-[var(--border)] hover:border-[var(--green)] transition-colors"
            style={{ padding: '6px 12px', gap: '6px', marginLeft: '8px' }}
            title="Download as Markdown"
          >
            <Download size={12} />
            Export
          </button>
        </div>
      </div>

      {/* Empty state when filtering */}
      {filteredResponses.length === 0 && (
        <div className="text-center text-[var(--text-dim)]" style={{ padding: '60px 0' }}>
          <MessageSquare size={40} className="mx-auto mb-4 opacity-30" />
          <p>No responses match your filters</p>
          <button
            onClick={() => {
              setMentionsOnly(false)
              onFilterChange('all')
            }}
            className="text-[var(--green)] font-mono text-sm hover:underline"
            style={{ marginTop: '12px' }}
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Animation keyframes for badge pop-in */}
      <style>{`
        @keyframes popIn {
          0% { transform: scale(0.5); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
      `}</style>

      {/* Response Cards */}
      <div style={{ display: 'grid', gap: '20px' }}>
        {filteredResponses.map((response, index) => (
          <ResponseCard
            key={`${response.platform}-${index}`}
            response={response}
            isExpanded={expandedIndices.has(index)}
            onToggleExpand={() => {
              setExpandedIndices(prev => {
                const next = new Set(prev)
                if (next.has(index)) {
                  next.delete(index)
                } else {
                  next.add(index)
                }
                return next
              })
            }}
            highlightKeywords={highlightKeywords}
            animationDelay={Math.min(index, 5) * 80} // Cap delay at 5 cards to avoid long waits
          />
        ))}
      </div>

      {/* Sticky Floating Upsell - Free and Starter only (no meaningful upgrade path for Pro/Agency) */}
      {(() => {
        const mentionRate = responses.length > 0 ? (mentionCount / responses.length) * 100 : 0
        const shouldShowUpsell = mentionRate < 50 // Show if less than 50% mention rate

        // Only show for free and starter tiers
        if (!shouldShowUpsell || !showStickyUpsell || tier === 'pro' || tier === 'agency') return null

        // Format visibility text - show "Less than 5%" for low values
        const visibilityText = mentionRate < 5
          ? 'Less than 5%'
          : `Only ${Math.round(mentionRate)}%`

        return (
          <div
            style={{
              position: 'fixed',
              bottom: '0',
              left: '0',
              right: '0',
              zIndex: 50,
              padding: '16px 24px',
              background: 'linear-gradient(135deg, rgba(20,20,20,0.98) 0%, rgba(30,25,20,0.98) 100%)',
              borderTop: '1px solid var(--gold-dim)',
              boxShadow: '0 -4px 20px rgba(0,0,0,0.5)',
              animation: 'slideUp 0.3s ease-out',
            }}
          >
            <style>{`
              @keyframes slideUp {
                from { transform: translateY(100%); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
              }
            `}</style>
            <div className="flex items-center justify-between flex-wrap" style={{ gap: '16px', maxWidth: '1200px', margin: '0 auto' }}>
              <div className="flex items-center" style={{ gap: '16px' }}>
                <div
                  className="flex items-center justify-center flex-shrink-0"
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--red) 0%, #b91c1c 100%)',
                  }}
                >
                  <AlertCircle size={20} style={{ color: 'white' }} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--text)] font-medium">
                      {visibilityText} AI visibility
                    </span>
                    <span className="text-[var(--text-ghost)]">•</span>
                    <span className="text-[var(--text-dim)] text-sm">
                      {tier === 'free' && 'Get action plans to improve'}
                      {tier === 'starter' && 'Pro includes AI-ready PRDs'}
                    </span>
                  </div>
                </div>
              </div>

              {tier === 'free' ? (
                <a
                  href="/pricing?from=report"
                  onClick={handlePricingClick}
                  className="font-mono text-sm flex items-center gap-2 transition-all hover:scale-105"
                  style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold-dim) 100%)',
                    color: 'var(--bg)',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '600',
                    textDecoration: 'none',
                  }}
                >
                  <Sparkles size={16} />
                  Get Fixes & Action Plans
                </a>
              ) : (
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="font-mono text-sm flex items-center gap-2 transition-all hover:scale-105"
                  style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold-dim) 100%)',
                    color: 'var(--bg)',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '600',
                  }}
                >
                  <Sparkles size={16} />
                  Upgrade to Pro
                </button>
              )}
            </div>
          </div>
        )
      })()}

      {/* Upgrade Modal for Starter users */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentTier="starter"
      />
    </div>
  )
}
