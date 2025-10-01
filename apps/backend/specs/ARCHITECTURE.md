# Technical Design Specification

## Architecture Overview

A NestJS backend serving as a proxy between OpenAI-compatible clients and GitHub Copilot, with a Next.js frontend for administration and a Fastify gateway for routing.

The backend uses:
- NestJS modules with DI and feature boundaries
- Prisma ORM for SQLite database access
- JWT authentication (access + refresh tokens) with httpOnly cookies
- Passport-based authentication strategies (JWT, Google OAuth)
- class-validator/class-transformer for input validation
- Global ValidationPipe for sanitization
- Throttling for auth endpoints via @nestjs/throttler
- Cookie-based session management with cookie-parser
- SSE (Server-Sent Events) for real-time device flow updates
- bcrypt for password hashing (12 rounds)

## Project Structure (Backend)

- `src/main.ts`: App bootstrap (global prefix, CORS, validation pipe, Prisma health/GC, start server)
- `src/app/`: Root app module and controller/service
- `src/config/`: TypeScript-based configuration loaded via ConfigModule
- `src/shared/`: Cross-cutting services/modules
  - `prisma/`: PrismaModule + PrismaService
  - `api-keys/`: ApiKeysSharedModule, storage interface and DB implementation
  - `interceptors/`: Logging interceptor (optional)
  - `utils.ts`: helpers (e.g., maskKey)
- `src/features/`: Feature modules
  - `proxy/`: OpenAI-compatible proxy endpoints
  - `api-keys/`: User-scoped API key management, GitHub OAuth device flow
  - `auth/`: Registration, login, refresh, logout, profile
  - `admin/`: Admin login, stats, user management
  - `users/`: Minimal current-user profile endpoint

## Data Models (Conceptual)

Types exposed to clients (shared in `libs/shared/types`):

```ts
export interface CopilotMeta {
  token: string;
  expiresAt: number;
  resetTime: number | null;
  chatQuota: number | null;
  completionsQuota: number | null;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: number; // epoch millis
  lastUsed?: number; // epoch millis
  usageCount: number;
  meta?: CopilotMeta;
}

export interface ApiKeyResponse extends Omit<ApiKey, 'key'> {
  isDefault: boolean;
  maskedKey: string;
}
```

Prisma schema (implemented):
- `enum Role { USER ADMIN }`
- `enum AuthProvider { EMAIL GOOGLE BOTH }`
- `model User { id, email, name?, passwordHash?, googleId?, avatar?, authProvider@default(EMAIL), role@default(USER), createdAt, updatedAt, apiKeys[], refreshTokens[] }`
- `model RefreshToken { id, tokenHash@unique, userId -> User, expiresAt, revokedAt?, createdAt }`
- `model ApiKey { id, name, key@unique, createdAt, lastUsed?, usageCount@default(0), isDefault@default(false), meta?, userId?, user? }`
- `model CopilotMeta { id, token, expiresAt, resetTime?, chatQuota?, completionsQuota?, apiKeyId@unique -> ApiKey }`

Notes:
- `ApiKey.userId` is nullable for backward compatibility (global keys).
- Default-per-user enforcement is done in service layer (partial unique indexes are provider-specific).
- `User.passwordHash` is nullable for OAuth-only users.
- `User.googleId` provides unique Google account linking.
- `AuthProvider` enum tracks user registration method (EMAIL, GOOGLE, or BOTH).

## Backend Modules

### App Module
- Imports ConfigModule, JwtModule (global), HttpModule, PrismaModule (via shared), and feature modules.
- Sets global config and DI across features.

### Auth Module
- Endpoints:
  - `POST /api/auth/register` — register with email/password (password policy enforced)
  - `POST /api/auth/login` — login (sets httpOnly cookies)
  - `POST /api/auth/refresh` — rotate refresh token (sets new httpOnly cookies)
  - `POST /api/auth/logout` — revoke refresh token and clear cookies
  - `GET /api/auth/profile` — current user profile
  - `PUT /api/auth/profile` — update profile (name)
  - `GET /api/auth/google` — initiate Google OAuth flow
  - `GET /api/auth/google/callback` — handle Google OAuth callback
