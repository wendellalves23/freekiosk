/**
 * FreeKiosk v1.2 - Display Tab
 * Brightness, Status Bar, Keyboard settings
 */

import React from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import {
  SettingsSection,
  SettingsSwitch,
  SettingsSlider,
  SettingsRadioGroup,
  SettingsInfoBox,
  SettingsInput,
} from '../../../components/settings';
import ScreenScheduleRuleCard from '../../../components/settings/ScreenScheduleRuleCard';
import { Colors, Spacing, Typography } from '../../../theme';
import { ScreenScheduleRule } from '../../../types/screenScheduler';
import type { MediaItem } from '../../../types/mediaPlayer';
import { getMediaDisplayName } from '../../../types/mediaPlayer';
import { isFilarePanelUrl } from '../../../utils/filarePanelUrl';
import { t } from '../../../i18n';

interface DisplayTabProps {
  displayMode: 'webview' | 'external_app' | 'media_player';
  
  // Brightness management (allow system to manage)
  brightnessManagementEnabled: boolean;
  onBrightnessManagementEnabledChange: (value: boolean) => void;
  
  // Default brightness
  defaultBrightness: number;
  onDefaultBrightnessChange: (value: number) => void;
  
  // Auto-brightness
  autoBrightnessEnabled: boolean;
  onAutoBrightnessEnabledChange: (value: boolean) => void;
  autoBrightnessMin: number;
  onAutoBrightnessMinChange: (value: number) => void;
  autoBrightnessMax: number;
  onAutoBrightnessMaxChange: (value: number) => void;
  autoBrightnessOffset: number;
  onAutoBrightnessOffsetChange: (value: number) => void;
  currentLightLevel: number;
  hasLightSensor: boolean;
  
  // Status bar
  statusBarEnabled: boolean;
  onStatusBarEnabledChange: (value: boolean) => void;
  statusBarOnOverlay: boolean;
  onStatusBarOnOverlayChange: (value: boolean) => void;
  statusBarOnReturn: boolean;
  onStatusBarOnReturnChange: (value: boolean) => void;
  
  // Status bar items
  showBattery: boolean;
  onShowBatteryChange: (value: boolean) => void;
  showWifi: boolean;
  onShowWifiChange: (value: boolean) => void;
  showBluetooth: boolean;
  onShowBluetoothChange: (value: boolean) => void;
  showVolume: boolean;
  onShowVolumeChange: (value: boolean) => void;
  showTime: boolean;
  onShowTimeChange: (value: boolean) => void;
  statusBarTheme: 'dark' | 'light';
  onStatusBarThemeChange: (value: string) => void;
  
  // Keyboard mode
  keyboardMode: string;
  onKeyboardModeChange: (value: string) => void;
  
  // WebView Zoom Level
  zoomLevel: number;
  onZoomLevelChange: (value: number) => void;
  disableUserZoom: boolean;
  onDisableUserZoomChange: (value: boolean) => void;
  panelDebugOverlay: boolean;
  onPanelDebugOverlayChange: (value: boolean) => void;
  kioskUrl: string;
  
  // Custom User Agent
  customUserAgent: string;
  onCustomUserAgentChange: (value: string) => void;
  
  // Screensaver
  screensaverEnabled: boolean;
  onScreensaverEnabledChange: (value: boolean) => void;
  screensaverBrightness: number;
  onScreensaverBrightnessChange: (value: number) => void;
  inactivityDelay: string;
  onInactivityDelayChange: (value: string) => void;

  // Screensaver style (dim/url/video)
  screensaverType: 'dim' | 'url' | 'video';
  onScreensaverTypeChange: (value: 'dim' | 'url' | 'video') => void;
  screensaverUrl: string;
  onScreensaverUrlChange: (value: string) => void;
  screensaverVideoItems: MediaItem[];
  onScreensaverVideoItemsChange: (items: MediaItem[]) => void;
  screensaverVideoLoop: boolean;
  onScreensaverVideoLoopChange: (value: boolean) => void;
  onPickScreensaverMedia: (type: 'video' | 'image' | 'any') => void;
  pickingScreensaverMedia: boolean;

