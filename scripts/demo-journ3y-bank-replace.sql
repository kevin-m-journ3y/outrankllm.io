-- Demo Report: JOURN3Y Bank Replacement Script
-- Report Token: 76b814235ca771f8
-- Lead ID: 4d44995f-1b1b-418a-8380-583593cd58e2
-- Domain Subscription ID: 61484a35-5bb9-446f-8a0f-11e917d5b693
--
-- Run this script after a rescan to replace all MyState references with JOURN3Y Bank
-- Execute via Supabase SQL Editor or psql

-- ============================================
-- STEP 1: Update domain fields
-- ============================================

UPDATE leads
SET domain = 'journ3ybank.com.au'
WHERE id = '4d44995f-1b1b-418a-8380-583593cd58e2';

UPDATE domain_subscriptions
SET domain = 'journ3ybank.com.au'
WHERE id = '61484a35-5bb9-446f-8a0f-11e917d5b693';

UPDATE scan_runs
SET domain = 'journ3ybank.com.au'
WHERE lead_id = '4d44995f-1b1b-418a-8380-583593cd58e2';

-- ============================================
-- STEP 2: Update business name in site_analyses
-- ============================================

UPDATE site_analyses
SET business_name = REPLACE(business_name, 'MyState', 'JOURN3Y')
WHERE run_id IN (
  SELECT id FROM scan_runs WHERE lead_id = '4d44995f-1b1b-418a-8380-583593cd58e2'
);

-- ============================================
-- STEP 3: Replace "MyState Bank" -> "JOURN3Y Bank" in all text
-- ============================================

-- LLM Responses
UPDATE llm_responses
SET response_text = REPLACE(
  REPLACE(response_text, 'MyState Bank', 'JOURN3Y Bank'),
  'MyState', 'JOURN3Y Bank'
)
WHERE run_id IN (
  SELECT id FROM scan_runs WHERE lead_id = '4d44995f-1b1b-418a-8380-583593cd58e2'
);

-- Action Plans
UPDATE action_plans
SET
  executive_summary = REPLACE(REPLACE(executive_summary, 'MyState Bank', 'JOURN3Y Bank'), 'MyState', 'JOURN3Y Bank'),
  page_edits = REPLACE(REPLACE(page_edits::text, 'MyState Bank', 'JOURN3Y Bank'), 'MyState', 'JOURN3Y Bank')::jsonb,
  keyword_map = REPLACE(REPLACE(keyword_map::text, 'MyState Bank', 'JOURN3Y Bank'), 'MyState', 'JOURN3Y Bank')::jsonb,
  key_takeaways = REPLACE(REPLACE(key_takeaways::text, 'MyState Bank', 'JOURN3Y Bank'), 'MyState', 'JOURN3Y Bank')::jsonb
WHERE lead_id = '4d44995f-1b1b-418a-8380-583593cd58e2';

-- Action Items
UPDATE action_items
SET
  title = REPLACE(REPLACE(title, 'MyState Bank', 'JOURN3Y Bank'), 'MyState', 'JOURN3Y Bank'),
  description = REPLACE(REPLACE(description, 'MyState Bank', 'JOURN3Y Bank'), 'MyState', 'JOURN3Y Bank'),
  source_insight = REPLACE(REPLACE(source_insight, 'MyState Bank', 'JOURN3Y Bank'), 'MyState', 'JOURN3Y Bank'),
  expected_outcome = REPLACE(REPLACE(expected_outcome, 'MyState Bank', 'JOURN3Y Bank'), 'MyState', 'JOURN3Y Bank')
WHERE plan_id IN (
  SELECT id FROM action_plans WHERE lead_id = '4d44995f-1b1b-418a-8380-583593cd58e2'
);

-- Brand Awareness Results
UPDATE brand_awareness_results
SET
  tested_entity = REPLACE(REPLACE(tested_entity, 'MyState Bank', 'JOURN3Y Bank'), 'MyState', 'JOURN3Y Bank'),
  response_text = REPLACE(REPLACE(response_text, 'MyState Bank', 'JOURN3Y Bank'), 'MyState', 'JOURN3Y Bank')
WHERE run_id IN (
  SELECT id FROM scan_runs WHERE lead_id = '4d44995f-1b1b-418a-8380-583593cd58e2'
);

-- Reports
UPDATE reports
SET
  summary = REPLACE(REPLACE(summary, 'MyState Bank', 'JOURN3Y Bank'), 'MyState', 'JOURN3Y Bank'),
  competitive_summary = REPLACE(REPLACE(competitive_summary::text, 'MyState Bank', 'JOURN3Y Bank'), 'MyState', 'JOURN3Y Bank')::jsonb
WHERE run_id IN (
  SELECT id FROM scan_runs WHERE lead_id = '4d44995f-1b1b-418a-8380-583593cd58e2'
);

