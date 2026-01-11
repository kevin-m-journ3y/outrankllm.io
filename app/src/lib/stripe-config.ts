/**
 * Stripe configuration that's safe to use in client components
 * Does NOT include the Stripe client or any server-side secrets
 */

// Pricing regions
export type PricingRegion = 'AU' | 'INTL'

// Subscription tiers
export type SubscriptionTier = 'starter' | 'pro' | 'agency'

// Tier display names
export const TIER_NAMES: Record<SubscriptionTier, string> = {
  starter: 'Starter',
  pro: 'Pro',
  agency: 'Agency',
}

// Tier prices by region - kept manually aligned with Stripe
export const TIER_PRICES: Record<PricingRegion, Record<SubscriptionTier, number>> = {
  AU: {
    starter: 39,
    pro: 59,
    agency: 199,
  },
  INTL: {
    starter: 24.99,
    pro: 39.99,
    agency: 139,
  },
}

// Currency symbols by region
export const CURRENCY_SYMBOL: Record<PricingRegion, string> = {
  AU: 'A$',
  INTL: '$',
}

// Currency codes for display
export const CURRENCY_CODE: Record<PricingRegion, string> = {
  AU: 'AUD',
  INTL: 'USD',
}
