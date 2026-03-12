-- CreateTable
CREATE TABLE "password_recoveries" (
    "id" SERIAL NOT NULL,
    "public_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,
    "user_id" INTEGER NOT NULL,
    "recovery_code" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "used_at" TIMESTAMPTZ,

    CONSTRAINT "password_recoveries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "password_recoveries_public_id_key" ON "password_recoveries"("public_id");

-- CreateIndex
CREATE UNIQUE INDEX "password_recoveries_recovery_code_key" ON "password_recoveries"("recovery_code");

-- CreateIndex
CREATE INDEX "password_recoveries_user_id_idx" ON "password_recoveries"("user_id");

-- CreateIndex
CREATE INDEX "password_recoveries_deleted_at_idx" ON "password_recoveries"("deleted_at");

-- AddForeignKey
ALTER TABLE "password_recoveries" ADD CONSTRAINT "password_recoveries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