- Security & Implementation:
  - Passport-based strategies and guards:
    - `JwtStrategy` + `JwtAuthGuard` for access tokens (reads jwt.accessSecret)
    - `RefreshJwtStrategy` + `RefreshJwtAuthGuard` for refresh tokens (reads jwt.refreshSecret)
    - `GoogleOauthStrategy` + `GoogleOauthGuard` for Google OAuth integration
  - Access tokens short-lived (default 15m), refresh tokens long-lived (default 7d)
  - Refresh tokens stored hashed (sha256) in DB and rotated on use
  - AuthService.refresh no longer verifies the token signature (delegated to guard); it rotates and issues new tokens
  - Password hashing via bcrypt (12 rounds)
  - Throttling on register/login/refresh/Google callback via @nestjs/throttler
  - Google OAuth integration with profile validation and user creation/linking
  - Cookie-based authentication with secure httpOnly cookies

### Users Module
- Endpoints:
  - `GET /api/users/me` — current user profile (JWT-protected)
- Note: User-scoped API key operations are under `ApiKeysModule`.

### API Keys Module (User-scoped)
- Endpoints (JWT-protected, user-specific):
  - `POST /api/api-keys` — create new API key for the authenticated user
  - `GET /api/api-keys` — list API keys for the authenticated user
  - `PATCH /api/api-keys/:id` — update an existing key (ownership enforced)
  - `DELETE /api/api-keys/:id` — delete key (ownership enforced)
  - `POST /api/api-keys/:id/refresh-meta` — refresh Copilot metadata (ownership enforced)
  - `POST /api/api-keys/default` — set default key for the user
  - `SSE /api/api-keys/device-flow` — GitHub OAuth device flow status stream; creates key for the user upon success
- Storage: implemented with Prisma via `ApiKeysDatabaseService` (see below).

### Proxy Module (OpenAI-compatible)
- Endpoints (JWT not required):
  - `POST /api/chat/completions`
  - `GET /api/models`
- Secured with `ApiKeyGuard` only:
  - Accepts an API key in `Authorization` header (`token` or `Bearer`).
  - Falls back to a global default API key when none is provided (backward compatible).
  - Resolves ephemeral Copilot token for chat completions via `TokenResolverService` + `GithubOauthService`.

### Admin Module (Roles-based)
- Endpoints:
  - `POST /api/admin/login` — authenticates via AuthService and requires the user to be ADMIN; cookies are set by the common login flow
  - `GET /api/admin/stats` — system stats (protected)
  - `GET /api/admin/logs` — request logs (placeholder; protected)
  - `GET /api/admin/users` — list users (protected)
  - `GET /api/admin/users/:id` — user detail including masked API keys (protected)
  - `PATCH /api/admin/users/:id` — update user name/role (protected)
  - `DELETE /api/admin/users/:id` — delete user (protected)
- Guard:
  - `AdminGuard` composes `JwtAuthGuard` + `RolesGuard`. It validates JWT, injects `req.user`, ensures a roles metadata exists (defaults to `['admin']`), and then uses `RolesGuard` to enforce.

## Shared Modules and Services

### Prisma
- `PrismaModule` exposes `PrismaService` application-wide.
- `PrismaService` manages connection lifecycle and graceful shutdown.

### API Keys Shared
- Token & interfaces: `IApiKeysStorage`
- Implementation: `ApiKeysDatabaseService` (Prisma)
- Exposed via `ApiKeysSharedModule` (`API_KEYS_STORAGE` token)
- Methods:
  - `create`, `createForUser(userId, dto)`
  - `findAll`, `findAllByUser(userId)`
  - `findOne(id)`, `findByKey(key)`
  - `update(id, dto)`, `remove(id)`
  - `getDefault()`, `getDefaultForUser(userId)`
  - `updateDefault(id)`, `updateDefaultForUser(userId, id)`

### Guards
- `JwtAuthGuard` — Passport AuthGuard('jwt'); validates access token via JwtStrategy and attaches `req.user`
- `RefreshJwtAuthGuard` — Passport AuthGuard('jwt-refresh'); validates refresh token via RefreshJwtStrategy
- `RolesGuard` — enforces roles metadata (`@Roles('admin')`, etc.)
- `AdminGuard` — composes JwtAuth + Roles (defaults role to `admin` if none set)
- `ApiKeyGuard` — validates API key header for proxy endpoints, optimized to use `findByKey` and fallback to global default token when not provided

## Configuration

Loaded via `ConfigModule` and `src/config/configuration.ts`.
- Core:
  - `BACKEND_PORT` (default 3020)
  - `api.prefix` (default `api`)
