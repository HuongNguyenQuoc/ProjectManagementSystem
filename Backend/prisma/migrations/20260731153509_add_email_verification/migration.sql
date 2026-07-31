-- AlterEnum
ALTER TYPE "user_status" ADD VALUE 'PENDING_VERIFICATION';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "verification_code" VARCHAR(255),
ADD COLUMN     "verification_code_expires_at" TIMESTAMPTZ(6);
