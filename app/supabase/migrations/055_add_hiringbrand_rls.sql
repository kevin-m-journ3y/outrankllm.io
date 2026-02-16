-- Add Row Level Security to HiringBrand tables
-- This ensures users can only access data from their own organizations

-- ============================================
-- hb_frozen_role_families
-- ============================================
ALTER TABLE hb_frozen_role_families ENABLE ROW LEVEL SECURITY;

-- Service role has full access
CREATE POLICY "Service role has full access to hb_frozen_role_families"
  ON hb_frozen_role_families
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Users can view role families from their organization
CREATE POLICY "Users can view their organization's role families"
  ON hb_frozen_role_families
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members WHERE lead_id = auth.uid()
    )
  );

-- Admins and owners can manage role families
CREATE POLICY "Admins can manage their organization's role families"
  ON hb_frozen_role_families
  FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE lead_id = auth.uid() AND role IN ('admin', 'owner')
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE lead_id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

-- ============================================
-- hb_frozen_competitors
-- ============================================
ALTER TABLE hb_frozen_competitors ENABLE ROW LEVEL SECURITY;

-- Service role has full access
CREATE POLICY "Service role has full access to hb_frozen_competitors"
  ON hb_frozen_competitors
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Users can view competitors from their organization
CREATE POLICY "Users can view their organization's competitors"
  ON hb_frozen_competitors
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members WHERE lead_id = auth.uid()
    )
  );

-- Admins and owners can manage competitors
CREATE POLICY "Admins can manage their organization's competitors"
  ON hb_frozen_competitors
  FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE lead_id = auth.uid() AND role IN ('admin', 'owner')
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE lead_id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

-- ============================================
-- hb_frozen_questions
-- ============================================
ALTER TABLE hb_frozen_questions ENABLE ROW LEVEL SECURITY;

-- Service role has full access
CREATE POLICY "Service role has full access to hb_frozen_questions"
  ON hb_frozen_questions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Users can view questions from their organization
CREATE POLICY "Users can view their organization's questions"
  ON hb_frozen_questions
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members WHERE lead_id = auth.uid()
    )
  );

-- Admins and owners can manage questions
CREATE POLICY "Admins can manage their organization's questions"
  ON hb_frozen_questions
  FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE lead_id = auth.uid() AND role IN ('admin', 'owner')
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE lead_id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

-- ============================================
-- hb_score_history
-- ============================================
ALTER TABLE hb_score_history ENABLE ROW LEVEL SECURITY;

-- Service role has full access
CREATE POLICY "Service role has full access to hb_score_history"
  ON hb_score_history
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Users can view score history from their organization
CREATE POLICY "Users can view their organization's score history"
  ON hb_score_history
  FOR SELECT
  TO authenticated
  USING (
    monitored_domain_id IN (
      SELECT md.id FROM monitored_domains md
      JOIN organization_members om ON om.organization_id = md.organization_id
      WHERE om.lead_id = auth.uid()
    )
  );

-- Score history is read-only for users (only service role can insert/update)

-- ============================================
-- hb_competitor_history
-- ============================================
ALTER TABLE hb_competitor_history ENABLE ROW LEVEL SECURITY;

-- Service role has full access
CREATE POLICY "Service role has full access to hb_competitor_history"
  ON hb_competitor_history
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Users can view competitor history from their organization
CREATE POLICY "Users can view their organization's competitor history"
  ON hb_competitor_history
  FOR SELECT
  TO authenticated
  USING (
    monitored_domain_id IN (
      SELECT md.id FROM monitored_domains md
      JOIN organization_members om ON om.organization_id = md.organization_id
      WHERE om.lead_id = auth.uid()
    )
  );

-- Competitor history is read-only for users (only service role can insert/update)

COMMENT ON POLICY "Service role has full access to hb_frozen_role_families" ON hb_frozen_role_families IS 'Backend operations need full access';
COMMENT ON POLICY "Users can view their organization's role families" ON hb_frozen_role_families IS 'Users can view role families from orgs they belong to';
COMMENT ON POLICY "Admins can manage their organization's role families" ON hb_frozen_role_families IS 'Admins and owners can create, update, delete role families';
