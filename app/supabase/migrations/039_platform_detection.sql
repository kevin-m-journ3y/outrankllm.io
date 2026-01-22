-- Migration: Add platform detection columns to site_analyses
-- Created: 2025-01-22

-- Add platform detection fields to site_analyses
ALTER TABLE site_analyses ADD COLUMN IF NOT EXISTS detected_cms TEXT;
ALTER TABLE site_analyses ADD COLUMN IF NOT EXISTS detected_cms_confidence TEXT CHECK (detected_cms_confidence IN ('high', 'medium', 'low'));
ALTER TABLE site_analyses ADD COLUMN IF NOT EXISTS detected_framework TEXT;
ALTER TABLE site_analyses ADD COLUMN IF NOT EXISTS detected_css_framework TEXT;
ALTER TABLE site_analyses ADD COLUMN IF NOT EXISTS detected_ecommerce TEXT;
ALTER TABLE site_analyses ADD COLUMN IF NOT EXISTS detected_hosting TEXT;
ALTER TABLE site_analyses ADD COLUMN IF NOT EXISTS detected_analytics TEXT[] DEFAULT '{}';
ALTER TABLE site_analyses ADD COLUMN IF NOT EXISTS detected_lead_capture TEXT[] DEFAULT '{}';

-- Content sections found
ALTER TABLE site_analyses ADD COLUMN IF NOT EXISTS has_blog BOOLEAN DEFAULT false;
ALTER TABLE site_analyses ADD COLUMN IF NOT EXISTS has_case_studies BOOLEAN DEFAULT false;
ALTER TABLE site_analyses ADD COLUMN IF NOT EXISTS has_resources BOOLEAN DEFAULT false;
ALTER TABLE site_analyses ADD COLUMN IF NOT EXISTS has_faq BOOLEAN DEFAULT false;
ALTER TABLE site_analyses ADD COLUMN IF NOT EXISTS has_about_page BOOLEAN DEFAULT false;
ALTER TABLE site_analyses ADD COLUMN IF NOT EXISTS has_team_page BOOLEAN DEFAULT false;
ALTER TABLE site_analyses ADD COLUMN IF NOT EXISTS has_testimonials BOOLEAN DEFAULT false;

-- E-commerce flag
ALTER TABLE site_analyses ADD COLUMN IF NOT EXISTS is_ecommerce BOOLEAN DEFAULT false;

-- AI readability issues (critical for GEO)
ALTER TABLE site_analyses ADD COLUMN IF NOT EXISTS has_ai_readability_issues BOOLEAN DEFAULT false;
ALTER TABLE site_analyses ADD COLUMN IF NOT EXISTS ai_readability_issues TEXT[] DEFAULT '{}';
ALTER TABLE site_analyses ADD COLUMN IF NOT EXISTS renders_client_side BOOLEAN DEFAULT false;

-- AI-generated / vibe-coded signals
ALTER TABLE site_analyses ADD COLUMN IF NOT EXISTS likely_ai_generated BOOLEAN DEFAULT false;
ALTER TABLE site_analyses ADD COLUMN IF NOT EXISTS ai_generated_signals TEXT[] DEFAULT '{}';

-- Raw detection signals for debugging
ALTER TABLE site_analyses ADD COLUMN IF NOT EXISTS platform_detection_signals TEXT[] DEFAULT '{}';

-- Index for filtering by CMS/platform
CREATE INDEX IF NOT EXISTS idx_site_analyses_detected_cms ON site_analyses(detected_cms);
CREATE INDEX IF NOT EXISTS idx_site_analyses_has_ai_readability_issues ON site_analyses(has_ai_readability_issues);
