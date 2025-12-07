-- CreateEnum
CREATE TYPE "InviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ClientStatus" AS ENUM ('ACTIVE', 'PAUSED', 'ARCHIVED');

-- AlterTable
ALTER TABLE "programs" ADD COLUMN     "source" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "is_coach" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "coach_clients" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "coach_id" UUID NOT NULL,
    "client_id" UUID,
    "invite_email" TEXT,
    "invite_token" TEXT,
    "invite_status" "InviteStatus" NOT NULL DEFAULT 'PENDING',
    "invite_sent_at" TIMESTAMP(3),
    "nickname" TEXT,
    "notes" TEXT,
    "status" "ClientStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coach_clients_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "coach_clients_invite_token_key" ON "coach_clients"("invite_token");

-- CreateIndex
CREATE INDEX "coach_clients_coach_id_idx" ON "coach_clients"("coach_id");

-- CreateIndex
CREATE INDEX "coach_clients_client_id_idx" ON "coach_clients"("client_id");

-- CreateIndex
CREATE INDEX "coach_clients_invite_token_idx" ON "coach_clients"("invite_token");

-- CreateIndex
CREATE UNIQUE INDEX "coach_clients_coach_id_client_id_key" ON "coach_clients"("coach_id", "client_id");

-- CreateIndex
CREATE UNIQUE INDEX "coach_clients_coach_id_invite_email_key" ON "coach_clients"("coach_id", "invite_email");

-- AddForeignKey
ALTER TABLE "coach_clients" ADD CONSTRAINT "coach_clients_coach_id_fkey" FOREIGN KEY ("coach_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coach_clients" ADD CONSTRAINT "coach_clients_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
