-- Waitlist table for coming soon page signups
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  source TEXT DEFAULT 'coming-soon', -- Track where signup came from
  notified BOOLEAN DEFAULT FALSE -- Track if we've sent them a launch notification
);

-- Index for email lookups
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);

-- Index for notified status (for batch launch emails)
CREATE INDEX IF NOT EXISTS idx_waitlist_notified ON waitlist(notified) WHERE notified = FALSE;