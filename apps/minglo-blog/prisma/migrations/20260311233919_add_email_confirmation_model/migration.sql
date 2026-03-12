-- CreateTable
CREATE TABLE "email_confirmations" (
    "id" SERIAL NOT NULL,
    "public_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,
    "user_id" INTEGER NOT NULL,
    "confirmation_code" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "confirmed_at" TIMESTAMPTZ,

    CONSTRAINT "email_confirmations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "email_confirmations_public_id_key" ON "email_confirmations"("public_id");

-- CreateIndex
CREATE UNIQUE INDEX "email_confirmations_confirmation_code_key" ON "email_confirmations"("confirmation_code");

-- CreateIndex
CREATE INDEX "email_confirmations_user_id_idx" ON "email_confirmations"("user_id");

-- CreateIndex
CREATE INDEX "email_confirmations_deleted_at_idx" ON "email_confirmations"("deleted_at");

-- AddForeignKey
ALTER TABLE "email_confirmations" ADD CONSTRAINT "email_confirmations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
