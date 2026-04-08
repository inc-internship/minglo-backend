-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('post', 'avatar');

-- CreateEnum
CREATE TYPE "MediaMimeType" AS ENUM ('image/jpeg', 'image/png', 'image/webp');

-- CreateTable
CREATE TABLE "media_files" (
    "id" SERIAL NOT NULL,
    "public_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,
    "public_user_id" TEXT NOT NULL,
    "type" "MediaType" NOT NULL DEFAULT 'post',
    "mime_type" "MediaMimeType",
    "url" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "file_size" INTEGER,
    "used_at" TIMESTAMPTZ,

    CONSTRAINT "media_files_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "media_files_public_id_key" ON "media_files"("public_id");

-- CreateIndex
CREATE INDEX "media_files_public_user_id_idx" ON "media_files"("public_user_id");

-- CreateIndex
CREATE INDEX "media_files_type_idx" ON "media_files"("type");

-- CreateIndex
CREATE INDEX "media_files_used_at_idx" ON "media_files"("used_at");

-- CreateIndex
CREATE INDEX "media_files_deleted_at_idx" ON "media_files"("deleted_at");
