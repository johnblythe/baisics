-- CreateTable
CREATE TABLE IF NOT EXISTS "pending_claims" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "tool_data" JSONB,
    "token" TEXT NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pending_claims_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "pending_claims_token_key" ON "pending_claims"("token");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "pending_claims_email_idx" ON "pending_claims"("email");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "pending_claims_token_idx" ON "pending_claims"("token");
