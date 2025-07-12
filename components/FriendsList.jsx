import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ApiService from '../services/api';
import SocketService from '../services/socket';
import styles from '../assets/styles/friendsList.style';

const FriendsList = ({ onFriendSelect, refreshTrigger }) => {
  const { user, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const [friends, setFriends] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastMessages, setLastMessages] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({}); // Track unread counts per friend
  const [refreshing, setRefreshing] = useState(false); // Track pull-to-refresh state

  // Function to clear unread messages for a specific friend
  const clearUnreadMessages = useCallback((friendId) => {
    setUnreadCounts(prev => ({
      ...prev,
      [friendId]: 0
    }));
  }, []);

  // Function to handle friend selection
  const handleFriendSelect = useCallback(async (friend) => {
    // Clear unread messages for this friend immediately in UI
    clearUnreadMessages(friend._id);
    
    // Mark messages as read on the server
    try {
      await ApiService.markMessagesAsRead(friend._id);
      console.log(`📖 Messages marked as read for friend: ${friend.fullname || friend.username}`);
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
    
    // Call the parent's onFriendSelect
    onFriendSelect(friend);
  }, [clearUnreadMessages, onFriendSelect]);

  const fetchFriends = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      }
      
      // Use the endpoint that returns friends with last message info
      const friendsData = await ApiService.getFriendsWithMessages();
      setFriends(friendsData);
      
      // Extract last messages and unread counts from the response
      const messagesMap = {};
      const unreadCountsMap = {};
      friendsData.forEach((friend) => {
        messagesMap[friend._id] = friend.lastMessage;
        unreadCountsMap[friend._id] = friend.unreadCount || 0;
      });
      setLastMessages(messagesMap);
      setUnreadCounts(unreadCountsMap);
    } catch (error) {
      console.error('Error fetching friends:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!user?._id) {
      setLoading(false);
      return;
    }
    
    fetchFriends();
    // Online users are handled via socket, not API
  }, [user?._id, fetchFriends]);

  // Handle refresh trigger from parent
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0 && user?._id) {
      console.log('🔄 Refreshing friends list due to trigger:', refreshTrigger);
      fetchFriends(true); // Use refresh version
      
      // Also ensure socket connection when refreshing
      if (!SocketService.getConnectionStatus()) {
        console.log('🔌 Socket not connected during refresh, reconnecting...');
        SocketService.connect(user._id);
      }
    }
  }, [refreshTrigger, user?._id, fetchFriends]);

  // Listen for friend request updates to refresh friends list immediately
  useEffect(() => {
    if (!user?._id) return;
    
    const unsubscribeFriendRequest = SocketService.onFriendRequest((data) => {
      console.log('👥 Friend request event in FriendsList:', data);
      
      // If a friend request was accepted, refresh the friends list immediately
      if (data.type === 'accepted' || data.type === 'listUpdated') {
        console.log('🔄 Refreshing friends list due to friend request acceptance');
        fetchFriends(false); // Refresh without showing refresh indicator
      }
      
      // If profile was updated, also refresh to get updated profile info
      if (data.type === 'profileUpdated') {
        console.log('🔄 Refreshing friends list due to profile update');
        fetchFriends(false);
      }
    });
    
    return unsubscribeFriendRequest;
  }, [user?._id, fetchFriends]);

  // Set up real-time online users listener
  useEffect(() => {
    const unsubscribe = SocketService.onOnlineUsersUpdate((users) => {
      console.log('📱 Online users updated:', users);
      setOnlineUsers(users || []); // Ensure we always have an array
    });

    // Also set up connection status listener to request online users when reconnected
    const unsubscribeConnection = SocketService.onConnectionChange((isConnected) => {
      if (isConnected) {
        console.log('📡 Socket reconnected, online users will be updated automatically');
      }
    });

    return () => {
      unsubscribe();
      unsubscribeConnection();
    };
  }, []);

  // Set up real-time message listener for last message updates
  useEffect(() => {
    if (!user?._id) return;
    
    const unsubscribeNewMessage = SocketService.onNewMessage((newMessage) => {
      // Update last message for the friend
      const friendId = newMessage.senderId === user._id ? newMessage.receiverId : newMessage.senderId;
      
      setLastMessages(prev => {
        // Only update if this message is newer than the current last message
        const currentLastMessage = prev[friendId];
        if (!currentLastMessage || new Date(newMessage.createdAt) > new Date(currentLastMessage.createdAt)) {
          console.log('📨 Updating last message for friend:', friendId, 'Message:', newMessage.text || 'Image');
          return {
            ...prev,
            [friendId]: newMessage
          };
        }
        return prev;
      });
      
      // If message is from another user (not current user), increment unread count
      if (newMessage.senderId !== user._id) {
        setUnreadCounts(prev => ({
          ...prev,
          [friendId]: (prev[friendId] || 0) + 1
        }));
      }
    });

    // Set up messages read listener to clear unread counts
    const unsubscribeMessagesRead = SocketService.onMessagesRead((data) => {
      console.log('📖 Messages read event received in FriendsList:', data);
      if (data.userId) {
        setUnreadCounts(prev => ({
          ...prev,
          [data.userId]: 0
        }));
      }
    });

    return () => {
      unsubscribeNewMessage();
      unsubscribeMessagesRead();
    };
  }, [user?._id]);

  const formatLastMessage = useCallback((message, friendId) => {
    if (!message) return 'No messages yet';
    if (!user?._id) return message.text || 'Message';
    
    const unreadCount = unreadCounts[friendId] || 0;
    
    // If there are unread messages, show the count
    if (unreadCount > 0) {
      if (unreadCount === 1) {
        // Show the actual last message for single unread
        if (message.image && !message.text) {
          return '📷 Photo';
        }
        return message.text || 'Message';
      } else if (unreadCount <= 4) {
        return `${unreadCount}+ Messages`;
      } else {
        return '4+ Messages';
      }
    }
    
    // Show regular last message
    const isCurrentUser = message.senderId === user._id;
    const prefix = isCurrentUser ? 'You: ' : '';
    
    if (message.image && !message.text) {
      return `${prefix}📷 Photo`;
    }
    
    return `${prefix}${message.text || 'Message'}`;
  }, [user?._id, unreadCounts]);

  const formatTime = useCallback((timestamp) => {
    if (!timestamp) return '';
    
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - messageTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  }, []);

  // Sort friends by last message time (most recent first) like WhatsApp
  const sortedFriends = useMemo(() => {
    return [...friends].sort((a, b) => {
      const messageA = lastMessages[a._id];
      const messageB = lastMessages[b._id];
      
      // If both have messages, sort by message time (newest first)
      if (messageA && messageB) {
        return new Date(messageB.createdAt) - new Date(messageA.createdAt);
      }
      
      // If only one has messages, prioritize the one with messages
      if (messageA && !messageB) return -1;
      if (!messageA && messageB) return 1;
      
      // If neither has messages, sort by friend name
      const nameA = a.fullname || a.username || '';
      const nameB = b.fullname || b.username || '';
      return nameA.localeCompare(nameB);
    });
  }, [friends, lastMessages]);

  const renderFriend = useCallback(({ item: friend }) => {
    const isOnline = onlineUsers.includes(friend._id);
    const lastMessage = lastMessages[friend._id];
    const unreadCount = unreadCounts[friend._id] || 0;
    const hasUnread = unreadCount > 0;
    
    return (
      <TouchableOpacity
        style={styles.friendItem}
        onPress={() => handleFriendSelect(friend)}
      >
        <View style={styles.avatarContainer}>
          <Image
            source={{
              uri: friend.profilePic || 'https://via.placeholder.com/50x50/cccccc/666666?text=U'
            }}
            style={styles.avatar}
          />
          {isOnline && <View style={styles.onlineIndicator} />}
        </View>
        
        <View style={styles.friendInfo}>
          <Text style={styles.friendName}>
            {friend.fullname || friend.username || 'Unknown User'}
          </Text>
          <Text style={[styles.lastMessage, hasUnread && styles.unreadMessage]} numberOfLines={1}>
            {formatLastMessage(lastMessage, friend._id)}
          </Text>
        </View>
        
        <View style={styles.messageTime}>
          <Text style={styles.timeText}>
            {formatTime(lastMessage?.createdAt)}
          </Text>
          {hasUnread ? (
            <View style={styles.unreadIndicator} />
          ) : isOnline ? (
            <View style={styles.onlineStatus}>
              <Text style={styles.onlineText}>Online</Text>
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  }, [onlineUsers, lastMessages, unreadCounts, formatLastMessage, formatTime, handleFriendSelect]);

  // Show loading while authentication is in progress
  if (authLoading || !user) {
    return (
      <View style={[styles.loadingContainer, theme === 'dark' && styles.darkLoadingContainer]}>
        <ActivityIndicator size="large" color={theme === 'dark' ? '#4CAF50' : '#1976D2'} />
        <Text style={[styles.loadingText, theme === 'dark' && styles.darkLoadingText]}>Loading...</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.loadingContainer, theme === 'dark' && styles.darkLoadingContainer]}>
        <ActivityIndicator size="large" color={theme === 'dark' ? '#4CAF50' : '#1976D2'} />
        <Text style={[styles.loadingText, theme === 'dark' && styles.darkLoadingText]}>Loading friends...</Text>
      </View>
    );
  }

  if (friends.length === 0) {
    return (
      <View style={[styles.emptyContainer, theme === 'dark' && styles.darkEmptyContainer]}>
        <Ionicons name="people-outline" size={64} color={theme === 'dark' ? '#666' : '#ccc'} />
        <Text style={[styles.emptyText, theme === 'dark' && styles.darkEmptyText]}>No friends yet</Text>
        <Text style={[styles.emptySubtext, theme === 'dark' && styles.darkEmptySubtext]}>Add friends to start chatting</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={sortedFriends}
        renderItem={renderFriend}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={15}
        getItemLayout={(data, index) => ({
          length: 70,
          offset: 70 * index,
          index,
        })}
        refreshing={refreshing}
        onRefresh={() => fetchFriends(true)}
      />
    </View>
  );
};

export default React.memo(FriendsList);
