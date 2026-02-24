-- CreateTable: foods_off — Open Food Facts local product cache
-- Uses tsvector generated column for full-text search with weighted ranking
CREATE TABLE "foods_off" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "brands" TEXT,
    "calories_per_100g" DOUBLE PRECISION,
    "protein_per_100g" DOUBLE PRECISION,
    "carbs_per_100g" DOUBLE PRECISION,
    "fat_per_100g" DOUBLE PRECISION,
    "serving_size" TEXT,
    "imported_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "search_vector" tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce("product_name", '')), 'A') ||
        setweight(to_tsvector('english', coalesce("brands", '')), 'B')
    ) STORED,
    CONSTRAINT "foods_off_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: unique barcode
CREATE UNIQUE INDEX "foods_off_code_idx" ON "foods_off"("code");

-- CreateIndex: GIN index for full-text search
CREATE INDEX "foods_off_search_vector_idx" ON "foods_off" USING GIN("search_vector");
