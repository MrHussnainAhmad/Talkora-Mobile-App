import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { KeyboardAvoidingView, Platform, View, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ApiService from '../../services/api';
import SocketService from '../../services/socket';
import notificationService from '../../services/simpleNotificationService';
import ChatHeader from '../../components/ChatHeader';
import ChatContainer from '../../components/ChatContainer';
import ChatInput from '../../components/ChatInput';
import ChatMenu from '../../components/ChatMenu';
import ChatSkeleton from '../../components/ChatSkeleton';
import PerformanceMonitor from '../../utils/performance';
import styles from '../../assets/styles/chat.style';

export default function ChatScreen() {
  const { userId, friendData } = useLocalSearchParams();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  
  // Initialize friend with passed data for instant loading
  const [friend, setFriend] = useState(() => {
    if (friendData) {
      try {
        return JSON.parse(friendData);
      } catch (error) {
        console.error('Error parsing friend data:', error);
        return null;
      }
    }
    return null;
  });
  
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [friendLoading, setFriendLoading] = useState(!friendData);
  const [menuVisible, setMenuVisible] = useState(false);
  
  // Memoize sorted messages to avoid sorting on every render
  const sortedMessages = useMemo(() => {
    if (!Array.isArray(messages)) return [];
    // Sort once and cache the result
    return [...messages].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }, [messages]);

  useEffect(() => {
    if (!user) {
      router.replace('/(auth)');
      return;
    }
    
    // Check if user is verified
    if (user && !user.isVerified) {
      router.replace('/(auth)');
      return;
    }

    // Start performance monitoring
    PerformanceMonitor.startMeasurement('chat-screen-load');
    
    // Ensure socket connection is established (non-blocking)
    if (user._id) {
      if (!SocketService.getConnectionStatus()) {
        console.log('Socket not connected, attempting to connect...');
        SocketService.connect(user._id);
      }
    }
    
    // Start message fetching and friend data fetching in parallel
    const promises = [fetchMessages()];
    
    // Only fetch friend data if not passed via navigation
    if (!friendData) {
      promises.push(fetchFriendData());
    }
    
    // Execute all promises in parallel for faster loading
    Promise.allSettled(promises).then(async () => {
      // Mark messages as read after data is loaded
      try {
        await ApiService.markMessagesAsRead(userId);
        console.log('📖 Messages marked as read successfully for:', userId);
      } catch (error) {
        console.log('Failed to mark messages as read:', error);
      }
    });
    
    // Set current chat user in notification service
    notificationService.setCurrentChatUser(userId);
    
  }, [userId, user]);

  // Set up real-time message listener
  useEffect(() => {
    console.log('🔗 Setting up message listener for userId:', userId);
    const unsubscribe = SocketService.onNewMessage((newMessage) => {
      console.log('📥 Received message in chat screen:', newMessage);
      console.log('📥 Current userId:', userId, 'Message senderId:', newMessage.senderId, 'receiverId:', newMessage.receiverId);
      
      // Only add message if it's from the current conversation
      if (newMessage.senderId === userId || newMessage.receiverId === userId) {
        console.log('✅ Message is for current conversation, adding to state');
        setMessages(prevMessages => {
          // Check if message already exists to avoid duplicates
          const exists = prevMessages.some(msg => msg._id === newMessage._id);
          if (!exists) {
            console.log('✅ New message, adding to state');
            // Add the new message - sorting will be handled by useMemo
            return [...prevMessages, newMessage];
          }
          console.log('⚠️ Message already exists, skipping');
          return prevMessages;
        });
        
        // If the message is from the other user (not current user), mark it as read immediately
        // since the user has this chat open
        if (newMessage.senderId === userId && newMessage.receiverId === user._id) {
          console.log('📖 Auto-marking message as read since chat is open');
          try {
            await ApiService.markMessagesAsRead(userId);
            console.log('📖 Auto-marked message as read successfully');
          } catch (error) {
            console.log('Failed to auto-mark message as read:', error);
          }
        }
      } else {
        console.log('❌ Message not for current conversation, ignoring');
      }
    });

    return () => {
      console.log('🔗 Cleaning up message listener for userId:', userId);
      unsubscribe();
    };
  }, [userId, user._id]);

  // Cleanup notification service when leaving chat
  useEffect(() => {
    return () => {
      notificationService.clearCurrentChatUser();
    };
  }, []);

  const fetchFriendData = useCallback(async () => {
    try {
      setFriendLoading(true);
      // Get friend data with messages info (includes lastSeen)
      const friends = await ApiService.getFriendsWithMessages();
      const friendData = friends.find(f => f._id === userId);
      
      // If not found in friends with messages, try regular friends
      if (!friendData) {
        const regularFriends = await ApiService.getFriends();
        const regularFriendData = regularFriends.find(f => f._id === userId);
        setFriend(regularFriendData);
      } else {
        setFriend(friendData);
      }
    } catch (error) {
      console.error('Error fetching friend data:', error);
      // Set a fallback friend object to prevent blocking UI
      setFriend({
        _id: userId,
        fullname: 'Loading...',
        username: 'Loading...',
        profilePic: null
      });
    } finally {
      setFriendLoading(false);
    }
  }, [userId]);

  const fetchMessages = useCallback(async () => {
    try {
      PerformanceMonitor.startMeasurement('fetch-messages');
      const messagesData = await ApiService.getMessages(userId);
      setMessages(messagesData);
      PerformanceMonitor.endMeasurement('fetch-messages');
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
      PerformanceMonitor.endMeasurement('chat-screen-load');
      PerformanceMonitor.logAllMeasurements();
    }
  }, [userId]);

  const handleSendMessage = async (messageText) => {
    try {
      console.log('📤 Sending message:', messageText, 'to userId:', userId);
      // ALWAYS send via API - this saves to database AND emits via Socket.IO
      const response = await ApiService.sendMessage(userId, messageText);
      console.log('📤 API response:', response);
      
      // Add the message to local state immediately for instant feedback
      setMessages(prevMessages => {
        console.log('📤 Adding message to local state');
        // Add message - sorting will be handled by useMemo
        return [...prevMessages, response];
      });
      
      // Play confirm sound
      await notificationService.handleMessageSent();
      
      console.log('✅ Message sent successfully');
    } catch (error) {
      console.error('❌ Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };

  const handleSendImage = async (base64Image) => {
    try {
      // ALWAYS send via API - this saves to database AND emits via Socket.IO
      const response = await ApiService.sendMessage(userId, { image: base64Image });
      
      // Add the message to local state immediately for instant feedback
      setMessages(prevMessages => {
        // Add message - sorting will be handled by useMemo
        return [...prevMessages, response];
      });
      
      // Play confirm sound
      await notificationService.handleMessageSent();
      
      console.log('Image sent successfully');
    } catch (error) {
      console.error('Error sending image:', error);
      Alert.alert('Error', 'Failed to send image. Please try again.');
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleMenuPress = () => {
    setMenuVisible(true);
  };

  const handlePrivacyPlus = async () => {
    try {
      await ApiService.deleteAllMessages(userId);
      // Clear messages from local state
      setMessages([]);
      Alert.alert('Success', 'All messages have been deleted.');
    } catch (error) {
      console.error('Error deleting messages:', error);
      Alert.alert('Error', 'Failed to delete messages. Please try again.');
    }
  };

  const handleDeleteFriend = async () => {
    try {
      await ApiService.deleteFriend(userId);
      Alert.alert('Success', 'Friend has been removed from your list.');
      // Navigate back to home screen
      router.replace('/home');
    } catch (error) {
      console.error('Error deleting friend:', error);
      Alert.alert('Error', 'Failed to remove friend. Please try again.');
    }
  };

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <ChatHeader 
        friend={friend}
        onBack={handleBack}
        onMenuPress={handleMenuPress}
      />
      
      <KeyboardAvoidingView 
        style={styles.chatContent}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {loading ? (
          <ChatSkeleton />
        ) : (
          <ChatContainer 
            messages={sortedMessages}
            currentUserId={user._id}
            loading={loading}
          />
        )}
        
        <View style={[styles.inputWrapper, {paddingBottom: insets.bottom}]}>
          <ChatInput 
            onSendMessage={handleSendMessage}
            onSendImage={handleSendImage}
            friendId={userId}
          />
        </View>
      </KeyboardAvoidingView>
      
      <ChatMenu 
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onPrivacyPlus={handlePrivacyPlus}
        onDeleteFriend={handleDeleteFriend}
        friendName={friend.fullname || friend.username || 'Unknown User'}
      />
    </View>
  );
}