- GitHub/Copilot headers and endpoints are configured in `configuration.ts` and used by `GithubOauthService`/`ProxyService`.
- JWT (centralized in configuration.ts):
  - `jwt.secret` (fallback if specific secrets absent)
  - `jwt.accessSecret`, `jwt.refreshSecret`
  - `jwt.accessTtl` (default `15m`), `jwt.refreshTtl` (default `7d`)
  - Tokens are delivered exclusively via httpOnly cookies; Authorization headers are not used for JWT
- Google OAuth:
  - `google.clientId`, `google.clientSecret`
  - `google.callbackUrl` (auto-constructed from HOST/PORT)
- Frontend integration:
  - `frontend.url` (auto-constructed from FRONTEND_HOST/FRONTEND_PORT)
  - `frontend.oauthSuccessPath`, `frontend.oauthErrorPath`
- DB:
  - `DATABASE_URL` (SQLite by default; supports other providers)

## Security
- Password hashing: bcrypt (12 rounds)
- Refresh tokens: signed JWT, hashed persistently (sha256), rotated on refresh
- Input validation: DTOs with class-validator, Global ValidationPipe with whitelist + forbidNonWhitelisted + transform
- Rate limiting: @nestjs/throttler on auth endpoints
- Data isolation: ApiKeys operations are user-scoped and enforce ownership at service layer
- Proxy protection: JWT is not required; API keys control access to proxy endpoints

## API Endpoints Summary

OpenAI-compatible (API key required via header):
- `POST /api/chat/completions`
- `GET /api/models`

Auth (public + JWT):
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/profile`
- `PUT /api/auth/profile`
- `GET /api/auth/google`
- `GET /api/auth/google/callback`

Users (JWT):
- `GET /api/users/me`

API Keys (JWT; user-scoped):
- `POST /api/api-keys`
- `GET /api/api-keys`
- `PATCH /api/api-keys/:id`
- `DELETE /api/api-keys/:id`
- `POST /api/api-keys/:id/refresh-meta`
- `POST /api/api-keys/default`
- `SSE /api/api-keys/device-flow`

Admin (JWT + role admin):
- `POST /api/admin/login`
- `GET /api/admin/stats`
- `GET /api/admin/logs`
- `GET /api/admin/users`
- `GET /api/admin/users/:id`
- `PATCH /api/admin/users/:id`
- `DELETE /api/admin/users/:id`

## Backward Compatibility and Migration
- Existing API keys remain valid; `ApiKey.userId` is nullable (global keys).
- Proxy endpoints continue to work without JWT and accept a default global API key when provided.
- API key management endpoints are now JWT-protected and user-scoped; frontend must attach access tokens.
- Prisma schema updated with `User`, `RefreshToken`, `AuthProvider` enum, and optional `ApiKey.userId`.
- Google OAuth users can be created without passwords (`passwordHash` nullable).
- Mixed authentication: users can link both email/password and Google accounts (`AuthProvider.BOTH`).

## Testing
- Unit tests exist for token resolution and storage mapping; more tests recommended:
  - AuthService (register/login/refresh/logout)
  - JwtAuthGuard/RolesGuard/AdminGuard composition
  - ApiKeysService ownership enforcement and defaults
  - ApiKeyGuard DB lookup behavior
- E2E: register → login → manage user keys → proxy requests with user keys

## Logging & Observability
- Console logger enabled; optional logging interceptor available
- Admin `getRequestLogs` endpoint is stubbed and can be wired to telemetry/log store later

## Implementation Notes

### Current Stack
- **NestJS Framework**: v11.x with modern decorators and DI
- **Database**: SQLite via Prisma ORM with client v6.16.1
- **Authentication**: Passport-based with JWT and Google OAuth strategies
- **Validation**: class-validator/class-transformer with global ValidationPipe
- **HTTP Client**: @nestjs/axios for external API calls
- **Security**: bcrypt, throttling, httpOnly cookies, CORS enabled
- **Real-time**: Server-Sent Events (SSE) for device flow status

### Integration Points
- **Gateway**: Fastify-based proxy handling routing between frontend/backend
- **Frontend**: Next.js application with Clerk integration (auth redundancy)
- **External APIs**: GitHub Copilot API, GitHub OAuth device flow

## Known Limitations / TODOs
- Device-flow + SSE currently creates key on success for the authenticated user; error handling is basic
- Per-user default key constraint is enforced in service layer only
- Admin telemetry (stats/logs) is partial and will need integration with a metrics/logging backend
- Dual authentication systems (NestJS JWT + Clerk) may need consolidation
- OAuth error handling in callback could be more robust
