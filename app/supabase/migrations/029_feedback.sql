-- ============================================
-- FEEDBACK TABLE
-- User feedback, bug reports, and feature requests
-- ============================================

CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User context (nullable for non-logged-in users)
  lead_id UUID REFERENCES leads(id),
  user_email TEXT,
  user_tier TEXT,

  -- Feedback content
  type TEXT NOT NULL CHECK (type IN ('bug', 'feature', 'feedback', 'other')),
  message TEXT NOT NULL,

  -- Context
  page_url TEXT,
  user_agent TEXT,

  -- Status tracking
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'resolved', 'wont_fix')),
  notes TEXT,  -- Internal notes for tracking

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_feedback_status ON feedback(status);
CREATE INDEX idx_feedback_type ON feedback(type);
CREATE INDEX idx_feedback_created ON feedback(created_at DESC);
CREATE INDEX idx_feedback_lead ON feedback(lead_id);

-- RLS policies
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Anyone can insert feedback (including anonymous users)
CREATE POLICY "Anyone can submit feedback" ON feedback
  FOR INSERT
  WITH CHECK (true);

-- Only service role can read/update (admin access)
CREATE POLICY "Service role can manage feedback" ON feedback
  FOR ALL
  USING (auth.role() = 'service_role');

-- Trigger for updated_at
CREATE TRIGGER update_feedback_updated_at
  BEFORE UPDATE ON feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
