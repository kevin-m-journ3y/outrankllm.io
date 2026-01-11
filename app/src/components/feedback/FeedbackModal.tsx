'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Bug, Lightbulb, MessageSquare, HelpCircle, Send, Check, Loader2 } from 'lucide-react'

type FeedbackType = 'bug' | 'feature' | 'feedback' | 'other'

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  initialType?: FeedbackType
}

const FEEDBACK_TYPES = [
  { id: 'bug' as const, label: 'Bug Report', icon: Bug, description: 'Something isn\'t working' },
  { id: 'feature' as const, label: 'Feature Request', icon: Lightbulb, description: 'Suggest an improvement' },
  { id: 'feedback' as const, label: 'General Feedback', icon: MessageSquare, description: 'Share your thoughts' },
  { id: 'other' as const, label: 'Other', icon: HelpCircle, description: 'Something else' },
]

export function FeedbackModal({ isOpen, onClose, initialType = 'feedback' }: FeedbackModalProps) {
  const [type, setType] = useState<FeedbackType>(initialType)
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  // Only render portal on client side
  useEffect(() => {
    setMounted(true)
  }, [])

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setType(initialType)
      setMessage('')
      setIsSubmitting(false)
      setIsSuccess(false)
      setError(null)
    }
  }, [isOpen, initialType])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (message.trim().length < 10) {
      setError('Please provide more detail (at least 10 characters)')
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          message: message.trim(),
          pageUrl: window.location.href,
          userAgent: navigator.userAgent,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to submit feedback')
      }

      setIsSuccess(true)

      // Auto-close after success
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen || !mounted) return null

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

      {/* Modal Container - centers the modal and adds padding */}
      <div
        className="relative flex min-h-full items-center justify-center"
        style={{ padding: '24px', zIndex: 10000 }}
      >
        {/* Modal */}
        <div
          className="relative w-full bg-[var(--surface)] border border-[var(--border)] shadow-2xl"
          style={{ maxWidth: '480px' }}
        >
        {/* Header */}
        <div
          className="flex items-center justify-between border-b border-[var(--border)]"
          style={{ padding: '16px 20px' }}
        >
          <h2 className="text-[var(--text)] font-medium">{getHeaderText(type)}</h2>
          <button
            onClick={onClose}
            className="text-[var(--text-dim)] hover:text-[var(--text)] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Success State */}
        {isSuccess ? (
          <div className="text-center" style={{ padding: '48px 24px' }}>
            <div
              className="inline-flex items-center justify-center bg-[var(--green)] text-[var(--bg)]"
              style={{ width: '48px', height: '48px', borderRadius: '50%', marginBottom: '16px' }}
            >
              <Check size={24} />
            </div>
            <h3 className="text-[var(--text)] font-medium" style={{ marginBottom: '8px' }}>
              Thank you!
            </h3>
            <p className="text-[var(--text-dim)] text-sm">
              Your feedback has been received. We appreciate you taking the time to help us improve.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Type Selection */}
            <div style={{ padding: '20px' }}>
              <label className="text-[var(--text-dim)] text-xs font-mono uppercase" style={{ marginBottom: '12px', display: 'block' }}>
                What type of feedback?
              </label>
              <div className="grid grid-cols-2" style={{ gap: '8px' }}>
                {FEEDBACK_TYPES.map((feedbackType) => {
                  const Icon = feedbackType.icon
                  const isSelected = type === feedbackType.id
                  return (
                    <button
                      key={feedbackType.id}
                      type="button"
                      onClick={() => setType(feedbackType.id)}
                      className={`
                        text-left border transition-colors
                        ${isSelected
                          ? 'border-[var(--green)] bg-[var(--green)]/10'
                          : 'border-[var(--border)] hover:border-[var(--border-hover)] bg-[var(--surface-elevated)]'
                        }
                      `}
                      style={{ padding: '12px' }}
                    >
                      <div className="flex items-center gap-2" style={{ marginBottom: '4px' }}>
                        <Icon size={14} className={isSelected ? 'text-[var(--green)]' : 'text-[var(--text-dim)]'} />
                        <span className={`text-sm font-medium ${isSelected ? 'text-[var(--green)]' : 'text-[var(--text)]'}`}>
                          {feedbackType.label}
                        </span>
                      </div>
                      <p className="text-[var(--text-ghost)] text-xs">
                        {feedbackType.description}
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Message Input */}
            <div style={{ padding: '0 20px 20px' }}>
              <label
                htmlFor="feedback-message"
                className="text-[var(--text-dim)] text-xs font-mono uppercase"
                style={{ marginBottom: '8px', display: 'block' }}
              >
                Your message
              </label>
              <textarea
                id="feedback-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={getPlaceholder(type)}
                className="w-full bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] placeholder:text-[var(--text-ghost)] focus:border-[var(--green)] focus:outline-none resize-none"
                style={{ padding: '12px', minHeight: '120px', fontSize: '14px' }}
                maxLength={5000}
              />
              <div className="flex justify-between" style={{ marginTop: '8px' }}>
                <span className="text-[var(--text-ghost)] text-xs">
                  {message.length < 10 ? `${10 - message.length} more characters needed` : ''}
                </span>
                <span className="text-[var(--text-ghost)] text-xs">
                  {message.length}/5000
                </span>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                className="bg-[var(--red)]/10 border border-[var(--red)]/20 text-[var(--red)] text-sm"
                style={{ margin: '0 20px 20px', padding: '12px' }}
              >
                {error}
              </div>
            )}

            {/* Buttons */}
            <div
              className="border-t border-[var(--border)] flex gap-3"
              style={{ padding: '16px 20px' }}
            >
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-2 bg-transparent border border-[var(--border)] text-[var(--text-mid)] font-mono text-sm font-medium transition-all hover:border-[var(--text-dim)] hover:text-[var(--text)] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ padding: '12px 24px' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || message.trim().length < 10}
                className="flex-1 flex items-center justify-center gap-2 bg-[var(--green)] text-[var(--bg)] font-mono text-sm font-medium transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ padding: '12px 24px' }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    {getButtonText(type)}
                  </>
                )}
              </button>
            </div>
          </form>
        )}
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}

function getPlaceholder(type: FeedbackType): string {
  switch (type) {
    case 'bug':
      return 'Describe the issue you encountered. What were you trying to do? What happened instead?'
    case 'feature':
      return 'Describe the feature or improvement you\'d like to see. How would it help you?'
    case 'feedback':
      return 'Share your thoughts, suggestions, or general feedback about outrankllm...'
    case 'other':
      return 'What would you like to tell us?'
  }
}

function getHeaderText(type: FeedbackType): string {
  switch (type) {
    case 'bug':
      return 'Report a Bug'
    case 'feature':
      return 'Request a Feature'
    case 'feedback':
      return 'Send Feedback'
    case 'other':
      return 'Send Message'
  }
}

function getButtonText(type: FeedbackType): string {
  switch (type) {
    case 'bug':
      return 'Submit Bug Report'
    case 'feature':
      return 'Submit Request'
    case 'feedback':
      return 'Send Feedback'
    case 'other':
      return 'Send Message'
  }
}
