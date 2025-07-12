import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import api from './api';
import { 
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_ACTIONS,
  initializeNotificationCategories 
} from './notificationActions';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class FCMNotificationService {
  constructor() {
    this.token = null;
    this.notificationListener = null;
    this.responseListener = null;
    this.isInitialized = false;
    this.currentUserId = null;
    this.currentChatUserId = null;
    this.isAppActive = true;
  }

  async initialize(userId = null) {
    if (this.isInitialized) return;

    try {
      if (userId) {
        this.currentUserId = userId;
      }
      
      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.warn('🔔 Push notification permissions not granted');
        return false;
      }

      // Set up notification channels for Android
      await this.setupNotificationChannels();

      // Initialize notification categories and actions
      await initializeNotificationCategories();

      // Get FCM token (only if we have a user ID)
      if (this.currentUserId) {
        await this.getFCMToken();
      }

      // Set up notification listeners
      this.setupNotificationListeners();

      this.isInitialized = true;
      console.log('🔔 FCM notification service initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize FCM notification service:', error);
      return false;
    }
  }

  async setupNotificationChannels() {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('messages', {
        name: 'Messages',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: true,
        enableVibrate: true,
      });

      await Notifications.setNotificationChannelAsync('general', {
        name: 'General',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: true,
        enableVibrate: true,
      });
    }
  }

  async getFCMToken() {
    try {
      if (!Device.isDevice) {
        console.warn('🔔 FCM tokens only work on physical devices');
        return null;
      }

      // Get push notification token
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId,
      });

      this.token = token.data;
      console.log('🔔 FCM Token obtained:', this.token);

      // Store token locally
      await AsyncStorage.setItem('fcm_token', this.token);

      // Register token with backend
      await this.registerTokenWithBackend();

      return this.token;
    } catch (error) {
      console.error('Failed to get FCM token:', error);
      return null;
    }
  }

  async registerTokenWithBackend() {
    try {
      if (!this.token || !this.currentUserId) {
        console.warn('🔔 Cannot register token: missing token or user ID');
        return;
      }

      const deviceId = Constants.deviceId || Constants.installationId || 'unknown';
      const platform = Platform.OS;

      await api.registerFCMToken(this.token, platform, deviceId);
      console.log('🔔 FCM token registered with backend successfully');
    } catch (error) {
      console.error('Failed to register FCM token with backend:', error);
    }
  }

  async removeTokenFromBackend() {
    try {
      if (!this.token) {
        console.warn('🔔 No token to remove');
        return;
      }

      const deviceId = Constants.deviceId || Constants.installationId || 'unknown';
      await api.removeFCMToken(deviceId, this.token);
      console.log('🔔 FCM token removed from backend successfully');
    } catch (error) {
      console.error('Failed to remove FCM token from backend:', error);
    }
  }

  setupNotificationListeners() {
    // Listen for notifications received while app is foregrounded
    this.notificationListener = Notifications.addNotificationReceivedListener(
      this.handleNotificationReceived.bind(this)
    );

    // Listen for notification taps and action responses
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      this.handleNotificationResponse.bind(this)
    );
  }

  async handleNotificationReceived(notification) {
    console.log('🔔 Notification received:', notification);
    
    const { data, body, title } = notification.request.content;
    
    // Don't show notification if user is in the same chat
    if (this.currentChatUserId === data?.senderId) {
      console.log('🔔 User is in chat with sender, skipping notification');
      return;
    }

    // Don't show notification if app is active and user is engaged
    if (this.isAppActive && this.currentChatUserId) {
      console.log('🔔 App is active and user is in a chat, skipping notification');
      return;
    }

    // Handle different notification types
    if (data?.type === 'message') {
      await this.handleMessageNotification(notification);
    } else {
      console.log('🔔 General notification received:', title, body);
    }
  }

  async handleMessageNotification(notification) {
    const { data, body, title } = notification.request.content;
    
    try {
      // Show notification with action buttons
      await Notifications.scheduleNotificationAsync({
        content: {
          title: title || `New message from ${data.senderName}`,
          body: body || data.messageText || 'New message',
          data: {
            ...data,
            notificationType: 'message',
          },
          categoryIdentifier: NOTIFICATION_CATEGORIES.MESSAGE,
        },
        trigger: null, // Show immediately
      });
    } catch (error) {
      console.error('Failed to handle message notification:', error);
    }
  }

  async handleNotificationResponse(response) {
    console.log('🔔 Notification response received:', response);
    
    const { notification, actionIdentifier } = response;
    const { data } = notification.request.content;

    try {
      switch (actionIdentifier) {
        case NOTIFICATION_ACTIONS.MARK_AS_READ:
          await this.handleMarkAsRead(data);
          break;
        case NOTIFICATION_ACTIONS.REPLY:
          await this.handleReply(data, response.userText);
          break;
        default:
          // Default tap - open the app/chat
          await this.handleDefaultTap(data);
          break;
      }
    } catch (error) {
      console.error('Failed to handle notification response:', error);
    }
  }

  async handleMarkAsRead(data) {
    try {
      if (!data.messageId || !data.chatId) {
        console.warn('🔔 Missing message or chat ID for mark as read');
        return;
      }

      // Call backend API to mark message as read
      const response = await fetch(`${api.BASE_URL}/api/notifications/mark-as-read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await AsyncStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          messageId: data.messageId,
          chatId: data.chatId,
        }),
      });

      if (response.ok) {
        console.log('🔔 Message marked as read successfully');
      } else {
        console.error('Failed to mark message as read:', response.status);
      }
    } catch (error) {
      console.error('Failed to mark message as read:', error);
    }
  }

  async handleReply(data, replyText) {
    try {
      if (!data.chatId || !replyText) {
        console.warn('🔔 Missing chat ID or reply text');
        return;
      }

      // Call backend API to send reply
      const response = await fetch(`${api.BASE_URL}/api/notifications/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await AsyncStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          chatId: data.chatId,
          replyText: replyText,
        }),
      });

      if (response.ok) {
        console.log('🔔 Reply sent successfully');
      } else {
        console.error('Failed to send reply:', response.status);
      }
    } catch (error) {
      console.error('Failed to send reply:', error);
    }
  }

  async handleDefaultTap(data) {
    try {
      if (data.chatId) {
        // Navigate to the specific chat
        router.push(`/chat/${data.chatId}`);
        console.log('🔔 Navigating to chat:', data.chatId);
      } else {
        // Navigate to main chat screen
        router.push('/chats');
        console.log('🔔 Navigating to chats screen');
      }
    } catch (error) {
      console.error('Failed to handle default tap:', error);
    }
  }

  // Set current chat user ID to prevent notifications from same user
  setCurrentChatUser(userId) {
    this.currentChatUserId = userId;
    console.log('🔔 Current chat user set to:', userId);
  }

  // Clear current chat user
  clearCurrentChatUser() {
    this.currentChatUserId = null;
    console.log('🔔 Current chat user cleared');
  }

  // Set app active state
  setAppActive(isActive) {
    this.isAppActive = isActive;
    console.log('🔔 App active state:', isActive);
  }

  // Get current push token
  getPushToken() {
    return this.token;
  }

  // Reinitialize with user ID after login
  async reinitializeWithUser(userId) {
    try {
      this.currentUserId = userId;
      
      // Get FCM token and register with backend
      await this.getFCMToken();
      
      console.log('🔔 FCM service reinitialized with user ID:', userId);
      return true;
    } catch (error) {
      console.error('Failed to reinitialize FCM service with user:', error);
      return false;
    }
  }

  // Test notification (for development)
  async testNotification() {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Test Notification',
          body: 'This is a test notification with actions',
          data: {
            type: 'message',
            chatId: 'test123',
            messageId: 'msg123',
            senderId: 'user123',
            senderName: 'Test User',
            messageText: 'This is a test message',
          },
          categoryIdentifier: NOTIFICATION_CATEGORIES.MESSAGE,
        },
        trigger: { seconds: 1 },
      });
      console.log('🔔 Test notification scheduled');
    } catch (error) {
      console.error('Failed to send test notification:', error);
    }
  }

  // Clean up
  cleanup() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
    this.isInitialized = false;
    console.log('🔔 FCM notification service cleaned up');
  }

  // Logout - remove token from backend
  async logout() {
    try {
      await this.removeTokenFromBackend();
      await AsyncStorage.removeItem('fcm_token');
      this.token = null;
      this.currentUserId = null;
      this.cleanup();
      console.log('🔔 FCM service logout completed');
    } catch (error) {
      console.error('Failed to logout FCM service:', error);
    }
  }
}

export default new FCMNotificationService();
