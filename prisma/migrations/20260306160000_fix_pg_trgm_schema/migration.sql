-- Fix pg_trgm extension schema for Supabase production.
-- Supabase may install pg_trgm in the 'extensions' schema by default.
-- Our GiST index uses public.gist_trgm_ops, which requires the extension in 'public'.
-- If it's already in 'public', ALTER EXTENSION is a no-op.

DO $$
BEGIN
  -- Move pg_trgm to public schema if it exists elsewhere
  IF EXISTS (
    SELECT 1 FROM pg_extension e
    JOIN pg_namespace n ON e.extnamespace = n.oid
    WHERE e.extname = 'pg_trgm' AND n.nspname != 'public'
  ) THEN
    ALTER EXTENSION pg_trgm SET SCHEMA public;
  END IF;
END $$;

-- Ensure pg_trgm exists in public (covers fresh installs)
CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;

-- Recreate GiST index (idempotent — drop first to handle partial state)
DROP INDEX IF EXISTS foods_off_product_name_trgm_idx;

CREATE INDEX foods_off_product_name_trgm_idx
  ON foods_off USING gist (product_name public.gist_trgm_ops);
