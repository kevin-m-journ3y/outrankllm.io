-- ============================================
-- CRAWLED PAGES
-- Store per-page crawl results for specific, actionable insights
-- This data enables PRD-ready actions like:
-- - "/services page missing H1 tag"
-- - "Homepage has only 150 words - needs expansion"
-- - "9 of 12 pages missing meta descriptions"
-- ============================================

CREATE TABLE IF NOT EXISTS crawled_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES scan_runs(id) ON DELETE CASCADE,

  -- Page identification
  url TEXT NOT NULL,
  path TEXT NOT NULL,

  -- SEO elements
  title TEXT,
  meta_description TEXT,
  h1 TEXT,
  headings TEXT[] DEFAULT '{}',        -- H2/H3 headings (up to 20)

  -- Content metrics
  word_count INTEGER DEFAULT 0,
  has_meta_description BOOLEAN DEFAULT FALSE,

  -- Schema markup
  schema_types TEXT[] DEFAULT '{}',    -- Schema.org types on this page (e.g., 'LocalBusiness', 'FAQPage')
  schema_data JSONB DEFAULT '[]',      -- Full JSON-LD data for detailed analysis

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX idx_crawled_pages_run ON crawled_pages(run_id);
CREATE INDEX idx_crawled_pages_path ON crawled_pages(path);

-- RLS policies
ALTER TABLE crawled_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Crawled pages are viewable" ON crawled_pages
  FOR SELECT
  USING (true);

-- Comment for documentation
COMMENT ON TABLE crawled_pages IS 'Per-page crawl results enabling specific, actionable recommendations for PRDs';
COMMENT ON COLUMN crawled_pages.headings IS 'H2 and H3 headings extracted from the page (up to 20)';
COMMENT ON COLUMN crawled_pages.schema_data IS 'Full JSON-LD schema markup for detailed schema analysis';
