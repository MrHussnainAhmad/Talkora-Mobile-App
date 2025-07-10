// Socket connection test utility
import SocketService from '../services/socket';

export const testSocketConnection = async (userId) => {
  console.log('🧪 Testing socket connection for user:', userId);
  
  try {
    // Test connection
    SocketService.connect(userId);
    
    // Wait for connection
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Connection timeout')), 10000);
      
      const unsubscribe = SocketService.onConnectionChange((isConnected) => {
        if (isConnected) {
          clearTimeout(timeout);
          unsubscribe();
          resolve();
        }
      });
    });
    
    console.log('✅ Socket connection test passed');
    return true;
  } catch (error) {
    console.error('❌ Socket connection test failed:', error);
    return false;
  }
};

export const testOnlineUsers = () => {
  console.log('🧪 Testing online users functionality');
  
  return new Promise((resolve) => {
    const unsubscribe = SocketService.onOnlineUsersUpdate((users) => {
      console.log('✅ Online users received:', users);
      unsubscribe();
      resolve(users);
    });
    
    // Timeout after 5 seconds
    setTimeout(() => {
      unsubscribe();
      console.log('❌ Online users test timeout');
      resolve(null);
    }, 5000);
  });
};
