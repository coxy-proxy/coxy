# Frontend Architecture (apps/frontend)

This document describes the architecture of the Frontend application in this monorepo. It covers the tech stack, routing, state management, services, data flow, and key patterns used throughout the app.

## Overview

- Framework: Next.js (App Router, RSC enabled where applicable)
- Monorepo tooling: Nx
- UI: Tailwind CSS + shared shadcn/ui component library (libs/shared/ui)
- State management: Zustand with localStorage persistence
- Auth: Clerk (feature-flagged)
- HTTP: fetch and axios (via a thin client with interceptors)
- Streaming: Server-Sent Events style parsing for chat completions
- Packaging/Run: `next dev` for development; custom Node server for production (`server.js`)

## Project configuration

- `project.json` – Nx target for `serve` (runs `next dev` on `$FRONTEND_PORT`).
- `next.config.js` – composed with `@nx/next` plugin.
- `tsconfig.json` – path aliases:
  - `_/*` → `apps/frontend/src/*` (local app alias)
  - `@/shared/types/*` → `libs/shared/types/src/*`
  - `@/shared/ui/*` → `libs/shared/ui/src/*`
- Tailwind/PostCSS configured locally, with global base CSS imported from the shared UI lib.

## Directory structure (selected)

- `src/app` – App Router structure
  - `layout.tsx` – Root layout; conditionally wraps with `ClerkProvider` when auth is enabled
  - `global.css` – Imports shared globals + app scrollbars
  - `(auth)/sign-in`, `(auth)/sign-up` – Clerk auth pages
  - `(dashboard)/layout.tsx` – Shell with sidebar, header, toaster
  - `(dashboard)/api-keys/page.tsx` – API key management screen
  - `(dashboard)/chat/page.tsx` – New chat screen
  - `(dashboard)/chat/[sessionId]/page.tsx` – Chat session screen
- `src/components`
  - `api-keys/*` – API key components (table, modals, dialogs)
  - `chat/*` – Chat UI (input, list, model selector, recent chats, shadows)
  - `HomeLogin.tsx` – Landing/login form (when auth disabled)
- `src/hooks` – React hooks
  - `useApiClient.ts` – axios with interceptors and (optional) Clerk token
  - `useApiKeyService.ts` – API service class wrapper around axios
  - `useApiKeys.ts` – CRUD lifecycle for API key screens
  - `useChat.ts` – Chat send-and-stream logic, retries
  - `useChatStore.ts` – Zustand store with persistence
  - `useAutoScroll.ts` – small utility hook
- `src/services` – network/service layer
  - `chat.ts` – chat streaming via fetch, SSE-style parsing
  - `models.ts` – model list retrieval
  - `sessions.ts` – client-side session ID factory
- `src/types` – shared app types (e.g., chat `Message`)
- `src/middleware.ts` – route protection (Clerk), see Authentication
- `server.js` – production HTTP server for Next.js

## Routing and layouts

- App Router organizes pages under route groups:
  - `(auth)` – Sign-in/up with Clerk components.
  - `(dashboard)` – Sidebar layout with navigation and content inset.
    - `/api-keys` – API key management
    - `/chat` – Start new conversation
    - `/chat/[sessionId]` – Continue specific session
- Root redirect behavior (`src/app/page.tsx`):
  - If `AUTH_ENABLED !== 'true'` (server-side), immediately redirects to `/api-keys`.
  - With auth enabled, if a user session exists, redirects to `/api-keys`; otherwise renders `HomeLogin`.

## Authentication and middleware

- Feature flags:
  - Server-side: `AUTH_ENABLED` (used in `middleware.ts` and `page.tsx`)
  - Client-side: `NEXT_PUBLIC_AUTH_ENABLED` (used in `layout.tsx`)
- Middleware (`src/middleware.ts`):
  - If `AUTH_ENABLED === 'true'`, uses `clerkMiddleware` to protect `/chat(.*)` and `/api-keys(.*)`.
  - Otherwise, it is a no-op passthrough.
- Root layout (`src/app/layout.tsx`):
  - Wraps the tree with `ClerkProvider` only when `NEXT_PUBLIC_AUTH_ENABLED === 'true'`.
- API client (`useAuthedApiClient`):
  - Demonstrates how to attach Clerk token on requests via axios interceptor (TODO notes present about when to use).

## UI and styling

- Tailwind CSS with a shared design system (shadcn/ui) via `libs/shared/ui`.
- Shared components imported via aliases like `@/shared/ui/components/*`.
- Sidebar, dropdown menus, dialogs, and other primitives come from the shared UI library.
- `ScrollShadowViewport` handles scrollable area with IntersectionObserver-driven top/bottom shadow cues and an auto-scroll-on-change behavior for chat transcripts.

## State management

- Zustand store (`useChatStore.ts`) holds chat sessions in-memory and persists a subset to `localStorage` via `persist`:
  - Persisted: `sessions`, `currentSession`, `selectedModel`
  - Not persisted: `isLoading`, `error`, `hasHydrated`
- Hydration:
  - `hasHydrated` flag is set via `onRehydrateStorage` so UI can defer routing/decisions until hydration completes.
