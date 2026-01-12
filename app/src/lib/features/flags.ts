import { createServiceClient } from '@/lib/supabase/server'

export type Tier = 'free' | 'starter' | 'pro' | 'agency'

export interface FeatureFlags {
  isSubscriber: boolean
  tier: Tier
  blurCompetitors: boolean
  showAllCompetitors: boolean
  editablePrompts: boolean
  customQuestionLimit: number  // Max total questions: 0 (free - can't edit), 10 (starter), 20 (pro/agency)
  showActionPlans: boolean     // Show full action plans (not teaser)
  showPrdTasks: boolean
  geoEnhancedPrompts: boolean
  unlimitedScans: boolean
  exportReports: boolean
  multiDomain: boolean  // Agency only - multiple domains
}

// Default flags for free tier
const DEFAULT_FLAGS: FeatureFlags = {
  isSubscriber: false,
  tier: 'free',
  blurCompetitors: true,
  showAllCompetitors: false,
  editablePrompts: false,
  customQuestionLimit: 0,
  showActionPlans: false,
  showPrdTasks: false,
  geoEnhancedPrompts: true,
  unlimitedScans: false,
  exportReports: false,
  multiDomain: false,
}

// Map database flag names to TypeScript property names
const FLAG_NAME_MAP: Record<string, keyof FeatureFlags> = {
  'blur_competitors': 'blurCompetitors',
  'show_all_competitors': 'showAllCompetitors',
  'editable_prompts': 'editablePrompts',
  'show_prd_tasks': 'showPrdTasks',
  'geo_enhanced_prompts': 'geoEnhancedPrompts',
  'unlimited_scans': 'unlimitedScans',
  'export_reports': 'exportReports',
  'multi_domain': 'multiDomain',
}

/**
 * Get feature flags for a specific tier
 */
export async function getFeatureFlags(tier: Tier = 'free'): Promise<FeatureFlags> {
  return getFlagsForTier(tier)
}

/**
 * Get flags based on tier
 */
function getFlagsForTier(tier: Tier): FeatureFlags {
  const isSubscriber = tier !== 'free'

  switch (tier) {
    case 'starter':
      return {
        isSubscriber: true,
        tier: 'starter',
        blurCompetitors: false,
        showAllCompetitors: true,
        editablePrompts: true,
        customQuestionLimit: 10,
        showActionPlans: true,
        showPrdTasks: false,
        geoEnhancedPrompts: true,
        unlimitedScans: false,
        exportReports: false,
        multiDomain: false,
      }

    case 'pro':
      return {
        isSubscriber: true,
        tier: 'pro',
        blurCompetitors: false,
        showAllCompetitors: true,
        editablePrompts: true,
        customQuestionLimit: 20,
        showActionPlans: true,
        showPrdTasks: true,
        geoEnhancedPrompts: true,
        unlimitedScans: true,
        exportReports: true,
        multiDomain: false,
      }

    case 'agency':
      return {
        isSubscriber: true,
        tier: 'agency',
        blurCompetitors: false,
        showAllCompetitors: true,
        editablePrompts: true,
        customQuestionLimit: 20,
        showActionPlans: true,
        showPrdTasks: true,
        geoEnhancedPrompts: true,
        unlimitedScans: true,
        exportReports: true,
        multiDomain: true,
      }

    case 'free':
    default:
      return {
        isSubscriber: false,
        tier: 'free',
        blurCompetitors: true,
        showAllCompetitors: false,
        editablePrompts: false,
        customQuestionLimit: 0,
        showActionPlans: false,
        showPrdTasks: false,
        geoEnhancedPrompts: true,
        unlimitedScans: false,
        exportReports: false,
        multiDomain: false,
      }
  }
}

// Boolean feature flags (excludes tier, isSubscriber, and customQuestionLimit which is a number)
type BooleanFeatureFlag = keyof Omit<FeatureFlags, 'isSubscriber' | 'tier' | 'customQuestionLimit'>

/**
 * Check if a specific boolean feature is enabled
 */
export function isFeatureEnabled(
  flags: FeatureFlags,
  feature: BooleanFeatureFlag
): boolean {
  return flags[feature] ?? false
}

/**
 * Get user tier from lead ID (checks for active subscription)
 *
 * Checks both domain_subscriptions (new multi-domain flow) and
 * legacy subscriptions table, returning the highest active tier.
 */
export async function getUserTier(leadId: string): Promise<Tier> {
  try {
    const supabase = createServiceClient()

    // Check domain_subscriptions FIRST (new multi-domain flow)
    // This is critical for second+ domain subscriptions
    const { data: domainSubs } = await supabase
      .from('domain_subscriptions')
      .select('tier')
      .eq('lead_id', leadId)
      .eq('status', 'active')

    if (domainSubs && domainSubs.length > 0) {
      // Return highest tier among active domain subscriptions
      const tiers = domainSubs.map((d: { tier: string }) => d.tier)
      if (tiers.includes('pro')) return 'pro'
      if (tiers.includes('starter')) return 'starter'
    }

    // Legacy: Check old subscriptions table for backward compatibility
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('tier, status')
      .eq('lead_id', leadId)
      .eq('status', 'active')
      .single()

    if (subscription?.tier) {
      return subscription.tier as Tier
    }

    // Final fallback to lead's tier field
    const { data: lead } = await supabase
      .from('leads')
      .select('tier')
      .eq('id', leadId)
      .single()

    return (lead?.tier as Tier) || 'free'

  } catch {
    return 'free'
  }
}

/**
 * Get feature flags for a specific lead
 */
export async function getFeatureFlagsForLead(leadId: string): Promise<FeatureFlags> {
  const tier = await getUserTier(leadId)
  return getFeatureFlags(tier)
}
