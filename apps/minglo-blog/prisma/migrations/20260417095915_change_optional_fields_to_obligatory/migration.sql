/*
  Warnings:

  - Made the column `mime_type` on table `posts_media_files` required. This step will fail if there are existing NULL values in that column.
  - Made the column `width` on table `posts_media_files` required. This step will fail if there are existing NULL values in that column.
  - Made the column `height` on table `posts_media_files` required. This step will fail if there are existing NULL values in that column.
  - Made the column `fileSize` on table `posts_media_files` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "posts_media_files" ALTER COLUMN "mime_type" SET NOT NULL,
ALTER COLUMN "width" SET NOT NULL,
ALTER COLUMN "height" SET NOT NULL,
ALTER COLUMN "fileSize" SET NOT NULL;
