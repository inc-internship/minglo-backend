/*
  Warnings:

  - You are about to drop the column `public_id` on the `email_confirmations` table. All the data in the column will be lost.
  - You are about to drop the column `public_id` on the `password_recoveries` table. All the data in the column will be lost.
  - You are about to drop the column `public_id` on the `sessions` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "email_confirmations_public_id_key";

-- DropIndex
DROP INDEX "password_recoveries_public_id_key";

-- DropIndex
DROP INDEX "sessions_public_id_key";

-- AlterTable
ALTER TABLE "email_confirmations" DROP COLUMN "public_id";

-- AlterTable
ALTER TABLE "password_recoveries" DROP COLUMN "public_id";

-- AlterTable
ALTER TABLE "sessions" DROP COLUMN "public_id";
