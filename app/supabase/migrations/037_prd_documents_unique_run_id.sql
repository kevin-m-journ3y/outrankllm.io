-- Add unique constraint to prevent duplicate PRDs for the same run
-- This handles race conditions when users click "Generate Now" multiple times
ALTER TABLE prd_documents
ADD CONSTRAINT prd_documents_run_id_unique UNIQUE (run_id);
