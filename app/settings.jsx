import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import notificationService from '../services/simpleNotificationService';
import BackendSwitcher from '../utils/backendSwitcher';
import BackendConfig from '../config/backend';
import BlockingManager from '../components/BlockingManager';
import styles from '../assets/styles/settings.style';

export default function SettingsScreen() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [blockingManagerVisible, setBlockingManagerVisible] = React.useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleAbout = () => {
    Alert.alert(
      'About Talkora',
      'Version 1.0.0\n\nTalkora is a modern messaging app that brings people together through seamless communication.',
      [{ text: 'OK' }]
    );
  };

  const handlePrivacy = () => {
    Alert.alert(
      'Privacy Policy',
      'Your privacy is important to us. We collect minimal data and never share your personal information with third parties.',
      [{ text: 'OK' }]
    );
  };

  const handleTerms = () => {
    Alert.alert(
      'Terms of Service',
      'By using Talkora, you agree to our terms of service. Use the app responsibly and respect other users.',
      [{ text: 'OK' }]
    );
  };

  const handleSupport = () => {
    Alert.alert(
      'Support',
      'Need help? Contact us at support@talkora.app',
      [{ text: 'OK' }]
    );
  };

  const handleTestNotification = async () => {
    try {
      await notificationService.testNotification();
      Alert.alert(
        'Test Notification',
        'A test notification has been triggered. You should see it in your notification center.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to send test notification. Make sure you have granted notification permissions.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleBackendSwitch = () => {
    BackendSwitcher.showSwitcher();
  };
  
  const handleTestBackend = async () => {
    await BackendSwitcher.testCurrentBackend();
  };
  
  const getBackendStatus = () => {
    if (BackendConfig.isLocal()) {
      if (BackendConfig.BASE_URL.includes('localhost')) {
        return 'Localhost';
      }
      return 'Local IP';
    }
    if (BackendConfig.isProduction()) {
      return 'Production';
    }
    return 'Unknown';
  };

  return (
    <View style={[styles.container, theme === 'dark' && styles.darkContainer]}>
      {/* Header */}
      <View style={[styles.header, theme === 'dark' && styles.darkHeader]}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons 
            name="arrow-back" 
            size={24} 
            color={theme === 'dark' ? '#fff' : '#1976D2'} 
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, theme === 'dark' && styles.darkHeaderTitle]}>
          Settings
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Appearance Section */}
        <View style={[styles.section, theme === 'dark' && styles.darkSection]}>
          <Text style={[styles.sectionTitle, theme === 'dark' && styles.darkSectionTitle]}>
            Appearance
          </Text>
          
          <View style={[styles.settingItem, theme === 'dark' && styles.darkSettingItem]}>
            <View style={styles.settingLeft}>
              <Ionicons 
                name={theme === 'dark' ? 'moon' : 'sunny'} 
                size={24} 
                color={theme === 'dark' ? '#9BA1A6' : '#666'} 
              />
              <Text style={[styles.settingText, theme === 'dark' && styles.darkSettingText]}>
                Dark Mode
              </Text>
            </View>
            <Switch
              value={theme === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
              thumbColor={theme === 'dark' ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Account Section */}
        <View style={[styles.section, theme === 'dark' && styles.darkSection]}>
          <Text style={[styles.sectionTitle, theme === 'dark' && styles.darkSectionTitle]}>
            Account
          </Text>
          
          <TouchableOpacity 
            style={[styles.settingItem, styles.settingItemButton, theme === 'dark' && styles.darkSettingItem]}
            onPress={() => router.push('/profile')}
          >
            <View style={styles.settingLeft}>
              <Ionicons 
                name="person-outline" 
                size={24} 
                color={theme === 'dark' ? '#9BA1A6' : '#666'} 
              />
              <Text style={[styles.settingText, theme === 'dark' && styles.darkSettingText]}>
                Edit Profile
              </Text>
            </View>
            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color={theme === 'dark' ? '#9BA1A6' : '#999'} 
            />
          </TouchableOpacity>

          <View style={[styles.accountInfo, theme === 'dark' && styles.darkAccountInfo]}>
            <Text style={[styles.accountInfoLabel, theme === 'dark' && styles.darkAccountInfoLabel]}>
              Username
            </Text>
            <Text style={[styles.accountInfoValue, theme === 'dark' && styles.darkAccountInfoValue]}>
              @{user?.username || 'Unknown'}
            </Text>
          </View>

          <View style={[styles.accountInfo, theme === 'dark' && styles.darkAccountInfo]}>
            <Text style={[styles.accountInfoLabel, theme === 'dark' && styles.darkAccountInfoLabel]}>
              Email
            </Text>
            <Text style={[styles.accountInfoValue, theme === 'dark' && styles.darkAccountInfoValue]}>
              {user?.email || 'Unknown'}
            </Text>
          </View>
        </View>

        {/* Privacy & Security Section */}
        <View style={[styles.section, theme === 'dark' && styles.darkSection]}>
          <Text style={[styles.sectionTitle, theme === 'dark' && styles.darkSectionTitle]}>
            Privacy & Security
          </Text>
          
          <TouchableOpacity 
            style={[styles.settingItem, styles.settingItemButton, theme === 'dark' && styles.darkSettingItem]}
            onPress={() => setBlockingManagerVisible(true)}
          >
            <View style={styles.settingLeft}>
              <Ionicons 
                name="shield-outline" 
                size={24} 
                color={theme === 'dark' ? '#9BA1A6' : '#666'} 
              />
              <Text style={[styles.settingText, theme === 'dark' && styles.darkSettingText]}>
                Blocked Users
              </Text>
            </View>
            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color={theme === 'dark' ? '#9BA1A6' : '#999'} 
            />
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View style={[styles.section, theme === 'dark' && styles.darkSection]}>
          <Text style={[styles.sectionTitle, theme === 'dark' && styles.darkSectionTitle]}>
            About
          </Text>
          
          <TouchableOpacity 
            style={[styles.settingItem, styles.settingItemButton, theme === 'dark' && styles.darkSettingItem]}
            onPress={handleAbout}
          >
            <View style={styles.settingLeft}>
              <Ionicons 
                name="information-circle-outline" 
                size={24} 
                color={theme === 'dark' ? '#9BA1A6' : '#666'} 
              />
              <Text style={[styles.settingText, theme === 'dark' && styles.darkSettingText]}>
                About Talkora
              </Text>
            </View>
            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color={theme === 'dark' ? '#9BA1A6' : '#999'} 
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.settingItem, styles.settingItemButton, theme === 'dark' && styles.darkSettingItem]}
            onPress={handlePrivacy}
          >
            <View style={styles.settingLeft}>
              <Ionicons 
                name="shield-checkmark-outline" 
                size={24} 
                color={theme === 'dark' ? '#9BA1A6' : '#666'} 
              />
              <Text style={[styles.settingText, theme === 'dark' && styles.darkSettingText]}>
                Privacy Policy
              </Text>
            </View>
            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color={theme === 'dark' ? '#9BA1A6' : '#999'} 
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.settingItem, styles.settingItemButton, theme === 'dark' && styles.darkSettingItem]}
            onPress={handleTerms}
          >
            <View style={styles.settingLeft}>
              <Ionicons 
                name="document-text-outline" 
                size={24} 
                color={theme === 'dark' ? '#9BA1A6' : '#666'} 
              />
              <Text style={[styles.settingText, theme === 'dark' && styles.darkSettingText]}>
                Terms of Service
              </Text>
            </View>
            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color={theme === 'dark' ? '#9BA1A6' : '#999'} 
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.settingItem, styles.settingItemButton, theme === 'dark' && styles.darkSettingItem]}
            onPress={handleSupport}
          >
            <View style={styles.settingLeft}>
              <Ionicons 
                name="help-circle-outline" 
                size={24} 
                color={theme === 'dark' ? '#9BA1A6' : '#666'} 
              />
              <Text style={[styles.settingText, theme === 'dark' && styles.darkSettingText]}>
                Support
              </Text>
            </View>
            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color={theme === 'dark' ? '#9BA1A6' : '#999'} 
            />
          </TouchableOpacity>

          {/* Test Notification - Development Only */}
          {__DEV__ && (
            <TouchableOpacity 
              style={[styles.settingItem, styles.settingItemButton, theme === 'dark' && styles.darkSettingItem]}
              onPress={handleTestNotification}
            >
              <View style={styles.settingLeft}>
                <Ionicons 
                  name="notifications-outline" 
                  size={24} 
                  color={theme === 'dark' ? '#9BA1A6' : '#666'} 
                />
                <Text style={[styles.settingText, theme === 'dark' && styles.darkSettingText]}>
                  Test Notification
                </Text>
              </View>
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color={theme === 'dark' ? '#9BA1A6' : '#999'} 
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Developer Section - Only in Development */}
        {__DEV__ && (
          <View style={[styles.section, theme === 'dark' && styles.darkSection]}>
            <Text style={[styles.sectionTitle, theme === 'dark' && styles.darkSectionTitle]}>
              Developer Options
            </Text>
            
            <TouchableOpacity 
              style={[styles.settingItem, styles.settingItemButton, theme === 'dark' && styles.darkSettingItem]}
              onPress={handleBackendSwitch}
            >
              <View style={styles.settingLeft}>
                <Ionicons 
                  name="server-outline" 
                  size={24} 
                  color={theme === 'dark' ? '#9BA1A6' : '#666'} 
                />
                <Text style={[styles.settingText, theme === 'dark' && styles.darkSettingText]}>
                  Backend Server
                </Text>
              </View>
              <View style={styles.settingRight}>
                <Text style={[styles.settingValue, theme === 'dark' && styles.darkSettingValue]}>
                  {getBackendStatus()}
                </Text>
                <Ionicons 
                  name="chevron-forward" 
                  size={20} 
                  color={theme === 'dark' ? '#9BA1A6' : '#999'} 
                />
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Version Info */}
        <View style={styles.versionContainer}>
          <Text style={[styles.versionText, theme === 'dark' && styles.darkVersionText]}>
            Talkora v0.1.0
          </Text>
          {__DEV__ && (
            <Text style={[styles.versionText, theme === 'dark' && styles.darkVersionText, { fontSize: 10, marginTop: 4 }]}>
              {BackendConfig.BASE_URL}
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Blocking Manager Modal */}
      <BlockingManager 
        visible={blockingManagerVisible}
        onClose={() => setBlockingManagerVisible(false)}
      />
    </View>
  );
}
