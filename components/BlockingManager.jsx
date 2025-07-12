import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Image,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import ApiService from '../services/api';
import SocketService from '../services/socket';
import { useTheme } from '../context/ThemeContext';
import styles from '../assets/styles/blocking.style';

export default function BlockingManager({ visible, onClose }) {
  const { theme } = useTheme();
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unblockingUsers, setUnblockingUsers] = useState(new Set());

  useEffect(() => {
    if (visible) {
      fetchBlockedUsers();
      setupSocketListeners();
    }

    return () => {
      cleanupSocketListeners();
    };
  }, [visible]);

  const setupSocketListeners = useCallback(() => {
    const unsubscribeBlocking = SocketService.onBlocking((data) => {
      console.log('🚫 Blocking event received:', data);
      
      if (data.type === 'actionConfirmed') {
        // Refresh the blocked users list
        fetchBlockedUsers();
      }
    });

    const unsubscribeContactList = SocketService.onContactListUpdate((data) => {
      console.log('🔄 Contact list update for blocking:', data);
      if (data.reason === 'blocking_update') {
        fetchBlockedUsers();
      }
    });

    return () => {
      unsubscribeBlocking();
      unsubscribeContactList();
    };
  }, []);

  const cleanupSocketListeners = useCallback(() => {
    // Socket listeners are automatically cleaned up by the return function
  }, []);

  const fetchBlockedUsers = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await ApiService.getBlockedUsers();
      setBlockedUsers(response.blockedUsers || []);
    } catch (error) {
      console.error('Error fetching blocked users:', error);
      Alert.alert('Error', 'Failed to load blocked users. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const handleUnblockUser = useCallback(async (userId, username) => {
    Alert.alert(
      'Unblock User',
      `Are you sure you want to unblock ${username}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unblock',
          style: 'destructive',
          onPress: async () => {
            setUnblockingUsers(prev => new Set([...prev, userId]));
            
            try {
              await ApiService.unblockUser(userId);
              
              // Remove from local state
              setBlockedUsers(prev => prev.filter(user => user._id !== userId));
              
              Alert.alert('Success', `${username} has been unblocked.`);
              
              // Clear cache to ensure fresh data
              ApiService.clearCache('/friends');
              ApiService.clearCache('/messages/users');
              
            } catch (error) {
              console.error('Error unblocking user:', error);
              Alert.alert('Error', 'Failed to unblock user. Please try again.');
            } finally {
              setUnblockingUsers(prev => {
                const newSet = new Set(prev);
                newSet.delete(userId);
                return newSet;
              });
            }
          },
        },
      ]
    );
  }, []);

  const renderBlockedUser = useCallback(({ item }) => {
    const isUnblocking = unblockingUsers.has(item._id);

    return (
      <View style={[styles.userItem, theme === 'dark' && styles.darkUserItem]}>
        <Image
          source={{
            uri: item.profilePic || 'https://via.placeholder.com/50x50/cccccc/666666?text=U'
          }}
          style={styles.avatar}
        />
        <View style={styles.userInfo}>
          <Text style={[styles.userName, theme === 'dark' && styles.darkUserName]}>
            {item.fullname}
          </Text>
          <Text style={[styles.userUsername, theme === 'dark' && styles.darkUserUsername]}>
            @{item.username}
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.unblockButton,
            isUnblocking && styles.unblockButtonDisabled
          ]}
          onPress={() => handleUnblockUser(item._id, item.fullname)}
          disabled={isUnblocking}
        >
          {isUnblocking ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark" size={16} color="#fff" />
              <Text style={styles.unblockButtonText}>Unblock</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  }, [theme, unblockingUsers, handleUnblockUser]);

  const getEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Ionicons
        name="shield-checkmark"
        size={64}
        color={theme === 'dark' ? '#666' : '#ccc'}
      />
      <Text style={[styles.emptyText, theme === 'dark' && styles.darkEmptyText]}>
        No blocked users
      </Text>
      <Text style={[styles.emptySubtext, theme === 'dark' && styles.darkEmptySubtext]}>
        Users you block will appear here
      </Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, theme === 'dark' && styles.darkContainer]}>
        {/* Header */}
        <View style={[styles.header, theme === 'dark' && styles.darkHeader]}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons 
              name="close" 
              size={24} 
              color={theme === 'dark' ? '#fff' : '#1976D2'} 
            />
          </TouchableOpacity>
          <Text style={[styles.title, theme === 'dark' && styles.darkTitle]}>
            Blocked Users
          </Text>
          <View style={styles.headerRight} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1976D2" />
              <Text style={[styles.loadingText, theme === 'dark' && styles.darkLoadingText]}>
                Loading blocked users...
              </Text>
            </View>
          ) : (
            <FlatList
              data={blockedUsers}
              renderItem={renderBlockedUser}
              keyExtractor={(item) => item._id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => fetchBlockedUsers(true)}
                  colors={['#1976D2']}
                  tintColor={theme === 'dark' ? '#fff' : '#1976D2'}
                />
              }
              ListEmptyComponent={getEmptyComponent}
            />
          )}
        </View>

        {/* Footer Info */}
        <View style={[styles.footer, theme === 'dark' && styles.darkFooter]}>
          <Text style={[styles.footerText, theme === 'dark' && styles.darkFooterText]}>
            Blocked users cannot send you messages or see when you're online.
          </Text>
        </View>
      </View>
    </Modal>
  );
}
