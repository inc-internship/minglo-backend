/*
  Warnings:

  - You are about to drop the column `confirmation_code` on the `email_confirmations` table. All the data in the column will be lost.
  - Added the required column `code` to the `email_confirmations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "email_confirmations" DROP COLUMN "confirmation_code",
ADD COLUMN     "code" VARCHAR(255) NOT NULL;
