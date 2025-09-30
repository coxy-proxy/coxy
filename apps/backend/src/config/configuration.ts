// Centralized app configuration. Exposes environment-driven values and sensible defaults.
export default () => ({
  api: {
    // Global API prefix (e.g., http://localhost:3020/api)
    prefix: 'api',
  },

  // JWT configuration (documented for clarity; values are sourced from environment)
  jwt: {
    // Fallback secret if access/refresh secrets are not explicitly set
    secret: process.env.JWT_SECRET,

    // Access token settings
    accessSecret: process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET,
    accessTtl: process.env.JWT_ACCESS_TTL || '15m',

    // Refresh token settings
    refreshSecret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    refreshTtl: process.env.JWT_REFRESH_TTL || '7d',
  },
  github: {
    deviceCodeApiUrl: 'https://github.com/login/device/code',
    oauthApiUrl: 'https://github.com/login/oauth/access_token',
    headers: {
      accept: 'application/json',
      'editor-version': 'Neovim/0.6.1',
      'editor-plugin-version': 'copilot.vim/1.16.0',
      'content-type': 'application/json',
      'user-agent': 'GithubCopilot/1.155.0',
      'accept-encoding': 'gzip,deflate,br',
    } as Record<string, string>,
    copilot: {
      clientId: 'Iv1.b507a08c87ecfe98',
      copilotApiUrl: 'https://api.githubcopilot.com',
      headers: {
        'editor-version': 'CopilotProxy/0.1.0',
        'copilot-integration-id': 'vscode-chat',
        'copilot-vision-request': 'true',
        'user-agent': 'CopilotProxy',
        host: 'api.githubcopilot.com',
      } as Record<string, string>,
    },
    copilot_internal: {
      tokenApiUrl: 'https://api.github.com/copilot_internal/v2/token',
    },
  },
  BACKEND_PORT: Number(process.env.BACKEND_PORT ?? 3020),
});
