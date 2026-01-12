'use client'

import { useEffect, useState, useCallback } from 'react'
import { Loader2, Clock, RefreshCw } from 'lucide-react'

type EnrichmentStatus = 'pending' | 'processing' | 'complete' | 'failed' | 'not_applicable'

interface EnrichmentLoadingProps {
  status: EnrichmentStatus
  title: string
  description: string
  processingMessage?: string
  pendingMessage?: string
  onRetry?: () => void
  runId?: string  // Optional: pass runId for polling
}

export function EnrichmentLoading({
  status,
  title,
  description,
  processingMessage = 'This usually takes 5-10 minutes.',
  pendingMessage = 'Your premium insights will be ready shortly.',
  onRetry,
  runId,
}: EnrichmentLoadingProps) {
  const [dots, setDots] = useState('')

  // Poll for enrichment status and auto-refresh when complete
  const checkEnrichmentStatus = useCallback(async () => {
    if (!runId) return false

    try {
      const response = await fetch(`/api/scan/enrichment-status?runId=${runId}`)
      if (!response.ok) return false

      const data = await response.json()
      return data.status === 'complete'
    } catch {
      return false
    }
  }, [runId])

  // Poll every 15 seconds when processing or pending
  useEffect(() => {
    if (status !== 'processing' && status !== 'pending') return
    if (!runId) return

    const pollInterval = setInterval(async () => {
      const isComplete = await checkEnrichmentStatus()
      if (isComplete) {
        // Refresh the page to show the new data
        window.location.reload()
      }
    }, 15000) // Poll every 15 seconds

    return () => clearInterval(pollInterval)
  }, [status, runId, checkEnrichmentStatus])

  // Animate loading dots
  useEffect(() => {
    if (status !== 'processing') return

    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'))
    }, 500)

    return () => clearInterval(interval)
  }, [status])

  if (status === 'processing') {
    return (
      <div
        className="flex flex-col items-center justify-center text-center"
        style={{ padding: '80px 24px' }}
      >
        <div
          className="flex items-center justify-center"
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--green) 0%, var(--green-dim) 100%)',
            marginBottom: '24px',
          }}
        >
          <Loader2 size={28} className="animate-spin" style={{ color: 'var(--bg)' }} />
        </div>

        <h3
          className="text-[var(--text)] font-medium text-lg"
          style={{ marginBottom: '8px' }}
        >
          {title}{dots}
        </h3>

        <p
          className="text-[var(--text-dim)] text-sm"
          style={{ maxWidth: '360px', marginBottom: '24px', lineHeight: '1.6' }}
        >
          {description}
        </p>

        <div
          className="font-mono text-xs text-[var(--text-ghost)]"
          style={{
            padding: '8px 16px',
            backgroundColor: 'var(--surface-elevated)',
            border: '1px solid var(--border)',
          }}
        >
          {processingMessage}
        </div>
      </div>
    )
  }

  if (status === 'pending') {
    return (
      <div
        className="flex flex-col items-center justify-center text-center"
        style={{ padding: '80px 24px' }}
      >
        <div
          className="flex items-center justify-center"
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold-dim) 100%)',
            marginBottom: '24px',
          }}
        >
          <Clock size={28} style={{ color: 'var(--bg)' }} />
        </div>

        <h3
          className="text-[var(--text)] font-medium text-lg"
          style={{ marginBottom: '8px' }}
        >
          Premium Insights Coming Soon
        </h3>

        <p
          className="text-[var(--text-dim)] text-sm"
          style={{ maxWidth: '360px', marginBottom: '24px', lineHeight: '1.6' }}
        >
          {pendingMessage}
        </p>

        <button
          onClick={() => window.location.reload()}
          className="font-mono text-xs flex items-center gap-2 transition-all hover:opacity-80"
          style={{
            padding: '10px 20px',
            backgroundColor: 'var(--surface-elevated)',
            border: '1px solid var(--border)',
            color: 'var(--text-mid)',
            cursor: 'pointer',
          }}
        >
          <RefreshCw size={14} />
          Refresh Page
        </button>
      </div>
    )
  }

  if (status === 'failed') {
    return (
      <div
        className="flex flex-col items-center justify-center text-center"
        style={{ padding: '80px 24px' }}
      >
        <div
          className="flex items-center justify-center"
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--red) 0%, var(--red-dim, #991b1b) 100%)',
            marginBottom: '24px',
          }}
        >
          <span style={{ color: 'var(--bg)', fontSize: '28px' }}>!</span>
        </div>

        <h3
          className="text-[var(--text)] font-medium text-lg"
          style={{ marginBottom: '8px' }}
        >
          Generation Failed
        </h3>

        <p
          className="text-[var(--text-dim)] text-sm"
          style={{ maxWidth: '360px', marginBottom: '24px', lineHeight: '1.6' }}
        >
          We encountered an issue generating your premium insights. Please try again or contact support if the problem persists.
        </p>

        {onRetry && (
          <button
            onClick={onRetry}
            className="font-mono text-sm flex items-center gap-2 transition-all hover:opacity-90"
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, var(--green) 0%, var(--green-dim) 100%)',
              color: 'var(--bg)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={14} />
            Try Again
          </button>
        )}
      </div>
    )
  }

  // For 'complete' or 'not_applicable', don't render anything
  // (the parent component should show the actual content)
  return null
}
