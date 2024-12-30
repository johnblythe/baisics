-- AlterTable
ALTER TABLE "user_images" ADD COLUMN     "program_id" UUID,
ADD COLUMN     "type" TEXT;

-- AddForeignKey
ALTER TABLE "user_images" ADD CONSTRAINT "user_images_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "programs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
