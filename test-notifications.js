/**
 * Simple test to verify notification service works
 * Run this in the Expo Go app console
 */

import NotificationService from './services/simpleNotificationService';

export const testNotifications = async () => {
  try {
    console.log('🧪 Testing notification service...');
    
    // Initialize service
    console.log('📱 Initializing notification service...');
    await NotificationService.initialize();
    
    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test confirm sound
    console.log('🔊 Testing confirm sound...');
    await NotificationService.handleMessageSent();
    
    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test notification sound
    console.log('🔔 Testing notification sound...');
    await NotificationService.testNotification();
    
    console.log('✅ All tests completed! Check if you heard the sounds.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// For debugging - expose to global
global.testNotifications = testNotifications;
global.NotificationService = NotificationService;

console.log('🧪 Test script loaded! Run testNotifications() in console or use the Settings screen.');
