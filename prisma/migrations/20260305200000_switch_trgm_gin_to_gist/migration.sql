-- Switch from GIN to GiST trigram index for KNN distance-ordered search.
-- GiST supports the <-> distance operator, enabling index-accelerated
-- nearest-neighbor lookups that stop after LIMIT N — avoids full bitmap scan.
-- Improves fuzzy query from ~1200ms (GIN bitmap + recheck) to <50ms (GiST KNN).

DROP INDEX IF EXISTS foods_off_product_name_trgm_idx;

CREATE INDEX foods_off_product_name_trgm_idx
  ON foods_off USING gist (product_name public.gist_trgm_ops);
