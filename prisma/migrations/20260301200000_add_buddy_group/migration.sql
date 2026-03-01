-- CreateTable
CREATE TABLE "buddy_groups" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "invite_code" VARCHAR(8) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "buddy_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "buddy_memberships" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "group_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "buddy_memberships_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "buddy_groups_invite_code_key" ON "buddy_groups"("invite_code");

-- CreateIndex
CREATE UNIQUE INDEX "buddy_memberships_group_id_user_id_key" ON "buddy_memberships"("group_id", "user_id");

-- CreateIndex
CREATE INDEX "buddy_memberships_user_id_idx" ON "buddy_memberships"("user_id");

-- AddForeignKey
ALTER TABLE "buddy_memberships" ADD CONSTRAINT "buddy_memberships_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "buddy_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buddy_memberships" ADD CONSTRAINT "buddy_memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
