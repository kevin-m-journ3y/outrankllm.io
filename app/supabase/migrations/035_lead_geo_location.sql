-- Add geo location columns to leads table
-- Captures best-guess location from Vercel IP headers at first scan submission

ALTER TABLE leads ADD COLUMN IF NOT EXISTS ip_country TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS ip_city TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS ip_region TEXT;

-- Index for country lookups (useful for analytics)
CREATE INDEX IF NOT EXISTS idx_leads_ip_country ON leads(ip_country);

COMMENT ON COLUMN leads.ip_country IS 'Two-letter country code from Vercel x-vercel-ip-country header';
COMMENT ON COLUMN leads.ip_city IS 'City name from Vercel x-vercel-ip-city header';
COMMENT ON COLUMN leads.ip_region IS 'Region/state code from Vercel x-vercel-ip-country-region header';
