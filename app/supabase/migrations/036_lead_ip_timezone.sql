-- Add timezone column to leads table
-- Captures IANA timezone string from Vercel x-vercel-ip-timezone header

ALTER TABLE leads ADD COLUMN IF NOT EXISTS ip_timezone TEXT;

COMMENT ON COLUMN leads.ip_timezone IS 'IANA timezone string from Vercel x-vercel-ip-timezone header (e.g. Australia/Sydney)';
