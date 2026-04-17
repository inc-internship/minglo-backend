/*
  Warnings:

  - Made the column `mime_type` on table `media_files` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "media_files" ALTER COLUMN "mime_type" SET NOT NULL;
