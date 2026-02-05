-- CreateTable
CREATE TABLE "daily_pulses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "weight" DOUBLE PRECISION,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_pulses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pulse_photos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "pulse_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "file_name" TEXT NOT NULL,
    "base64_data" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pulse_photos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "daily_pulses_user_id_idx" ON "daily_pulses"("user_id");

-- CreateIndex
CREATE INDEX "daily_pulses_user_id_date_idx" ON "daily_pulses"("user_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "daily_pulses_user_id_date_key" ON "daily_pulses"("user_id", "date");

-- CreateIndex
CREATE INDEX "pulse_photos_pulse_id_idx" ON "pulse_photos"("pulse_id");

-- AddForeignKey
ALTER TABLE "daily_pulses" ADD CONSTRAINT "daily_pulses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pulse_photos" ADD CONSTRAINT "pulse_photos_pulse_id_fkey" FOREIGN KEY ("pulse_id") REFERENCES "daily_pulses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pulse_photos" ADD CONSTRAINT "pulse_photos_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
