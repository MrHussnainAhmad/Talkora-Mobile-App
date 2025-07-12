import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useFocusEffect } from 'expo-router';
import ApiService from '../services/api';
import SocketService from '../services/socket';
import ChatContextMenu from './ChatContextMenu';
import styles from '../assets/styles/friendsList.style';

const FriendsList = ({ onFriendSelect, refreshTrigger, searchQuery = '' }) => {
  const { user, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const [friends, setFriends] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastMessages, setLastMessages] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({}); // Track unread counts per friend
  const [refreshing, setRefreshing] = useState(false); // Track pull-to-refresh state
  
  // Context menu state
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [contextMenuFriend, setContextMenuFriend] = useState(null);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [pinnedFriends, setPinnedFriends] = useState(new Set());
  const [mutedFriends, setMutedFriends] = useState(new Set());
  const [blockedFriends, setBlockedFriends] = useState(new Set());
  
  // Filter friends based on search query
  const filteredFriends = useMemo(() => {
    if (!searchQuery.trim()) {
      return friends;
    }
    
    const query = searchQuery.toLowerCase().trim();
    return friends.filter(friend => 
      (friend.fullname && friend.fullname.toLowerCase().includes(query)) ||
      (friend.username && friend.username.toLowerCase().includes(query))
    );
  }, [friends, searchQuery]);

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

  // Refresh when screen comes into focus (user returns from chat)
  useFocusEffect(
    useCallback(() => {
      if (user?._id) {
        console.log('🔄 FriendsList focused, refreshing to update unread counts');
        // Small delay to ensure any pending API calls from chat screen complete
        const timeoutId = setTimeout(() => {
          fetchFriends(false); // Refresh without showing loading indicator
        }, 100);
        
        return () => clearTimeout(timeoutId);
      }
    }, [user?._id, fetchFriends])
  );

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
        console.log('📖 Clearing unread count for userId:', data.userId);
        setUnreadCounts(prev => {
          const newCounts = {
            ...prev,
            [data.userId]: 0
          };
          console.log('📖 Updated unread counts:', newCounts);
          return newCounts;
        });
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

  // Context menu handlers
  const handleLongPress = useCallback((friend, event) => {
    const { pageX, pageY } = event.nativeEvent;
    setContextMenuFriend(friend);
    setContextMenuPosition({ x: pageX, y: pageY });
    setContextMenuVisible(true);
  }, []);

  const handleContextMenuClose = useCallback(() => {
    setContextMenuVisible(false);
    setContextMenuFriend(null);
  }, []);

  const handlePinChat = useCallback(async (friend) => {
    try {
      const isPinned = pinnedFriends.has(friend._id);
      if (isPinned) {
        await ApiService.unpinChat(friend._id);
        setPinnedFriends(prev => {
          const newSet = new Set(prev);
          newSet.delete(friend._id);
          return newSet;
        });
      } else {
        await ApiService.pinChat(friend._id);
        setPinnedFriends(prev => new Set(prev).add(friend._id));
      }
      handleContextMenuClose();
    } catch (error) {
      console.error('Error pinning/unpinning chat:', error);
    }
  }, [pinnedFriends, handleContextMenuClose]);

  const handleMuteChat = useCallback(async (friend) => {
    try {
      const isMuted = mutedFriends.has(friend._id);
      if (isMuted) {
        await ApiService.unmuteChat(friend._id);
        setMutedFriends(prev => {
          const newSet = new Set(prev);
          newSet.delete(friend._id);
          return newSet;
        });
      } else {
        // Mute for 8 hours by default
        await ApiService.muteChat(friend._id, 8 * 60 * 60 * 1000);
        setMutedFriends(prev => new Set(prev).add(friend._id));
      }
      handleContextMenuClose();
    } catch (error) {
      console.error('Error muting/unmuting chat:', error);
    }
  }, [mutedFriends, handleContextMenuClose]);

  const handleBlockUser = useCallback(async (friend) => {
    try {
      const isBlocked = blockedFriends.has(friend._id);
      if (isBlocked) {
        await ApiService.unblockUser(friend._id);
        setBlockedFriends(prev => {
          const newSet = new Set(prev);
          newSet.delete(friend._id);
          return newSet;
        });
      } else {
        await ApiService.blockUser(friend._id);
        setBlockedFriends(prev => new Set(prev).add(friend._id));
      }
      handleContextMenuClose();
    } catch (error) {
      console.error('Error blocking/unblocking user:', error);
    }
  }, [blockedFriends, handleContextMenuClose]);

  const handleDeleteFriend = useCallback(async (friend) => {
    try {
      await ApiService.deleteFriend(friend._id);
      // Remove from friends list
      setFriends(prev => prev.filter(f => f._id !== friend._id));
      // Clean up related state
      setLastMessages(prev => {
        const newMessages = { ...prev };
        delete newMessages[friend._id];
        return newMessages;
      });
      setUnreadCounts(prev => {
        const newCounts = { ...prev };
        delete newCounts[friend._id];
        return newCounts;
      });
      setPinnedFriends(prev => {
        const newSet = new Set(prev);
        newSet.delete(friend._id);
        return newSet;
      });
      setMutedFriends(prev => {
        const newSet = new Set(prev);
        newSet.delete(friend._id);
        return newSet;
      });
      setBlockedFriends(prev => {
        const newSet = new Set(prev);
        newSet.delete(friend._id);
        return newSet;
      });
      handleContextMenuClose();
    } catch (error) {
      console.error('Error deleting friend:', error);
    }
  }, [handleContextMenuClose]);

  // Sort friends by last message time (most recent first) like WhatsApp
  const sortedFilteredFriends = useMemo(() => {
    return [...filteredFriends].sort((a, b) => {
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
  }, [filteredFriends, lastMessages]);

  const renderFriend = useCallback(({ item: friend }) => {
    const isOnline = onlineUsers.includes(friend._id);
    const lastMessage = lastMessages[friend._id];
    const unreadCount = unreadCounts[friend._id] || 0;
    const hasUnread = unreadCount > 0;
    
    return (
      <TouchableOpacity
        style={[styles.friendItem, theme === 'dark' && styles.darkFriendItem]}
        onPress={() => handleFriendSelect(friend)}
        onLongPress={(event) => handleLongPress(friend, event)}
      >
        <View style={styles.avatarContainer}>
          <Image
            source={{
              uri: friend.profilePic || 'https://via.placeholder.com/50x50/cccccc/666666?text=U'
            }}
            style={styles.avatar}
          />
          {isOnline && <View style={[styles.onlineIndicator, theme === 'dark' && styles.darkOnlineIndicator]} />}
        </View>
        
        <View style={styles.friendInfo}>
          <Text style={[styles.friendName, theme === 'dark' && styles.darkFriendName]}>
            {friend.fullname || friend.username || 'Unknown User'}
          </Text>
          <Text style={[
            styles.lastMessage, 
            theme === 'dark' && styles.darkLastMessage,
            hasUnread && styles.unreadMessage,
            hasUnread && theme === 'dark' && styles.darkUnreadMessage
          ]} numberOfLines={1}>
            {formatLastMessage(lastMessage, friend._id)}
          </Text>
        </View>
        
        <View style={styles.messageTime}>
          <Text style={[styles.timeText, theme === 'dark' && styles.darkTimeText]}>
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
  }, [onlineUsers, lastMessages, unreadCounts, formatLastMessage, formatTime, handleFriendSelect, theme]);

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

  if (filteredFriends.length === 0 && searchQuery.trim()) {
    return (
      <View style={[styles.emptyContainer, theme === 'dark' && styles.darkEmptyContainer]}>
        <Ionicons name="search-outline" size={64} color={theme === 'dark' ? '#666' : '#ccc'} />
        <Text style={[styles.emptyText, theme === 'dark' && styles.darkEmptyText]}>No contacts found</Text>
        <Text style={[styles.emptySubtext, theme === 'dark' && styles.darkEmptySubtext]}>Try searching with a different name</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, theme === 'dark' && styles.darkContainer]}>
      <FlatList
        data={sortedFilteredFriends}
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
      
      {/* Context Menu */}
      <ChatContextMenu
        visible={contextMenuVisible}
        position={contextMenuPosition}
        friend={contextMenuFriend}
        onClose={handleContextMenuClose}
        onPin={handlePinChat}
        onMute={handleMuteChat}
        onBlock={handleBlockUser}
        onDelete={handleDeleteFriend}
        isPinned={contextMenuFriend ? pinnedFriends.has(contextMenuFriend._id) : false}
        isMuted={contextMenuFriend ? mutedFriends.has(contextMenuFriend._id) : false}
        isBlocked={contextMenuFriend ? blockedFriends.has(contextMenuFriend._id) : false}
      />
    </View>
  );
};

export default React.memo(FriendsList);
