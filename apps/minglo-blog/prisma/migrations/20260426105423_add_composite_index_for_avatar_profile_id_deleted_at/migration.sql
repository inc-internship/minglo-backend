-- CreateIndex
CREATE INDEX "avatar_profile_id_deleted_at_idx" ON "avatar"("profile_id", "deleted_at");
