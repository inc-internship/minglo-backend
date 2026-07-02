export const MINGLO_BLOG_SWAGGER_VERSION = '1.0';
export const MINGLO_BLOG_SWAGGER_PREFIX = 'api/v1';
export const MINGLO_BLOG_SWAGGER_TITLE = 'Minglo Blog API';
export const MINGLO_BLOG_SWAGGER_DESCRIPTION = (gqlPath: string) => {
  return `
Backend service for a social media platform inspired by Instagram.
---
## 🎉GraphQL (Admin)
\`\`\`
- sandbox: ${gqlPath}
- auth: Basic Auth (admin credentials)
- scope: user management (list, detail, block/unblock, delete), payments, followers/following
\`\`\`

## 📡 Real-time Notifications
\`\`\`json
- ws:socket.io
- namespace: /notifications
- auth: Bearer

- event: NOTIFICATION
- payload: {
    id: String
    type: SUBSCRIPTION_ACTIVATED | SUBSCRIPTION_PENDING | PAYMENT_REMINDER | SUBSCRIPTION_EXPIRING_7_DAYS | SUBSCRIPTION_EXPIRING_1_DAY
    message: String,
    isRead: Boolean,
    createdAt: Date
  }
\`\`\`
`.trim();
};
