/** Default mobile Chrome UA for general kiosk browsing. */
export const FILARE_PANEL_DEFAULT_USER_AGENT =
  'Mozilla/5.0 (Linux; Android 13; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36';

/** Desktop Chrome UA — matches typical monitor browser for FILARE panel parity. */
export const FILARE_PANEL_DESKTOP_USER_AGENT =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const FILARE_PANEL_PATH = /\/painel\/[^/]+\/[^/]+/;
const FILARE_TV_PATH = /\/tv(?:\/|$)/;

/** True when the URL loads a FILARE panel or TV signage surface. */
export function isFilarePanelUrl(url: string): boolean {
  if (!url || url === 'about:blank') {
    return false;
  }

  try {
    const path = new URL(url).pathname;
    return FILARE_PANEL_PATH.test(path) || FILARE_TV_PATH.test(path);
  } catch {
    return FILARE_PANEL_PATH.test(url) || FILARE_TV_PATH.test(url);
  }
}
