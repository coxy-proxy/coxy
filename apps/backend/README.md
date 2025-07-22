# Backend API

This is the backend API for the OpenAI-compatible GitHub Copilot proxy.

## Features

- **Proxy Module**: OpenAI-compatible endpoints that forward requests to GitHub Copilot
- **Admin Module**: Dashboard for monitoring usage and managing the system
- **API Keys Module**: Management of API keys with GitHub OAuth device flow integration

## API Endpoints

### OpenAI-Compatible Proxy
- `POST /api/chat/completions` - Chat completions proxy
- `GET /api/models` - Available models

### Admin Dashboard
- `POST /api/admin/login` - Admin authentication
- `GET /api/admin/stats` - Usage statistics
- `GET /api/admin/logs` - Request logs

### API Key Management
- `POST /api/api-keys` - Create new API key
- `GET /api/api-keys` - List API keys
- `DELETE /api/api-keys/:id` - Delete API key
- `POST /api/api-keys/github-auth/device-flow` - Initiate GitHub OAuth
- `POST /api/api-keys/github-auth/verify` - Verify GitHub OAuth

## Setup

1. Copy `.env.example` to `.env` and configure your environment variables
2. Install dependencies: `npm install`
3. Start the server: `npm run dev:backend`

## Environment Variables

- `JWT_SECRET`: Secret key for JWT token signing
- `GITHUB_CLIENT_ID`: GitHub OAuth app client ID
- `GITHUB_CLIENT_SECRET`: GitHub OAuth app client secret
- `PORT`: Server port (default: 3000)
- `ADMIN_USERNAME`: Admin username
- `ADMIN_PASSWORD`: Admin password

## Architecture

The backend is built with NestJS and follows a modular architecture:

```
src/
├── app/                 # Main application module
├── features/
│   ├── proxy/          # OpenAI proxy functionality
│   │   ├── dto/        # Proxy-specific DTOs
│   │   ├── proxy.controller.ts
│   │   ├── proxy.service.ts
│   │   └── proxy.module.ts
│   ├── admin/          # Admin dashboard
│   │   ├── dto/        # Admin-specific DTOs
│   │   ├── guards/     # Admin guards
│   │   ├── admin.controller.ts
│   │   ├── admin.service.ts
│   │   └── admin.module.ts
│   └── api-keys/       # API key management
│       ├── dto/        # API key DTOs
│       ├── interfaces/ # TypeScript interfaces
│       ├── api-keys.controller.ts
│       ├── api-keys.service.ts
│       ├── github-oauth.service.ts
│       └── api-keys.module.ts
├── shared/             # Global shared components
│   ├── interceptors/   # Global interceptors
│   └── middleware/     # Global middleware
└── main.ts             # Application entry point
```

## Development

The modules are scaffolded with placeholder implementations. Key areas that need implementation:

1. **Database Integration**: Currently using in-memory storage
2. **GitHub Copilot API**: Actual integration with GitHub Copilot endpoints
3. **Authentication**: Production-ready admin authentication
4. **Logging**: Persistent request logging for the admin dashboard