-- PRD Documents
UPDATE prd_documents
SET
  title = REPLACE(REPLACE(title, 'MyState Bank', 'JOURN3Y Bank'), 'MyState', 'JOURN3Y Bank'),
  overview = REPLACE(REPLACE(overview, 'MyState Bank', 'JOURN3Y Bank'), 'MyState', 'JOURN3Y Bank')
WHERE lead_id = '4d44995f-1b1b-418a-8380-583593cd58e2';

-- PRD Tasks
UPDATE prd_tasks
SET
  title = REPLACE(REPLACE(title, 'MyState Bank', 'JOURN3Y Bank'), 'MyState', 'JOURN3Y Bank'),
  description = REPLACE(REPLACE(description, 'MyState Bank', 'JOURN3Y Bank'), 'MyState', 'JOURN3Y Bank'),
  prompt_context = REPLACE(REPLACE(prompt_context, 'MyState Bank', 'JOURN3Y Bank'), 'MyState', 'JOURN3Y Bank'),
  implementation_notes = REPLACE(REPLACE(implementation_notes, 'MyState Bank', 'JOURN3Y Bank'), 'MyState', 'JOURN3Y Bank'),
  code_snippets = REPLACE(REPLACE(code_snippets::text, 'MyState Bank', 'JOURN3Y Bank'), 'MyState', 'JOURN3Y Bank')::jsonb
WHERE prd_id IN (
  SELECT id FROM prd_documents WHERE lead_id = '4d44995f-1b1b-418a-8380-583593cd58e2'
);

-- ============================================
-- STEP 4: Fix double "Bank Bank" issue
-- ============================================

UPDATE llm_responses
SET response_text = REPLACE(response_text, 'JOURN3Y Bank Bank', 'JOURN3Y Bank')
WHERE run_id IN (
  SELECT id FROM scan_runs WHERE lead_id = '4d44995f-1b1b-418a-8380-583593cd58e2'
);

UPDATE action_plans
SET
  executive_summary = REPLACE(executive_summary, 'JOURN3Y Bank Bank', 'JOURN3Y Bank'),
  page_edits = REPLACE(page_edits::text, 'JOURN3Y Bank Bank', 'JOURN3Y Bank')::jsonb,
  keyword_map = REPLACE(keyword_map::text, 'JOURN3Y Bank Bank', 'JOURN3Y Bank')::jsonb,
  key_takeaways = REPLACE(key_takeaways::text, 'JOURN3Y Bank Bank', 'JOURN3Y Bank')::jsonb
WHERE lead_id = '4d44995f-1b1b-418a-8380-583593cd58e2';

UPDATE action_items
SET
  title = REPLACE(title, 'JOURN3Y Bank Bank', 'JOURN3Y Bank'),
  description = REPLACE(description, 'JOURN3Y Bank Bank', 'JOURN3Y Bank'),
  source_insight = REPLACE(source_insight, 'JOURN3Y Bank Bank', 'JOURN3Y Bank'),
  expected_outcome = REPLACE(expected_outcome, 'JOURN3Y Bank Bank', 'JOURN3Y Bank')
WHERE plan_id IN (
  SELECT id FROM action_plans WHERE lead_id = '4d44995f-1b1b-418a-8380-583593cd58e2'
);

UPDATE brand_awareness_results
SET response_text = REPLACE(response_text, 'JOURN3Y Bank Bank', 'JOURN3Y Bank')
WHERE run_id IN (
  SELECT id FROM scan_runs WHERE lead_id = '4d44995f-1b1b-418a-8380-583593cd58e2'
);

UPDATE reports
SET
  summary = REPLACE(summary, 'JOURN3Y Bank Bank', 'JOURN3Y Bank'),
  competitive_summary = REPLACE(competitive_summary::text, 'JOURN3Y Bank Bank', 'JOURN3Y Bank')::jsonb
WHERE run_id IN (
  SELECT id FROM scan_runs WHERE lead_id = '4d44995f-1b1b-418a-8380-583593cd58e2'
);

UPDATE prd_documents
SET
  title = REPLACE(title, 'JOURN3Y Bank Bank', 'JOURN3Y Bank'),
  overview = REPLACE(overview, 'JOURN3Y Bank Bank', 'JOURN3Y Bank')
WHERE lead_id = '4d44995f-1b1b-418a-8380-583593cd58e2';

UPDATE prd_tasks
SET
  title = REPLACE(title, 'JOURN3Y Bank Bank', 'JOURN3Y Bank'),
  description = REPLACE(description, 'JOURN3Y Bank Bank', 'JOURN3Y Bank'),
  prompt_context = REPLACE(prompt_context, 'JOURN3Y Bank Bank', 'JOURN3Y Bank')
WHERE prd_id IN (
  SELECT id FROM prd_documents WHERE lead_id = '4d44995f-1b1b-418a-8380-583593cd58e2'
);

