export function maskKey(key: string) {
  if (!key) {
    return '';
  }
  return `${key.slice(0, 10)}...${key.slice(-5)}`;
}
