-- CreateEnum
CREATE TYPE "MediaMimeType" AS ENUM ('image/jpeg', 'image/png', 'image/webp');

-- CreateTable
CREATE TABLE "posts_media_files" (
    "id" SERIAL NOT NULL,
    "public_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,
    "post_id" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "mime_type" "MediaMimeType",
    "width" INTEGER,
    "height" INTEGER,
    "fileSize" INTEGER,
    "order" INTEGER NOT NULL,

    CONSTRAINT "posts_media_files_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "posts_media_files_public_id_key" ON "posts_media_files"("public_id");

-- CreateIndex
CREATE INDEX "posts_media_files_post_id_idx" ON "posts_media_files"("post_id");

-- CreateIndex
CREATE INDEX "posts_media_files_deleted_at_idx" ON "posts_media_files"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "posts_media_files_post_id_order_key" ON "posts_media_files"("post_id", "order");

-- AddForeignKey
ALTER TABLE "posts_media_files" ADD CONSTRAINT "posts_media_files_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