  // Motion detection
  motionEnabled: boolean;
  onMotionEnabledChange: (value: boolean) => void;
  motionSensitivity: 'low' | 'medium' | 'high';
  onMotionSensitivityChange: (value: 'low' | 'medium' | 'high') => void;
  motionCameraPosition: 'front' | 'back';
  onMotionCameraPositionChange: (value: 'front' | 'back') => void;
  availableCameras: Array<{position: 'front' | 'back', id: string}>;
  
  // Screen Sleep Scheduler
  screenSchedulerEnabled: boolean;
  onScreenSchedulerEnabledChange: (value: boolean) => void;
  screenSchedulerRules: ScreenScheduleRule[];
  onScreenSchedulerRulesChange: (rules: ScreenScheduleRule[]) => void;
  screenSchedulerWakeOnTouch: boolean;
  onScreenSchedulerWakeOnTouchChange: (value: boolean) => void;
  onAddScheduleRule: () => void;
  onEditScheduleRule: (rule: ScreenScheduleRule) => void;
  
  // Keep Screen On
  keepScreenOn: boolean;
  onKeepScreenOnChange: (value: boolean) => void;

  // Auto Wake on Screen Off
  autoWakeOnScreenOff: boolean;
  onAutoWakeOnScreenOffChange: (value: boolean) => void;
}

