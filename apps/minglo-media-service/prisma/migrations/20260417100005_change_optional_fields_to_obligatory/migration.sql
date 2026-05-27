/*
  Warnings:

  - Made the column `width` on table `media_files` required. This step will fail if there are existing NULL values in that column.
  - Made the column `height` on table `media_files` required. This step will fail if there are existing NULL values in that column.
  - Made the column `file_size` on table `media_files` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "media_files" ALTER COLUMN "width" SET NOT NULL,
ALTER COLUMN "height" SET NOT NULL,
ALTER COLUMN "file_size" SET NOT NULL;
