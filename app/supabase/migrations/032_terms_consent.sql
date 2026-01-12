-- Add terms consent tracking to leads table
-- Records when a user agreed to the Terms & Conditions

ALTER TABLE leads
ADD COLUMN terms_accepted_at TIMESTAMPTZ;

-- Index for compliance reporting queries
CREATE INDEX idx_leads_terms_accepted ON leads(terms_accepted_at) WHERE terms_accepted_at IS NOT NULL;

-- Comment for documentation
COMMENT ON COLUMN leads.terms_accepted_at IS 'Timestamp when user agreed to Terms & Conditions during form submission';
