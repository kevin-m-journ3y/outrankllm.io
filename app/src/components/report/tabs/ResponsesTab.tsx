'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageSquare, Filter, CheckCircle2, ChevronDown, AlertCircle, Sparkles } from 'lucide-react'
import type { Response } from '../shared'
import { platformColors, platformNames, formatResponseText, handlePricingClick, FilterButton } from '../shared'

export function ResponsesTab({
  responses,
  platformFilter,
  onFilterChange
}: {
  responses: Response[] | null
  platformFilter: string
  onFilterChange: (filter: string) => void
}) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const [mentionsOnly, setMentionsOnly] = useState(false)
  const [showStickyUpsell, setShowStickyUpsell] = useState(false)
  const firstResponseRef = useRef<HTMLDivElement>(null)

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

        <div className="flex flex-wrap" style={{ gap: '8px' }}>
          <FilterButton
            active={platformFilter === 'all'}
            onClick={() => onFilterChange('all')}
          >
            All ({responses.length})
          </FilterButton>
          {Object.entries(platformCounts).map(([platform, count]) => (
            <FilterButton
              key={platform}
              active={platformFilter === platform}
              onClick={() => onFilterChange(platform)}
              color={platformColors[platform]}
            >
              {platformNames[platform] || platform} ({count})
            </FilterButton>
          ))}
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

      {/* Response Cards */}
      <div style={{ display: 'grid', gap: '20px' }}>
        {filteredResponses.map((response, index) => {
          const isExpanded = expandedIndex === index
          const truncateAt = 1200  // Increased from 500 to show more context before truncating
          const shouldTruncate = (response.response_text?.length || 0) > truncateAt

          return (
            <div
              key={index}
              ref={index === 0 ? firstResponseRef : undefined}
              className="card"
              style={{ padding: '28px' }}
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
                    style={{ fontSize: '12px' }}
                  >
                    <span style={{ fontSize: '14px' }}>✓</span> Mentioned
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
                  style={{ fontSize: '14px', lineHeight: '1.7' }}
                >
                  {formatResponseText(
                    isExpanded || !shouldTruncate
                      ? response.response_text || ''
                      : (response.response_text?.slice(0, truncateAt) || '') + '...'
                  )}
                </div>

                {shouldTruncate && (
                  <button
                    onClick={() => setExpandedIndex(isExpanded ? null : index)}
                    className="text-[var(--green)] font-mono text-sm hover:underline flex items-center gap-1"
                    style={{ marginTop: '12px' }}
                  >
                    {isExpanded ? 'Show less' : 'Show more'}
                    <ChevronDown
                      size={14}
                      style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                    />
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Sticky Floating Upsell - Shows when mention rate is low and user has scrolled */}
      {(() => {
        const mentionRate = responses.length > 0 ? (mentionCount / responses.length) * 100 : 0
        const shouldShowUpsell = mentionRate < 50 // Show if less than 50% mention rate

        if (!shouldShowUpsell || !showStickyUpsell) return null

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
                      Only {Math.round(mentionRate)}% AI visibility
                    </span>
                    <span className="text-[var(--text-ghost)]">•</span>
                    <span className="text-[var(--text-dim)] text-sm">
                      Get action plans to improve
                    </span>
                  </div>
                </div>
              </div>

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
            </div>
          </div>
        )
      })()}
    </div>
  )
}
