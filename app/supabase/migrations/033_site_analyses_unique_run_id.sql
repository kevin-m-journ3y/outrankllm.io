-- ============================================
-- ADD UNIQUE CONSTRAINT TO site_analyses.run_id
-- ============================================
-- Prevents duplicate site_analyses records when Inngest retries the analyze-content step.
-- Before this, each retry would insert a NEW record, causing .single() queries to fail.

-- First, clean up any existing duplicates by keeping only the most recent per run_id
DELETE FROM site_analyses sa1
WHERE EXISTS (
  SELECT 1 FROM site_analyses sa2
  WHERE sa2.run_id = sa1.run_id
    AND sa2.created_at > sa1.created_at
);

-- Now add the unique constraint
ALTER TABLE site_analyses
ADD CONSTRAINT site_analyses_run_id_unique UNIQUE (run_id);

-- Log for verification
DO $$
BEGIN
  RAISE NOTICE 'Added UNIQUE constraint on site_analyses.run_id';
END $$;
