-- AlterTable
ALTER TABLE "users" ADD COLUMN "brand_name" TEXT;
ALTER TABLE "users" ADD COLUMN "brand_color" TEXT;
ALTER TABLE "users" ADD COLUMN "brand_logo" TEXT;
ALTER TABLE "users" ADD COLUMN "invite_slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_invite_slug_key" ON "users"("invite_slug");
