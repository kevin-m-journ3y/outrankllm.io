'use client'

import { Settings, Globe, Lock, Plus, Sparkles } from 'lucide-react'
import Link from 'next/link'
import type { Analysis, Prompt } from '../shared'
import { handlePricingClick, categoryLabels, categoryColors } from '../shared'

export function SetupTab({
  analysis,
  prompts,
  domain
}: {
  analysis: Analysis | null
  prompts?: Prompt[] | null
  domain: string
}) {
  if (!analysis) {
    return (
      <div className="text-center text-[var(--text-dim)]" style={{ padding: '80px 0' }}>
        <Settings size={48} className="mx-auto mb-4 opacity-30" />
        <p>No analysis data available</p>
      </div>
    )
  }

  // Group prompts by category
  const promptsByCategory = prompts?.reduce((acc, prompt) => {
    const category = prompt.category || 'general'
    if (!acc[category]) acc[category] = []
    acc[category].push(prompt)
    return acc
  }, {} as Record<string, Prompt[]>) || {}

  return (
    <div style={{ display: 'grid', gap: '32px' }}>
      {/* Description Box */}
      <div
        className="bg-[var(--surface-elevated)] border border-[var(--border)]"
        style={{ padding: '20px 24px' }}
      >
        <div className="flex items-start" style={{ gap: '16px' }}>
          <Settings size={20} className="text-[var(--green)] flex-shrink-0" style={{ marginTop: '2px' }} />
          <div>
            <p className="text-[var(--text-mid)] text-sm" style={{ lineHeight: '1.6' }}>
              <strong className="text-[var(--text)]">Your Report Configuration:</strong> We crawled your website and extracted key information about your business. This data powers the questions we ask AI assistants. Subscribers can edit and customize these settings.
            </p>
          </div>
        </div>
      </div>

      {/* Business Identity */}
      <div className="card" style={{ padding: '32px' }}>
        <h3
          className="text-[var(--green)] font-mono uppercase tracking-wider"
          style={{ fontSize: '11px', marginBottom: '24px', letterSpacing: '0.1em' }}
        >
          What We Detected
        </h3>

        <div style={{ display: 'grid', gap: '28px' }}>
          {analysis.business_name && (
            <div>
              <label className="text-[var(--text-dim)] font-mono text-xs block" style={{ marginBottom: '8px' }}>
                Business Name
              </label>
              <p className="text-[var(--text)] text-xl font-medium">
                {analysis.business_name}
              </p>
            </div>
          )}

          <div>
            <label className="text-[var(--text-dim)] font-mono text-xs block" style={{ marginBottom: '8px' }}>
              Business Type
            </label>
            <p className="text-[var(--text)] text-lg">
              {analysis.business_type}
            </p>
          </div>

          <div className="grid sm:grid-cols-2" style={{ gap: '24px' }}>
            {analysis.location && (
              <div>
                <label className="text-[var(--text-dim)] font-mono text-xs block" style={{ marginBottom: '8px' }}>
                  Location
                </label>
                <p className="text-[var(--text-mid)]">
                  {analysis.location}
                </p>
              </div>
            )}

            {analysis.industry && (
              <div>
                <label className="text-[var(--text-dim)] font-mono text-xs block" style={{ marginBottom: '8px' }}>
                  Industry
                </label>
                <p className="text-[var(--text-mid)]">
                  {analysis.industry}
                </p>
              </div>
            )}

            {analysis.target_audience && (
              <div>
                <label className="text-[var(--text-dim)] font-mono text-xs block" style={{ marginBottom: '8px' }}>
                  Target Audience
                </label>
                <p className="text-[var(--text-mid)]">
                  {analysis.target_audience}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Services */}
      {analysis.services && analysis.services.length > 0 && (
        <div className="card" style={{ padding: '32px' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: '24px' }}>
            <h3
              className="text-[var(--green)] font-mono uppercase tracking-wider"
              style={{ fontSize: '11px', letterSpacing: '0.1em' }}
            >
              Products & Services
            </h3>
            <span className="text-[var(--text-dim)] font-mono text-xs">
              {analysis.services.length} detected
            </span>
          </div>

          <div className="flex flex-wrap" style={{ gap: '12px', marginBottom: '20px' }}>
            {analysis.services.map((service, index) => (
              <span
                key={index}
                className="bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-mid)] font-mono"
                style={{ padding: '10px 16px', fontSize: '13px' }}
              >
                {service}
              </span>
            ))}
            {/* Subscribe to add more button */}
            <Link
              href="/pricing?from=report"
              onClick={handlePricingClick}
              className="flex items-center gap-2 transition-all hover:opacity-80"
              style={{
                padding: '10px 16px',
                fontSize: '13px',
                background: 'transparent',
                border: '1px dashed var(--gold-dim)',
                color: 'var(--gold)',
                textDecoration: 'none',
              }}
            >
              <Plus size={14} />
              <span className="font-mono">Subscribe to add more</span>
              <Lock size={12} />
            </Link>
          </div>
        </div>
      )}

      {/* Key Phrases */}
      {analysis.key_phrases && analysis.key_phrases.length > 0 && (
        <div className="card" style={{ padding: '32px' }}>
          <h3
            className="text-[var(--green)] font-mono uppercase tracking-wider"
            style={{ fontSize: '11px', marginBottom: '24px', letterSpacing: '0.1em' }}
          >
            Key Phrases We Identified
          </h3>

          <div className="flex flex-wrap" style={{ gap: '12px' }}>
            {analysis.key_phrases.map((phrase, index) => (
              <span
                key={index}
                className="bg-[var(--green)]/10 border border-[var(--green)]/20 text-[var(--green)] font-mono"
                style={{ padding: '10px 16px', fontSize: '13px' }}
              >
                {phrase}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Generated Questions */}
      {prompts && prompts.length > 0 && (
        <div className="card" style={{ padding: '32px' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: '24px' }}>
            <h3
              className="text-[var(--green)] font-mono uppercase tracking-wider"
              style={{ fontSize: '11px', letterSpacing: '0.1em' }}
            >
              Questions We Asked AI
            </h3>
            <span className="text-[var(--text-dim)] font-mono text-xs">
              {prompts.length} questions
            </span>
          </div>

          <p
            className="text-[var(--text-dim)] text-sm"
            style={{ marginBottom: '16px', lineHeight: '1.6' }}
          >
            We analyzed your website and identified your business as {analysis?.business_name ? <strong className="text-[var(--text-mid)]">{analysis.business_name}</strong> : 'your company'}
            {analysis?.business_type && analysis.business_type !== 'Business website' && <>, a <strong className="text-[var(--text-mid)]">{analysis.business_type.toLowerCase()}</strong></>}
            {analysis?.location && <> in <strong className="text-[var(--text-mid)]">{analysis.location}</strong></>}.
          </p>

          {/* Search-based queries indicator */}
          <div
            className="flex items-center gap-2 bg-[var(--surface)] border border-[var(--border-subtle)] px-3 py-2"
            style={{ marginBottom: '24px', width: 'fit-content' }}
          >
            <Globe size={14} className="text-[var(--green)]" />
            <span className="text-xs text-[var(--text-mid)]">
              Based on real search queries people use for businesses like yours
            </span>
          </div>

          <div style={{ display: 'grid', gap: '12px' }}>
            {prompts.map((prompt, index) => (
              <div
                key={prompt.id || index}
                className="flex items-start bg-[var(--surface-elevated)] border border-[var(--border)]"
                style={{ padding: '16px 20px', gap: '16px' }}
              >
                <span
                  className="flex-shrink-0 font-mono text-[var(--text-ghost)]"
                  style={{ fontSize: '12px', width: '24px' }}
                >
                  {index + 1}.
                </span>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-[var(--text-mid)]"
                    style={{ fontSize: '14px', lineHeight: '1.5', marginBottom: '8px' }}
                  >
                    {prompt.prompt_text}
                  </p>
                  <span
                    className="font-mono text-xs"
                    style={{ color: categoryColors[prompt.category] || 'var(--text-ghost)' }}
                  >
                    {categoryLabels[prompt.category] || prompt.category}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Upgrade prompt for editing - Gold styling for premium feature */}
          <div
            className="flex items-center justify-between"
            style={{
              marginTop: '24px',
              padding: '20px 24px',
              gap: '16px',
              background: 'var(--gold-glow)',
              border: '1px dashed var(--gold-dim)',
            }}
          >
            <div className="flex items-center" style={{ gap: '12px' }}>
              <div
                className="flex items-center justify-center"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold-dim) 100%)',
                }}
              >
                <Lock size={16} style={{ color: 'var(--bg)' }} />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--gold)' }}>
                  Want to customize these questions?
                </p>
                <p className="text-[var(--text-dim)] text-xs" style={{ marginTop: '4px' }}>
                  Edit questions, add your own, and re-run analysis to track changes over time.
                </p>
              </div>
            </div>
            <a
              href="/pricing?from=report"
              onClick={handlePricingClick}
              className="flex-shrink-0 font-mono text-xs flex items-center gap-2 transition-all hover:opacity-80"
              style={{
                padding: '10px 18px',
                background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold-dim) 100%)',
                color: 'var(--bg)',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'none',
              }}
            >
              <Sparkles size={14} />
              Unlock Editing
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
