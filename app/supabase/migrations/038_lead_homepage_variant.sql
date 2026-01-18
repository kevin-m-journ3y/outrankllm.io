-- Add homepage_variant column to leads table
-- Tracks which A/B test variant the user saw when they signed up

ALTER TABLE leads
ADD COLUMN IF NOT EXISTS homepage_variant TEXT;

-- Add comment for documentation
COMMENT ON COLUMN leads.homepage_variant IS 'A/B test variant the user saw on homepage at signup (e.g., control, variant-b)';
