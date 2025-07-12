import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const BACKEND_PREFERENCE_KEY = 'backend_preference';

export const BackendSwitcher = {
  // Backend options
  BACKENDS: {
    AUTO: 'auto',
    LOCALHOST: 'localhost',
    LOCAL_IP: 'local_ip',
    PRODUCTION: 'production',
    CUSTOM: 'custom'
  },
  
  // Get current backend preference
  getPreference: async () => {
    try {
      const preference = await AsyncStorage.getItem(BACKEND_PREFERENCE_KEY);
      return preference || BackendSwitcher.BACKENDS.AUTO;
    } catch (error) {
      console.error('Error getting backend preference:', error);
      return BackendSwitcher.BACKENDS.AUTO;
    }
  },
  
  // Set backend preference
  setPreference: async (backend) => {
    try {
      await AsyncStorage.setItem(BACKEND_PREFERENCE_KEY, backend);
      Alert.alert(
        'Backend Changed',
        'Please restart the app for changes to take effect.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error setting backend preference:', error);
    }
  },
  
  // Get backend URL based on preference
  getBackendUrl: async () => {
    const preference = await BackendSwitcher.getPreference();
    
    switch (preference) {
      case BackendSwitcher.BACKENDS.LOCALHOST:
        return 'http://localhost:3000';
      
      case BackendSwitcher.BACKENDS.PRODUCTION:
        return 'https://talkora-private-chat.up.railway.app';
      
      case BackendSwitcher.BACKENDS.CUSTOM:
        const customUrl = await AsyncStorage.getItem('custom_backend_url');
        return customUrl || 'http://192.168.3.58:3000';
      
      case BackendSwitcher.BACKENDS.LOCAL_IP:
      default:
        return 'http://192.168.3.58:3000';
    }
  },
  
  // Set custom backend URL
  setCustomUrl: async (url) => {
    try {
      await AsyncStorage.setItem('custom_backend_url', url);
      await BackendSwitcher.setPreference(BackendSwitcher.BACKENDS.CUSTOM);
    } catch (error) {
      console.error('Error setting custom backend URL:', error);
    }
  },
  
  // Show backend switcher dialog
  showSwitcher: () => {
    const options = [
      { text: '✨ Auto-Detect (Recommended)', value: BackendSwitcher.BACKENDS.AUTO },
      { text: '💻 Localhost (127.0.0.1:3000)', value: BackendSwitcher.BACKENDS.LOCALHOST },
      { text: '🏠 Local IP (192.168.3.58:3000)', value: BackendSwitcher.BACKENDS.LOCAL_IP },
      { text: '🌐 Production (Railway)', value: BackendSwitcher.BACKENDS.PRODUCTION },
      { text: '🔧 Custom URL', value: BackendSwitcher.BACKENDS.CUSTOM },
      { text: 'Cancel', style: 'cancel' }
    ];
    
    Alert.alert(
      'Backend Server',
      'Choose which backend to connect to:\n\nAuto-Detect will try localhost first, then local IP, then production.',
      options.map(option => ({
        text: option.text,
        style: option.style,
        onPress: option.value ? () => BackendSwitcher.setPreference(option.value) : undefined
      }))
    );
  },
  
  // Test current backend connectivity
  async testCurrentBackend() {
    const preference = await this.getPreference();
    const url = await this.getBackendUrl();
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${url}/api/auth/check`, {
        method: 'GET',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
      });
      
      clearTimeout(timeoutId);
      
      Alert.alert(
        'Backend Status',
        `✅ Connected to ${preference.toUpperCase()}\n\nURL: ${url}\nStatus: ${response.status}`,
        [{ text: 'OK' }]
      );
      
      return true;
    } catch (error) {
      Alert.alert(
        'Backend Status',
        `❌ Cannot connect to ${preference.toUpperCase()}\n\nURL: ${url}\nError: ${error.message}`,
        [
          { text: 'Try Auto-Detect', onPress: () => this.setPreference(this.BACKENDS.AUTO) },
          { text: 'OK' }
        ]
      );
      
      return false;
    }
  }
};

export default BackendSwitcher;
