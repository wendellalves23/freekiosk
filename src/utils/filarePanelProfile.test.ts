import {
  appendFilareLowMemoryParam,
  DEFAULT_FILARE_PANEL_PROFILE,
  isFilarePanelProfileActive,
  resolveEffectiveFeatureFlags,
} from './filarePanelProfile';

const panelUrl = 'https://app.example.com/painel/gloria/ABC1';
const storedAllOn = {
  restApiEnabled: true,
  mqttEnabled: true,
  pdfViewerEnabled: true,
  urlRotationEnabled: true,
  urlPlannerEnabled: true,
  screensaverEnabled: true,
  motionEnabled: true,
  inactivityReturnEnabled: true,
  panelDebugOverlay: true,
  statusBarEnabled: true,
};

describe('isFilarePanelProfileActive', () => {
  it('is active only when profile enabled and URL is FILARE panel', () => {
    expect(isFilarePanelProfileActive(true, panelUrl)).toBe(true);
    expect(isFilarePanelProfileActive(false, panelUrl)).toBe(false);
    expect(isFilarePanelProfileActive(true, 'https://example.com/')).toBe(false);
  });
});

describe('resolveEffectiveFeatureFlags', () => {
  it('returns stored flags when profile is off', () => {
    expect(
      resolveEffectiveFeatureFlags(
        { ...DEFAULT_FILARE_PANEL_PROFILE, enabled: false },
        panelUrl,
        storedAllOn,
      ),
    ).toEqual(storedAllOn);
  });

  it('forces heavy features off when profile is active', () => {
    const effective = resolveEffectiveFeatureFlags(
      { ...DEFAULT_FILARE_PANEL_PROFILE, enabled: true },
      panelUrl,
      storedAllOn,
    );

    expect(effective.restApiEnabled).toBe(false);
    expect(effective.mqttEnabled).toBe(false);
    expect(effective.pdfViewerEnabled).toBe(false);
    expect(effective.urlRotationEnabled).toBe(false);
    expect(effective.screensaverEnabled).toBe(false);
  });

  it('allows REST API and MQTT when sub-toggles are on', () => {
    const effective = resolveEffectiveFeatureFlags(
      {
        ...DEFAULT_FILARE_PANEL_PROFILE,
        enabled: true,
        allowRestApi: true,
        allowMqtt: true,
      },
      panelUrl,
      storedAllOn,
    );

    expect(effective.restApiEnabled).toBe(true);
    expect(effective.mqttEnabled).toBe(true);
    expect(effective.pdfViewerEnabled).toBe(false);
  });
});

describe('appendFilareLowMemoryParam', () => {
  it('appends lowMemory=1 for FILARE panel URLs', () => {
    expect(appendFilareLowMemoryParam(panelUrl, true)).toBe(
      'https://app.example.com/painel/gloria/ABC1?lowMemory=1',
    );
  });

  it('does not duplicate lowMemory param', () => {
    expect(
      appendFilareLowMemoryParam(`${panelUrl}?lowMemory=1`, true),
    ).toBe(`${panelUrl}?lowMemory=1`);
  });

  it('leaves non-FILARE URLs unchanged', () => {
    expect(appendFilareLowMemoryParam('https://example.com/', true)).toBe(
      'https://example.com/',
    );
  });

  it('returns URL unchanged when disabled', () => {
    expect(appendFilareLowMemoryParam(panelUrl, false)).toBe(panelUrl);
  });
});
