import {
  isBrowsableKioskUrl,
  normalizeFilareKioskUrl,
  shouldAutoSaveFilareUrl,
} from './filareKioskUrl';

describe('normalizeFilareKioskUrl', () => {
  it('returns canonical panel URL without deviceToken and lowMemory', () => {
    expect(
      normalizeFilareKioskUrl(
        'https://app.example.com/painel/gloria/ABC1?deviceToken=secret&lowMemory=1',
      ),
    ).toBe('https://app.example.com/painel/gloria/ABC1');
  });

  it('returns canonical totem URL', () => {
    expect(
      normalizeFilareKioskUrl(
        'https://app.example.com/totem/gloria/TOT1?deviceToken=secret',
      ),
    ).toBe('https://app.example.com/totem/gloria/TOT1');
  });

  it('preserves unrelated query params', () => {
    expect(
      normalizeFilareKioskUrl(
        'https://app.example.com/tv/gloria/sign-1?foo=bar&deviceToken=x',
      ),
    ).toBe('https://app.example.com/tv/gloria/sign-1?foo=bar');
  });

  it('rejects non-FILARE URLs', () => {
    expect(normalizeFilareKioskUrl('https://app.example.com/parear')).toBeNull();
    expect(normalizeFilareKioskUrl('about:blank')).toBeNull();
  });
});

describe('shouldAutoSaveFilareUrl', () => {
  it('saves when last saved is null or different', () => {
    const canonical = 'https://app.example.com/painel/gloria/ABC1';
    expect(shouldAutoSaveFilareUrl(canonical, null)).toBe(true);
    expect(shouldAutoSaveFilareUrl(canonical, canonical)).toBe(false);
    expect(
      shouldAutoSaveFilareUrl(
        canonical,
        'https://app.example.com/painel/gloria/ABC1?deviceToken=x',
      ),
    ).toBe(true);
  });
});

describe('isBrowsableKioskUrl', () => {
  it('accepts http and https', () => {
    expect(isBrowsableKioskUrl('https://example.com/painel/a/b')).toBe(true);
    expect(isBrowsableKioskUrl('http://example.com')).toBe(true);
  });

  it('rejects blank and invalid URLs', () => {
    expect(isBrowsableKioskUrl('about:blank')).toBe(false);
    expect(isBrowsableKioskUrl('')).toBe(false);
  });
});
