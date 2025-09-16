export default () => ({
  api: {
    prefix: 'api',
  },
  apiKeys: {
    storage: (process.env.API_KEYS_STORAGE as 'file' | 'database') || 'file',
    migrateOnStart: process.env.API_KEYS_MIGRATE_ON_START === 'true',
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
  JWT_SECRET: process.env.JWT_SECRET,
});
