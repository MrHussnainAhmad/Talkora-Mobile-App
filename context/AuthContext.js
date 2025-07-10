import React, { createContext, useContext, useState, useEffect } from 'react';
import ApiService from '../services/api';
import SocketService from '../services/socket';
import NotificationService from '../services/simpleNotificationService';
import { router } from 'expo-router';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const userData = await ApiService.checkAuth();
        setUser(userData);
        
        // Connect to Socket.IO if user is authenticated and verified
        if (userData && userData.isVerified) {
          console.log('🔗 Connecting socket for user:', userData._id);
          SocketService.connect(userData._id);
          // Initialize notification service
          await NotificationService.initialize();
          
          // Register push token with backend
          const pushToken = NotificationService.getPushToken();
          if (pushToken) {
            try {
              await ApiService.updatePushToken(pushToken);
              console.log('📱 Push token registered with backend');
            } catch (error) {
              console.error('Failed to register push token:', error);
            }
          }
        }
      } catch (error) {
        // Don't log "Unauthorized" as an error - it's expected when no user is logged in
        if (!error.message?.includes('Unauthorized')) {
          console.error('Auth Check Error:', error);
        }
        // User is not logged in, which is normal
        setUser(null);
        SocketService.disconnect();
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (credentials) => {
    const data = await ApiService.login(credentials);
    setUser(data);
    
    // Connect to Socket.IO after successful login
    if (data && data.isVerified) {
      SocketService.connect(data._id);
      // Initialize notification service
      await NotificationService.initialize();
      
      // Register push token with backend
      const pushToken = NotificationService.getPushToken();
      if (pushToken) {
        try {
          await ApiService.updatePushToken(pushToken);
          console.log('📱 Push token registered with backend');
        } catch (error) {
          console.error('Failed to register push token:', error);
        }
      }
    }
    
    router.replace('/home');
  };

  const logout = async () => {
    try {
      await ApiService.logout();
      setUser(null);
      SocketService.disconnect();
      NotificationService.cleanup();
      router.replace('/(auth)');
    } catch (error) {
      console.error('Logout Error:', error);
      setUser(null);
      SocketService.disconnect();
      NotificationService.cleanup();
      router.replace('/(auth)');
    }
  };

  const signup = async (userData) => {
    await ApiService.signup(userData);
  };

  // Navigation guard function
  const requireAuth = () => {
    if (!user && !loading) {
      router.replace('/(auth)');
      return false;
    }
    
    // Check if user is verified
    if (user && !user.isVerified && !loading) {
      router.replace('/(auth)');
      return false;
    }
    
    return true;
  };

  // Prevent authenticated users from accessing auth screens
  const requireGuest = () => {
    if (user && user.isVerified && !loading) {
      router.replace('/home');
      return false;
    }
    return true;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, signup, requireAuth, requireGuest }}>
      {children}
    </AuthContext.Provider>
  );
};
