/**
 * Pricing region detection for Australian vs International customers
 *
 * Detection priority:
 * 1. Explicit user override (query param or cookie)
 * 2. Lead data signals (ABN, .au domain, Australian location)
 * 3. IP geolocation (Vercel headers)
 * 4. Default to INTL
 */

import { extractTldCountry, detectLocationFromContent } from './detect'

export type PricingRegion = 'AU' | 'INTL'

export interface RegionDetectionResult {
  region: PricingRegion
  confidence: 'high' | 'medium' | 'low'
  source: string
  signals: string[]
}

export interface RegionDetectionContext {
  // From Vercel headers (server-side)
  ipCountry?: string | null

  // From lead/report data (if user has scanned)
  leadDomain?: string | null
  leadLocation?: string | null
  hasABN?: boolean
  hasAustralianPhone?: boolean

  // User overrides
  cookieRegion?: PricingRegion | null
  queryParamRegion?: PricingRegion | null
}

/**
 * Detect pricing region based on available signals
 */
export function detectPricingRegion(context: RegionDetectionContext): RegionDetectionResult {
  const signals: string[] = []

  // 1. Check for explicit query param override (for testing)
  if (context.queryParamRegion) {
    signals.push(`Query param override: ${context.queryParamRegion}`)
    return {
      region: context.queryParamRegion,
      confidence: 'high',
      source: 'query_param',
      signals,
    }
  }

  // 2. Check for cookie preference (user clicked toggle)
  if (context.cookieRegion) {
    signals.push(`Cookie preference: ${context.cookieRegion}`)
    return {
      region: context.cookieRegion,
      confidence: 'high',
      source: 'cookie',
      signals,
    }
  }

  // 3. High confidence: ABN detected in business content
  if (context.hasABN) {
    signals.push('Australian Business Number (ABN) detected')
    return {
      region: 'AU',
      confidence: 'high',
      source: 'abn',
      signals,
    }
  }

  // 4. High confidence: .au domain
  if (context.leadDomain) {
    const tldCountry = extractTldCountry(context.leadDomain)
    if (tldCountry === 'Australia') {
      signals.push(`Australian domain TLD: ${context.leadDomain}`)
      return {
        region: 'AU',
        confidence: 'high',
        source: 'domain_tld',
        signals,
      }
    }
  }

  // 5. Medium confidence: Australian phone number
  if (context.hasAustralianPhone) {
    signals.push('Australian phone number detected')
    return {
      region: 'AU',
      confidence: 'medium',
      source: 'phone',
      signals,
    }
  }

  // 6. Medium confidence: Location mentions Australia
  if (context.leadLocation?.toLowerCase().includes('australia')) {
    signals.push(`Location mentions Australia: ${context.leadLocation}`)
    return {
      region: 'AU',
      confidence: 'medium',
      source: 'location',
      signals,
    }
  }

  // 7. Medium confidence: IP geolocation
  if (context.ipCountry === 'AU') {
    signals.push('IP address located in Australia')
    return {
      region: 'AU',
      confidence: 'medium',
      source: 'ip_geo',
      signals,
    }
  }

  // 8. Default to international
  if (context.ipCountry) {
    signals.push(`IP address located in: ${context.ipCountry}`)
  }
  signals.push('Defaulting to international pricing')

  return {
    region: 'INTL',
    confidence: 'low',
    source: 'default',
    signals,
  }
}

/**
 * Check if website content contains Australian business indicators
 */
export function detectAustralianBusinessSignals(content: string): {
  hasABN: boolean
  hasAustralianPhone: boolean
  hasAustralianState: boolean
} {
  // ABN pattern: ABN followed by 11 digits (with optional spaces)
  const hasABN = /\bABN[\s:]*\d{2}\s?\d{3}\s?\d{3}\s?\d{3}\b/i.test(content)

  // Australian phone patterns: +61, 04xx (mobile), 02/03/07/08 (landline)
  const hasAustralianPhone = /\+61|\b04\d{2}\s?\d{3}\s?\d{3}\b|\b0[2378]\s?\d{4}\s?\d{4}\b/.test(content)

  // Australian state abbreviations
  const hasAustralianState = /\b(NSW|VIC|QLD|WA|SA|TAS|ACT|NT)\b/.test(content)

  return { hasABN, hasAustralianPhone, hasAustralianState }
}

/**
 * Cookie name for storing region preference
 */
export const REGION_COOKIE_NAME = 'pricing_region'

/**
 * Parse region from cookie value
 */
export function parseRegionCookie(cookieValue: string | undefined): PricingRegion | null {
  if (cookieValue === 'AU' || cookieValue === 'INTL') {
    return cookieValue
  }
  return null
}

/**
 * Validate region query param
 * Accepts: AU, INTL, US (alias for INTL)
 */
export function parseRegionParam(param: string | null): PricingRegion | null {
  if (!param) return null
  const upper = param.toUpperCase()
  if (upper === 'AU') return 'AU'
  if (upper === 'INTL' || upper === 'US' || upper === 'USD') return 'INTL'
  return null
}
