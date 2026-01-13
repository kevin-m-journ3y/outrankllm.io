'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, ArrowUp, Sparkles } from 'lucide-react'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  currentTier: 'starter' | 'pro'
}

export function UpgradeModal({ isOpen, onClose, currentTier }: UpgradeModalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen || !mounted) return null

  const targetTier = currentTier === 'starter' ? 'Pro' : 'Agency'

  const modalContent = (
    <div
      className="fixed inset-0 overflow-y-auto"
      style={{ zIndex: 9999 }}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
        style={{ zIndex: 9999 }}
      />

      {/* Modal Container */}
      <div
        className="relative flex min-h-full items-center justify-center"
        style={{ padding: '24px', zIndex: 10000 }}
      >
        {/* Modal */}
        <div
          className="relative w-full bg-[var(--surface)] border border-[var(--border)] shadow-2xl"
          style={{ maxWidth: '440px' }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between border-b border-[var(--border)]"
            style={{ padding: '16px 20px' }}
          >
            <div className="flex items-center gap-2">
              <ArrowUp size={18} className="text-[var(--gold)]" />
              <h2 className="text-[var(--text)] font-medium">Upgrade to {targetTier}</h2>
            </div>
            <button
              onClick={onClose}
              className="text-[var(--text-dim)] hover:text-[var(--text)] transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div style={{ padding: '24px 20px' }}>
            <p className="text-[var(--text-mid)]" style={{ marginBottom: '16px', lineHeight: '1.6' }}>
              As an existing subscriber, you can upgrade your plan directly from your dashboard. This keeps your billing seamless and applies the change immediately.
            </p>

            <div
              className="bg-[var(--surface-elevated)] border border-[var(--border)]"
              style={{ padding: '16px', marginBottom: '24px' }}
            >
              <p className="text-[var(--text-dim)] text-sm" style={{ lineHeight: '1.5' }}>
                <strong className="text-[var(--text)]">{targetTier} includes:</strong>
                {currentTier === 'starter' ? (
                  <> Competitor analysis, Brand Awareness insights, enhanced Action Plans, and PRD generation for AI coding tools.</>
                ) : (
                  <> Everything in Pro plus multiple domain monitoring and priority support.</>
                )}
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div
            className="border-t border-[var(--border)] flex gap-3"
            style={{ padding: '16px 20px' }}
          >
            <button
              type="button"
              onClick={onClose}
              className="flex-1 flex items-center justify-center gap-2 bg-transparent border border-[var(--border)] text-[var(--text-mid)] font-mono text-sm font-medium transition-all hover:border-[var(--text-dim)] hover:text-[var(--text)]"
              style={{ padding: '12px 24px' }}
            >
              Cancel
            </button>
            <a
              href="/dashboard"
              className="flex-1 flex items-center justify-center gap-2 bg-[var(--gold)] text-[var(--bg)] font-mono text-sm font-medium transition-all hover:opacity-90"
              style={{ padding: '12px 24px', textDecoration: 'none' }}
            >
              <Sparkles size={16} />
              Go to Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
