/**
 * FreeKiosk v1.2 - Security Tab
 * Lock mode, Auto-launch, External app behavior
 */

import React from 'react';
import { View, Text, StyleSheet, Linking } from 'react-native';
import {
  SettingsSection,
  SettingsSwitch,
  SettingsRadioGroup,
  SettingsInput,
  SettingsInfoBox,
  SettingsButton,
  SettingsModeSelector,
  UrlListEditor,
} from '../../../components/settings';
import { Colors, Spacing, Typography } from '../../../theme';
import { t } from '../../../i18n';

const POSITION_KEYS: Record<string, string> = {
  'top-left': 'security.positions.topLeft',
  'top-right': 'security.positions.topRight',
  'bottom-left': 'security.positions.bottomLeft',
  'bottom-right': 'security.positions.bottomRight',
};

function translatePosition(position: string): string {
  const key = POSITION_KEYS[position];
  return key ? t(key) : position;
}

interface SecurityTabProps {
  displayMode: 'webview' | 'external_app' | 'media_player';
  isDeviceOwner: boolean;
  navigation?: any; // Navigation prop for sub-screens
  
  // Lock mode
  kioskEnabled: boolean;
  onKioskEnabledChange: (value: boolean) => void;
  
  // Power button
  allowPowerButton: boolean;
  onAllowPowerButtonChange: (value: boolean) => void;
  
  // Notifications (NFC support)
  allowNotifications: boolean;
  onAllowNotificationsChange: (value: boolean) => void;
  
  // System Info (audio fix for Samsung)
  allowSystemInfo: boolean;
  onAllowSystemInfoChange: (value: boolean) => void;
  
  // Return to Settings
  returnMode: string; // 'tap_anywhere' | 'button'
  onReturnModeChange: (value: string) => void;
  returnTapCount: string;
  onReturnTapCountChange: (value: string) => void;
  returnTapTimeout: string;
  onReturnTapTimeoutChange: (value: string) => void;
  returnButtonPosition: string; // 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  onReturnButtonPositionChange: (value: string) => void;
  overlayButtonVisible: boolean;
  onOverlayButtonVisibleChange: (value: boolean) => void;
  volumeUp5TapEnabled: boolean;
  onVolumeUp5TapEnabledChange: (value: boolean) => void;
  
  // Auto launch
  autoLaunchEnabled: boolean;
  onAutoLaunchChange: (value: boolean) => void;
  onOpenSystemSettings: () => void;
  
  // External app specific
  autoRelaunchApp: boolean;
  onAutoRelaunchAppChange: (value: boolean) => void;
  backButtonMode: string;
  onBackButtonModeChange: (value: string) => void;
  backButtonTimerDelay: string;
  onBackButtonTimerDelayChange: (value: string) => void;
  
  // URL Filtering
  urlFilterEnabled: boolean;
  onUrlFilterEnabledChange: (value: boolean) => void;
  urlFilterMode: string; // 'blacklist' | 'whitelist'
  onUrlFilterModeChange: (value: string) => void;
  urlFilterList: string[];
  onUrlFilterListChange: (patterns: string[]) => void;
  urlFilterShowFeedback: boolean;
  onUrlFilterShowFeedbackChange: (value: boolean) => void;

  onExitKioskMode: () => void;
}

