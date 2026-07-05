const BANNED_URL_PROTOCOLS = ['javascript:', 'data:', 'vbscript:', 'blob:'];

export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return !BANNED_URL_PROTOCOLS.some((protocol) => parsed.protocol === protocol);
  } catch {
    return false;
  }
}
