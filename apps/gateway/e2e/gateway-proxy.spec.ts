import fs from 'node:fs';
import path from 'node:path';
import { expect, test } from '@playwright/test';

const STORAGE_DIR = 'tmp_e2e_storage';

// Best-effort cleanup before the test run begins
try {
  fs.rmSync(path.join(process.cwd(), STORAGE_DIR), { recursive: true, force: true });
} catch {}

// Helper to create random API key value for isolation
const randomKey = () => `test_key_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

// Frontend proxy should redirect to /api-keys and render the page
test('frontend proxy: root redirects to /api-keys and renders title', async ({ page }) => {
  await page.goto('/');
  await page.waitForURL(/\/api-keys/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('API Keys');
});

// Gateway should expose a health endpoint providing upstream statuses
test('health endpoint returns service statuses JSON', async ({ request }) => {
  const res = await request.get('/healthz');
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body).toHaveProperty('status');
  expect(body).toHaveProperty('services');
  expect(body.services).toHaveProperty('backend');
  expect(body.services).toHaveProperty('frontend');
});

// End-to-end API flow via gateway proxy for API Keys CRUD
// Uses the gateway baseURL with /api prefix that proxies to backend /api/*
// 1) create -> 2) list -> 3) update -> 4) set default -> 5) delete

test('backend proxy: API Keys CRUD flow via /api/api-keys', async ({ request }) => {
  // 1) Create
  const createRes = await request.post('/api/api-keys', {
    data: { name: 'E2E Key', key: randomKey() },
  });
  expect(createRes.ok()).toBeTruthy();
  const created = await createRes.json();
  expect(created).toHaveProperty('id');
  expect(created).toHaveProperty('name', 'E2E Key');
  expect(typeof created.maskedKey).toBe('string');

  const id: string = created.id;

  // 2) List
  const listRes = await request.get('/api/api-keys');
  expect(listRes.ok()).toBeTruthy();
  const list = await listRes.json();
  expect(Array.isArray(list)).toBe(true);
  expect(list.find((k: any) => k.id === id)).toBeTruthy();

  // 3) Update name
  const updateRes = await request.patch(`/api/api-keys/${id}`, { data: { name: 'E2E Key Updated' } });
  expect(updateRes.ok()).toBeTruthy();
  const updated = await updateRes.json();
  expect(updated).toHaveProperty('name', 'E2E Key Updated');

  // 4) Set default
  const setDefaultRes = await request.post('/api/api-keys/default', { data: { id } });
  expect(setDefaultRes.ok()).toBeTruthy();

  // 5) Delete
  const deleteRes = await request.delete(`/api/api-keys/${id}`);
  expect(deleteRes.ok()).toBeTruthy();

  // Verify removed
  const listRes2 = await request.get('/api/api-keys');
  expect(listRes2.ok()).toBeTruthy();
  const list2 = await listRes2.json();
  expect(list2.find((k: any) => k.id === id)).toBeFalsy();
});

// Best-effort cleanup after all tests
test.afterAll(async () => {
  try {
    fs.rmSync(path.join(process.cwd(), STORAGE_DIR), { recursive: true, force: true });
  } catch {}
});
