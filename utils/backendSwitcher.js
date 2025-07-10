import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const BACKEND_PREFERENCE_KEY = 'backend_preference';

export const BackendSwitcher = {
  // Backend options
  BACKENDS: {
    LOCAL_IP: 'local_ip',
    LOCALHOST: 'localhost',
    PRODUCTION: 'production',
    CUSTOM: 'custom'
  },
  
  // Get current backend preference
  getPreference: async () => {
    try {
      const preference = await AsyncStorage.getItem(BACKEND_PREFERENCE_KEY);
      return preference || BackendSwitcher.BACKENDS.LOCAL_IP;
    } catch (error) {
      console.error('Error getting backend preference:', error);
      return BackendSwitcher.BACKENDS.LOCAL_IP;
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
        return 'https://talko-private-chat.up.railway.app';
      
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
      { text: 'Local IP (192.168.3.58)', value: BackendSwitcher.BACKENDS.LOCAL_IP },
      { text: 'Localhost', value: BackendSwitcher.BACKENDS.LOCALHOST },
      { text: 'Production', value: BackendSwitcher.BACKENDS.PRODUCTION },
      { text: 'Custom', value: BackendSwitcher.BACKENDS.CUSTOM },
      { text: 'Cancel', style: 'cancel' }
    ];
    
    Alert.alert(
      'Select Backend',
      'Choose which backend to connect to:',
      options.map(option => ({
        text: option.text,
        style: option.style,
        onPress: option.value ? () => BackendSwitcher.setPreference(option.value) : undefined
      }))
    );
  }
};

export default BackendSwitcher;
