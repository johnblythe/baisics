-- Enable pg_trgm (explicit schema avoids Supabase function visibility issues)
CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;

-- GIN trigram index on product_name for fuzzy matching
CREATE INDEX IF NOT EXISTS foods_off_product_name_trgm_idx
  ON foods_off USING gin (product_name public.gin_trgm_ops);