const DisplayTab: React.FC<DisplayTabProps> = ({
  displayMode,
  brightnessManagementEnabled,
  onBrightnessManagementEnabledChange,
  defaultBrightness,
  onDefaultBrightnessChange,
  autoBrightnessEnabled,
  onAutoBrightnessEnabledChange,
  autoBrightnessMin,
  onAutoBrightnessMinChange,
  autoBrightnessMax,
  onAutoBrightnessMaxChange,
  autoBrightnessOffset,
  onAutoBrightnessOffsetChange,
  currentLightLevel,
  hasLightSensor,
  statusBarEnabled,
  onStatusBarEnabledChange,
  statusBarOnOverlay,
  onStatusBarOnOverlayChange,
  statusBarOnReturn,
  onStatusBarOnReturnChange,
  showBattery,
  onShowBatteryChange,
  showWifi,
  onShowWifiChange,
  showBluetooth,
  onShowBluetoothChange,
  showVolume,
  onShowVolumeChange,
  showTime,
  onShowTimeChange,
  statusBarTheme,
  onStatusBarThemeChange,
  keyboardMode,
  onKeyboardModeChange,
  zoomLevel,
  onZoomLevelChange,
  disableUserZoom,
  onDisableUserZoomChange,
  panelDebugOverlay,
  onPanelDebugOverlayChange,
  kioskUrl,
  customUserAgent,
  onCustomUserAgentChange,
  screensaverEnabled,
  onScreensaverEnabledChange,
  screensaverBrightness,
  onScreensaverBrightnessChange,
  inactivityDelay,
  onInactivityDelayChange,
  screensaverType,
  onScreensaverTypeChange,
  screensaverUrl,
  onScreensaverUrlChange,
  screensaverVideoItems,
  onScreensaverVideoItemsChange,
  screensaverVideoLoop,
  onScreensaverVideoLoopChange,
  onPickScreensaverMedia,
  pickingScreensaverMedia,
  motionEnabled,
  onMotionEnabledChange,
  motionSensitivity,
  onMotionSensitivityChange,
  motionCameraPosition,
  onMotionCameraPositionChange,
  availableCameras,
  screenSchedulerEnabled,
  onScreenSchedulerEnabledChange,
  screenSchedulerRules,
  onScreenSchedulerRulesChange,
  screenSchedulerWakeOnTouch,
  onScreenSchedulerWakeOnTouchChange,
  keepScreenOn,
  onKeepScreenOnChange,
  autoWakeOnScreenOff,
  onAutoWakeOnScreenOffChange,
  onAddScheduleRule,
  onEditScheduleRule,
}) => {
  const handleCameraPositionChange = (value: string) => {
    if (value === 'front' || value === 'back') {
      onMotionCameraPositionChange(value);
    }
  };

  const handleMotionSensitivityChange = (value: string) => {
    if (value === 'low' || value === 'medium' || value === 'high') {
      onMotionSensitivityChange(value);
    }
  };

  // Generate camera options from available cameras (deduplicated by position)
  const uniquePositions = Array.from(new Set(availableCameras.map(cam => cam.position)));
  const cameraOptions = uniquePositions.map(position => ({
    label: position === 'front' ? t('display.cameraFrontLabel') : t('display.cameraBackLabel'),
    value: position,
  }));

  // Check whether the selected camera is available on this device
  const selectedCameraAvailable = availableCameras.some(cam => cam.position === motionCameraPosition);
  const filarePanelUrl = isFilarePanelUrl(kioskUrl);

  return (
    <View>
      {/* App Brightness Control toggle - WebView mode only (external app mode doesn't manage brightness) */}
      {displayMode !== 'external_app' && (
        <SettingsSection title={t('display.brightnessControl')} icon="brightness-6">
          <SettingsSwitch
            label={t('display.appBrightnessControl')}
            hint={brightnessManagementEnabled
              ? t('display.appManagesBrightness')
              : t('display.systemManagesBrightness')}
            value={brightnessManagementEnabled}
            onValueChange={onBrightnessManagementEnabledChange}
          />
          {!brightnessManagementEnabled && (
            <SettingsInfoBox variant="info">
              <Text style={styles.infoText}>
                {t('display.brightnessSystemInfo')}
              </Text>
            </SettingsInfoBox>
          )}
        </SettingsSection>
      )}

      {/* Default Brightness - Only in WebView mode and when app manages brightness */}
      {displayMode !== 'external_app' && brightnessManagementEnabled && (
        <SettingsSection title={t('display.manualBrightness')} icon="brightness-6">
          <SettingsSlider
            label=""
            hint={autoBrightnessEnabled 
              ? t('display.manualDisabledAuto')
              : t('display.manualBrightnessHint')}
            value={defaultBrightness}
            onValueChange={onDefaultBrightnessChange}
            minimumValue={0}
            maximumValue={1}
            step={0.01}
            disabled={autoBrightnessEnabled}
          />
          {autoBrightnessEnabled && (
            <SettingsInfoBox variant="warning">
              <Text style={styles.infoText}>
                {t('display.manualDisabledWarning')}
              </Text>
            </SettingsInfoBox>
          )}
        </SettingsSection>
      )}
      
      {/* Auto-Brightness - WebView only, and only when app manages brightness */}
      {displayMode !== 'external_app' && brightnessManagementEnabled && (
        <SettingsSection title={t('display.autoBrightness')} icon="brightness-auto">
          <SettingsSwitch
            label={t('display.enableAutoBrightness')}
            hint={t('display.autoBrightnessHint')}
            value={autoBrightnessEnabled}
            onValueChange={onAutoBrightnessEnabledChange}
            disabled={!hasLightSensor}
          />
          
          {!hasLightSensor && (
            <SettingsInfoBox variant="error">
              <Text style={styles.infoText}>
                {t('display.lightSensorUnavailable')}
              </Text>
            </SettingsInfoBox>
          )}
          
          {hasLightSensor && autoBrightnessEnabled && (
            <>
              <SettingsSlider
                label={t('display.minBrightness')}
                hint={t('display.minBrightnessHint')}
                value={autoBrightnessMin}
                onValueChange={onAutoBrightnessMinChange}
                minimumValue={0}
                maximumValue={1}
                step={0.05}
                presets={[
                  { label: '5%', value: 0.05 },
                  { label: '10%', value: 0.1 },
                  { label: '20%', value: 0.2 },
                ]}
              />
              
              <SettingsSlider
                label={t('display.maxBrightness')}
                hint={t('display.maxBrightnessHint')}
                value={autoBrightnessMax}
                onValueChange={onAutoBrightnessMaxChange}
                minimumValue={0}
                maximumValue={1}
                step={0.05}
                presets={[
                  { label: '80%', value: 0.8 },
                  { label: '90%', value: 0.9 },
                  { label: '100%', value: 1.0 },
                ]}
              />
              
              <SettingsSlider
                label={t('display.brightnessOffset')}
                hint={t('display.brightnessOffsetHint')}
                value={autoBrightnessOffset}
                onValueChange={onAutoBrightnessOffsetChange}
                minimumValue={0}
                maximumValue={0.5}
                step={0.05}
                presets={[
                  { label: '0%', value: 0 },
                  { label: '+10%', value: 0.1 },
                  { label: '+20%', value: 0.2 },
                ]}
              />
              
              <SettingsInfoBox variant="info">
                <Text style={styles.infoText}>
                  {t('display.currentLightLevel', { value: currentLightLevel.toFixed(1) })}
                </Text>
              </SettingsInfoBox>
            </>
          )}
        </SettingsSection>
      )}
      
      {/* Screen Always On - WebView mode only (external app mode: system manages screen) */}
      {displayMode !== 'external_app' && (
      <SettingsSection title={t('display.screenAlwaysOn')} icon="monitor">
        <SettingsSwitch
          label={t('display.keepScreenOn')}
          hint={keepScreenOn
            ? t('display.keepScreenOnEnabled')
            : t('display.keepScreenOnDisabled')}
          value={keepScreenOn}
          onValueChange={onKeepScreenOnChange}
        />
        {!keepScreenOn && (
          <SettingsInfoBox variant="warning">
            <Text style={styles.infoText}>
              {t('display.screenTimeoutWarning')}
            </Text>
          </SettingsInfoBox>
        )}
        <SettingsSwitch
          label={t('display.autoWakeOnScreenOff')}
          hint={autoWakeOnScreenOff
            ? t('display.autoWakeEnabled')
            : t('display.autoWakeDisabled')}
          value={autoWakeOnScreenOff}
          onValueChange={onAutoWakeOnScreenOffChange}
        />
        {autoWakeOnScreenOff && (
          <SettingsInfoBox variant="info">
            <Text style={styles.infoText}>
              {t('display.autoWakeInfo')}
            </Text>
          </SettingsInfoBox>
        )}
      </SettingsSection>
      )}
      
      {/* Screensaver - available in all display modes (keepScreenOn required for webview/media_player) */}
      {(displayMode === 'external_app' || keepScreenOn) && (
        <SettingsSection title={t('display.screensaver')} icon="weather-night">
          <SettingsSwitch
            label={t('display.enableScreensaver')}
            hint={t('display.enableScreensaverHint')}
            value={screensaverEnabled}
            onValueChange={onScreensaverEnabledChange}
          />

          {screensaverEnabled && (
            <>
              {/* Screensaver Style (dim / url / video) */}
              <View style={styles.subSection}>
                <Text style={styles.subSectionTitle}>{t('display.screensaverStyle')}</Text>
                <SettingsRadioGroup
                  options={[
                    { label: t('display.ssDimOnly'), value: 'dim', hint: t('display.ssDimOnlyHint') },
                    { label: t('display.ssWebPage'), value: 'url', hint: t('display.ssWebPageHint') },
                    { label: t('display.ssVideoImage'), value: 'video', hint: t('display.ssVideoImageHint') },
                  ]}
                  value={screensaverType}
                  onValueChange={(v) => onScreensaverTypeChange(v as 'dim' | 'url' | 'video')}
                />

                {screensaverType === 'url' && (
                  <>
                    <SettingsInput
                      label={t('display.screensaverUrl')}
                      value={screensaverUrl}
                      onChangeText={onScreensaverUrlChange}
                      placeholder={t('display.screensaverUrlPlaceholder')}
                      keyboardType="url"
                      autoCapitalize="none"
                      hint={t('display.screensaverUrlHint')}
                    />
                    {screensaverUrl.trim().length > 0 && (() => {
                      try { new URL(screensaverUrl.trim()); return null; } catch {
                        return (
                          <SettingsInfoBox variant="error">
                            <Text style={styles.infoText}>
                              {t('display.screensaverInvalidUrl')}
                            </Text>
                          </SettingsInfoBox>
                        );
                      }
                    })()}
                  </>
                )}

                {screensaverType === 'video' && (
                  <>
                    <SettingsInfoBox variant="info">
                      <Text style={styles.infoText}>
                        {t('display.screensaverPickInfo')}
                      </Text>
                    </SettingsInfoBox>
                    <TouchableOpacity
                      style={[styles.ssPickButton, pickingScreensaverMedia && styles.ssPickButtonDisabled]}
                      onPress={() => !pickingScreensaverMedia && onPickScreensaverMedia('any')}
                      disabled={pickingScreensaverMedia}
                    >
                      <Text style={styles.ssPickButtonText}>
                        {pickingScreensaverMedia ? t('display.pickingMedia') : t('display.pickFromDevice')}
                      </Text>
                    </TouchableOpacity>

                    {screensaverVideoItems.map((item, index) => (
                      <View key={item.id} style={styles.ssMediaCard}>
                        <Text style={styles.ssMediaIndex}>{index + 1}</Text>
                        <Text style={styles.ssMediaName} numberOfLines={1}>
                          {item.type === 'video' ? '🎥 ' : '🖼️ '}{getMediaDisplayName(item)}
                        </Text>
                        <TouchableOpacity
                          onPress={() => {
                            onScreensaverVideoItemsChange(screensaverVideoItems.filter(i => i.id !== item.id));
                          }}
                        >
                          <Text style={styles.ssMediaDelete}>✗</Text>
                        </TouchableOpacity>
                      </View>
                    ))}

                    <SettingsSwitch
                      label={t('display.loopPlaylist')}
                      hint={t('display.loopPlaylistHint')}
                      value={screensaverVideoLoop}
                      onValueChange={onScreensaverVideoLoopChange}
                    />

                    {screensaverVideoItems.length === 0 && (
                      <SettingsInfoBox variant="warning">
                        <Text style={styles.infoText}>
                          {t('display.noMediaSelected')}
                        </Text>
                      </SettingsInfoBox>
                    )}
                  </>
                )}

                {(screensaverType === 'url' || screensaverType === 'video') && screensaverBrightness < 0.1 && brightnessManagementEnabled && (
                  <SettingsInfoBox variant="warning">
                    <Text style={styles.infoText}>
                      {t('display.ssBrightnessLowWarning')}
                    </Text>
                  </SettingsInfoBox>
                )}
              </View>

              {/* Screensaver Brightness - only when app manages brightness */}
              {brightnessManagementEnabled && (
                <View style={styles.subSection}>
                  <Text style={styles.subSectionTitle}>{t('display.screensaverBrightness')}</Text>
                  <SettingsSlider
                    label=""
                    hint={t('display.screensaverBrightnessHint')}
                    value={screensaverBrightness}
                    onValueChange={onScreensaverBrightnessChange}
                    minimumValue={0}
                    maximumValue={1}
                    step={0.01}
                    presets={[
                      { label: t('display.presetBlackScreen'), value: 0 },
                      { label: t('display.presetVeryDim'), value: 0.05 },
                      { label: t('display.presetDim'), value: 0.1 },
                    ]}
                  />
                </View>
              )}
              
              {/* Inactivity Delay */}
              <View style={styles.subSection}>
                <Text style={styles.subSectionTitle}>{t('display.inactivityDelay')}</Text>
                <SettingsInput
                  label=""
                  value={inactivityDelay}
                  onChangeText={(text) => {
                    if (/^\d*$/.test(text)) {
                      onInactivityDelayChange(text);
                    }
                  }}
                  keyboardType="numeric"
                  maxLength={3}
                  placeholder="10"
                  hint={t('display.inactivityDelayHint')}
                />
              </View>
              
              {/* Motion Detection */}
              <View style={styles.subSection}>
                <Text style={styles.subSectionTitle}>{t('display.motionDetection')}</Text>
                <SettingsSwitch
                  label={t('display.enableDetection')}
                  hint={t('display.enableDetectionHint')}
                  value={motionEnabled}
                  onValueChange={onMotionEnabledChange}
                />
                
                {motionEnabled && (
                  <>
                    <SettingsRadioGroup
                      label={t('display.sensitivity')}
                      hint={t('display.sensitivityHint')}
                      options={[
                        { label: t('display.sensitivityLow'), value: 'low' },
                        { label: t('display.sensitivityMedium'), value: 'medium' },
                        { label: t('display.sensitivityHigh'), value: 'high' },
                      ]}
                      value={motionSensitivity}
                      onValueChange={handleMotionSensitivityChange}
                    />

                    {availableCameras.length === 0 && (
                      <SettingsInfoBox variant="error">
                        <Text style={styles.infoText}>
                          {t('display.noCameraDetected')}
                        </Text>
                      </SettingsInfoBox>
                    )}
                    
                    {availableCameras.length === 1 && (
                      <SettingsInfoBox variant="info">
                        <Text style={styles.infoText}>
                          {t('display.usingSingleCamera', {
                            position: availableCameras[0].position === 'front'
                              ? t('display.cameraFront')
                              : t('display.cameraBack'),
                          })}
                        </Text>
                      </SettingsInfoBox>
                    )}
                    
                    {availableCameras.length > 1 && (
                      <>
                        <SettingsRadioGroup
                          label={t('display.cameraPosition')}
                          hint={t('display.cameraPositionHint')}
                          options={cameraOptions}
                          value={motionCameraPosition}
                          onValueChange={handleCameraPositionChange}
                        />
                        
                        {!selectedCameraAvailable && (
                          <SettingsInfoBox variant="warning">
                            <Text style={styles.infoText}>
                              {t('display.selectedCameraUnavailable')}
                            </Text>
                          </SettingsInfoBox>
                        )}
                      </>
                    )}

                  </>
                )}
              </View>
              
              {/* How it works */}
              <View style={styles.subSection}>
                <Text style={styles.infoTitle}>{t('display.howItWorks')}</Text>
                <Text style={styles.infoText}>
                  {t('display.howItWorksLine1', { minutes: inactivityDelay || '10' })}{`\n`}
                  {displayMode === 'external_app'
                    ? `${t('display.howItWorksExternalApp')}\n`
                    : ''}
                  {t('display.howItWorksTouch')}{`\n`}
                  {motionEnabled ? `${t('display.howItWorksMotion')}\n` : ''}
                  {t('display.howItWorksRestore')}
                </Text>
              </View>
            </>
          )}
        </SettingsSection>
      )}
      
      {/* Screen Sleep Scheduler */}
      <SettingsSection title={t('display.screenSleepSchedule')} icon="power-sleep">
        <SettingsSwitch
          label={t('display.enableScreenSchedule')}
          hint={t('display.enableScreenScheduleHint')}
          value={screenSchedulerEnabled}
          onValueChange={onScreenSchedulerEnabledChange}
        />
        
        {screenSchedulerEnabled && (
          <>
            {/* Schedule Rules List */}
            <View style={styles.subSection}>
              <Text style={styles.subSectionTitle}>{t('display.scheduleRules')}</Text>
              {screenSchedulerRules.length === 0 ? (
                <SettingsInfoBox variant="info">
                  <Text style={styles.infoText}>
                    {t('display.noScheduleRules')}
                  </Text>
                </SettingsInfoBox>
              ) : (
                <View style={styles.rulesContainer}>
                  {screenSchedulerRules.map((rule) => (
                    <ScreenScheduleRuleCard
                      key={rule.id}
                      rule={rule}
                      onToggle={(id, enabled) => {
                        onScreenSchedulerRulesChange(
                          screenSchedulerRules.map(r =>
                            r.id === id ? { ...r, enabled } : r
                          )
                        );
                      }}
                      onEdit={onEditScheduleRule}
                      onDelete={(id) => {
                        Alert.alert(
                          t('display.deleteRuleTitle'),
                          t('display.deleteRuleMessage'),
                          [
                            { text: t('common.cancel'), style: 'cancel' },
                            {
                              text: t('display.delete'),
                              style: 'destructive',
                              onPress: () => {
                                onScreenSchedulerRulesChange(
                                  screenSchedulerRules.filter(r => r.id !== id)
                                );
                              },
                            },
                          ]
                        );
                      }}
                    />
                  ))}
                </View>
              )}
              
              <TouchableOpacity style={styles.addRuleButton} onPress={onAddScheduleRule}>
                <Text style={styles.addRuleButtonText}>{t('display.addScheduleRule')}</Text>
              </TouchableOpacity>
            </View>
            
            {/* Wake on Touch option */}
            <View style={styles.subSection}>
              <Text style={styles.subSectionTitle}>{t('display.wakeOptions')}</Text>
              <SettingsSwitch
                label={t('display.wakeOnTouch')}
                hint={t('display.wakeOnTouchHint')}
                value={screenSchedulerWakeOnTouch}
                onValueChange={onScreenSchedulerWakeOnTouchChange}
              />
              {!screenSchedulerWakeOnTouch && (
                <SettingsInfoBox variant="warning">
                  <Text style={styles.infoText}>
                    {t('display.wakeOnTouchDisabledWarning')}
                  </Text>
                </SettingsInfoBox>
              )}
            </View>
            
            {/* How it works */}
            <View style={styles.subSection}>
              <Text style={styles.infoTitle}>{t('display.howScreenScheduleWorks')}</Text>
              <Text style={styles.infoText}>
                {t('display.scheduleWorksOff')}{`\n`}
                {t('display.scheduleWorksOn')}{`\n`}
                {t('display.scheduleWorksMultiple')}{`\n`}
                {t('display.scheduleWorksOvernight')}{`\n`}
                {screenSchedulerWakeOnTouch
                  ? `${t('display.scheduleWorksTouchEnabled')}\n`
                  : `${t('display.scheduleWorksTouchDisabled')}\n`}
                {`\n`}
                {t('display.scheduleDeviceOwner')}{`\n`}
                {t('display.scheduleNonDeviceOwner')}{`\n`}
                {t('display.scheduleAlarmManager')}
              </Text>
            </View>
          </>
        )}
      </SettingsSection>
      
      {/* Status Bar */}
      <SettingsSection title={t('display.systemStatusBar')} icon="chart-bar">
        <SettingsSwitch
          label={t('display.showStatusBar')}
          hint={t('display.showStatusBarHint')}
          value={statusBarEnabled}
          onValueChange={onStatusBarEnabledChange}
        />
        
        {statusBarEnabled && (
          <View style={styles.subSection}>
            <SettingsInfoBox variant="info">
              <Text style={styles.infoText}>
                {t('display.statusBarLayout')}
              </Text>
            </SettingsInfoBox>

            <SettingsRadioGroup
              label={t('display.statusBarTheme')}
              hint={t('display.statusBarThemeHint')}
              options={[
                {
                  value: 'dark',
                  label: t('display.themeDark'),
                  hint: t('display.themeDarkHint'),
                  icon: 'weather-night',
                },
                {
                  value: 'light',
                  label: t('display.themeLight'),
                  hint: t('display.themeLightHint'),
                  icon: 'brightness-7',
                },
              ]}
              value={statusBarTheme}
              onValueChange={onStatusBarThemeChange}
            />
            
            {/* Customize Status Bar Items */}
            <Text style={styles.subSectionTitle}>{t('display.customizeItems')}</Text>
            
            <View style={styles.itemsGrid}>
              <SettingsSwitch
                label={t('display.battery')}
                icon="power"
                value={showBattery}
                onValueChange={onShowBatteryChange}
              />
              
              <SettingsSwitch
                label={t('display.wifi')}
                icon="server-network"
                value={showWifi}
                onValueChange={onShowWifiChange}
              />
              
              <SettingsSwitch
                label={t('display.bluetooth')}
                icon="remote"
                value={showBluetooth}
                onValueChange={onShowBluetoothChange}
              />
              
              <SettingsSwitch
                label={t('display.volume')}
                icon="volume-high"
                value={showVolume}
                onValueChange={onShowVolumeChange}
              />
              
              <SettingsSwitch
                label={t('display.time')}
                icon="clock-outline"
                value={showTime}
                onValueChange={onShowTimeChange}
              />
            </View>
            
            {/* External App specific options */}
            {displayMode === 'external_app' && (
              <View style={styles.externalAppOptions}>
                <Text style={styles.subSectionTitle}>{t('display.externalAppModeOptions')}</Text>
                
                <SettingsSwitch
                  label={t('display.onExternalAppOverlay')}
                  hint={t('display.onExternalAppOverlayHint')}
                  value={statusBarOnOverlay}
                  onValueChange={onStatusBarOnOverlayChange}
                />
                
                <SettingsSwitch
                  label={t('display.onReturnScreen')}
                  hint={t('display.onReturnScreenHint')}
                  value={statusBarOnReturn}
                  onValueChange={onStatusBarOnReturnChange}
                />
              </View>
            )}
            
            {(displayMode === 'webview' || displayMode === 'media_player') && (
              <SettingsInfoBox variant="info">
                <Text style={styles.infoText}>
                  {displayMode === 'webview'
                    ? t('display.statusBarWebviewMode')
                    : t('display.statusBarMediaMode')}
                </Text>
              </SettingsInfoBox>
            )}
          </View>
        )}
      </SettingsSection>
      
      {/* Web Page Zoom - Only in WebView mode */}
      {displayMode === 'webview' && (
        <SettingsSection title={t('display.webPageZoom')} icon="magnify">
          {filarePanelUrl && (
            <SettingsInfoBox variant="info">
              <Text style={styles.infoText}>
                {t('display.filareZoomInfo')}
              </Text>
            </SettingsInfoBox>
          )}
          <SettingsSlider
            label=""
            hint={t('display.zoomLevelHint', { level: zoomLevel })}
            value={zoomLevel}
            onValueChange={(val) => onZoomLevelChange(Math.round(val))}
            minimumValue={50}
            maximumValue={200}
            step={5}
            formatValue={(val) => `${Math.round(val)}%`}
            presets={[
              { label: '75%', value: 75 },
              { label: '100%', value: 100 },
              { label: '125%', value: 125 },
              { label: '150%', value: 150 },
            ]}
          />
          {filarePanelUrl && zoomLevel !== 100 && (
            <SettingsInfoBox variant="warning">
              <Text style={styles.infoText}>
                {t('display.filareZoomMismatch', { level: zoomLevel })}
              </Text>
            </SettingsInfoBox>
          )}
          {zoomLevel !== 100 && !filarePanelUrl && (
            <SettingsInfoBox variant="info">
              <Text style={styles.infoText}>
                {t('display.zoomResetHint', { level: zoomLevel })}
              </Text>
            </SettingsInfoBox>
          )}
          <SettingsSwitch
            label={t('display.disableUserZoom')}
            hint={t('display.disableUserZoomHint')}
            value={disableUserZoom}
            onValueChange={onDisableUserZoomChange}
          />
          {filarePanelUrl && (
            <SettingsSwitch
              label={t('display.panelDebugOverlay')}
              hint={t('display.panelDebugOverlayHint')}
              value={panelDebugOverlay}
              onValueChange={onPanelDebugOverlayChange}
            />
          )}
        </SettingsSection>
      )}
      
      {/* Custom User Agent - Only in WebView mode */}
      {displayMode === 'webview' && (
        <SettingsSection title={t('display.userAgent')} icon="web">
          {filarePanelUrl && !customUserAgent.trim() && (
            <SettingsInfoBox variant="info">
              <Text style={styles.infoText}>
                {t('display.filareUserAgentInfo')}
              </Text>
            </SettingsInfoBox>
          )}
          <SettingsInput
            label={t('display.customUserAgent')}
            hint={customUserAgent.trim()
              ? t('display.customUserAgentActive')
              : t('display.customUserAgentDefault')}
            value={customUserAgent}
            onChangeText={onCustomUserAgentChange}
            placeholder={t('display.customUserAgentPlaceholder')}
            autoCapitalize="none"
            multiline={true}
          />
          {customUserAgent.trim() !== '' && (
            <SettingsInfoBox variant="warning">
              <Text style={styles.infoText}>
                {t('display.customUserAgentWarning')}
              </Text>
            </SettingsInfoBox>
          )}
        </SettingsSection>
      )}
      
      {/* Keyboard Mode - Only in WebView mode */}
      {displayMode === 'webview' && (
        <SettingsSection title={t('display.keyboardMode')} icon="keyboard-outline">
          <SettingsRadioGroup
            hint={t('display.keyboardModeHint')}
            options={[
              {
                value: 'default',
                label: t('display.keyboardDefault'),
                hint: t('display.keyboardDefaultHint'),
              },
              {
                value: 'force_numeric',
                label: t('display.keyboardForceNumeric'),
                hint: t('display.keyboardForceNumericHint'),
              },
              {
                value: 'smart',
                label: t('display.keyboardSmart'),
                hint: t('display.keyboardSmartHint'),
              },
            ]}
            value={keyboardMode}
            onValueChange={onKeyboardModeChange}
          />
        </SettingsSection>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  subSection: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  subSectionTitle: {
    ...Typography.labelSmall,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  itemsGrid: {
    gap: Spacing.xs,
  },
  externalAppOptions: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  infoText: {
    ...Typography.body,
    color: Colors.infoDark,
  },
  infoTitle: {
    ...Typography.label,
    color: Colors.infoDark,
    marginBottom: Spacing.sm,
  },
  rulesContainer: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  addRuleButton: {
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  addRuleButtonText: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  ssPickButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: Spacing.sm,
  },
  ssPickButtonDisabled: {
    opacity: 0.5,
  },
  ssPickButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  ssMediaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.background,
    borderRadius: 8,
    marginVertical: Spacing.xs,
  },
  ssMediaIndex: {
    fontWeight: '600',
    marginRight: Spacing.sm,
    color: Colors.textSecondary,
    minWidth: 20,
  },
  ssMediaName: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  ssMediaDelete: {
    color: Colors.error,
    fontSize: 18,
    fontWeight: '700',
    paddingHorizontal: Spacing.sm,
  },
});

export default DisplayTab;
