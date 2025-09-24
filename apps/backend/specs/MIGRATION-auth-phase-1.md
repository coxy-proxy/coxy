# Auth Phase 1 – Database Schema and Migration Plan

This document describes the schema changes and a safe rollout plan to introduce user authentication and user-scoped API keys while maintaining backward compatibility.

## Summary of Schema Changes

- Add `Role` enum: `USER`, `ADMIN`.
- Add `User` model with fields required for authentication and roles:
  - `id (cuid)`, `email (unique)`, `name?`, `passwordHash`, `role` (default `USER`), `createdAt`, `updatedAt`.
- Add `RefreshToken` model for long-lived sessions:
  - `id (uuid)`, `tokenHash (unique)`, `userId (fk)`, `expiresAt`, `revokedAt?`, `createdAt`.
- Update `ApiKey` to optionally belong to a `User`:
  - Add nullable `userId` and relation to `User`.
  - Keep all existing fields and behavior: `id`, `name`, `key (unique)`, `createdAt`, `lastUsed?`, `usageCount`, `isDefault`, `meta`.
- Keep `CopilotMeta` unchanged.

All changes are backward compatible: existing `ApiKey` rows remain valid with `userId = null` (global keys).

## Migration Steps (with Prisma)

1. Pull or validate schema locally (no data changes yet):
   - Update `prisma/schema.prisma` (already done).
   - Run: `prisma generate` (ensures updated client).
   - Run: `prisma db push` (applies schema changes to the database).

2. Post-deploy validations:
   - Verify tables and columns exist: `User`, `RefreshToken`, `ApiKey.userId`.
   - Confirm existing `ApiKey` rows are intact and have `userId = null`.

3. Optional seeding (later phases):
   - Create an initial admin user with role `ADMIN`.
   - Optionally associate the current global default API key to the admin user (keeping a global default as fallback if desired).

## Backward Compatibility

- Proxy endpoints continue to accept API keys directly and do not rely on JWT.
- `ApiKey` lookups by `key` continue to work without needing a `User`.
- The global default key (if any) continues to be used where configured.

## Forward Compatibility

- In later phases, add user-scoped API key operations:
  - Each user can create and manage their own keys (with `userId` set).
  - Enforce "one default key per user" at the application/service layer (partial unique index is not portable across all providers).
- Introduce `AuthModule` with access/refresh tokens using the `User` and `RefreshToken` models.

## Rollout/Operational Plan

- Environments using SQLite (`DATABASE_URL=file:...`) can run `prisma db push` safely.
- For PostgreSQL/MySQL, prefer `prisma migrate dev`/`prisma migrate deploy` to produce/version SQL migrations.
- No data migration is required in Phase 1. Global keys remain usable. Any future association of keys to users is additive.

## Risk and Mitigations

- Risk: Accidental uniqueness constraint affecting existing data.
  - Mitigation: All added constraints are on new tables/columns; existing unique constraint on `ApiKey.key` remains unchanged.
- Risk: Partial-unique requirement for per-user default keys.
  - Mitigation: Enforce in service layer; optional DB-level enforcement can be added later for providers that support partial indexes.

## Verification Checklist

- [ ] `User`, `RefreshToken` tables created
- [ ] `ApiKey.userId` column exists (nullable)
- [ ] Existing API keys preserved and queries unaffected
- [ ] Application still starts and serves proxy endpoints
