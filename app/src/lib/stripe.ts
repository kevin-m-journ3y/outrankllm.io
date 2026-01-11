/**
 * Server-side Stripe configuration
 * This file should only be imported in server components and API routes
 */
import Stripe from 'stripe'

// Re-export client-safe types and constants
export {
  type PricingRegion,
  type SubscriptionTier,
  TIER_NAMES,
  TIER_PRICES,
  CURRENCY_SYMBOL,
  CURRENCY_CODE,
} from './stripe-config'

import type { PricingRegion, SubscriptionTier } from './stripe-config'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not configured')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-12-15.clover',
  typescript: true,
})

// Price IDs from environment - region-based (server-only)
export const STRIPE_PRICES: Record<PricingRegion, Record<SubscriptionTier, string>> = {
  AU: {
    starter: process.env.STRIPE_PRICE_STARTER_AU || process.env.STRIPE_PRICE_STARTER!,
    pro: process.env.STRIPE_PRICE_PRO_AU || process.env.STRIPE_PRICE_PRO!,
    agency: process.env.STRIPE_PRICE_AGENCY_AU || process.env.STRIPE_PRICE_AGENCY!,
  },
  INTL: {
    starter: process.env.STRIPE_PRICE_STARTER_USD || process.env.STRIPE_PRICE_STARTER!,
    pro: process.env.STRIPE_PRICE_PRO_USD || process.env.STRIPE_PRICE_PRO!,
    agency: process.env.STRIPE_PRICE_AGENCY_USD || process.env.STRIPE_PRICE_AGENCY!,
  },
} as const

// Get price ID for a tier and region
export function getPriceId(tier: SubscriptionTier, region: PricingRegion): string {
  return STRIPE_PRICES[region][tier]
}

// Map price IDs back to tier names (checks both regions)
export function getTierFromPriceId(priceId: string): SubscriptionTier | null {
  for (const region of ['AU', 'INTL'] as PricingRegion[]) {
    const entries = Object.entries(STRIPE_PRICES[region]) as [SubscriptionTier, string][]
    const found = entries.find(([, id]) => id === priceId)
    if (found) return found[0]
  }
  return null
}
