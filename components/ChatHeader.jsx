import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import SocketService from '../services/socket';
import { formatLastSeenForHeader } from '../utils/timeFormatter';
import styles from '../assets/styles/chatHeader.style';

const ChatHeader = React.memo(({ friend, onBack, onMenuPress }) => {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  
  // Provide default values for better performance
  const displayName = friend?.fullname || friend?.username || 'Loading...';
  const profilePic = friend?.profilePic || 'https://via.placeholder.com/40x40/cccccc/666666?text=U';
  
  const isOnline = friend?._id ? onlineUsers.includes(friend._id) : false;
  const isTyping = friend?._id ? typingUsers[friend._id] : false;
  
  // Debug friend data
  useEffect(() => {
    console.log('👤 Friend data changed:', friend);
    console.log('👤 Friend._id:', friend?._id);
    console.log('👤 Friend.lastSeen:', friend?.lastSeen);
    console.log('👤 Friend.fullname:', friend?.fullname);
  }, [friend]);
  
  // Set up socket listeners for online users and typing
  useEffect(() => {
    if (!friend?._id) return;
    
    console.log('🔌 Setting up socket listeners for friend:', friend._id);
    
    // Listen for online users updates
    const unsubscribeOnlineUsers = SocketService.onOnlineUsersUpdate((users) => {
      console.log('📶 Online users received:', users);
      console.log('📶 Friend is online:', users?.includes(friend._id));
      setOnlineUsers(users || []);
    });
    
    // Listen for typing events
    const unsubscribeTyping = SocketService.onTyping((data) => {
      console.log('⌨️ Typing event received:', data);
      console.log('⌨️ Friend._id:', friend._id, 'Data.senderId:', data.senderId);
      if (data.senderId === friend._id) {
        console.log('⌨️ Setting typing for friend:', friend._id, 'isTyping:', data.isTyping !== false);
        setTypingUsers(prev => ({
          ...prev,
          [friend._id]: data.isTyping !== false
        }));
      }
    });
    
    // Request online users sync
    if (user?._id) {
      console.log('🔄 Requesting online users sync');
      SocketService.requestOnlineUsersSync(user._id);
    }
    
    return () => {
      unsubscribeOnlineUsers();
      unsubscribeTyping();
    };
  }, [friend?._id, user?._id]);
  
  // Get status text and color
  const getStatusInfo = () => {
    console.log('📊 Status calculation:');
    console.log('  - isOnline:', isOnline);
    console.log('  - isTyping:', isTyping);
    console.log('  - friend.lastSeen:', friend?.lastSeen);
    console.log('  - onlineUsers:', onlineUsers);
    console.log('  - typingUsers:', typingUsers);
    
    // If user is online and typing, show typing
    if (isOnline && isTyping) {
      console.log('  - Result: typing...');
      return {
        text: 'typing...',
        color: '#4CAF50'
      };
    }
    
    // If user is online (but not typing), show online
    if (isOnline) {
      console.log('  - Result: online');
      return {
        text: 'online',
        color: '#4CAF50'
      };
    }
    
    // If user is offline, show last seen
    const lastSeenText = formatLastSeenForHeader(friend?.lastSeen);
    console.log('  - Result: last seen -', lastSeenText);
    return {
      text: lastSeenText,
      color: '#666666'
    };
  };
  
  const statusInfo = getStatusInfo();
  
  // Handle profile picture click
  const handleProfileClick = () => {
    if (friend?._id) {
      router.push(`/user-profile/${friend._id}`);
    }
  };
  
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Ionicons name="arrow-back" size={24} color="#1976D2" />
      </TouchableOpacity>
      
      <View style={styles.profileSection}>
        <TouchableOpacity onPress={handleProfileClick}>
          <Image
            source={{ uri: profilePic }}
            style={styles.profilePic}
          />
        </TouchableOpacity>
        <View style={styles.nameContainer}>
          <Text style={styles.friendName} numberOfLines={1} ellipsizeMode="tail">
            {displayName}
          </Text>
          <Text style={[styles.onlineStatus, { color: statusInfo.color }]} numberOfLines={1}>
            {statusInfo.text}
          </Text>
        </View>
      </View>
      
      <TouchableOpacity style={styles.menuButton} onPress={onMenuPress}>
        <Ionicons name="ellipsis-vertical" size={24} color="#1976D2" />
      </TouchableOpacity>
    </View>
  );
});

export default ChatHeader;