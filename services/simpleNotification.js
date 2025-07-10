import { Audio } from 'expo-av';
import { Alert } from 'react-native';

class SimpleNotificationService {
  constructor() {
    this.sounds = {
      notification: null,
      confirm: null,
    };
    this.currentChatUserId = null;
    this.isAppActive = true;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Load sounds
      await this.loadSounds();
      this.isInitialized = true;
      console.log('🔊 Simple notification service initialized (audio only)');
    } catch (error) {
      console.error('Failed to initialize simple notification service:', error);
    }
  }

  async loadSounds() {
    try {
      // Load notification sound
      const { sound: notificationSound } = await Audio.Sound.createAsync(
        require('../assets/alerts/notification.mp3'),
        { shouldPlay: false }
      );
      this.sounds.notification = notificationSound;

      // Load confirm sound
      const { sound: confirmSound } = await Audio.Sound.createAsync(
        require('../assets/alerts/Confirm.wav'),
        { shouldPlay: false }
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
        await this.sounds.notification.replayAsync();
        console.log('🔊 Notification sound played');
      }
    } catch (error) {
      console.error('Failed to play notification sound:', error);
    }
  }

  async playConfirmSound() {
    try {
      if (this.sounds.confirm) {
        await this.sounds.confirm.replayAsync();
        console.log('🔊 Confirm sound played');
      }
    } catch (error) {
      console.error('Failed to play confirm sound:', error);
    }
  }

  // Simple notification - just sound + console log (for development)
  async showNotification(message, sender) {
    try {
      // Don't show notification if user is in the same chat
      if (this.currentChatUserId === sender._id) {
        console.log('📱 User is in chat with sender, skipping notification');
        return;
      }

      // Don't show notification if app is active and user is engaged
      if (this.isAppActive && this.currentChatUserId) {
        console.log('📱 App is active and user is in a chat, skipping notification');
        return;
      }

      let messageText = message.text || 'Photo';
      if (message.image && !message.text) {
        messageText = 'Photo';
      }

      // Play notification sound
      await this.playNotificationSound();

      // For development - log the notification details
      console.log('📱 NEW MESSAGE NOTIFICATION:');
      console.log('  From:', sender.fullname || sender.username || 'Unknown User');
      console.log('  Message:', messageText);
      
      // In development, you could also show an alert for testing
      if (__DEV__) {
        setTimeout(() => {
          Alert.alert(
            `New message from ${sender.fullname || sender.username}`,
            messageText,
            [
              { text: 'OK', style: 'default' }
            ]
          );
        }, 100);
      }

    } catch (error) {
      console.error('Failed to show notification:', error);
    }
  }

  // Set current chat user ID to prevent notifications from same user
  setCurrentChatUser(userId) {
    this.currentChatUserId = userId;
    console.log('📱 Current chat user set to:', userId);
  }

  // Clear current chat user
  clearCurrentChatUser() {
    this.currentChatUserId = null;
    console.log('📱 Current chat user cleared');
  }

  // Set app active state
  setAppActive(isActive) {
    this.isAppActive = isActive;
    console.log('📱 App active state:', isActive);
  }

  // Handle incoming message
  async handleIncomingMessage(message, currentUserId) {
    try {
      // Don't process messages from current user
      if (message.senderId === currentUserId) {
        return;
      }

      // Don't show notification if user is in the same chat
      if (this.currentChatUserId === message.senderId) {
        console.log('📱 User is in chat with sender, skipping notification');
        return;
      }

      // Get sender info from message or create basic info
      const senderInfo = {
        _id: message.senderId,
        fullname: message.senderName || message.senderFullname || 'Unknown User',
        username: message.senderUsername || 'unknown',
        profilePic: message.senderProfilePic || null,
      };

      // Show notification
      await this.showNotification(message, senderInfo);

    } catch (error) {
      console.error('Failed to handle incoming message:', error);
    }
  }

  // Handle message sent by current user
  async handleMessageSent() {
    try {
      await this.playConfirmSound();
      console.log('🔊 Message sent confirmation sound played');
    } catch (error) {
      console.error('Failed to play message sent sound:', error);
    }
  }

  // Clean up
  cleanup() {
    // Unload sounds
    if (this.sounds.notification) {
      this.sounds.notification.unloadAsync();
    }
    if (this.sounds.confirm) {
      this.sounds.confirm.unloadAsync();
    }
  }

  // Test notification (for development)
  async testNotification() {
    await this.showNotification(
      { text: 'This is a test message' },
      { fullname: 'Test User', _id: 'test123' }
    );
  }
}

export default new SimpleNotificationService();
