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

// Helper to create a test user and get authentication cookies
const createTestUser = async (request: any) => {
  const uniqueId = Date.now().toString();
  const testUser = {
    email: `test-${uniqueId}@example.com`,
    password: 'TestPassword123!',
    name: 'E2E Test User',
  };

  // Register the test user
  const registerRes = await request.post('/api/auth/register', {
    data: testUser,
  });

  if (!registerRes.ok()) {
    throw new Error(`Failed to register test user: ${registerRes.status()} ${await registerRes.text()}`);
  }

  return { testUser, response: registerRes };
};

// Helper to extract cookie header from response
const extractCookieHeader = (response: any) => {
  const cookies = response.headers()['set-cookie'];
  if (!cookies) return '';

  const cookieArray = Array.isArray(cookies) ? cookies : [cookies];
  return cookieArray
    .map((cookie: string) => {
      const [nameValue] = cookie.split(';');
      return nameValue;
    })
    .join('; ');
};

// Frontend proxy should redirect to login for unauthenticated users
test('frontend proxy: root redirects to login when unauthenticated', async ({ page }) => {
  await page.goto('/');
  await page.waitForURL(/\/auth\/login/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Login to your account');
});

// Frontend proxy should allow access to /api-keys after authentication
test('frontend proxy: authenticated user can access api-keys page', async ({ page, request }) => {
  // Create and authenticate test user
  const { response } = await createTestUser(request);

  // Set cookies in browser context
  const cookies = response.headers()['set-cookie'];
  if (cookies) {
    const cookieArray = Array.isArray(cookies) ? cookies : [cookies];
    for (const cookie of cookieArray) {
      const [nameValue] = cookie.split(';');
      const [name, value] = nameValue.split('=');
      if (name && value) {
        await page.context().addCookies([
          {
            name: name.trim(),
            value: value.trim(),
            domain: 'localhost',
            path: '/',
          },
        ]);
      }
    }
  }

  // Now access the protected route
  await page.goto('/api-keys');
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

// End-to-end API flow via gateway proxy for API Keys CRUD (authenticated)
// Uses the gateway baseURL with /api prefix that proxies to backend /api/*
// 1) authenticate -> 2) create -> 3) list -> 4) update -> 5) set default -> 6) delete
test('backend proxy: authenticated API Keys CRUD flow via /api/api-keys', async ({ request }) => {
  // First authenticate
  const { response } = await createTestUser(request);
  const cookieHeader = extractCookieHeader(response);

  // 1) Create - with authentication cookies
  const createRes = await request.post('/api/api-keys', {
    data: { name: 'E2E Key', key: randomKey() },
    headers: {
      Cookie: cookieHeader,
    },
  });
  expect(createRes.ok()).toBeTruthy();
  const created = await createRes.json();
  expect(created).toHaveProperty('id');
  expect(created).toHaveProperty('name', 'E2E Key');
  expect(typeof created.maskedKey).toBe('string');

  const id: string = created.id;

  // 2) List
  const listRes = await request.get('/api/api-keys', {
    headers: {
      Cookie: cookieHeader,
    },
  });
  expect(listRes.ok()).toBeTruthy();
  const list = await listRes.json();
  expect(Array.isArray(list)).toBe(true);
  expect(list.find((k: any) => k.id === id)).toBeTruthy();

  // 3) Update name
  const updateRes = await request.patch(`/api/api-keys/${id}`, {
    data: { name: 'E2E Key Updated' },
    headers: {
      Cookie: cookieHeader,
    },
  });
  expect(updateRes.ok()).toBeTruthy();
  const updated = await updateRes.json();
  expect(updated).toHaveProperty('name', 'E2E Key Updated');

  // 4) Set default
  const setDefaultRes = await request.post('/api/api-keys/default', {
    data: { id },
    headers: {
      Cookie: cookieHeader,
    },
  });
  expect(setDefaultRes.ok()).toBeTruthy();

  // 5) Delete
  const deleteRes = await request.delete(`/api/api-keys/${id}`, {
    headers: {
      Cookie: cookieHeader,
    },
  });
  expect(deleteRes.ok()).toBeTruthy();

  // Verify removed
  const listRes2 = await request.get('/api/api-keys', {
    headers: {
      Cookie: cookieHeader,
    },
  });
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
