import { Alert, Vibration } from 'react-native';
import { Audio } from 'expo-av';

class BasicNotificationService {
  constructor() {
    this.currentChatUserId = null;
    this.isAppActive = true;
    this.isInitialized = false;
    this.sounds = {
      notification: null,
      confirm: null,
    };
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Load sounds
      await this.loadSounds();
      this.isInitialized = true;
      console.log('🔊 Basic notification service initialized (sounds + vibration)');
    } catch (error) {
      console.error('Failed to initialize basic notification service:', error);
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

  // Notification for messages from other users (when not in same chat)
  async showNotification(message, sender) {
    try {
      // Only show notification if user is NOT in the same chat
      if (this.currentChatUserId === sender._id) {
        console.log('📱 User is in chat with sender, skipping notification');
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
      
      // In development, show an alert for testing
      if (__DEV__) {
        setTimeout(() => {
          Alert.alert(
            `💬 ${sender.fullname || sender.username}`,
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
      console.log('📳 Message sent confirmation vibration played');
    } catch (error) {
      console.error('Failed to play message sent vibration:', error);
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
    console.log('🧹 Basic notification service cleaned up');
  }

  // Test notification (for development)
  async testNotification() {
    await this.showNotification(
      { text: 'This is a test message' },
      { fullname: 'Test User', _id: 'test123' }
    );
  }
}

export default new BasicNotificationService();
