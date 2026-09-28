export function normalizeUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const candidate = /^[a-z][a-z\d+.-]*:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const url = new URL(candidate);
    if ((url.protocol !== "http:" && url.protocol !== "https:") || !url.hostname) {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}

export function normalizeEmail(value: string): string | null {
  const trimmed = value.trim();
  return /^[^\s@<>]+@[^\s@.]+(?:\.[^\s@.]+)+$/.test(trimmed) ? trimmed : null;
}