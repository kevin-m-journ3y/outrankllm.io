-- Migration: RLS fixes for query_research_results and waitlist
-- Created: 2025-01-08
-- Description: Adds missing RLS policies to secure tables

-- ============================================
-- query_research_results - Public read, service write
-- ============================================
ALTER TABLE query_research_results ENABLE ROW LEVEL SECURITY;

-- Allow public to view research results (part of report display)
CREATE POLICY "Query research results are viewable" ON query_research_results
  FOR SELECT USING (true);

-- Service role has full access for backend operations
CREATE POLICY "Query research results service access" ON query_research_results
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- waitlist - Service role only (email privacy)
-- ============================================
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Only service role can access waitlist (emails are private)
CREATE POLICY "Waitlist service access" ON waitlist
  FOR ALL USING (auth.role() = 'service_role');
