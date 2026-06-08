/*
  Warnings:
  - You are about to drop the column `file_size_large` on the `avatar` table. All the data in the column will be lost.
  - You are about to drop the column `file_size_small` on the `avatar` table. All the data in the column will be lost.
  - You are about to drop the column `height_large` on the `avatar` table. All the data in the column will be lost.
  - You are about to drop the column `height_small` on the `avatar` table. All the data in the column will be lost.
  - You are about to drop the column `key_large` on the `avatar` table. All the data in the column will be lost.
  - You are about to drop the column `key_small` on the `avatar` table. All the data in the column will be lost.
  - You are about to drop the column `url_large` on the `avatar` table. All the data in the column will be lost.
  - You are about to drop the column `url_small` on the `avatar` table. All the data in the column will be lost.
  - You are about to drop the column `width_large` on the `avatar` table. All the data in the column will be lost.
  - You are about to drop the column `width_small` on the `avatar` table. All the data in the column will be lost.
  - Added the required column `file_size_original` to the `avatar` table without a default value. This is not possible if the table is not empty.
  - Added the required column `file_size_thumbnail` to the `avatar` table without a default value. This is not possible if the table is not empty.
  - Added the required column `height_original` to the `avatar` table without a default value. This is not possible if the table is not empty.
  - Added the required column `height_thumbnail` to the `avatar` table without a default value. This is not possible if the table is not empty.
  - Added the required column `key_original` to the `avatar` table without a default value. This is not possible if the table is not empty.
  - Added the required column `key_thumbnail` to the `avatar` table without a default value. This is not possible if the table is not empty.
  - Added the required column `original_media_id` to the `avatar` table without a default value. This is not possible if the table is not empty.
  - Added the required column `thumbnail_media_id` to the `avatar` table without a default value. This is not possible if the table is not empty.
  - Added the required column `url_original` to the `avatar` table without a default value. This is not possible if the table is not empty.
  - Added the required column `url_thumbnail` to the `avatar` table without a default value. This is not possible if the table is not empty.
  - Added the required column `width_original` to the `avatar` table without a default value. This is not possible if the table is not empty.
  - Added the required column `width_thumbnail` to the `avatar` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "avatar" DROP COLUMN "file_size_large",
DROP COLUMN "file_size_small",
DROP COLUMN "height_large",
DROP COLUMN "height_small",
DROP COLUMN "key_large",
DROP COLUMN "key_small",
DROP COLUMN "url_large",
DROP COLUMN "url_small",
DROP COLUMN "width_large",
DROP COLUMN "width_small",
ADD COLUMN     "file_size_original" INTEGER NOT NULL,
ADD COLUMN     "file_size_thumbnail" INTEGER NOT NULL,
ADD COLUMN     "height_original" INTEGER NOT NULL,
ADD COLUMN     "height_thumbnail" INTEGER NOT NULL,
ADD COLUMN     "key_original" TEXT NOT NULL,
ADD COLUMN     "key_thumbnail" TEXT NOT NULL,
ADD COLUMN     "original_media_id" TEXT NOT NULL,
ADD COLUMN     "thumbnail_media_id" TEXT NOT NULL,
ADD COLUMN     "url_original" TEXT NOT NULL,
ADD COLUMN     "url_thumbnail" TEXT NOT NULL,
ADD COLUMN     "width_original" INTEGER NOT NULL,
ADD COLUMN     "width_thumbnail" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "profile" ALTER COLUMN "first_name" DROP NOT NULL,
ALTER COLUMN "last_name" DROP NOT NULL;
