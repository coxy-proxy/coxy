export function maskKey(key: string) {
  if (!key) {
    return '';
  }
  return `${key.slice(0, 10)}...${key.slice(-5)}`;
}

export function toHeaders(reqHeaders: Record<string, string | string[]>): Record<string, string> {
  return Object.entries(reqHeaders).reduce((obj, [k, v]) => ({ ...obj, [k]: Array.isArray(v) ? v.join(',') : v }), {});
}
