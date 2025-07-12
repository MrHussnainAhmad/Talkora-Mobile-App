import { Audio } from 'expo-av';
import { Platform, AppState, Vibration } from 'react-native';
import { router } from 'expo-router';

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
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Load sounds
      await this.loadSounds();

      // Track app state
      this.appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
        this.isAppActive = nextAppState === 'active';
      });

      this.isInitialized = true;
      console.log('📱 Simple notification service initialized');
    } catch (error) {
      console.error('Failed to initialize notification service:', error);
      this.isInitialized = true;
    }
  }

  async loadSounds() {
    try {
      // Set audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        staysActiveInBackground: true,
        interruptionModeIOS: 1, // DO_NOT_MIX
        interruptionModeAndroid: 1, // DO_NOT_MIX
      });

      // Load notification sound
      const { sound: notificationSound } = await Audio.Sound.createAsync(
        require('../assets/alerts/notification.mp3'),
        { shouldPlay: false, volume: 0.5 } // Reduced volume
      );
      this.sounds.notification = notificationSound;

      // Load confirm sound
      const { sound: confirmSound } = await Audio.Sound.createAsync(
        require('../assets/alerts/Confirm.wav'),
        { shouldPlay: false, volume: 0.3 } // Lower volume for confirm
      );
      this.sounds.confirm = confirmSound;

      console.log('🔊 Sounds loaded successfully');
    } catch (error) {
      console.error('Failed to load sounds:', error);
    }
  }

  async playNotificationSound() {
    try {
      if (this.sounds.notification) {
        await this.sounds.notification.setPositionAsync(0);
        await this.sounds.notification.playAsync();
        // Vibrate on notification
        if (Platform.OS === 'android') {
          Vibration.vibrate([0, 250, 100, 250]);
        } else {
          Vibration.vibrate();
        }
      }
    } catch (error) {
      console.error('Failed to play notification sound:', error);
    }
  }

  async playConfirmSound() {
    try {
      if (this.sounds.confirm) {
        await this.sounds.confirm.setPositionAsync(0);
        await this.sounds.confirm.playAsync();
      }
    } catch (error) {
      console.error('Failed to play confirm sound:', error);
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
      await this.playConfirmSound();
    } catch (error) {
      console.error('Failed to play message sent sound:', error);
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
}

export default new SimpleNotificationService();
