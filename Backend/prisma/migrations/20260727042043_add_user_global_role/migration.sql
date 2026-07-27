-- CreateEnum
CREATE TYPE "global_role" AS ENUM ('ADMIN', 'USER');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "role" "global_role" NOT NULL DEFAULT 'USER';
