import { isFilarePanelUrl } from './filarePanelUrl';

export type FilarePanelProfileSettings = {
  enabled: boolean;
  appendLowMemoryParam: boolean;
  allowRestApi: boolean;
  allowMqtt: boolean;
};

export type StoredRuntimeFlags = {
  restApiEnabled: boolean;
  mqttEnabled: boolean;
  pdfViewerEnabled: boolean;
  urlRotationEnabled: boolean;
  urlPlannerEnabled: boolean;
  screensaverEnabled: boolean;
  motionEnabled: boolean;
  inactivityReturnEnabled: boolean;
  panelDebugOverlay: boolean;
  statusBarEnabled: boolean;
};

export type EffectiveRuntimeFlags = StoredRuntimeFlags;

export const DEFAULT_FILARE_PANEL_PROFILE: FilarePanelProfileSettings = {
  enabled: false,
  appendLowMemoryParam: true,
  allowRestApi: false,
  allowMqtt: false,
};

export function isFilarePanelProfileActive(
  profileEnabled: boolean,
  kioskUrl: string,
): boolean {
  return profileEnabled && isFilarePanelUrl(kioskUrl);
}

export function resolveEffectiveFeatureFlags(
  profile: FilarePanelProfileSettings,
  kioskUrl: string,
  stored: StoredRuntimeFlags,
): EffectiveRuntimeFlags {
  const profileActive = isFilarePanelProfileActive(profile.enabled, kioskUrl);

  if (!profileActive) {
    return { ...stored };
  }

  return {
    restApiEnabled: stored.restApiEnabled && profile.allowRestApi,
    mqttEnabled: stored.mqttEnabled && profile.allowMqtt,
    pdfViewerEnabled: false,
    urlRotationEnabled: false,
    urlPlannerEnabled: false,
    screensaverEnabled: false,
    motionEnabled: false,
    inactivityReturnEnabled: false,
    panelDebugOverlay: false,
    statusBarEnabled: false,
  };
}

export function appendFilareLowMemoryParam(url: string, enabled: boolean): string {
  if (!enabled || !isFilarePanelUrl(url)) {
    return url;
  }

  try {
    const parsed = new URL(url);
    if (parsed.searchParams.has('lowMemory')) {
      return url;
    }
    parsed.searchParams.set('lowMemory', '1');
    return parsed.toString();
  } catch {
    if (/[?&]lowMemory=/i.test(url)) {
      return url;
    }
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}lowMemory=1`;
  }
}
