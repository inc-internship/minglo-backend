export interface MessageSentPayload {
  conversationId: string;
  messageId: string;
  senderPublicId: string;
  senderLogin: string | null;
  recipientPublicIds: string[];
  text: string | null;
  createdAt: string;
}