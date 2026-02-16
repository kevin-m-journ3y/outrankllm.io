-- Add 'role_insights' category to scan_prompts constraint
-- This allows role-specific employer questions to be saved

ALTER TABLE scan_prompts DROP CONSTRAINT IF EXISTS scan_prompts_category_check;
ALTER TABLE scan_prompts ADD CONSTRAINT scan_prompts_category_check
  CHECK (category IN (
    -- outrankllm categories (existing)
    'finding_provider',
    'product_specific',
    'service',
    'comparison',
    'review',
    'how_to',
    'general',
    'location',
    'recommendation',
    -- HiringBrand employer categories (existing)
    'reputation',
    'culture',
    'compensation',
    'growth',
    'industry',
    'balance',
    'leadership',
    -- HiringBrand role-specific category (new)
    'role_insights'
  ));
