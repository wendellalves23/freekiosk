import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, NativeModules, BackHandler } from 'react-native';
import PinInput from '../components/PinInput';
import { StorageService } from '../utils/storage';
import { migrateOldPin, hasSecurePin } from '../utils/secureStorage';
import AppLauncherModule from '../utils/AppLauncherModule';
import DeviceControlService from '../services/DeviceControlService';
import { grantSettingsAccess } from '../utils/authState';
import { t } from '../i18n';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type PinScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Pin'>;

interface PinScreenProps {
  navigation: PinScreenNavigationProp;
}

const PinScreen: React.FC<PinScreenProps> = ({ navigation }) => {
  const [storedPin, setStoredPin] = useState<string>('1234');
  const [migrationDone, setMigrationDone] = useState<boolean>(false);
  const [displayMode, setDisplayMode] = useState<'webview' | 'external_app' | 'media_player'>('webview');
  const [externalAppPackage, setExternalAppPackage] = useState<string | null>(null);

  useEffect(() => {
    migrateFromOldSystem();
    loadDisplayMode();
  }, []);

  // Block Android back gesture/button on PIN screen to prevent bypassing PIN (#93)
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // Navigate back to Kiosk instead of allowing default back behavior
      navigation.navigate('Kiosk');
      return true;
    });
    return () => backHandler.remove();
  }, [navigation]);

  const loadDisplayMode = async (): Promise<void> => {
    try {
      const savedDisplayMode = await StorageService.getDisplayMode();
      const savedExternalAppPackage = await StorageService.getExternalAppPackage();
      setDisplayMode(savedDisplayMode);
      setExternalAppPackage(savedExternalAppPackage);
    } catch (error) {
      console.error('[PinScreen] Failed to load display mode:', error);
    }
  };

  const migrateFromOldSystem = async (): Promise<void> => {
    try {
      // Check if already using secure storage
      const hasSecure = await hasSecurePin();

      if (!hasSecure) {
        // Migrate from old plaintext storage
        const oldPin = await StorageService.getPin();
        await migrateOldPin(oldPin);

        // Clear old PIN from AsyncStorage for security
        if (oldPin && oldPin !== '1234') {
          await StorageService.savePin(''); // Clear old plaintext PIN
        }
      }

      setMigrationDone(true);
    } catch (error) {
      console.error('[PinScreen] Migration error:', error);
      setMigrationDone(true); // Continue anyway
    }
  };

  const handleSuccess = (): void => {
    grantSettingsAccess();
    navigation.navigate('Settings');
  };

  const handleReloadPage = async (): Promise<void> => {
    if (displayMode !== 'webview') {
      return;
    }

    await DeviceControlService.reloadWebView();
    navigation.navigate('Kiosk');
  };

  const handleBack = async (): Promise<void> => {
    // If in external app mode, relaunch the external app with overlay service
    if (displayMode === 'external_app' && externalAppPackage) {
      try {
        // Load return settings
        const returnTapCount = await StorageService.getReturnTapCount();
        const returnTapTimeout = await StorageService.getReturnTapTimeout();
        const returnMode = await StorageService.getReturnMode();
        const returnButtonPosition = await StorageService.getReturnButtonPosition();
        const autoRelaunch = await StorageService.getAutoRelaunchApp();
        
        // Start OverlayService BEFORE launching the external app
        const { OverlayServiceModule } = NativeModules;
        const nfcEnabled = await StorageService.getAllowNotifications();
        await OverlayServiceModule.startOverlayService(
          returnTapCount, 
          returnTapTimeout, 
          returnMode, 
          returnButtonPosition,
          externalAppPackage,
          autoRelaunch,
          nfcEnabled
        );
        console.log('[PinScreen] OverlayService started with auto-relaunch monitoring');
        
        await AppLauncherModule.launchExternalApp(externalAppPackage);
      } catch (error) {
        console.error('[PinScreen] Failed to relaunch external app:', error);
      }
    }
    // Navigate back to Kiosk screen
    navigation.navigate('Kiosk');
  };

  // Wait for migration before showing PIN input
  if (!migrationDone) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.topActions}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>↩️ {t('pin.backToKiosk')}</Text>
        </TouchableOpacity>

        {displayMode === 'webview' && (
          <TouchableOpacity style={styles.reloadButton} onPress={handleReloadPage}>
            <Text style={styles.reloadButtonText}>🔄 {t('pin.reloadPage')}</Text>
          </TouchableOpacity>
        )}
      </View>

      <PinInput onSuccess={handleSuccess} storedPin={storedPin} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  topActions: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    gap: 12,
    zIndex: 1000,
  },
  backButton: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButtonText: {
    color: '#666',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  reloadButton: {
    backgroundColor: '#f0f7ff',
    paddingVertical: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#4a90d9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reloadButtonText: {
    color: '#2a6cb8',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default PinScreen;
