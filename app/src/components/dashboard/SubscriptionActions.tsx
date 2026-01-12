'use client'

import { useState, useEffect } from 'react'
import { Crown, AlertCircle, Loader2, ArrowUp, ArrowDown, X, CheckCircle } from 'lucide-react'
import type { DomainSubscription } from '@/lib/subscriptions'
import { TIER_PRICES, CURRENCY_SYMBOL, type PricingRegion } from '@/lib/stripe-config'

interface SubscriptionActionsProps {
  subscription: DomainSubscription
  onUpdate: () => void
  region: PricingRegion
}

interface PricingInfo {
  oldTier: string
  newTier: string
  oldPrice: string
  newPrice: string
}

const tierLabels: Record<string, string> = {
  starter: 'Starter',
  pro: 'Pro',
}

export function SubscriptionActions({ subscription, onUpdate, region }: SubscriptionActionsProps) {
  const [upgrading, setUpgrading] = useState(false)
  const [downgrading, setDowngrading] = useState(false)
  const [canceling, setCanceling] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successInfo, setSuccessInfo] = useState<{ message: string; pricing?: PricingInfo } | null>(null)

  const isActive = subscription.status === 'active'
  const isCanceling = subscription.cancel_at_period_end
  const hasStripeSubscription = !!subscription.stripe_subscription_id

  // Get current price for display
  const currentPrice = TIER_PRICES[region][subscription.tier as keyof typeof TIER_PRICES.AU]
  const currencySymbol = CURRENCY_SYMBOL[region]

  // Clear success/error messages when switching subscriptions
  useEffect(() => {
    setSuccessInfo(null)
    setError(null)
  }, [subscription.id])

  const handleUpgrade = async () => {
    setUpgrading(true)
    setError(null)
    setSuccessInfo(null)

    try {
      const response = await fetch(`/api/subscriptions/${subscription.id}/upgrade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upgrade')
      }

      setSuccessInfo({
        message: data.message,
        pricing: data.pricing,
      })
      onUpdate()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upgrade')
    } finally {
      setUpgrading(false)
    }
  }

  const handleDowngrade = async () => {
    setDowngrading(true)
    setError(null)
    setSuccessInfo(null)

    try {
      const response = await fetch(`/api/subscriptions/${subscription.id}/downgrade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to downgrade')
      }

      setSuccessInfo({
        message: data.message,
        pricing: data.pricing,
      })
      onUpdate()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to downgrade')
    } finally {
      setDowngrading(false)
    }
  }

  const handleCancel = async () => {
    setCanceling(true)
    setError(null)

    try {
      const response = await fetch(`/api/subscriptions/${subscription.id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to cancel')
      }

      setShowCancelConfirm(false)
      onUpdate()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel')
    } finally {
      setCanceling(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div>
      {/* Subscription Status */}
      <div className="flex items-center gap-3" style={{ marginBottom: '16px' }}>
        <Crown className="w-5 h-5 text-[var(--gold)]" />
        <span className="text-lg font-medium">{tierLabels[subscription.tier]} Plan</span>
        <span className="font-mono text-sm text-[var(--text-mid)]">
          {currencySymbol}{currentPrice}/mo
        </span>
        {isCanceling ? (
          <span className="font-mono text-xs text-orange-500 uppercase">Canceling</span>
        ) : isActive ? (
          <span className="font-mono text-xs text-[var(--green)] uppercase">Active</span>
        ) : (
          <span className="font-mono text-xs text-[var(--text-dim)] uppercase">{subscription.status}</span>
        )}
      </div>

      {/* Billing Period */}
      <p className="text-sm text-[var(--text-dim)]" style={{ marginBottom: '20px' }}>
        {isCanceling ? (
          <>Cancels on {formatDate(subscription.current_period_end)}</>
        ) : (
          <>Renews on {formatDate(subscription.current_period_end)}</>
        )}
      </p>

      {/* Error Message */}
      {error && (
        <div
          className="flex items-center gap-2 text-sm text-red-500 bg-red-500/10 border border-red-500/20"
          style={{ padding: '12px', marginBottom: '16px' }}
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Success Message */}
      {successInfo && successInfo.pricing && (
        <div
          className="text-sm bg-[var(--green)]/10 border border-[var(--green)]/20"
          style={{ padding: '12px', marginBottom: '16px' }}
        >
          <div className="flex items-center gap-2 text-[var(--green)]" style={{ marginBottom: '8px' }}>
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span className="font-medium">
              {successInfo.pricing.newTier === 'Pro' ? 'Upgrade' : 'Downgrade'} confirmed
            </span>
          </div>
          <div className="text-[var(--text-mid)]" style={{ marginLeft: '24px' }}>
            <span className="line-through text-[var(--text-dim)]">{successInfo.pricing.oldPrice}</span>
            {' → '}
            <span className="font-medium text-[var(--green)]">{successInfo.pricing.newPrice}</span>
            <span className="text-[var(--text-dim)]">
              {successInfo.pricing.newTier === 'Pro'
                ? ' (prorated charge applied)'
                : ' starting next billing cycle'}
            </span>
          </div>
        </div>
      )}

      {/* Notice for subscriptions without Stripe ID (test/manual subscriptions) */}
      {isActive && !hasStripeSubscription && (
        <div
          className="flex items-center gap-2 text-sm text-[var(--text-dim)] bg-[var(--surface)] border border-[var(--border)]"
          style={{ padding: '12px', marginBottom: '16px' }}
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>This subscription was created for testing. Upgrade/downgrade actions require a linked Stripe subscription.</span>
        </div>
      )}

      {/* Action Buttons */}
      {isActive && !isCanceling && hasStripeSubscription && (
        <div className="flex items-center gap-3 flex-wrap">
          {subscription.tier === 'starter' && (
            <button
              onClick={handleUpgrade}
              disabled={upgrading}
              className="flex items-center gap-2 bg-[var(--gold)] text-[var(--bg)] font-mono text-sm hover:opacity-90 transition-all disabled:opacity-50"
              style={{ padding: '10px 16px' }}
            >
              {upgrading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ArrowUp className="w-4 h-4" />
              )}
              Upgrade to Pro
            </button>
          )}

          {subscription.tier === 'pro' && (
            <button
              onClick={handleDowngrade}
              disabled={downgrading}
              className="flex items-center gap-2 border border-[var(--border)] bg-[var(--surface)] text-[var(--text-mid)] font-mono text-sm hover:border-[var(--text-dim)] transition-all disabled:opacity-50"
              style={{ padding: '10px 16px' }}
            >
              {downgrading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ArrowDown className="w-4 h-4" />
              )}
              Downgrade to Starter
            </button>
          )}

          <button
            onClick={() => setShowCancelConfirm(true)}
            className="flex items-center gap-2 text-[var(--text-dim)] font-mono text-sm hover:text-red-500 transition-colors"
            style={{ padding: '10px 16px' }}
          >
            <X className="w-4 h-4" />
            Cancel Subscription
          </button>
        </div>
      )}

      {/* Canceling Notice */}
      {isCanceling && (
        <div
          className="flex items-center gap-3 bg-orange-500/10 border border-orange-500/20"
          style={{ padding: '12px' }}
        >
          <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-orange-500">Subscription will end soon</p>
            <p className="text-[var(--text-dim)]">
              Your subscription will be canceled on {formatDate(subscription.current_period_end)}.
              You will retain access until then.
            </p>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowCancelConfirm(false)}
        >
          <div
            className="bg-[var(--bg)] border border-[var(--border)] shadow-xl"
            style={{ maxWidth: '400px', width: '90%', padding: '24px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-medium" style={{ marginBottom: '12px' }}>
              Cancel Subscription?
            </h3>
            <p className="text-sm text-[var(--text-mid)]" style={{ marginBottom: '20px' }}>
              Your subscription for <strong>{subscription.domain}</strong> will be canceled at the end of the current billing period ({formatDate(subscription.current_period_end)}). You will retain access until then.
            </p>

            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="font-mono text-sm text-[var(--text-mid)] hover:text-[var(--text)] transition-colors"
                style={{ padding: '10px 16px' }}
              >
                Keep Subscription
              </button>
              <button
                onClick={handleCancel}
                disabled={canceling}
                className="flex items-center gap-2 bg-red-500 text-white font-mono text-sm hover:bg-red-600 transition-all disabled:opacity-50"
                style={{ padding: '10px 16px' }}
              >
                {canceling ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : null}
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
