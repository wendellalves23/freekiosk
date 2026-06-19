import { isFilarePanelUrl } from './filarePanelUrl';

describe('isFilarePanelUrl', () => {
  it('matches FILARE panel URLs', () => {
    expect(isFilarePanelUrl('https://app.example.com/painel/gloria/ABC1')).toBe(true);
    expect(isFilarePanelUrl('https://app.example.com/painel/gloria/ABC1?foo=1')).toBe(true);
  });

  it('matches TV signage URLs', () => {
    expect(isFilarePanelUrl('https://app.example.com/tv/gloria/sign-1')).toBe(true);
  });

  it('rejects unrelated URLs', () => {
    expect(isFilarePanelUrl('https://app.example.com/admin')).toBe(false);
    expect(isFilarePanelUrl('about:blank')).toBe(false);
    expect(isFilarePanelUrl('')).toBe(false);
  });
});