- Selected model:
  - Stored in the global chat store; `ModelSelector` initializes it to the first available model when empty.

## Data and control flow

### Chat new-session flow

1. User lands on `/chat` (New Chat page).
2. On first message submit:
   - A UUID session ID is created client-side via `createChatSession()`.
   - `useChat().sendMessage(sessionId, message)` is fired (without waiting).
   - Router navigates to `/chat/[sessionId]` so the streaming response displays on the session screen.

### Chat session page

- Loads `messages` for the given `sessionId` from the store.
- Waits for hydration; if no messages are found after hydration, redirects to `/chat`.
- Renders `MessageList` within `ScrollShadowViewport` and provides `ChatInput` + `ModelSelector`.

### Chat streaming logic (`useChat` + `services/chat.ts`)

- `useChat().sendMessage`:
  - Adds a user message (pending) to the session.
  - Adds an empty assistant message placeholder (pending) for streaming.
  - Calls `sendMessage` with payload `{ model, messages, stream: true }` to `/api/chat/completions`.
  - The `sendMessage` service reads the response body as a stream:
    - Parses lines in SSE format (`data: {json}` with `[DONE]` sentinel) or raw text.
    - Appends `delta` tokens to the assistant placeholder via `onDelta`.
  - On success: marks both messages `sent` and sets final assistant content.
  - On failure: marks messages as `error` and surfaces a generic error (and keeps retry affordance on assistant).
- Retry flow:
  - Finds the preceding user message relative to the errored assistant message.
  - Replays the request using history up to (but excluding) that user message.

### Models and selection

- `ModelSelector` fetches from `/api/models` and stores the selection in the chat store.
- The selected model is passed with chat requests.

### API keys management

- `ApiKeyManager` composes table/list UI + modals for CRUD.
- `useApiKeys` orchestrates lifecycle and state around service calls.
- `useApiKeyService` calls REST endpoints (all relative to `/api` base):
  - `GET /api-keys` – list
  - `POST /api-keys` – create
  - `PATCH /api-keys/:id` – update name
  - `DELETE /api-keys/:id` – delete
  - `POST /api-keys/default` – set default
  - `POST /api-keys/:id/refresh-meta` – refresh quota/meta
  - `GET /api/api-keys/device-flow` – SSE for device flow progress (EventSource)
- UX details:
  - Table shows name, masked key, created date, default badge, quota usage, and renewal time.
  - Actions menu for edit/delete/set-default/refresh-meta.
  - Create/Edit/Delete dialogs are controlled components.

## Networking and gateways

- All client calls use relative `/api/*` URLs and are expected to be proxied by the gateway app (see apps/gateway) to the backend.
- Two client stacks are used:
  - `fetch` for streaming chat and simple JSON endpoints (models)
  - `axios` for the API keys CRUD (with a shared interceptor-based client)
- Auth integration:
  - If `AUTH_ENABLED` is on, middleware protects pages; axios client demonstrates how to inject Bearer tokens via Clerk.

## Error handling

- Chat:
  - Service throws with detailed status text; UI marks messages as error and displays a retry action for assistant messages.
  - Route-level `error.tsx` for `/chat` boundary.
- API keys:
  - `useApiKeys` stores an error string shown in UI; toasts used for some failures (e.g., refresh meta).
- Axios interceptor redirects to `/sign-in` on 401 (client-side).

## Production server

- `server.js` runs Next in production mode behind a simple Node HTTP server, loading env from `.env` and respecting `FRONTEND_PORT`.

## Environment variables

- `AUTH_ENABLED` (server-only): toggles Clerk middleware protection and landing redirect behavior.
- `NEXT_PUBLIC_AUTH_ENABLED` (client/browser): toggles `ClerkProvider` in the root layout and sidebar user menu.
- `FRONTEND_PORT`: used by the production server.

## Notable implementation details and patterns

- Persisted client state is hydration-aware via `hasHydrated` to avoid mismatches.
- Scroll shadow viewport uses a single IntersectionObserver instance and sentinel elements to avoid layout thrashing.
- Model list parsing supports both `{ data: Model[] }` and `Model[]` payload shapes to be robust across backends.
- Chat streaming parser accepts both SSE-style `data:` lines and raw text.

## Known TODOs and extension points

- HomeLogin: placeholder form with TODOs for real auth actions (email/password, Google OAuth).
- `useApiClient`: TODO note to automatically switch to the authed client when auth is enabled.
- Access control on API calls: align axios/fetch headers with Clerk tokens when `AUTH_ENABLED` is on.
- Enhanced markdown rendering and code blocks for assistant messages.
- Server-side rendering considerations for chat/session prefetch (currently client-side store driven).

## Testing notes

- E2E tests live under `apps/frontend-e2e` (Playwright). Integration with gateway/backend assumed via `/api` proxy.

## How to work with this codebase

- Add new UI primitives to `libs/shared/ui` and import via `@/shared/ui/components/*`.
- Add new pages under `src/app`, preferring route groups to share layouts.
- For new data domains, add a `src/services/*` module and thin hooks in `src/hooks/*` orchestrating state.
- Use the Zustand store for cross-page chat-related state; persist only what is safe in localStorage.
