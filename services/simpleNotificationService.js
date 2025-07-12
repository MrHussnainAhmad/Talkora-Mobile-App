import { Audio } from 'expo-av';
import { Platform, AppState, Vibration } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

class SimpleNotificationService {
  constructor() {
    this.currentChatUserId = null;
    this.isAppActive = true;
    this.sounds = {
      notification: null,
      confirm: null,
    };
    this.isInitialized = false;
    this.appStateSubscription = null;
    this.notificationQueue = [];
    this.inChatSoundEnabled = true; // Default to enabled
  }

  async initialize() {
    if (this.isInitialized) {
      console.log('📱 Simple notification service already initialized');
      return;
    }

    try {
      console.log('📱 Starting simple notification service initialization...');
      // Load sound settings
      await this.loadSettings();
      
      // Load sounds
      await this.loadSounds();

      // Track app state
      this.appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
        this.isAppActive = nextAppState === 'active';
        console.log('📱 App state changed:', nextAppState);
      });

      this.isInitialized = true;
      console.log('📱 ✅ Simple notification service initialized successfully!');
    } catch (error) {
      console.error('📱 ❌ Failed to initialize notification service:', error);
      this.isInitialized = true;
    }
  }

  async loadSounds() {
    try {
      console.log('🔊 Starting to load sounds...');
      // Set audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        staysActiveInBackground: true,
        interruptionModeIOS: 1, // DO_NOT_MIX
        interruptionModeAndroid: 1, // DO_NOT_MIX
      });
      console.log('🔊 Audio mode set');

      // Load notification sound
      console.log('🔊 Loading notification sound...');
      const { sound: notificationSound } = await Audio.Sound.createAsync(
        require('../assets/alerts/notification.mp3'),
        { shouldPlay: false, volume: 0.5 } // Reduced volume
      );
      this.sounds.notification = notificationSound;
      console.log('🔊 Notification sound loaded');

      // Load confirm sound
      console.log('🔊 Loading confirm sound...');
      const { sound: confirmSound } = await Audio.Sound.createAsync(
        require('../assets/alerts/Confirm.wav'),
        { shouldPlay: false, volume: 0.3 } // Lower volume for confirm
      );
      this.sounds.confirm = confirmSound;
      console.log('🔊 Confirm sound loaded');

      console.log('🔊 ✅ All sounds loaded successfully!');
    } catch (error) {
      console.error('🔊 ❌ Failed to load sounds:', error);
    }
  }

  async playNotificationSound() {
    try {
      console.log('🔊 Playing notification sound...');
      if (this.sounds.notification) {
        await this.sounds.notification.setPositionAsync(0);
        await this.sounds.notification.playAsync();
        console.log('🔊 ✅ Notification sound played');
        // Vibrate on notification
        if (Platform.OS === 'android') {
          Vibration.vibrate([0, 250, 100, 250]);
        } else {
          Vibration.vibrate();
        }
        console.log('📳 Vibration triggered');
      } else {
        console.log('🔊 ❌ Notification sound not loaded');
      }
    } catch (error) {
      console.error('🔊 ❌ Failed to play notification sound:', error);
    }
  }

  async playConfirmSound() {
    try {
      console.log('🔊 Playing confirm sound...');
      if (this.sounds.confirm) {
        await this.sounds.confirm.setPositionAsync(0);
        await this.sounds.confirm.playAsync();
        console.log('🔊 ✅ Confirm sound played');
      } else {
        console.log('🔊 ❌ Confirm sound not loaded');
      }
    } catch (error) {
      console.error('🔊 ❌ Failed to play confirm sound:', error);
    }
  }

  async showNotification(message, sender) {
    try {
      // Don't show notification if user is in the same chat
      if (this.currentChatUserId === sender._id) {
        return;
      }

      let messageText = message.text || 'Photo';
      if (message.image && !message.text) {
        messageText = '📷 Photo';
      }

      // Add to notification queue
      this.notificationQueue.push({
        id: message._id || Date.now().toString(),
        title: sender.fullname || sender.username || 'New Message',
        body: messageText,
        data: {
          senderId: sender._id,
          senderName: sender.fullname || sender.username,
          messageId: message._id,
        },
        timestamp: Date.now(),
      });

      // Play sound and vibrate
      await this.playNotificationSound();

      console.log('📱 Notification triggered:', messageText);
    } catch (error) {
      console.error('Failed to show notification:', error);
    }
  }

  setCurrentChatUser(userId) {
    this.currentChatUserId = userId;
    console.log('📱 Current chat user:', userId);
  }

  clearCurrentChatUser() {
    this.currentChatUserId = null;
  }

  setAppActive(isActive) {
    this.isAppActive = isActive;
  }

  async handleIncomingMessage(message, currentUserId) {
    try {
      console.log('🔔 handleIncomingMessage:', {
        messageSenderId: message.senderId,
        currentUserId: currentUserId,
        currentChatUserId: this.currentChatUserId,
        isAppActive: this.isAppActive
      });
      
      // Don't process messages from current user
      if (message.senderId === currentUserId) {
        console.log('🔔 Message from self, ignoring');
        return;
      }

      // If user is in the same chat, don't play any sound for incoming messages
      if (this.currentChatUserId === message.senderId) {
        console.log('🔔 User in same chat, no notification sound');
        // No sound for receiving messages in active chat
        return;
      }

      // Get sender info
      let senderInfo = {
        _id: message.senderId,
        fullname: message.senderName || message.senderFullname || 'Unknown User',
        username: message.senderUsername || 'unknown',
        profilePic: message.senderProfilePic || null,
      };

      // Try to get more info if needed
      if (!senderInfo.fullname || senderInfo.fullname === 'Unknown User') {
        try {
          const ApiService = (await import('./api')).default;
          const friends = await ApiService.getFriends();
          const friend = friends.find(f => f._id === message.senderId);
          if (friend) {
            senderInfo = {
              _id: friend._id,
              fullname: friend.fullname || friend.username,
              username: friend.username,
              profilePic: friend.profilePic,
            };
          }
        } catch (error) {
          console.log('Could not fetch sender info:', error);
        }
      }

      // Show notification
      await this.showNotification(message, senderInfo);
    } catch (error) {
      console.error('Failed to handle incoming message:', error);
    }
  }

  async handleMessageSent() {
    try {
      console.log('🔔 Message sent - playing confirm sound');
      // Check if in-chat sound is enabled
      if (this.inChatSoundEnabled) {
        await this.playConfirmSound();
      } else {
        console.log('🔔 In-chat sound disabled, skipping confirm sound');
      }
    } catch (error) {
      console.error('🔔 ❌ Failed to play message sent sound:', error);
    }
  }

  getNotifications() {
    return this.notificationQueue;
  }

  clearNotifications() {
    this.notificationQueue = [];
  }

  removeNotification(id) {
    this.notificationQueue = this.notificationQueue.filter(n => n.id !== id);
  }

  cleanup() {
    if (this.sounds.notification) {
      this.sounds.notification.unloadAsync();
    }
    if (this.sounds.confirm) {
      this.sounds.confirm.unloadAsync();
    }
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
    }
  }

  // For testing
  async testNotification() {
    await this.showNotification(
      { text: 'Test notification message', _id: 'test123' },
      { fullname: 'Test User', _id: 'testuser123' }
    );
  }

  // Expo-specific methods that won't throw errors
  async requestPermissions() {
    // In Expo Go, we can't request push permissions but we can still use sounds
    console.log('📱 Notification permissions not needed for sounds in Expo Go');
    return { granted: true };
  }

  getPushToken() {
    // No push token in Expo Go
    return null;
  }

  onForegroundEvent(callback) {
    // No-op in Expo Go
    console.log('📱 Foreground events not supported in Expo Go');
  }

  onBackgroundEvent(callback) {
    // No-op in Expo Go
    console.log('📱 Background events not supported in Expo Go');
  }

  // Settings management
  async loadSettings() {
    try {
      const inChatSoundSetting = await AsyncStorage.getItem('inChatSoundEnabled');
      this.inChatSoundEnabled = inChatSoundSetting !== null ? JSON.parse(inChatSoundSetting) : true;
      console.log('📱 In-chat sound setting loaded:', this.inChatSoundEnabled);
    } catch (error) {
      console.error('📱 Failed to load settings:', error);
      this.inChatSoundEnabled = true; // Default to enabled
    }
  }

  async setInChatSoundEnabled(enabled) {
    try {
      this.inChatSoundEnabled = enabled;
      await AsyncStorage.setItem('inChatSoundEnabled', JSON.stringify(enabled));
      console.log('📱 In-chat sound setting saved:', enabled);
    } catch (error) {
      console.error('📱 Failed to save in-chat sound setting:', error);
    }
  }

  getInChatSoundEnabled() {
    return this.inChatSoundEnabled;
  }
}

export default new SimpleNotificationService();
