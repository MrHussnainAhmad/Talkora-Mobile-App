import io from 'socket.io-client';
import notificationService from './simpleNotificationService';
import BackendConfig from '../config/backend';

// Use centralized backend configuration
const SOCKET_URL = BackendConfig.SOCKET_URL;

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.messageListeners = new Set();
    this.onlineUsersListeners = new Set();
    this.connectionListeners = new Set();
    this.messagesReadListeners = new Set();
    this.typingListeners = new Set();
    this.friendRequestListeners = new Set();
    this.blockingListeners = new Set();
    this.notificationListeners = new Set();
    this.contactListListeners = new Set();
    this.accountActivityListeners = new Set();
    this.reconnectTimeout = null;
  }

  connect(userId) {
    if (this.socket && this.isConnected) {
      console.log('Socket already connected for user:', userId);
      return;
    }
    
    if (this.socket && !this.isConnected) {
      console.log('Socket exists but not connected, cleaning up first');
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }

    console.log('Connecting to socket for user:', userId, 'at', SOCKET_URL);
    this.socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['polling', 'websocket'], // Try polling first, then websocket
      timeout: 20000, // 20 seconds timeout
      forceNew: false, // Don't force new connection if one exists
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      maxReconnectionAttempts: 5,
      query: {
        userId: userId
      }
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
      this.isConnected = true;
      this.connectionListeners.forEach(listener => listener(true));
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected, reason:', reason);
      this.isConnected = false;
      this.connectionListeners.forEach(listener => listener(false));
      
      // Only retry if disconnection was not intentional
      if (reason !== 'io client disconnect' && reason !== 'client namespace disconnect') {
        console.log('Unexpected disconnection, socket.io will handle reconnection');
        // Let socket.io handle reconnection automatically
      }
    });

    // Reconnect with exponential backoff
    this.socket.on('reconnect_attempt', (attempt) => {
      console.log(`Reconnect attempt ${attempt}`);
      // Keep polling as primary transport if websocket was problematic
      this.socket.io.opts.transports = ['polling', 'websocket'];
    });

    // Listen for new messages
    this.socket.on('newMessage', (message) => {
      console.log('📨 New message received via Socket.IO:', message);
      console.log('📨 Message listeners count:', this.messageListeners.size);
      this.messageListeners.forEach(listener => listener(message));
      
      // Handle incoming message via notification service
      const currentUserId = this.socket.query.userId;
      notificationService.handleIncomingMessage(message, currentUserId);
    });

    // Listen for online users updates
    this.socket.on('getOnlineUsers', (users) => {
      console.log('Online users updated:', users);
      this.onlineUsersListeners.forEach(listener => listener(users));
    });

    // Listen for messages read events
    this.socket.on('messagesRead', (data) => {
      console.log('📖 Messages read event:', data);
      this.messagesReadListeners.forEach(listener => listener(data));
    });

    // Listen for typing events
    this.socket.on('userTyping', (data) => {
      console.log('⌨️ User typing event:', data);
      this.typingListeners.forEach(listener => listener(data));
    });

    this.socket.on('userStoppedTyping', (data) => {
      console.log('⌨️ User stopped typing event:', data);
      this.typingListeners.forEach(listener => listener({ ...data, isTyping: false }));
    });

    // Listen for friend request events
    this.socket.on('friendRequestReceived', (data) => {
      console.log('👥 Friend request received:', data);
      this.friendRequestListeners.forEach(listener => listener({ type: 'received', ...data }));
    });

    this.socket.on('friendRequestAccepted', (data) => {
      console.log('👥 Friend request accepted:', data);
      this.friendRequestListeners.forEach(listener => listener({ type: 'accepted', ...data }));
    });

    this.socket.on('friendRequestRejected', (data) => {
      console.log('👥 Friend request rejected:', data);
      this.friendRequestListeners.forEach(listener => listener({ type: 'rejected', ...data }));
    });

    // Listen for friend updates (when friends are added/removed)
    this.socket.on('friendListUpdated', (data) => {
      console.log('👥 Friend list updated:', data);
      this.friendRequestListeners.forEach(listener => listener({ type: 'listUpdated', ...data }));
    });

    // Listen for profile updates from friends
    this.socket.on('profileUpdated', (data) => {
      console.log('👤 Profile updated:', data);
      this.friendRequestListeners.forEach(listener => listener({ type: 'profileUpdated', ...data }));
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      
      // If websocket fails, try polling
      if (error.message && error.message.includes('websocket')) {
        console.log('WebSocket failed, falling back to polling...');
        this.socket.io.opts.transports = ['polling'];
      }
      
      // Don't immediately retry here - let socket.io handle it
      this.isConnected = false;
      this.connectionListeners.forEach(listener => listener(false));
    });
    
    this.socket.on('reconnect', () => {
      console.log('Socket reconnected successfully');
      this.isConnected = true;
      this.connectionListeners.forEach(listener => listener(true));
    });
    
    this.socket.on('reconnect_error', (error) => {
      console.error('Socket reconnection error:', error);
    });

    // Enhanced real-time events
    this.setupEnhancedEventListeners();
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      clearTimeout(this.reconnectTimeout); // Clear any pending reconnection attempts
      this.socket.removeAllListeners(); // Remove all listeners
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Message listeners
  onNewMessage(callback) {
    this.messageListeners.add(callback);
    return () => this.messageListeners.delete(callback);
  }

  // Online users listeners
  onOnlineUsersUpdate(callback) {
    this.onlineUsersListeners.add(callback);
    return () => this.onlineUsersListeners.delete(callback);
  }

  // Messages read listeners
  onMessagesRead(callback) {
    this.messagesReadListeners.add(callback);
    return () => this.messagesReadListeners.delete(callback);
  }

  // Typing listeners
  onTyping(callback) {
    this.typingListeners.add(callback);
    return () => this.typingListeners.delete(callback);
  }

  // Friend request listeners
  onFriendRequest(callback) {
    this.friendRequestListeners.add(callback);
    return () => this.friendRequestListeners.delete(callback);
  }

  // Connection listeners
  onConnectionChange(callback) {
    this.connectionListeners.add(callback);
    return () => this.connectionListeners.delete(callback);
  }

  // Send message removed - use API instead
  // Messages are sent via API which saves to DB and emits via Socket.IO

  // Join user to socket room
  joinRoom(userId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('joinRoom', userId);
    }
  }

  // Leave room
  leaveRoom(userId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leaveRoom', userId);
    }
  }

  // Get connection status
  getConnectionStatus() {
    return this.isConnected;
  }

  // Request online users sync
  requestOnlineUsersSync(userId) {
    if (this.socket && this.isConnected) {
      console.log('🔄 Requesting online users sync for user:', userId);
      this.socket.emit('requestOnlineUsers', userId);
    }
  }

  // Emit typing started
  emitTypingStarted(receiverId) {
    if (this.socket && this.isConnected) {
      console.log('⌨️ Emitting typing started to:', receiverId);
      this.socket.emit('typing', { receiverId });
    }
  }

  // Emit typing stopped
  emitTypingStopped(receiverId) {
    if (this.socket && this.isConnected) {
      console.log('⌨️ Emitting typing stopped to:', receiverId);
      this.socket.emit('stopTyping', { receiverId });
    }
  }

  // Retry connection with exponential backoff
  retryConnection(userId) {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    
    if (this.isConnected) {
      console.log('Already connected, skipping reconnection');
      return;
    }
    
    let attempt = 1;
    const maxAttempts = 5;
    
    const connectWithDelay = () => {
      if (attempt > maxAttempts) {
        console.log('Max reconnection attempts reached');
        return;
      }
      
      if (this.isConnected) {
        console.log('Connected during retry, stopping attempts');
        return;
      }
      
      const delay = Math.min(attempt * 1000, 10000); // Cap delay at 10 seconds
      console.log(`Attempting to reconnect... try #${attempt}, waiting ${delay}ms`);
      
      this.reconnectTimeout = setTimeout(() => {
        if (!this.isConnected) {
          // Disconnect existing socket before creating new one
          if (this.socket) {
            this.socket.removeAllListeners();
            this.socket.disconnect();
            this.socket = null;
          }
          
          attempt++;
          this.connect(userId); // Use connect method instead of socket.connect()
        }
      }, delay);
    };
    
    connectWithDelay();
  }

  // Setup enhanced event listeners for new features
  setupEnhancedEventListeners() {
    if (!this.socket) return;

    // Blocking events
    this.socket.on('youWereBlocked', (data) => {
      console.log('🚫 You were blocked by user:', data);
      this.blockingListeners.forEach(listener => listener({ type: 'blocked', ...data }));
    });

    this.socket.on('youWereUnblocked', (data) => {
      console.log('✅ You were unblocked by user:', data);
      this.blockingListeners.forEach(listener => listener({ type: 'unblocked', ...data }));
    });

    this.socket.on('blockActionConfirmed', (data) => {
      console.log('🔒 Block action confirmed:', data);
      this.blockingListeners.forEach(listener => listener({ type: 'actionConfirmed', ...data }));
    });

    // Contact list refresh events
    this.socket.on('refreshContactsList', (data) => {
      console.log('🔄 Contact list refresh requested:', data);
      this.contactListListeners.forEach(listener => listener(data));
    });

    // Notification events
    this.socket.on('notification', (data) => {
      console.log('🔔 Real-time notification received:', data);
      this.notificationListeners.forEach(listener => listener(data));
    });

    // Account activity events
    this.socket.on('userAccountDeleted', (data) => {
      console.log('🗑️ User account deleted:', data);
      this.accountActivityListeners.forEach(listener => listener({ type: 'accountDeleted', ...data }));
    });

    // Chat events
    this.socket.on('chatDeleted', (data) => {
      console.log('🗑️ Chat deleted:', data);
      this.accountActivityListeners.forEach(listener => listener({ type: 'chatDeleted', ...data }));
    });

    // Message received event for sound notifications
    this.socket.on('messageReceived', (data) => {
      console.log('📬 Message received notification:', data);
      this.notificationListeners.forEach(listener => listener({ type: 'messageReceived', ...data }));
    });

    // Message sent confirmation
    this.socket.on('messageSent', (data) => {
      console.log('✅ Message sent confirmation:', data);
      this.notificationListeners.forEach(listener => listener({ type: 'messageSent', ...data }));
    });

    // Friend request events (additional ones)
    this.socket.on('newFriendRequest', (data) => {
      console.log('👥 New friend request:', data);
      this.friendRequestListeners.forEach(listener => listener({ type: 'new', ...data }));
    });

    this.socket.on('friendRequestCancelled', (data) => {
      console.log('❌ Friend request cancelled:', data);
      this.friendRequestListeners.forEach(listener => listener({ type: 'cancelled', ...data }));
    });

    this.socket.on('friendRequestProcessed', (data) => {
      console.log('✅ Friend request processed:', data);
      this.friendRequestListeners.forEach(listener => listener({ type: 'processed', ...data }));
    });
  }

  // Enhanced listener methods
  onBlocking(callback) {
    this.blockingListeners.add(callback);
    return () => this.blockingListeners.delete(callback);
  }

  onNotification(callback) {
    this.notificationListeners.add(callback);
    return () => this.notificationListeners.delete(callback);
  }

  onContactListUpdate(callback) {
    this.contactListListeners.add(callback);
    return () => this.contactListListeners.delete(callback);
  }

  onAccountActivity(callback) {
    this.accountActivityListeners.add(callback);
    return () => this.accountActivityListeners.delete(callback);
  }

  // Enhanced emit methods
  emitBlockUser(userId) {
    if (this.socket && this.isConnected) {
      console.log('🚫 Emitting block user:', userId);
      this.socket.emit('blockUser', { userId });
    }
  }

  emitUnblockUser(userId) {
    if (this.socket && this.isConnected) {
      console.log('✅ Emitting unblock user:', userId);
      this.socket.emit('unblockUser', { userId });
    }
  }

  // Request contact list refresh
  requestContactListRefresh() {
    if (this.socket && this.isConnected) {
      console.log('🔄 Requesting contact list refresh');
      this.socket.emit('requestContactsRefresh');
    }
  }

  // Heartbeat to maintain connection
  startHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    this.heartbeatInterval = setInterval(() => {
      if (this.socket && this.isConnected) {
        this.socket.emit('ping', { timestamp: Date.now() });
      }
    }, 30000); // Every 30 seconds
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // Clean up all listeners
  removeAllCustomListeners() {
    this.messageListeners.clear();
    this.onlineUsersListeners.clear();
    this.connectionListeners.clear();
    this.messagesReadListeners.clear();
    this.typingListeners.clear();
    this.friendRequestListeners.clear();
    this.blockingListeners.clear();
    this.notificationListeners.clear();
    this.contactListListeners.clear();
    this.accountActivityListeners.clear();
  }
}

export default new SocketService();
