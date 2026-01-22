import type React from 'react'

export type TabId = 'startHere' | 'setup' | 'readiness' | 'responses' | 'measurements' | 'competitors' | 'brandAwareness' | 'actions' | 'prd'

export interface Tab {
  id: TabId
  label: string
  icon: React.ElementType
  locked?: boolean
  premium?: boolean
  lockMessage?: string
}

export interface Analysis {
  business_type: string
  business_name: string | null
  services: string[]
  location: string | null
  target_audience?: string | null
  key_phrases?: string[]
  industry?: string
}

export interface Response {
  platform: string
  response_text: string
  domain_mentioned: boolean
  prompt: { prompt_text: string } | null
}

export interface Prompt {
  id: string
  prompt_text: string
  category: string
  source?: 'ai_generated' | 'user_created'
}

export interface Competitor {
  name: string
  count: number
}

export interface CrawlData {
  hasSitemap?: boolean
  hasRobotsTxt?: boolean
  pagesCrawled?: number
  schemaTypes?: string[]
  hasMetaDescriptions?: boolean
}

export interface PlatformData {
  // CMS / Website Builder
  detected_cms?: string | null
  detected_cms_confidence?: 'high' | 'medium' | 'low' | null
  detected_framework?: string | null
  detected_css_framework?: string | null
  detected_ecommerce?: string | null
  detected_hosting?: string | null

  // Analytics & Lead Capture
  detected_analytics?: string[]
  detected_lead_capture?: string[]

  // Content sections
  has_blog?: boolean
  has_case_studies?: boolean
  has_resources?: boolean
  has_faq?: boolean
  has_about_page?: boolean
  has_team_page?: boolean
  has_testimonials?: boolean

  // E-commerce flag
  is_ecommerce?: boolean

  // AI Readability
  has_ai_readability_issues?: boolean
  ai_readability_issues?: string[]
  renders_client_side?: boolean

  // AI-generated signals
  likely_ai_generated?: boolean
  ai_generated_signals?: string[]
}

export interface BrandAwarenessResult {
  platform: string
  query_type: string
  tested_entity: string
  tested_attribute: string | null
  entity_recognized: boolean
  attribute_mentioned: boolean
  response_text: string
  confidence_score: number
  compared_to: string | null
  positioning: string | null
}

export interface CompetitiveSummary {
  strengths: string[]
  weaknesses: string[]
  opportunities: string[]
  overallPosition: string
}

export interface ReadinessCheck {
  id: string
  label: string
  description: string
  impact: 'high' | 'medium' | 'low'
  check: (analysis: Analysis | null, crawlData?: CrawlData) => 'pass' | 'fail' | 'warning' | 'unknown'
}