// utils/api-keys.ts
export function maskApiKey(key: string): string {
  if (!key || key.length <= 4) return '****';
  const lastFour = key.slice(-4);
  const masked = '*'.repeat(12);
  return masked + lastFour;
}
