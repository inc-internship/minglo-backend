-- CreateTable
CREATE TABLE "avatar" (
    "id" SERIAL NOT NULL,
    "public_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,
    "profile_id" INTEGER NOT NULL,
    "url_large" TEXT NOT NULL,
    "key_large" TEXT NOT NULL,
    "file_size_large" INTEGER NOT NULL,
    "width_large" INTEGER NOT NULL,
    "height_large" INTEGER NOT NULL,
    "url_small" TEXT NOT NULL,
    "key_small" TEXT NOT NULL,
    "file_size_small" INTEGER NOT NULL,
    "width_small" INTEGER NOT NULL,
    "height_small" INTEGER NOT NULL,
    "mime_type" "MediaMimeType" NOT NULL,

    CONSTRAINT "avatar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile" (
    "id" SERIAL NOT NULL,
    "public_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,
    "first_name" VARCHAR(255) NOT NULL,
    "last_name" VARCHAR(255) NOT NULL,
    "birthday" TIMESTAMPTZ,
    "country_id" VARCHAR(255),
    "city_id" VARCHAR(255),
    "about_me" VARCHAR(500),
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "profile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "avatar_public_id_key" ON "avatar"("public_id");

-- CreateIndex
CREATE UNIQUE INDEX "avatar_profile_id_key" ON "avatar"("profile_id");

-- CreateIndex
CREATE INDEX "avatar_profile_id_deleted_at_idx" ON "avatar"("profile_id", "deleted_at");

-- CreateIndex
CREATE INDEX "avatar_deleted_at_idx" ON "avatar"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "profile_public_id_key" ON "profile"("public_id");

-- CreateIndex
CREATE UNIQUE INDEX "profile_user_id_key" ON "profile"("user_id");

-- CreateIndex
CREATE INDEX "profile_deleted_at_idx" ON "profile"("deleted_at");

-- AddForeignKey
ALTER TABLE "avatar" ADD CONSTRAINT "avatar_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile" ADD CONSTRAINT "profile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
