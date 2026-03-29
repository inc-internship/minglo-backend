export const passwordRecoveryTemplates = {
  passwordRecovery: (redirectUrl: string, code: string): string => `
      <h1>Confirm your email</h1>
      <p>Use the link below to confirm your email address:</p>
      <a href="${redirectUrl}?code=${code}">Confirm Email</a>
      <p>The link is valid for 1 hour.</p>
    `,
};
