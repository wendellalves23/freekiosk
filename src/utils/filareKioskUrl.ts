import { isFilarePanelUrl } from './filarePanelUrl';

const STRIP_QUERY_PARAMS = ['deviceToken', 'lowMemory'] as const;

/** Canonical FILARE device URL without transient query params. */
export function normalizeFilareKioskUrl(raw: string): string | null {
  if (!isFilarePanelUrl(raw)) {
    return null;
  }

  try {
    const parsed = new URL(raw);
    for (const param of STRIP_QUERY_PARAMS) {
      parsed.searchParams.delete(param);
    }
    const search = parsed.searchParams.toString();
    parsed.search = search ? `?${search}` : '';
    return parsed.toString();
  } catch {
    return null;
  }
}

export function shouldAutoSaveFilareUrl(
  canonical: string,
  lastSaved: string | null,
): boolean {
  if (!canonical) {
    return false;
  }
  if (!lastSaved) {
    return true;
  }
  return canonical !== lastSaved;
}

/** True for http(s) URLs usable as kiosk home. */
export function isBrowsableKioskUrl(url: string): boolean {
  if (!url || url === 'about:blank') {
    return false;
  }
  try {
    const protocol = new URL(url).protocol;
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
}
