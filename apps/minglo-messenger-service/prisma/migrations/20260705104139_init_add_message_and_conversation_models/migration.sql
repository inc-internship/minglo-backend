-- CreateEnum
CREATE TYPE "ConversationType" AS ENUM ('DIRECT', 'CHANNEL');

-- CreateEnum
CREATE TYPE "ParticipantRole" AS ENUM ('MEMBER', 'ADMIN');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('TEXT', 'IMAGE', 'VOICE');

-- CreateTable
CREATE TABLE "conversations" (
    "id" SERIAL NOT NULL,
    "public_id" TEXT NOT NULL,
    "type" "ConversationType" NOT NULL DEFAULT 'DIRECT',
    "name" VARCHAR(255),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_participants" (
    "id" SERIAL NOT NULL,
    "conversation_id" INTEGER NOT NULL,
    "user_public_id" VARCHAR(255) NOT NULL,
    "role" "ParticipantRole" NOT NULL DEFAULT 'MEMBER',
    "unread_count" INTEGER NOT NULL DEFAULT 0,
    "last_read_at" TIMESTAMPTZ,
    "joined_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversation_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" SERIAL NOT NULL,
    "public_id" TEXT NOT NULL,
    "conversation_id" INTEGER NOT NULL,
    "sender_public_id" VARCHAR(255) NOT NULL,
    "text" VARCHAR(3000),
    "type" "MessageType" NOT NULL DEFAULT 'TEXT',
    "deleted_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "conversations_public_id_key" ON "conversations"("public_id");

-- CreateIndex
CREATE INDEX "conversation_participants_user_public_id_idx" ON "conversation_participants"("user_public_id");

-- CreateIndex
CREATE INDEX "conversation_participants_conversation_id_idx" ON "conversation_participants"("conversation_id");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_participants_conversation_id_user_public_id_key" ON "conversation_participants"("conversation_id", "user_public_id");

-- CreateIndex
CREATE UNIQUE INDEX "messages_public_id_key" ON "messages"("public_id");

-- CreateIndex
CREATE INDEX "messages_conversation_id_created_at_idx" ON "messages"("conversation_id", "created_at");

-- CreateIndex
CREATE INDEX "messages_sender_public_id_idx" ON "messages"("sender_public_id");

-- AddForeignKey
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