const SecurityTab: React.FC<SecurityTabProps> = ({
  displayMode,
  isDeviceOwner,
  navigation,
  kioskEnabled,
  onKioskEnabledChange,
  allowPowerButton,
  onAllowPowerButtonChange,
  allowNotifications,
  onAllowNotificationsChange,
  allowSystemInfo,
  onAllowSystemInfoChange,
  returnMode,
  onReturnModeChange,
  returnTapCount,
  onReturnTapCountChange,
  returnTapTimeout,
  onReturnTapTimeoutChange,
  returnButtonPosition,
  onReturnButtonPositionChange,
  overlayButtonVisible,
  onOverlayButtonVisibleChange,
  volumeUp5TapEnabled,
  onVolumeUp5TapEnabledChange,
  autoLaunchEnabled,
  onAutoLaunchChange,
  onOpenSystemSettings,
  autoRelaunchApp,
  onAutoRelaunchAppChange,
  backButtonMode,
  onBackButtonModeChange,
  backButtonTimerDelay,
  onBackButtonTimerDelayChange,
  urlFilterEnabled,
  onUrlFilterEnabledChange,
  urlFilterMode,
  onUrlFilterModeChange,
  urlFilterList,
  onUrlFilterListChange,
  urlFilterShowFeedback,
  onUrlFilterShowFeedbackChange,
  onExitKioskMode,
}) => {
  return (
    <View>
      {/* Lock Mode */}
      <SettingsSection title={t('general.lockMode')} icon="lock">
        <SettingsSwitch
          label={t('general.enableLockMode')}
          hint={t('general.lockModeHint')}
          value={kioskEnabled}
          onValueChange={onKioskEnabledChange}
        />
        
        {!kioskEnabled && (
          <SettingsInfoBox variant="warning">
            <Text style={styles.infoText}>
              ⚠️ {t('security.lockModeDisabled')}
            </Text>
          </SettingsInfoBox>
        )}
        
        {kioskEnabled && (displayMode === 'webview' || displayMode === 'media_player') && isDeviceOwner && (
          <SettingsInfoBox variant="info">
            <Text style={styles.infoText}>
              ℹ️ {t('security.screenPinningEnabled')}
            </Text>
          </SettingsInfoBox>
        )}
        
        {kioskEnabled && (displayMode === 'webview' || displayMode === 'media_player') && !isDeviceOwner && (
          <SettingsInfoBox variant="warning">
            <Text style={styles.infoText}>
              ⚠️ {t('security.noDeviceOwnerWarning')}
            </Text>
          </SettingsInfoBox>
        )}
        
        {kioskEnabled && displayMode === 'external_app' && !isDeviceOwner && (
          <SettingsInfoBox variant="error">
            <Text style={styles.infoText}>
              ⚠️ {t('security.deviceOwnerRequiredExternal')}
            </Text>
          </SettingsInfoBox>
        )}
        
        {kioskEnabled && displayMode === 'external_app' && isDeviceOwner && (
          <SettingsInfoBox variant="info">
            <Text style={styles.infoText}>
              ℹ️ {t('security.lockModeExternalEnabled')}
            </Text>
          </SettingsInfoBox>
        )}
        
        {/* Power Button Setting - Only show when Lock Mode is enabled and Device Owner */}
        {kioskEnabled && isDeviceOwner && (
          <>
            <View style={styles.divider} />
            <SettingsSwitch
              label={t('security.blockPowerMenu')}
              hint={t('security.blockPowerMenuHint')}
              value={!allowPowerButton}
              onValueChange={(value) => onAllowPowerButtonChange(!value)}
            />
            <View style={styles.divider} />
            <SettingsSwitch
              label={t('security.allowNotificationsNfc')}
              hint={t('security.allowNotificationsNfcHint')}
              value={allowNotifications}
              onValueChange={onAllowNotificationsChange}
            />
            <View style={styles.divider} />
            <SettingsSwitch
              label={t('security.showSystemInfoBar')}
              hint={t('security.showSystemInfoBarHint')}
              value={allowSystemInfo}
              onValueChange={onAllowSystemInfoChange}
            />
          </>
        )}
      </SettingsSection>
      
      {/* Auto Launch */}
      <SettingsSection title={t('security.autoLaunch')} icon="rocket-launch">
        <SettingsSwitch
          label={t('security.launchOnBoot')}
          hint={t('security.launchOnBootHint')}
          value={autoLaunchEnabled}
          onValueChange={onAutoLaunchChange}
        />
        
        <SettingsInfoBox variant="info">
          <Text style={styles.infoText}>
            ℹ️ {t('security.autoLaunchInfo')}
          </Text>
        </SettingsInfoBox>
        
        <SettingsButton
          title={t('security.openSystemSettings')}
          icon="cog-outline"
          variant="primary"
          onPress={onOpenSystemSettings}
        />
      </SettingsSection>
      
      {/* Return to Settings */}
      <SettingsSection title={t('security.returnToSettings')} icon="gesture-tap">
        <SettingsRadioGroup
          hint={t('security.chooseReturnMethod')}
          options={[
            {
              value: 'tap_anywhere',
              label: t('security.tapAnywhere'),
              icon: 'gesture-tap',
              hint: t('security.tapAnywhereHint'),
            },
            {
              value: 'button',
              label: t('security.fixedButton'),
              icon: 'square-outline',
              hint: t('security.fixedButtonHint'),
            },
          ]}
          value={returnMode}
          onValueChange={onReturnModeChange}
        />
        <View style={styles.divider} />
        
        <SettingsInput
          label={t('security.numberOfTaps')}
          hint={returnMode === 'button' ? t('security.numberOfTapsHintButton') : t('security.numberOfTapsHintTap')}
          value={returnTapCount}
          onChangeText={(text) => {
            const filtered = text.replace(/[^0-9]/g, '');
            onReturnTapCountChange(filtered);
          }}
          keyboardType="numeric"
          placeholder="5"
          maxLength={2}
          error={returnTapCount !== '' && (parseInt(returnTapCount, 10) < 2 || parseInt(returnTapCount, 10) > 20) ? t('security.tapCountError') : undefined}
        />
        
        <SettingsInput
          label={t('security.detectionTimeout')}
          hint={t('security.detectionTimeoutHint')}
          value={returnTapTimeout}
          onChangeText={(text) => {
            const filtered = text.replace(/[^0-9]/g, '');
            onReturnTapTimeoutChange(filtered);
          }}
          keyboardType="numeric"
          placeholder="1500"
          maxLength={4}
          error={returnTapTimeout !== '' && (parseInt(returnTapTimeout, 10) < 500 || parseInt(returnTapTimeout, 10) > 5000) ? t('security.timeoutError') : undefined}
        />
        
        {returnMode === 'button' && (
          <>
            <View style={styles.divider} />
            {displayMode === 'external_app' && (
              <>
                <SettingsRadioGroup
                  hint={t('security.buttonPositionHint')}
                  options={[
                    { value: 'top-left', label: t('security.positions.topLeft'), icon: 'arrow-top-left' },
                    { value: 'top-right', label: t('security.positions.topRight'), icon: 'arrow-top-right' },
                    { value: 'bottom-left', label: t('security.positions.bottomLeft'), icon: 'arrow-bottom-left' },
                    { value: 'bottom-right', label: t('security.positions.bottomRight'), icon: 'arrow-bottom-right' },
                  ]}
                  value={returnButtonPosition}
                  onValueChange={onReturnButtonPositionChange}
                />
                <View style={styles.divider} />
              </>
            )}
            <SettingsSwitch
              label={t('security.showButton')}
              hint={displayMode === 'external_app' 
                ? t('security.showButtonHintExternal')
                : t('security.showButtonHint')}
              value={overlayButtonVisible}
              onValueChange={onOverlayButtonVisibleChange}
            />
          </>
        )}
        
        <>
          <View style={styles.divider} />
          <SettingsSwitch
            label={t('security.volumeButtonAlternative')}
            hint={displayMode === 'external_app'
              ? t('security.volumeButtonHintExternal')
              : t('security.volumeButtonHint')}
            value={volumeUp5TapEnabled}
            onValueChange={onVolumeUp5TapEnabledChange}
          />
        </>
        
        <SettingsInfoBox variant="info">
          <Text style={styles.infoText}>
            ℹ️ {returnMode === 'button' && displayMode === 'external_app' 
              ? t('security.returnInfoButton', {
                  position: translatePosition(returnButtonPosition),
                  count: returnTapCount || '5',
                })
              : t('security.returnInfoTap', {
                  count: returnTapCount || '5',
                  timeout: returnTapTimeout
                    ? `${(parseInt(returnTapTimeout, 10) / 1000).toFixed(1)}s`
                    : '1.5s',
                })}
            {kioskEnabled && t('security.pinRequired')}
          </Text>
        </SettingsInfoBox>
      </SettingsSection>
      
      {/* Touch Blocking Overlays - Works without Device Owner but less secure */}
      <SettingsSection title={t('security.touchBlocking')} icon="gesture-tap-button">
        <SettingsInfoBox variant="info">
          <Text style={styles.infoText}>
            ℹ️ {t('security.touchBlockingInfo', {
              target: displayMode === 'webview'
                ? t('security.touchBlockingTargetWebsite')
                : t('security.touchBlockingTargetExternal'),
            })}
          </Text>
        </SettingsInfoBox>
        
        {(!kioskEnabled || !isDeviceOwner) && (
          <SettingsInfoBox variant="warning">
            <Text style={styles.infoText}>
              ⚠️ {t('security.touchBlockingWarning')}
            </Text>
          </SettingsInfoBox>
        )}
        
        <SettingsButton
          title={t('security.configureBlockingOverlays')}
          icon="rectangle-outline"
          variant="primary"
          onPress={() => navigation?.navigate('BlockingOverlays')}
        />
        
        {kioskEnabled && isDeviceOwner && (
          <SettingsInfoBox variant="success">
            <Text style={styles.infoText}>
              ✅ {t('security.maxSecurityEnabled')}
            </Text>
          </SettingsInfoBox>
        )}
      </SettingsSection>
      
      {/* URL Filtering - Blacklist/Whitelist (WebView mode only) */}
      {displayMode === 'webview' && (
        <SettingsSection title={t('security.urlFiltering')} icon="shield-lock">
          <SettingsSwitch
            label={t('security.enableUrlFiltering')}
            hint={t('security.enableUrlFilteringHint')}
            value={urlFilterEnabled}
            onValueChange={onUrlFilterEnabledChange}
          />
          
          {urlFilterEnabled && (
            <>
              <View style={styles.divider} />
              
              <SettingsModeSelector
                label={t('security.filterMode')}
                options={[
                  {
                    value: 'blacklist',
                    label: t('security.blacklist'),
                    icon: 'close-circle',
                  },
                  {
                    value: 'whitelist',
                    label: t('security.whitelist'),
                    icon: 'check-circle-outline',
                  },
                ]}
                value={urlFilterMode}
                onValueChange={onUrlFilterModeChange}
                hint={urlFilterMode === 'blacklist' 
                  ? t('security.blacklistHint')
                  : t('security.whitelistHint')}
              />
              
              <View style={styles.divider} />
              
              <UrlListEditor
                urls={urlFilterList}
                onUrlsChange={onUrlFilterListChange}
                maxUrls={0}
                patternMode={true}
                placeholder={urlFilterMode === 'blacklist' ? '*facebook.com*' : '*mysite.com/*'}
                emptyTitle={t('security.noPatternsAdded')}
                emptyHint={urlFilterMode === 'blacklist' 
                  ? t('security.addPatternsBlock')
                  : t('security.whitelistEmptyHint')}
              />
              
              <SettingsInfoBox variant="info">
                <Text style={styles.infoText}>
                  {'ℹ️ '}{t('security.wildcardExamples')}
                </Text>
              </SettingsInfoBox>
              
              <SettingsInfoBox variant="success">
                <Text style={styles.infoText}>
                  {'✅ '}{t('security.mainUrlAlwaysAllowed')}
                </Text>
              </SettingsInfoBox>
              
              <View style={styles.divider} />
              
              <SettingsSwitch
                label={t('security.showBlockedNotification')}
                hint={t('security.showBlockedNotificationHint')}
                value={urlFilterShowFeedback}
                onValueChange={onUrlFilterShowFeedbackChange}
              />
            </>
          )}
        </SettingsSection>
      )}
      
      {/* External App Specific Settings */}
      {displayMode === 'external_app' && (
        <>
          {/* Auto Relaunch */}
          <SettingsSection title={t('security.externalAppBehavior')} icon="application">
            <SettingsSwitch
              label={t('security.autoRelaunchApp')}
              hint={t('security.autoRelaunchAppHint')}
              value={autoRelaunchApp}
              onValueChange={onAutoRelaunchAppChange}
            />
          </SettingsSection>
          
          {/* Back Button Behavior */}
          <SettingsSection title={t('security.backButtonBehavior')} icon="undo">
            <SettingsRadioGroup
              hint={t('security.backButtonActionHint')}
              options={[
                {
                  value: 'test',
                  label: t('security.testMode'),
                  icon: 'test-tube',
                  hint: t('security.testModeHint'),
                },
                {
                  value: 'immediate',
                  label: t('security.immediateReturn'),
                  icon: 'flash',
                  hint: t('security.immediateReturnHint'),
                },
                {
                  value: 'timer',
                  label: t('security.delayedReturn'),
                  icon: 'timer',
                  hint: t('security.delayedReturnHint'),
                },
              ]}
              value={backButtonMode}
              onValueChange={onBackButtonModeChange}
            />
            
            {backButtonMode === 'timer' && (
              <View style={styles.timerInput}>
                <SettingsInput
                  label={t('security.delaySeconds')}
                  value={backButtonTimerDelay}
                  onChangeText={(text) => {
                    const num = text.replace(/[^0-9]/g, '');
                    onBackButtonTimerDelayChange(num);
                  }}
                  keyboardType="numeric"
                  placeholder="10"
                  maxLength={4}
                />
              </View>
            )}
          </SettingsSection>
        </>
      )}
      
      {/* Return Mechanism Info - Always visible */}
      <SettingsSection variant="info">
        <Text style={styles.infoTitle}>ℹ️ {t('security.returnToSettings')}</Text>
        <Text style={styles.infoText}>
          {displayMode === 'external_app' && returnMode === 'button'
            ? t('security.returnMechanismButton', {
                position: translatePosition(returnButtonPosition),
                count: returnTapCount || '5',
                invisible: overlayButtonVisible ? '' : t('security.invisible'),
              })
            : t('security.returnMechanismTap', {
                count: returnTapCount || '5',
                timeout: returnTapTimeout
                  ? `${(parseInt(returnTapTimeout, 10) / 1000).toFixed(1)}s`
                  : '1.5s',
                indicator: overlayButtonVisible ? t('security.indicatorVisible') : '',
              })}
          {displayMode === 'external_app' && t('security.returnMechanismRecentApps')}
          {(displayMode === 'webview' || displayMode === 'media_player') && volumeUp5TapEnabled
            && t('security.returnMechanismVolume', { count: returnTapCount || '5' })}
        </Text>
      </SettingsSection>

      <SettingsSection title={t('security.exitSection')} icon="exit-to-app">
        <SettingsInfoBox variant="info">
          <Text style={styles.infoText}>
            {t('security.exitInfo')}
          </Text>
        </SettingsInfoBox>
        <SettingsButton
          title={t('security.exitButton')}
          icon="exit-to-app"
          variant="danger"
          onPress={onExitKioskMode}
        />
      </SettingsSection>
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
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: Spacing.md,
  },
  timerInput: {
    marginTop: Spacing.md,
    paddingLeft: Spacing.xxl,
  },
});

export default SecurityTab;
