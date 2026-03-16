/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `email_confirmations` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "email_confirmations_code_key" ON "email_confirmations"("code");