-- ============================================
-- STEP 5: Replace domain mystate.com.au -> journ3ybank.com.au
-- ============================================

UPDATE llm_responses
SET response_text = REPLACE(response_text, 'mystate.com.au', 'journ3ybank.com.au')
WHERE run_id IN (
  SELECT id FROM scan_runs WHERE lead_id = '4d44995f-1b1b-418a-8380-583593cd58e2'
);

UPDATE action_plans
SET
  executive_summary = REPLACE(executive_summary, 'mystate.com.au', 'journ3ybank.com.au'),
  page_edits = REPLACE(page_edits::text, 'mystate.com.au', 'journ3ybank.com.au')::jsonb,
  keyword_map = REPLACE(keyword_map::text, 'mystate.com.au', 'journ3ybank.com.au')::jsonb,
  key_takeaways = REPLACE(key_takeaways::text, 'mystate.com.au', 'journ3ybank.com.au')::jsonb
WHERE lead_id = '4d44995f-1b1b-418a-8380-583593cd58e2';

UPDATE action_items
SET
  title = REPLACE(title, 'mystate.com.au', 'journ3ybank.com.au'),
  description = REPLACE(description, 'mystate.com.au', 'journ3ybank.com.au'),
  source_insight = REPLACE(source_insight, 'mystate.com.au', 'journ3ybank.com.au'),
  expected_outcome = REPLACE(expected_outcome, 'mystate.com.au', 'journ3ybank.com.au')
WHERE plan_id IN (
  SELECT id FROM action_plans WHERE lead_id = '4d44995f-1b1b-418a-8380-583593cd58e2'
);

UPDATE brand_awareness_results
SET response_text = REPLACE(response_text, 'mystate.com.au', 'journ3ybank.com.au')
WHERE run_id IN (
  SELECT id FROM scan_runs WHERE lead_id = '4d44995f-1b1b-418a-8380-583593cd58e2'
);

UPDATE reports
SET
  summary = REPLACE(summary, 'mystate.com.au', 'journ3ybank.com.au'),
  competitive_summary = REPLACE(competitive_summary::text, 'mystate.com.au', 'journ3ybank.com.au')::jsonb
WHERE run_id IN (
  SELECT id FROM scan_runs WHERE lead_id = '4d44995f-1b1b-418a-8380-583593cd58e2'
);

UPDATE prd_documents
SET
  title = REPLACE(title, 'mystate.com.au', 'journ3ybank.com.au'),
  overview = REPLACE(overview, 'mystate.com.au', 'journ3ybank.com.au')
WHERE lead_id = '4d44995f-1b1b-418a-8380-583593cd58e2';

UPDATE prd_tasks
SET
  title = REPLACE(title, 'mystate.com.au', 'journ3ybank.com.au'),
  description = REPLACE(description, 'mystate.com.au', 'journ3ybank.com.au'),
  prompt_context = REPLACE(prompt_context, 'mystate.com.au', 'journ3ybank.com.au'),
  implementation_notes = REPLACE(implementation_notes, 'mystate.com.au', 'journ3ybank.com.au'),
  code_snippets = REPLACE(code_snippets::text, 'mystate.com.au', 'journ3ybank.com.au')::jsonb
WHERE prd_id IN (
  SELECT id FROM prd_documents WHERE lead_id = '4d44995f-1b1b-418a-8380-583593cd58e2'
);

UPDATE crawled_pages
SET url = REPLACE(url, 'mystate.com.au', 'journ3ybank.com.au')
WHERE run_id IN (
  SELECT id FROM scan_runs WHERE lead_id = '4d44995f-1b1b-418a-8380-583593cd58e2'
);

UPDATE site_analyses
SET raw_content = REPLACE(raw_content, 'mystate.com.au', 'journ3ybank.com.au')
WHERE run_id IN (
  SELECT id FROM scan_runs WHERE lead_id = '4d44995f-1b1b-418a-8380-583593cd58e2'
);

-- ============================================
-- STEP 6: Make report public (no login, no expiry)
-- ============================================

UPDATE reports
SET
  subscriber_only = false,
  expires_at = NULL
WHERE run_id IN (
  SELECT id FROM scan_runs WHERE lead_id = '4d44995f-1b1b-418a-8380-583593cd58e2'
);

-- ============================================
-- STEP 7: Remove scan schedule to prevent auto-rescan
-- ============================================

UPDATE domain_subscriptions
SET
  scan_schedule_day = NULL,
  scan_schedule_hour = NULL,
  scan_timezone = NULL
WHERE id = '61484a35-5bb9-446f-8a0f-11e917d5b693';

-- ============================================
-- DONE!
-- ============================================

SELECT 'Demo report updated: JOURN3Y Bank @ journ3ybank.com.au' as status;
