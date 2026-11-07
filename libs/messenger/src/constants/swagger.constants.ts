export const MESSENGER_SWAGGER_VERSION = '1.0';
export const MESSENGER_SWAGGER_PREFIX = 'api/v1';
export const MESSENGER_SWAGGER_TITLE = 'Minglo Messenger Service API';
export const MESSENGER_SWAGGER_DESCRIPTION = `
Real-time messenger. All REST endpoints require Bearer token.
---
## 🔌 WebSocket
\`\`\`
- ws:socket.io
- namespace: /messenger
- auth: { token: "Bearer <access_token>" }

- client events: MESSAGE_SEND { conversationId, text } | TYPING_START { conversationId } | TYPING_STOP { conversationId }
- server events: MESSAGE_RECEIVED { id, conversationId, text, type, sender, createdAt } | USER_TYPING { userPublicId, conversationId, isTyping } | ERROR { message }
\`\`\`
`.trim();