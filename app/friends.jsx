import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import SafeScreen from '../components/SafeScreen';
import ApiService from '../services/api';
import SocketService from '../services/socket';
import { useAuth } from '../context/AuthContext';
import styles from '../assets/styles/friends.style';

const TABS = {
  SEARCH: 'search',
  RECEIVED: 'received',
  SENT: 'sent',
};

export default function Friends() {
  const router = useRouter();
  const { user } = useAuth();
  const { tab = TABS.SEARCH } = useLocalSearchParams();
  
  const [activeTab, setActiveTab] = useState(tab);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // Fetch data based on active tab
  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      switch (activeTab) {
        case TABS.RECEIVED:
          const received = await ApiService.getIncomingRequests();
          setReceivedRequests(received);
          break;
        case TABS.SENT:
          const sent = await ApiService.getOutgoingRequests();
          setSentRequests(sent);
          break;
        case TABS.SEARCH:
          // Search is handled separately
          break;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab]);

  // Search users
  const searchUsers = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const results = await ApiService.searchUsers(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching users:', error);
      // Only show error if it's not about minimum characters
      if (!error.message.includes('least') && !error.message.includes('characters')) {
        Alert.alert('Error', 'Failed to search users. Please try again.');
      }
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // Send friend request
  const sendFriendRequest = useCallback(async (userId) => {
    try {
      await ApiService.sendFriendRequest(userId);
      Alert.alert('Success', 'Friend request sent successfully!');
      
      // Update search results to show request sent
      setSearchResults(prev => 
        prev.map(user => 
          user._id === userId 
            ? { ...user, requestSent: true }
            : user
        )
      );
      
      // Refresh sent requests if on that tab
      if (activeTab === TABS.SENT) {
        fetchData();
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
      Alert.alert('Error', error.message || 'Failed to send friend request');
    }
  }, [activeTab, fetchData]);

  // Accept friend request
  const acceptFriendRequest = useCallback(async (requestId) => {
    try {
      await ApiService.acceptFriendRequest(requestId);
      Alert.alert('Success', 'Friend request accepted!');
      
      // Remove from received requests
      setReceivedRequests(prev => 
        prev.filter(request => request._id !== requestId)
      );
      
      // Force refresh of home screen pending count
      router.replace('/home');
    } catch (error) {
      console.error('Error accepting friend request:', error);
      Alert.alert('Error', error.message || 'Failed to accept friend request');
    }
  }, []);

  // Reject friend request
  const rejectFriendRequest = useCallback(async (requestId) => {
    try {
      await ApiService.rejectFriendRequest(requestId);
      Alert.alert('Success', 'Friend request rejected');
      
      // Remove from received requests
      setReceivedRequests(prev => 
        prev.filter(request => request._id !== requestId)
      );
      
      // Force refresh of home screen pending count
      router.replace('/home');
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      Alert.alert('Error', error.message || 'Failed to reject friend request');
    }
  }, []);

  // Cancel friend request
  const cancelFriendRequest = useCallback(async (requestId) => {
    try {
      await ApiService.cancelFriendRequest(requestId);
      Alert.alert('Success', 'Friend request cancelled');
      
      // Remove from sent requests
      setSentRequests(prev => 
        prev.filter(request => request._id !== requestId)
      );
    } catch (error) {
      console.error('Error cancelling friend request:', error);
      Alert.alert('Error', error.message || 'Failed to cancel friend request');
    }
  }, []);

  // Handle search input change
  const handleSearchChange = useCallback((text) => {
    setSearchQuery(text);
    if (text.trim()) {
      searchUsers(text);
    } else {
      setSearchResults([]);
    }
  }, [searchUsers]);

  // Handle tab change
  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    setSearchQuery('');
    setSearchResults([]);
  }, []);

  // Fetch data when tab changes
  useEffect(() => {
    if (activeTab !== TABS.SEARCH) {
      fetchData();
    }
  }, [activeTab, fetchData]);
  
  // Listen for real-time friend request updates
  useEffect(() => {
    if (user?._id) {
      const unsubscribe = SocketService.onFriendRequest((data) => {
        console.log('👥 Friend request update in friends screen:', data);
        
        // Refresh the relevant tab data
        if (data.type === 'received' && activeTab === TABS.RECEIVED) {
          fetchData();
        } else if (data.type === 'accepted' && activeTab === TABS.SENT) {
          fetchData();
        } else if (data.type === 'rejected' && activeTab === TABS.SENT) {
          fetchData();
        }
      });
      
      return () => {
        unsubscribe();
      };
    }
  }, [user?._id, activeTab, fetchData]);

  // Render search result item
  const renderSearchItem = useCallback(({ item }) => {
    const getButtonState = () => {
      switch (item.relationshipStatus) {
        case 'friends':
          return { text: 'Friends', disabled: true, style: styles.actionButtonDisabled };
        case 'pending_sent':
          return { text: 'Sent', disabled: true, style: styles.actionButtonDisabled };
        case 'pending_received':
          return { text: 'Pending', disabled: true, style: styles.actionButtonDisabled };
        case 'none':
        default:
          return { text: 'Add', disabled: false, style: {} };
      }
    };

    const buttonState = getButtonState();

    return (
      <View style={styles.userItem}>
        <Image
          source={{
            uri: item.profilePic || 'https://via.placeholder.com/50x50/cccccc/666666?text=U'
          }}
          style={styles.avatar}
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.fullname}</Text>
          <Text style={styles.userUsername}>@{item.username}</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.actionButton,
            buttonState.style
          ]}
          onPress={() => sendFriendRequest(item._id)}
          disabled={buttonState.disabled}
        >
          <Text style={[
            styles.actionButtonText,
            buttonState.disabled && styles.actionButtonTextDisabled
          ]}>
            {buttonState.text}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }, [sendFriendRequest]);

  // Render received request item
  const renderReceivedItem = useCallback(({ item }) => (
    <View style={styles.userItem}>
      <Image
        source={{
          uri: item.senderId.profilePic || 'https://via.placeholder.com/50x50/cccccc/666666?text=U'
        }}
        style={styles.avatar}
      />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.senderId.fullname}</Text>
        <Text style={styles.userUsername}>@{item.senderId.username}</Text>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.acceptButton]}
          onPress={() => acceptFriendRequest(item._id)}
        >
          <Text style={styles.actionButtonText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.rejectButton]}
          onPress={() => rejectFriendRequest(item._id)}
        >
          <Text style={styles.actionButtonText}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  ), [acceptFriendRequest, rejectFriendRequest]);

  // Render sent request item
  const renderSentItem = useCallback(({ item }) => (
    <View style={styles.userItem}>
      <Image
        source={{
          uri: item.receiverId.profilePic || 'https://via.placeholder.com/50x50/cccccc/666666?text=U'
        }}
        style={styles.avatar}
      />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.receiverId.fullname}</Text>
        <Text style={styles.userUsername}>@{item.receiverId.username}</Text>
        <Text style={styles.statusText}>Request sent</Text>
      </View>
      <TouchableOpacity
        style={[styles.actionButton, styles.cancelButton]}
        onPress={() => cancelFriendRequest(item._id)}
      >
        <Text style={styles.actionButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  ), [cancelFriendRequest]);

  // Get current data based on active tab
  const getCurrentData = () => {
    switch (activeTab) {
      case TABS.SEARCH:
        return searchResults;
      case TABS.RECEIVED:
        return receivedRequests;
      case TABS.SENT:
        return sentRequests;
      default:
        return [];
    }
  };

  // Get current render function
  const getCurrentRenderItem = () => {
    switch (activeTab) {
      case TABS.SEARCH:
        return renderSearchItem;
      case TABS.RECEIVED:
        return renderReceivedItem;
      case TABS.SENT:
        return renderSentItem;
      default:
        return renderSearchItem;
    }
  };

  // Get empty state message
  const getEmptyMessage = () => {
    switch (activeTab) {
      case TABS.SEARCH:
        return searchQuery ? 'No users found' : 'Start typing to search for users';
      case TABS.RECEIVED:
        return 'No friend requests received';
      case TABS.SENT:
        return 'No friend requests sent';
      default:
        return 'No data available';
    }
  };

  return (
    <SafeScreen>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#1976D2" />
          </TouchableOpacity>
          <Text style={styles.title}>Friends</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Tab Bar */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, activeTab === TABS.SEARCH && styles.activeTab]}
            onPress={() => handleTabChange(TABS.SEARCH)}
          >
            <Ionicons
              name="search"
              size={20}
              color={activeTab === TABS.SEARCH ? '#1976D2' : '#666'}
            />
            <Text style={[
              styles.tabText,
              activeTab === TABS.SEARCH && styles.activeTabText
            ]}>
              Search
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === TABS.RECEIVED && styles.activeTab]}
            onPress={() => handleTabChange(TABS.RECEIVED)}
          >
            <Ionicons
              name="person-add"
              size={20}
              color={activeTab === TABS.RECEIVED ? '#1976D2' : '#666'}
            />
            <Text style={[
              styles.tabText,
              activeTab === TABS.RECEIVED && styles.activeTabText
            ]}>
              Received
            </Text>
            {receivedRequests.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{receivedRequests.length}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === TABS.SENT && styles.activeTab]}
            onPress={() => handleTabChange(TABS.SENT)}
          >
            <Ionicons
              name="paper-plane"
              size={20}
              color={activeTab === TABS.SENT ? '#1976D2' : '#666'}
            />
            <Text style={[
              styles.tabText,
              activeTab === TABS.SENT && styles.activeTabText
            ]}>
              Sent
            </Text>
            {sentRequests.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{sentRequests.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Search Input (only for search tab) */}
        {activeTab === TABS.SEARCH && (
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search users..."
              value={searchQuery}
              onChangeText={handleSearchChange}
              autoFocus={true}
            />
            {searchLoading && (
              <ActivityIndicator size="small" color="#1976D2" style={styles.searchLoader} />
            )}
          </View>
        )}

        {/* Content */}
        <View style={styles.content}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1976D2" />
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          ) : (
            <FlatList
              data={getCurrentData()}
              renderItem={getCurrentRenderItem()}
              keyExtractor={(item) => item._id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => fetchData(true)}
                  colors={['#1976D2']}
                />
              }
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons
                    name={
                      activeTab === TABS.SEARCH
                        ? "search"
                        : activeTab === TABS.RECEIVED
                        ? "person-add"
                        : "paper-plane"
                    }
                    size={64}
                    color="#ccc"
                  />
                  <Text style={styles.emptyText}>{getEmptyMessage()}</Text>
                </View>
              }
            />
          )}
        </View>
      </View>
    </SafeScreen>
  );
}
