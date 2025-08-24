export const verificationTemplate = (url: string) => `
  <h1>Verify Your Email</h1>
  <p>Click the link below to verify your account:</p>
  <a href="${url}">${url}</a>
`;

export const resetPasswordTemplate = (url: string) => `
  <h1>Reset Your Password</h1>
  <p>Click the link below to reset your password:</p>
  <a href="${url}">${url}</a>
`;
