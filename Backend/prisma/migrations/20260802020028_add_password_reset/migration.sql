-- AlterTable
ALTER TABLE "users" ADD COLUMN     "password_reset_code" VARCHAR(255),
ADD COLUMN     "password_reset_code_expires_at" TIMESTAMPTZ(6);