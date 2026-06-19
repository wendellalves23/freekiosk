/**
 * FreeKiosk v1.2 - General Tab
 * Display mode, URL/App selection, PIN configuration
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Linking } from 'react-native';
import {
  SettingsSection,
  SettingsInput,
  SettingsSwitch,
  SettingsModeSelector,
  SettingsInfoBox,
  SettingsButton,
  UrlListEditor,
  ScheduleEventList,
  ManagedAppsSection,
  SettingsRadioGroup,
} from '../../../components/settings';
import { ManagedApp } from '../../../types/managedApps';
import { Colors, Spacing, Typography } from '../../../theme';
import AppLauncherModule, { AppInfo } from '../../../utils/AppLauncherModule';
import { ScheduledEvent } from '../../../types/planner';
import type { MediaItem, MediaFitMode } from '../../../types/mediaPlayer';
import { generateMediaItemId, detectMediaType, isLocalMedia, getMediaDisplayName } from '../../../types/mediaPlayer';
import FilePickerModule from '../../../utils/FilePickerModule';
import type { PickedFile } from '../../../utils/FilePickerModule';
import { isFilarePanelUrl } from '../../../utils/filarePanelUrl';
import { isBrowsableKioskUrl, normalizeFilareKioskUrl } from '../../../utils/filareKioskUrl';
import { t } from '../../../i18n';

interface GeneralTabProps {
  // Display mode
  displayMode: 'webview' | 'external_app' | 'media_player';
  onDisplayModeChange: (mode: 'webview' | 'external_app' | 'media_player') => void;
  
  // WebView settings
  url: string;
  onUrlChange: (url: string) => void;
  browsedUrl?: string | null;
  
  // External app settings
  externalAppPackage: string;
  onExternalAppPackageChange: (pkg: string) => void;
  onPickApp: () => void;
  loadingApps: boolean;
  
  // External app sub-mode (single vs multi)
  externalAppMode: 'single' | 'multi';
  onExternalAppModeChange: (mode: 'single' | 'multi') => void;
  
  // Managed apps (multi-app mode)
  managedApps: ManagedApp[];
  onManagedAppsChange: (apps: ManagedApp[]) => void;
  
  // Permissions
  hasOverlayPermission: boolean;
  onRequestOverlayPermission: () => void;
  hasUsageStatsPermission: boolean;
  onRequestUsageStatsPermission: () => void;
  isDeviceOwner: boolean;
  
  // PIN
  pin: string;
  onPinChange: (pin: string) => void;
  isPinConfigured: boolean;
  pinModeChanged: boolean;
  pinMaxAttemptsText: string;
  onPinMaxAttemptsChange: (text: string) => void;
  onPinMaxAttemptsBlur: () => void;
  pinMode: 'numeric' | 'alphanumeric';
  onPinModeChange: (mode: 'numeric' | 'alphanumeric') => void;
  
  // Dashboard mode (webview only)
  dashboardModeEnabled: boolean;
  onDashboardModeEnabledChange: (value: boolean) => void;

  // Auto reload (webview only)
  autoReload: boolean;
  onAutoReloadChange: (value: boolean) => void;
  
  // PDF Viewer (webview only)
  pdfViewerEnabled: boolean;
  onPdfViewerEnabledChange: (value: boolean) => void;
  
  // Printing (webview only)
  printEnabled: boolean;
  onPrintEnabledChange: (value: boolean) => void;
  printPaperSize: string;
  onPrintPaperSizeChange: (value: string) => void;
  
  // URL Rotation (webview only)
  urlRotationEnabled: boolean;
  onUrlRotationEnabledChange: (value: boolean) => void;
  urlRotationList: string[];
  onUrlRotationListChange: (urls: string[]) => void;
  urlRotationInterval: string;
  onUrlRotationIntervalChange: (value: string) => void;
  
  // URL Planner (webview only)
  urlPlannerEnabled: boolean;
  onUrlPlannerEnabledChange: (value: boolean) => void;
  urlPlannerEvents: ScheduledEvent[];
  onUrlPlannerEventsChange: (events: ScheduledEvent[]) => void;
  onAddRecurringEvent: () => void;
  onAddOneTimeEvent: () => void;
  onEditEvent: (event: ScheduledEvent) => void;
  
  // WebView Back Button (webview only)
  webViewBackButtonEnabled: boolean;
  onWebViewBackButtonEnabledChange: (value: boolean) => void;
  webViewBackButtonXPercent: string;
  onWebViewBackButtonXPercentChange: (value: string) => void;
  webViewBackButtonYPercent: string;
  onWebViewBackButtonYPercentChange: (value: string) => void;
  onResetWebViewBackButtonPosition: () => void;
  
  // Inactivity Return to Home (webview only)
  inactivityReturnEnabled: boolean;
  onInactivityReturnEnabledChange: (value: boolean) => void;
  inactivityReturnDelay: string;
  onInactivityReturnDelayChange: (value: string) => void;
  inactivityReturnResetOnNav: boolean;
  onInactivityReturnResetOnNavChange: (value: boolean) => void;
  inactivityReturnClearCache: boolean;
  onInactivityReturnClearCacheChange: (value: boolean) => void;
  inactivityReturnScrollTop: boolean;
  onInactivityReturnScrollTopChange: (value: boolean) => void;
  
  // Media Player settings
  mediaPlayerItems: MediaItem[];
  onMediaPlayerItemsChange: (items: MediaItem[]) => void;
  mediaPlayerAutoPlay: boolean;
  onMediaPlayerAutoPlayChange: (value: boolean) => void;
  mediaPlayerLoop: boolean;
  onMediaPlayerLoopChange: (value: boolean) => void;
  mediaPlayerShuffle: boolean;
  onMediaPlayerShuffleChange: (value: boolean) => void;
  mediaPlayerImageDuration: string;
  onMediaPlayerImageDurationChange: (value: string) => void;
  mediaPlayerShowControls: boolean;
  onMediaPlayerShowControlsChange: (value: boolean) => void;
  mediaPlayerFitMode: MediaFitMode;
  onMediaPlayerFitModeChange: (value: MediaFitMode) => void;
  mediaPlayerBgColor: string;
  onMediaPlayerBgColorChange: (value: string) => void;
  mediaPlayerTransition: boolean;
  onMediaPlayerTransitionChange: (value: boolean) => void;
  mediaPlayerTransitionDuration: string;
  onMediaPlayerTransitionDurationChange: (value: string) => void;
  mediaPlayerMute: boolean;
  onMediaPlayerMuteChange: (value: boolean) => void;
  onPickMediaFromDevice: (type: 'video' | 'image' | 'any') => void;
  pickingMedia: boolean;
  
  // HTTP Basic Auth (webview only)
  basicAuthUsername: string;
  onBasicAuthUsernameChange: (value: string) => void;
  basicAuthPassword: string;
  onBasicAuthPasswordChange: (value: string) => void;

  // FILARE panel RAM-saving profile (webview + FILARE URL)
  filarePanelProfileEnabled: boolean;
  onFilarePanelProfileEnabledChange: (value: boolean) => void;
  filarePanelProfileLowMemoryUrl: boolean;
  onFilarePanelProfileLowMemoryUrlChange: (value: boolean) => void;
  filarePanelProfileAllowRestApi: boolean;
  onFilarePanelProfileAllowRestApiChange: (value: boolean) => void;
  filarePanelProfileAllowMqtt: boolean;
  onFilarePanelProfileAllowMqttChange: (value: boolean) => void;

  // Navigation
  onBackToKiosk: () => void;
}

const GeneralTab: React.FC<GeneralTabProps> = ({
  displayMode,
  onDisplayModeChange,
  url,
  onUrlChange,
  browsedUrl,
  externalAppPackage,
  onExternalAppPackageChange,
  onPickApp,
  loadingApps,
  externalAppMode,
  onExternalAppModeChange,
  managedApps,
  onManagedAppsChange,
  hasOverlayPermission,
  onRequestOverlayPermission,
  hasUsageStatsPermission,
  onRequestUsageStatsPermission,
  isDeviceOwner,
  pin,
  onPinChange,
  isPinConfigured,
  pinModeChanged,
  pinMaxAttemptsText,
  onPinMaxAttemptsChange,
  onPinMaxAttemptsBlur,
  pinMode,
  onPinModeChange,
  dashboardModeEnabled,
  onDashboardModeEnabledChange,
  autoReload,
  onAutoReloadChange,
  pdfViewerEnabled,
  onPdfViewerEnabledChange,
  printEnabled,
  onPrintEnabledChange,
  printPaperSize,
  onPrintPaperSizeChange,
  urlRotationEnabled,
  onUrlRotationEnabledChange,
  urlRotationList,
  onUrlRotationListChange,
  urlRotationInterval,
  onUrlRotationIntervalChange,
  urlPlannerEnabled,
  onUrlPlannerEnabledChange,
  urlPlannerEvents,
  onUrlPlannerEventsChange,
  onAddRecurringEvent,
  onAddOneTimeEvent,
  onEditEvent,
  webViewBackButtonEnabled,
  onWebViewBackButtonEnabledChange,
  webViewBackButtonXPercent,
  onWebViewBackButtonXPercentChange,
  webViewBackButtonYPercent,
  onWebViewBackButtonYPercentChange,
  onResetWebViewBackButtonPosition,
  inactivityReturnEnabled,
  onInactivityReturnEnabledChange,
  inactivityReturnDelay,
  onInactivityReturnDelayChange,
  inactivityReturnResetOnNav,
  onInactivityReturnResetOnNavChange,
  inactivityReturnClearCache,
  onInactivityReturnClearCacheChange,
  inactivityReturnScrollTop,
  onInactivityReturnScrollTopChange,
  mediaPlayerItems,
  onMediaPlayerItemsChange,
  mediaPlayerAutoPlay,
  onMediaPlayerAutoPlayChange,
  mediaPlayerLoop,
  onMediaPlayerLoopChange,
  mediaPlayerShuffle,
  onMediaPlayerShuffleChange,
  mediaPlayerImageDuration,
  onMediaPlayerImageDurationChange,
  mediaPlayerShowControls,
  onMediaPlayerShowControlsChange,
  mediaPlayerFitMode,
  onMediaPlayerFitModeChange,
  mediaPlayerBgColor,
  onMediaPlayerBgColorChange,
  mediaPlayerTransition,
  onMediaPlayerTransitionChange,
  mediaPlayerTransitionDuration,
  onMediaPlayerTransitionDurationChange,
  mediaPlayerMute,
  onMediaPlayerMuteChange,
  onPickMediaFromDevice,
  pickingMedia,
  basicAuthUsername,
  onBasicAuthUsernameChange,
  basicAuthPassword,
  onBasicAuthPasswordChange,
  filarePanelProfileEnabled,
  onFilarePanelProfileEnabledChange,
  filarePanelProfileLowMemoryUrl,
  onFilarePanelProfileLowMemoryUrlChange,
  filarePanelProfileAllowRestApi,
  onFilarePanelProfileAllowRestApiChange,
  filarePanelProfileAllowMqtt,
  onFilarePanelProfileAllowMqttChange,
  onBackToKiosk,
}) => {
  const filarePanelUrl = isFilarePanelUrl(url);
  const applyBrowsedUrlCandidate =
    browsedUrl && isBrowsableKioskUrl(browsedUrl)
      ? normalizeFilareKioskUrl(browsedUrl) ?? browsedUrl
      : null;
  const canApplyBrowsedUrl =
    applyBrowsedUrlCandidate !== null &&
    applyBrowsedUrlCandidate.replace(/\/+$/, '') !== url.replace(/\/+$/, '');

  return (
    <View>
      {/* Display Mode Selection */}
      <SettingsSection title={t('general.displayMode')} icon="cellphone">
        <SettingsModeSelector
          options={[
            { value: 'webview', label: t('general.modeWebsite'), icon: 'web' },
            { value: 'media_player', label: t('general.modeMedia'), icon: 'play-circle-outline' },
            { value: 'external_app', label: t('general.modeApp'), icon: 'android' },
          ]}
          value={displayMode}
          onValueChange={(value) => onDisplayModeChange(value as 'webview' | 'external_app' | 'media_player')}
          hint={t('general.displayModeHint')}
        />
        
        {/* Device Owner warning for External App */}
        {displayMode === 'external_app' && !isDeviceOwner && (
          <SettingsInfoBox variant="error" title={t('general.deviceOwnerRecommended')}>
            <Text style={styles.infoText}>
              {t('general.deviceOwnerWarningWithout')}{`
`}
              {t('general.deviceOwnerWarningNav')}{`
`}
              {t('general.deviceOwnerWarningExit')}{`
`}
              {t('general.deviceOwnerWarningLock')}
            </Text>
          </SettingsInfoBox>
        )}
      </SettingsSection>
      
      {/* How to Use */}
      <SettingsSection variant="info">
        <Text style={styles.infoTitle}>{t('general.howToUseTitle')}</Text>
        <Text style={styles.infoText}>
          {displayMode === 'media_player'
            ? t('general.howToUseMedia')
            : t('general.howToUseWebview')}
        </Text>
      </SettingsSection>
      
      {/* ===== MEDIA PLAYER SETTINGS ===== */}
      {displayMode === 'media_player' && (
        <>
          {/* Media Items / Playlist */}
          <SettingsSection title={t('general.mediaPlaylist')} icon="play-circle-outline">
            <SettingsInfoBox variant="info">
              <Text style={styles.infoText}>
                {t('general.mediaPlaylistInfo')}
              </Text>
            </SettingsInfoBox>
            
            {/* Pick from device buttons */}
            <View style={styles.pickButtonsRow}>
              <TouchableOpacity
                style={[styles.pickButton, pickingMedia && styles.pickButtonDisabled]}
                onPress={() => !pickingMedia && onPickMediaFromDevice('any')}
                disabled={pickingMedia}
              >
                <Text style={styles.pickButtonText}>
                  {pickingMedia ? t('general.pickingMedia') : t('general.pickFromDevice')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.pickButtonSmall, { backgroundColor: Colors.info }, pickingMedia && styles.pickButtonDisabled]}
                onPress={() => !pickingMedia && onPickMediaFromDevice('video')}
                disabled={pickingMedia}
              >
                <Text style={styles.pickButtonSmallText}>🎥</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.pickButtonSmall, { backgroundColor: Colors.secondary }, pickingMedia && styles.pickButtonDisabled]}
                onPress={() => !pickingMedia && onPickMediaFromDevice('image')}
                disabled={pickingMedia}
              >
                <Text style={styles.pickButtonSmallText}>🖼️</Text>
              </TouchableOpacity>
            </View>
            
            {mediaPlayerItems.map((item, index) => (
              <View key={item.id} style={styles.mediaItemCard}>
                <View style={styles.mediaItemHeader}>
                  <Text style={styles.mediaItemIndex}>{index + 1}</Text>
                  <View style={[
                    styles.mediaItemTypeBadge,
                    { backgroundColor: item.type === 'video' ? Colors.info : Colors.secondary }
                  ]}>
                    <Text style={styles.mediaItemTypeText}>
                      {item.type === 'video' ? t('general.mediaVideo') : t('general.mediaImage')}
                    </Text>
                  </View>
                  {item.isLocal && (
                    <View style={styles.localBadge}>
                      <Text style={styles.localBadgeText}>{t('general.mediaLocal')}</Text>
                    </View>
                  )}
                  <TouchableOpacity
                    style={styles.mediaItemDeleteBtn}
                    onPress={() => {
                      const toDelete = mediaPlayerItems.find(i => i.id === item.id);
                      // If it's a local file, also delete the copied file
                      if (toDelete?.isLocal && toDelete.url.startsWith('file://')) {
                        FilePickerModule.deleteMediaFile(toDelete.url).catch(() => {});
                      }
                      const updated = mediaPlayerItems.filter(i => i.id !== item.id);
                      onMediaPlayerItemsChange(updated);
                    }}
                  >
                    <Text style={styles.mediaItemDeleteText}>✗</Text>
                  </TouchableOpacity>
                </View>
                
                {item.isLocal ? (
                  <View style={styles.localFileInfo}>
                    <Text style={styles.localFileName} numberOfLines={1}>
                      {getMediaDisplayName(item)}
                    </Text>
                    <Text style={styles.localFilePath} numberOfLines={1}>
                      {item.url}
                    </Text>
                  </View>
                ) : (
                  <SettingsInput
                    label={t('general.urlLabel')}
                    value={item.url}
                    onChangeText={(text) => {
                      const updated = mediaPlayerItems.map(i => 
                        i.id === item.id ? { ...i, url: text, type: detectMediaType(text) } : i
                      );
                      onMediaPlayerItemsChange(updated);
                    }}
                    placeholder={t('general.mediaUrlPlaceholder')}
                    keyboardType="url"
                  />
                )}
                
                {item.type === 'image' && (
                  <SettingsInput
                    label={t('general.displayDurationSeconds')}
                    value={item.duration ? String(item.duration) : ''}
                    onChangeText={(text) => {
                      const dur = parseInt(text, 10);
                      const updated = mediaPlayerItems.map(i => 
                        i.id === item.id ? { ...i, duration: isNaN(dur) ? undefined : dur } : i
                      );
                      onMediaPlayerItemsChange(updated);
                    }}
                    placeholder={mediaPlayerImageDuration || '10'}
                    keyboardType="numeric"
                    hint={t('general.displayDurationHint')}
                  />
                )}
              </View>
            ))}
            
            <SettingsButton
              title={t('general.addUrlEntry')}
              icon="plus-circle"
              variant="success"
              onPress={() => {
                const newItem: MediaItem = {
                  id: generateMediaItemId(),
                  url: '',
                  type: 'video',
                  isLocal: false,
                };
                onMediaPlayerItemsChange([...mediaPlayerItems, newItem]);
              }}
            />
            
            {mediaPlayerItems.length === 0 && (
              <SettingsInfoBox variant="warning">
                <Text style={styles.infoText}>
                  {t('general.mediaMinOneWarning')}
                </Text>
              </SettingsInfoBox>
            )}
          </SettingsSection>
          
          {/* Playback Settings */}
          <SettingsSection title={t('general.playback')} icon="play">
            <SettingsSwitch
              label={t('general.autoPlay')}
              value={mediaPlayerAutoPlay}
              onValueChange={onMediaPlayerAutoPlayChange}
              hint={t('general.autoPlayHint')}
            />
            
            <SettingsSwitch
              label={t('general.loopPlaylist')}
              value={mediaPlayerLoop}
              onValueChange={onMediaPlayerLoopChange}
              hint={t('general.loopPlaylistHint')}
            />
            
            <SettingsSwitch
              label={t('general.shuffle')}
              value={mediaPlayerShuffle}
              onValueChange={onMediaPlayerShuffleChange}
              hint={t('general.shuffleHint')}
            />
            
            <SettingsSwitch
              label={t('general.muteVideos')}
              value={mediaPlayerMute}
              onValueChange={onMediaPlayerMuteChange}
              hint={t('general.muteVideosHint')}
            />
            
            <View style={styles.rotationSpacer} />
            <SettingsInput
              label={t('general.defaultImageDuration')}
              value={mediaPlayerImageDuration}
              onChangeText={onMediaPlayerImageDurationChange}
              placeholder="10"
              keyboardType="numeric"
              hint={t('general.defaultImageDurationHint')}
            />
          </SettingsSection>
          
          {/* Display Settings */}
          <SettingsSection title={t('general.displayOptions')} icon="monitor">
            <SettingsSwitch
              label={t('general.showPlaybackControls')}
              value={mediaPlayerShowControls}
              onValueChange={onMediaPlayerShowControlsChange}
              hint={t('general.showPlaybackControlsHint')}
            />
            
            <View style={styles.rotationSpacer} />
            <SettingsRadioGroup
              label={t('general.contentFitMode')}
              options={[
                { value: 'contain', label: t('general.fitContain') },
                { value: 'cover', label: t('general.fitCover') },
                { value: 'fill', label: t('general.fitFill') },
              ]}
              value={mediaPlayerFitMode}
              onValueChange={(v) => onMediaPlayerFitModeChange(v as MediaFitMode)}
            />
            
            <View style={styles.rotationSpacer} />
            <SettingsInput
              label={t('general.backgroundColor')}
              value={mediaPlayerBgColor}
              onChangeText={onMediaPlayerBgColorChange}
              placeholder="#000000"
              hint={t('general.backgroundColorHint')}
            />
            
            <View style={styles.rotationSpacer} />
            <SettingsSwitch
              label={t('general.crossfadeTransition')}
              value={mediaPlayerTransition}
              onValueChange={onMediaPlayerTransitionChange}
              hint={t('general.crossfadeTransitionHint')}
            />
            
            {mediaPlayerTransition && (
              <SettingsInput
                label={t('general.transitionDurationMs')}
                value={mediaPlayerTransitionDuration}
                onChangeText={onMediaPlayerTransitionDurationChange}
                placeholder="500"
                keyboardType="numeric"
                hint={t('general.transitionDurationHint')}
              />
            )}
          </SettingsSection>
        </>
      )}
      
      {/* URL Input (WebView mode) */}
      {displayMode === 'webview' && (
        <SettingsSection title={t('general.urlSection')} icon="link-variant">
          <SettingsSwitch
            label={t('general.useDashboardMode')}
            value={dashboardModeEnabled}
            onValueChange={onDashboardModeEnabledChange}
            hint={t('general.useDashboardModeHint')}
          />

          {dashboardModeEnabled ? (
            <SettingsInfoBox variant="info">
              <Text style={styles.infoText}>
                {t('general.dashboardActive')}
              </Text>
            </SettingsInfoBox>
          ) : (
            <>
              <SettingsInput
                label=""
                value={url}
                onChangeText={onUrlChange}
                placeholder={t('general.urlPlaceholder')}
                keyboardType="url"
                hint={t('general.urlHint')}
              />

              {canApplyBrowsedUrl && applyBrowsedUrlCandidate && (
                <SettingsButton
                  title={t('general.useCurrentUrl')}
                  icon="content-copy"
                  variant="secondary"
                  onPress={() => onUrlChange(applyBrowsedUrlCandidate)}
                />
              )}

              {filarePanelUrl && !filarePanelProfileEnabled && (
                <SettingsInfoBox variant="info">
                  <Text style={styles.infoText}>
                    {t('general.filareUrlHint')}
                  </Text>
                </SettingsInfoBox>
              )}

              {url.trim().toLowerCase().startsWith('http://') && (
                <SettingsInfoBox variant="warning">
                  <Text style={styles.infoText}>
                    ⚠️ {t('general.httpWarning')}
                  </Text>
                </SettingsInfoBox>
              )}
            </>
          )}
        </SettingsSection>
      )}

      {/* FILARE panel profile — WebView + FILARE panel/tv URL */}
      {displayMode === 'webview' && filarePanelUrl && !dashboardModeEnabled && (
        <SettingsSection title={t('filare.profileTitle')} icon="speedometer">
          <SettingsInfoBox variant="info">
            <Text style={styles.infoText}>
              {t('filare.profileInfo')}
            </Text>
          </SettingsInfoBox>
          <SettingsSwitch
            label={t('filare.profileEnable')}
            value={filarePanelProfileEnabled}
            onValueChange={onFilarePanelProfileEnabledChange}
            hint={t('filare.profileEnableHint')}
          />
          {filarePanelProfileEnabled && (
            <>
              <SettingsSwitch
                label={t('filare.lowMemory')}
                value={filarePanelProfileLowMemoryUrl}
                onValueChange={onFilarePanelProfileLowMemoryUrlChange}
                hint={t('filare.lowMemoryHint')}
              />
              <SettingsSwitch
                label={t('filare.allowRestApi')}
                value={filarePanelProfileAllowRestApi}
                onValueChange={onFilarePanelProfileAllowRestApiChange}
                hint={t('filare.allowRestApiHint')}
              />
              <SettingsSwitch
                label={t('filare.allowMqtt')}
                value={filarePanelProfileAllowMqtt}
                onValueChange={onFilarePanelProfileAllowMqttChange}
                hint={t('filare.allowMqttHint')}
              />
              <SettingsInfoBox variant="info">
                <Text style={styles.infoText}>
                  {t('filare.profileDisabledInfo')}
                </Text>
              </SettingsInfoBox>
            </>
          )}
        </SettingsSection>
      )}

      {/* HTTP Basic Auth (WebView mode only) */}
      {displayMode === 'webview' && (
        <SettingsSection title={t('general.websiteAuth')} icon="lock-outline">
          <SettingsInput
            label={t('general.username')}
            value={basicAuthUsername}
            onChangeText={onBasicAuthUsernameChange}
            placeholder={t('general.usernamePlaceholder')}
            hint={t('general.usernameHint')}
            autoCapitalize="none"
          />
          {basicAuthUsername.trim().length > 0 && (
            <SettingsInput
              label={t('general.password')}
              value={basicAuthPassword}
              onChangeText={onBasicAuthPasswordChange}
              placeholder={t('general.passwordPlaceholder')}
              secureTextEntry={true}
              hint={t('general.passwordKeychainHint')}
              autoCapitalize="none"
            />
          )}
          <SettingsInfoBox variant="info">
            <Text style={styles.infoText}>
              {t('general.basicAuthInfo')}
            </Text>
          </SettingsInfoBox>
        </SettingsSection>
      )}

      {/* URL Rotation (WebView mode only) */}
      {displayMode === 'webview' && (
        <SettingsSection title={t('general.urlRotation')} icon="sync">
          {dashboardModeEnabled && (
            <SettingsInfoBox variant="info">
              <Text style={styles.infoText}>
                {t('general.urlRotationDashboardDisabled')}
              </Text>
            </SettingsInfoBox>
          )}
          {!dashboardModeEnabled && (
            <>
              <SettingsSwitch
                label={t('general.enableRotation')}
                value={urlRotationEnabled}
                onValueChange={onUrlRotationEnabledChange}
                hint={t('general.enableRotationHint')}
              />

              {urlRotationEnabled && (
                <>
                  <View style={styles.rotationSpacer} />
                  <UrlListEditor
                    urls={urlRotationList}
                    onUrlsChange={onUrlRotationListChange}
                  />

                  <View style={styles.rotationSpacer} />
                  <SettingsInput
                    label={t('general.rotationIntervalSeconds')}
                    value={urlRotationInterval}
                    onChangeText={onUrlRotationIntervalChange}
                    placeholder="30"
                    keyboardType="numeric"
                    hint={t('general.rotationIntervalHint')}
                  />

                  {urlRotationList.length < 2 && (
                    <SettingsInfoBox variant="warning">
                      <Text style={styles.infoText}>
                        {t('general.rotationMinTwoUrls')}
                      </Text>
                    </SettingsInfoBox>
                  )}
                </>
              )}
            </>
          )}
        </SettingsSection>
      )}
      
      {/* URL Planner (WebView mode only) */}
      {displayMode === 'webview' && (
        <SettingsSection title={t('general.urlPlanner')} icon="calendar-clock">
          <SettingsSwitch
            label={t('general.enableScheduledUrls')}
            value={urlPlannerEnabled}
            onValueChange={onUrlPlannerEnabledChange}
            hint={t('general.enableScheduledUrlsHint')}
          />
          
          {urlPlannerEnabled && (
            <>
              <SettingsInfoBox variant="info">
                <Text style={styles.infoText}>
                  {t('general.urlPlannerPriorityInfo')}
                </Text>
              </SettingsInfoBox>
              
              <View style={styles.rotationSpacer} />
              
              <ScheduleEventList
                events={urlPlannerEvents}
                onEventsChange={onUrlPlannerEventsChange}
                onAddRecurring={onAddRecurringEvent}
                onAddOneTime={onAddOneTimeEvent}
                onEditEvent={onEditEvent}
              />
            </>
          )}
        </SettingsSection>
      )}
      
      {/* External App Sub-Mode Selection */}
      {displayMode === 'external_app' && (
        <>
          <SettingsSection title={t('general.appMode')} icon="apps">
            <SettingsModeSelector
              options={[
                { value: 'single', label: t('general.singleApp'), icon: 'cellphone' },
                { value: 'multi', label: t('general.multiApp'), icon: 'view-grid', badge: 'BETA', badgeColor: Colors.warning },
              ]}
              value={externalAppMode}
              onValueChange={(value) => onExternalAppModeChange(value as 'single' | 'multi')}
              hint={externalAppMode === 'single'
                ? t('general.singleAppHint')
                : t('general.multiAppHint')}
            />
          </SettingsSection>
          
          {/* Single App: classic package name + picker */}
          {externalAppMode === 'single' && (
            <SettingsSection title={t('general.application')} icon="cellphone-link">
              <SettingsInput
                label={t('general.packageName')}
                value={externalAppPackage}
                onChangeText={onExternalAppPackageChange}
                placeholder="com.example.app"
                hint={t('general.packageNameHint')}
              />
              
              <SettingsButton
                title={loadingApps ? t('general.loadingApps') : t('general.chooseApplication')}
                icon="format-list-bulleted"
                variant="success"
                onPress={onPickApp}
                disabled={loadingApps}
                loading={loadingApps}
              />
            </SettingsSection>
          )}
          
          {/* Multi App: managed apps grid */}
          {externalAppMode === 'multi' && (
            <SettingsSection title={t('general.applications')} icon="view-grid">
              <SettingsInfoBox variant="info">
                <Text style={styles.infoText}>
                  {t('general.multiAppInfo')}
                </Text>
              </SettingsInfoBox>
              <ManagedAppsSection
                managedApps={managedApps}
                onManagedAppsChange={onManagedAppsChange}
                isDeviceOwner={isDeviceOwner}
              />
            </SettingsSection>
          )}
          
          {/* Managed Apps for Single App mode (optional, for background/accessibility features) */}
          {externalAppMode === 'single' && (
            <SettingsSection title={t('general.additionalManagedApps')} icon="apps">
              <SettingsInfoBox variant="info">
                <Text style={styles.infoText}>
                  {t('general.additionalManagedAppsInfo')}
                </Text>
              </SettingsInfoBox>
              <ManagedAppsSection
                managedApps={managedApps}
                onManagedAppsChange={onManagedAppsChange}
                isDeviceOwner={isDeviceOwner}
              />
            </SettingsSection>
          )}
          
          {/* Overlay Permission */}
          <SettingsSection
            variant={hasOverlayPermission ? 'success' : 'warning'}
          >
            <View style={styles.permissionRow}>
              <View style={styles.permissionTextContainer}>
                <Text style={[styles.permissionTitle, { color: hasOverlayPermission ? Colors.successDark : Colors.warningDark }]}>
                  {hasOverlayPermission ? t('general.overlayEnabled') : t('general.overlayRequired')}
                </Text>
                <Text style={styles.permissionHint}>
                  {hasOverlayPermission
                    ? t('general.overlayEnabledHint')
                    : t('general.overlayRequiredHint')}
                </Text>
              </View>
            </View>
            
            {!hasOverlayPermission && (
              <SettingsButton
                title={t('general.enablePermission')}
                variant="success"
                onPress={onRequestOverlayPermission}
              />
            )}
          </SettingsSection>
          
          {/* Usage Stats Permission - required for auto-relaunch monitoring */}
          <SettingsSection
            variant={hasUsageStatsPermission ? 'success' : 'warning'}
          >
            <View style={styles.permissionRow}>
              <View style={styles.permissionTextContainer}>
                <Text style={[styles.permissionTitle, { color: hasUsageStatsPermission ? Colors.successDark : Colors.warningDark }]}>
                  {hasUsageStatsPermission ? t('general.usageAccessGranted') : t('general.usageAccessRequired')}
                </Text>
                <Text style={styles.permissionHint}>
                  {hasUsageStatsPermission
                    ? t('general.usageAccessGrantedHint')
                    : t('general.usageAccessRequiredHint')}
                </Text>
              </View>
            </View>
            
            {!hasUsageStatsPermission && (
              <SettingsButton
                title={t('general.grantUsageAccess')}
                variant="warning"
                onPress={onRequestUsageStatsPermission}
              />
            )}
          </SettingsSection>
        </>
      )}
      
      {/* Password Configuration */}
      <SettingsSection title={t('general.passwordSection')} icon="pin">
        <SettingsSwitch
          label={t('general.advancedPasswordMode')}
          hint={t('general.advancedPasswordModeHint')}
          value={pinMode === 'alphanumeric'}
          onValueChange={(enabled) => onPinModeChange(enabled ? 'alphanumeric' : 'numeric')}
        />
        
        <SettingsInput
          label=""
          value={pin}
          onChangeText={onPinChange}
          placeholder={isPinConfigured && !pinModeChanged ? '••••' : '1234'}
          keyboardType={pinMode === 'alphanumeric' ? 'default' : 'numeric'}
          secureTextEntry
          maxLength={pinMode === 'alphanumeric' ? undefined : 6}
          autoCapitalize={pinMode === 'alphanumeric' ? 'none' : undefined}
          error={pinModeChanged && !pin ? t('general.pinRequiredAfterModeChange') : undefined}
          hint={pinModeChanged
            ? t('general.pinModeChangedHint')
            : isPinConfigured
              ? t('general.pinConfiguredHint')
              : pinMode === 'alphanumeric'
                ? t('general.pinAlphanumericHint')
                : t('general.pinNumericHint')}
        />
        
        <View style={styles.pinAttemptsContainer}>
          <SettingsInput
            label={t('general.maxAttemptsLockout')}
            value={pinMaxAttemptsText}
            onChangeText={onPinMaxAttemptsChange}
            onBlur={onPinMaxAttemptsBlur}
            keyboardType="numeric"
            maxLength={3}
            placeholder="5"
            hint={t('general.maxAttemptsHint')}
          />
        </View>
      </SettingsSection>
      
      {/* Inactivity Return to Home - WebView only */}
      {displayMode === 'webview' && (
        <SettingsSection title={t('general.inactivityReturn')} icon="timer-sand">
          <SettingsSwitch
            label={t('general.inactivityReturnEnable')}
            value={inactivityReturnEnabled}
            onValueChange={onInactivityReturnEnabledChange}
            hint={t('general.inactivityReturnHint')}
          />
          
          {inactivityReturnEnabled && (
            <>
              <View style={styles.rotationSpacer} />
              <SettingsInput
                label={t('general.inactivityTimeoutSeconds')}
                value={inactivityReturnDelay}
                onChangeText={onInactivityReturnDelayChange}
                placeholder="60"
                keyboardType="numeric"
                hint={t('general.inactivityTimeoutHint')}
              />
              
              <View style={styles.rotationSpacer} />
              <SettingsSwitch
                label={t('general.resetTimerOnPageLoad')}
                value={inactivityReturnResetOnNav}
                onValueChange={onInactivityReturnResetOnNavChange}
                hint={t('general.resetTimerOnPageLoadHint')}
              />
              
              <SettingsSwitch
                label={t('general.clearCacheOnReturn')}
                value={inactivityReturnClearCache}
                onValueChange={onInactivityReturnClearCacheChange}
                hint={t('general.clearCacheOnReturnHint')}
              />
              
              <SettingsSwitch
                label={t('general.scrollToTopOnStart')}
                value={inactivityReturnScrollTop}
                onValueChange={onInactivityReturnScrollTopChange}
                hint={t('general.scrollToTopOnStartHint')}
              />
              
              <SettingsInfoBox variant="info">
                <Text style={styles.infoText}>
                  {t('general.inactivityReturnInfo')}
                </Text>
              </SettingsInfoBox>
            </>
          )}
        </SettingsSection>
      )}
      
      {/* Auto Reload - WebView only */}
      {displayMode === 'webview' && (
        <SettingsSection title={t('general.autoReloadSection')} icon="refresh">
          <SettingsSwitch
            label={t('general.reloadOnError')}
            hint={t('general.reloadOnErrorHint')}
            value={autoReload}
            onValueChange={onAutoReloadChange}
          />
        </SettingsSection>
      )}
      
      {/* PDF Viewer - WebView only */}
      {displayMode === 'webview' && (
        <SettingsSection title={t('general.pdfViewer')} icon="file-pdf-box">
          <SettingsSwitch
            label={t('general.inlinePdfViewer')}
            hint={t('general.inlinePdfViewerHint')}
            value={pdfViewerEnabled}
            onValueChange={onPdfViewerEnabledChange}
          />
          
          {pdfViewerEnabled && (
            <SettingsInfoBox variant="info">
              <Text style={styles.infoText}>
                {t('general.pdfViewerInfo')}
              </Text>
            </SettingsInfoBox>
          )}
        </SettingsSection>
      )}
      
      {/* Printing - WebView only */}
      {displayMode === 'webview' && (
        <SettingsSection title={t('general.printing')} icon="printer">
          <SettingsSwitch
            label={t('general.allowPrinting')}
            hint={t('general.allowPrintingHint')}
            value={printEnabled}
            onValueChange={onPrintEnabledChange}
          />
          
          {printEnabled && (
            <>
              <View style={styles.rotationSpacer} />
              <SettingsRadioGroup
                label={t('general.defaultPaperSize')}
                options={[
                  { value: 'A4',     label: t('general.paperA4') },
                  { value: 'A5',     label: t('general.paperA5') },
                  { value: 'A3',     label: t('general.paperA3') },
                  { value: 'LETTER', label: t('general.paperLetter') },
                  { value: 'LEGAL',  label: t('general.paperLegal') },
                ]}
                value={printPaperSize}
                onValueChange={onPrintPaperSizeChange}
              />
            </>
          )}

          {printEnabled && (
            <SettingsInfoBox variant="info">
              <Text style={styles.infoText}>
                {t('general.printingInfo')}
              </Text>
            </SettingsInfoBox>
          )}
        </SettingsSection>
      )}
      
      {/* WebView Back Button - WebView only */}
      {displayMode === 'webview' && (
        <SettingsSection title={t('general.webNavButton')} icon="arrow-left-circle">
          <SettingsSwitch
            label={t('general.enableBackButton')}
            hint={t('general.enableBackButtonHint')}
            value={webViewBackButtonEnabled}
            onValueChange={onWebViewBackButtonEnabledChange}
          />
          
          {webViewBackButtonEnabled && (
            <>
              <View style={styles.rotationSpacer} />
              <SettingsInfoBox variant="info">
                <Text style={styles.infoText}>
                  {t('general.webNavButtonInfo')}
                </Text>
              </SettingsInfoBox>
              
              <View style={styles.rotationSpacer} />
              <SettingsInput
                label={t('general.positionXPercent')}
                value={webViewBackButtonXPercent}
                onChangeText={onWebViewBackButtonXPercentChange}
                placeholder="2"
                keyboardType="numeric"
                hint={t('general.positionXHint')}
              />
              
              <SettingsInput
                label={t('general.positionYPercent')}
                value={webViewBackButtonYPercent}
                onChangeText={onWebViewBackButtonYPercentChange}
                placeholder="10"
                keyboardType="numeric"
                hint={t('general.positionYHint')}
              />
              
              <SettingsButton
                title={t('general.resetDefaultPosition')}
                icon="restore"
                variant="outline"
                onPress={onResetWebViewBackButtonPosition}
              />
            </>
          )}
        </SettingsSection>
      )}
      
      {/* Background Apps - WebView mode only */}
      {displayMode === 'webview' && (
        <SettingsSection title={t('general.backgroundApps')} icon="apps">
          <SettingsInfoBox variant="info">
            <Text style={styles.infoText}>
              {t('general.backgroundAppsInfo')}
            </Text>
          </SettingsInfoBox>
          <ManagedAppsSection
            managedApps={managedApps}
            onManagedAppsChange={onManagedAppsChange}
            isDeviceOwner={isDeviceOwner}
            showHomeScreenToggle={false}
          />
        </SettingsSection>
      )}

      {/* Back to Kiosk Button */}
      <SettingsButton
        title={t('general.backToKiosk')}
        icon="arrow-u-left-top"
        variant="outline"
        onPress={onBackToKiosk}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  infoText: {
    ...Typography.body,
    lineHeight: 22,
  },
  infoTitle: {
    ...Typography.label,
    color: Colors.infoDark,
    marginBottom: Spacing.sm,
  },
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  permissionTextContainer: {
    flex: 1,
  },
  permissionTitle: {
    ...Typography.label,
    marginBottom: 4,
  },
  permissionHint: {
    ...Typography.hint,
  },
  pinAttemptsContainer: {
    marginTop: Spacing.lg,
  },
  rotationSpacer: {
    height: Spacing.md,
  },
  mediaItemCard: {
    backgroundColor: Colors.surfaceVariant,
    borderRadius: 10,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  mediaItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  mediaItemIndex: {
    ...Typography.label,
    color: Colors.textSecondary,
    width: 24,
    textAlign: 'center',
    fontSize: 14,
  },
  mediaItemTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginLeft: 8,
  },
  mediaItemTypeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  mediaItemDeleteBtn: {
    marginLeft: 'auto',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.errorLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaItemDeleteText: {
    color: Colors.error,
    fontSize: 16,
    fontWeight: 'bold',
  },
  pickButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.md,
  },
  pickButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickButtonDisabled: {
    opacity: 0.5,
  },
  pickButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  pickButtonSmall: {
    width: 48,
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickButtonSmallText: {
    fontSize: 20,
  },
  localBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: Colors.successLight,
    marginLeft: 6,
  },
  localBadgeText: {
    color: Colors.success,
    fontSize: 11,
    fontWeight: '600',
  },
  localFileInfo: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  localFileName: {
    ...Typography.label,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  localFilePath: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontSize: 11,
  },
});

export default GeneralTab;
