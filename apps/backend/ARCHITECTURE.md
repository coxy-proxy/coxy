# Technical Design Specification

## Architecture Overview

A NestJS backend serving as a proxy between OpenAI-compatible clients and GitHub Copilot, with a Next.js frontend for administration.

The backend is built with NestJS and is structured into several modules. It uses NestJS ConfigModule (TypeScript-based configuration) for configuration management, NestJS Console Logger for logging, and `class-validator`/`class-transformer` for input validation.

## Project Structure

The backend codebase is organized as follows:

-   `src/main.ts`: The application entry point (sets global prefix from config, enables CORS, and starts the server).
-   `src/app/`: The root module of the application.
-   `src/features/`: Contains the core feature modules of the application.
    -   `admin/`: Handles administration-related functionalities (login, stats, logs).
    -   `api-keys/`: Manages API key creation, validation, storage, and GitHub OAuth device flow.
    -   `proxy/`: Proxies requests to the GitHub Copilot service.
-   `src/shared/`: Contains shared modules, services, and utilities used across different feature modules.
-   `src/config/`: TypeScript-based application configuration loaded via NestJS ConfigModule (`configuration.ts`).

## Data Models

```typescript
export interface CopilotMeta {
  token: string; // token used for chat completions
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

## API Endpoints

All endpoints are served under the global prefix configured at `api.prefix` (default: `api`).

### OpenAI-compatible

-   `POST /api/chat/completions` — OpenAI-compatible proxy endpoint (streams response when applicable)
-   `GET /api/models` — Get list of available models (proxied)

### Admin dashboard

-   `POST /api/admin/login` — Admin login (returns JWT)
-   `GET /api/admin/stats` — Get usage statistics (requires AdminGuard / JWT)
-   `GET /api/admin/logs` — Get request logs (requires AdminGuard / JWT)

### API keys management

-   `POST /api/api-keys` — Create new API key
-   `GET /api/api-keys` — List API keys
-   `PATCH /api/api-keys/:id` — Update API key
-   `DELETE /api/api-keys/:id` — Delete API key
-   `GET /api/api-keys/device-flow` — Server-Sent Events (SSE) stream for GitHub OAuth device flow status
-   `POST /api/api-keys/default` — Set default API key
-   `POST /api/api-keys/:id/refresh-meta` — Refresh Copilot metadata for a specific key

## Backend modules

### App Module

The `AppModule` is the root module of the application. It imports the necessary modules, including feature modules, and sets up global configuration via `ConfigModule`, JWT via `JwtModule.registerAsync`, and outbound HTTP via `HttpModule`.

### Proxy Module

The `ProxyModule` is responsible for forwarding requests from OpenAI-compatible clients to the GitHub Copilot service. It uses `HttpModule` to make HTTP requests, `ApiKeyGuard` to validate incoming API keys (or fall back to a default key), and `TokenResolverService` + `GithubOauthService` to resolve ephemeral Copilot tokens for chat completion requests.

### Admin Module

The `AdminModule` provides backend functionalities for the admin dashboard. This includes endpoints for logging in, viewing usage statistics, and fetching request logs. It uses the `JwtModule` for issuing and verifying JWTs. (The current login implementation is a placeholder and should be replaced with real authentication.)

### API Keys Module

The `ApiKeysModule` manages API keys used to authenticate requests to the proxy. It provides endpoints for creating, listing, updating, and deleting API keys; supports selecting a default key; and implements the GitHub OAuth device flow (via SSE) to obtain GitHub tokens. API keys and the selected default key are stored using a file-based storage service.

### Shared Modules

The `shared` directory contains modules and services that are used by multiple feature modules.

-   **ApiKeysSharedModule**: Provides shared services for managing API keys, namely the `ApiKeysFileStorageService` which persists keys using `node-persist` under `.storage` (configurable via `STORAGE_DIR`).
-   **Interceptors**: `LoggingInterceptor` is available for request logging (not currently applied globally).
-   **Utils**: Utility functions like `maskKey` and `toHeaders` used across the app.
