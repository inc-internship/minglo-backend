/*
  Warnings:

  - You are about to drop the column `file_size` on the `avatar` table. All the data in the column will be lost.
  - You are about to drop the column `height` on the `avatar` table. All the data in the column will be lost.
  - You are about to drop the column `key` on the `avatar` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `avatar` table. All the data in the column will be lost.
  - You are about to drop the column `width` on the `avatar` table. All the data in the column will be lost.
  - You are about to drop the column `user_name` on the `profile` table. All the data in the column will be lost.
  - Added the required column `file_size_large` to the `avatar` table without a default value. This is not possible if the table is not empty.
  - Added the required column `file_size_small` to the `avatar` table without a default value. This is not possible if the table is not empty.
  - Added the required column `height_large` to the `avatar` table without a default value. This is not possible if the table is not empty.
  - Added the required column `height_small` to the `avatar` table without a default value. This is not possible if the table is not empty.
  - Added the required column `key_large` to the `avatar` table without a default value. This is not possible if the table is not empty.
  - Added the required column `key_small` to the `avatar` table without a default value. This is not possible if the table is not empty.
  - Added the required column `url_large` to the `avatar` table without a default value. This is not possible if the table is not empty.
  - Added the required column `url_small` to the `avatar` table without a default value. This is not possible if the table is not empty.
  - Added the required column `width_large` to the `avatar` table without a default value. This is not possible if the table is not empty.
  - Added the required column `width_small` to the `avatar` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "avatar" DROP COLUMN "file_size",
DROP COLUMN "height",
DROP COLUMN "key",
DROP COLUMN "url",
DROP COLUMN "width",
ADD COLUMN     "file_size_large" INTEGER NOT NULL,
ADD COLUMN     "file_size_small" INTEGER NOT NULL,
ADD COLUMN     "height_large" INTEGER NOT NULL,
ADD COLUMN     "height_small" INTEGER NOT NULL,
ADD COLUMN     "key_large" TEXT NOT NULL,
ADD COLUMN     "key_small" TEXT NOT NULL,
ADD COLUMN     "url_large" TEXT NOT NULL,
ADD COLUMN     "url_small" TEXT NOT NULL,
ADD COLUMN     "width_large" INTEGER NOT NULL,
ADD COLUMN     "width_small" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "profile" DROP COLUMN "user_name",
ALTER COLUMN "about_me" SET DATA TYPE VARCHAR(500);
