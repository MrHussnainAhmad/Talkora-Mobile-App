// Test script for FCM notification service
// Run this with: npx expo start --dev-client

import fcmNotificationService from '../services/fcmNotificationService';

const testNotifications = async () => {
  console.log('🧪 Starting FCM notification tests...');
  
  try {
    // Test 1: Initialize service
    console.log('🧪 Test 1: Initializing FCM service...');
    const initResult = await fcmNotificationService.initialize();
    console.log('✅ FCM service initialized:', initResult);
    
    // Test 2: Get push token
    console.log('🧪 Test 2: Getting push token...');
    const token = fcmNotificationService.getPushToken();
    console.log('✅ Push token:', token ? 'Available' : 'Not available');
    
    // Test 3: Test notification with actions
    console.log('🧪 Test 3: Sending test notification...');
    await fcmNotificationService.testNotification();
    console.log('✅ Test notification sent');
    
    // Test 4: App state management
    console.log('🧪 Test 4: Testing app state management...');
    fcmNotificationService.setAppActive(false);
    fcmNotificationService.setCurrentChatUser('user123');
    console.log('✅ App state set');
    
    // Test 5: Clear state
    console.log('🧪 Test 5: Clearing state...');
    fcmNotificationService.clearCurrentChatUser();
    fcmNotificationService.setAppActive(true);
    console.log('✅ State cleared');
    
    console.log('🎉 All FCM notification tests completed successfully!');
    
  } catch (error) {
    console.error('❌ FCM notification test failed:', error);
  }
};

// Auto-run if this file is executed directly
if (require.main === module) {
  testNotifications();
}

export default testNotifications;
