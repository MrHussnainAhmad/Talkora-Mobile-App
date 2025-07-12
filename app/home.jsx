import React, { useState, useEffect, useCallback, useMemo } from "react";
import { View, Text, TouchableOpacity, Modal, TextInput, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from "../assets/styles/home.style";
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { router, useFocusEffect } from 'expo-router';
import FriendsList from '../components/FriendsList';
import SafeScreen from '../components/SafeScreen';
import ApiService from '../services/api';
import SocketService from '../services/socket';

export default function Home() {
  const { logout, user, loading } = useAuth();
  const { theme } = useTheme();
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [friendsModalVisible, setFriendsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [isFabExpanded, setIsFabExpanded] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [fabAnimation] = useState(new Animated.Value(0));
  const [overlayAnimation] = useState(new Animated.Value(0));
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [chatListSearchQuery, setChatListSearchQuery] = useState("");
  
  useEffect(() => {
    if (!user && !loading) {
      router.replace('/(auth)');
      return;
    }
    
    if (user && !user.isVerified && !loading) {
      router.replace('/(auth)');
      return;
    }
    
    if (user && user.isVerified && !loading) {
      const isConnected = SocketService.getConnectionStatus();
      if (!isConnected) {
        SocketService.connect(user._id);
      }
    }
  }, [user, loading]);

  useFocusEffect(
    React.useCallback(() => {
      setRefreshKey(prev => prev + 1);
      
      if (user?._id) {
        const isConnected = SocketService.getConnectionStatus();
        if (!isConnected) {
          SocketService.connect(user._id);
        }
        fetchPendingRequestsCount();
      }
    }, [user?._id])
  );
  
  const fetchPendingRequestsCount = useCallback(async () => {
    try {
      const requests = await ApiService.getIncomingRequests();
      setPendingRequestsCount(requests.length);
    } catch (error) {
      console.error('Error fetching pending requests:', error);
    }
  }, []);
  
  useEffect(() => {
    if (user?._id) {
      fetchPendingRequestsCount();
    }
  }, [user?._id]);
  
  // Listen for real-time friend request updates
  useEffect(() => {
    if (user?._id) {
      const unsubscribe = SocketService.onFriendRequest((data) => {
        console.log('👥 Friend request update:', data);
        
        // Refresh pending requests count
        fetchPendingRequestsCount();
        
        // Show notification for new friend requests
        if (data.type === 'received') {
          // You could show a toast notification here
          console.log('📬 New friend request received from:', data.from?.fullname || data.from?.username);
        }
      });
      
      return () => {
        unsubscribe();
      };
    }
  }, [user?._id, fetchPendingRequestsCount]);
  
  const handleProfilePress = useCallback(() => {
    setProfileModalVisible(true);
  }, []);

  const collapseFabImmediately = useCallback(() => {
    setIsFabExpanded(false);
    setShowOverlay(false);
    fabAnimation.setValue(0);
    overlayAnimation.setValue(0);
  }, [fabAnimation, overlayAnimation]);

  const toggleFab = useCallback(() => {
    if (isFabExpanded) {
      Animated.parallel([
        Animated.timing(fabAnimation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnimation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start(() => {
        setShowOverlay(false);
      });
      setIsFabExpanded(false);
    } else {
      setShowOverlay(true);
      Animated.parallel([
        Animated.timing(fabAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
      setIsFabExpanded(true);
    }
  }, [isFabExpanded, fabAnimation, overlayAnimation]);

  const handleFriendsPress = useCallback(() => {
    setFriendsModalVisible(true);
  }, []);

  const handleSearchPress = useCallback(() => {
    collapseFabImmediately();
    router.push('/friends?tab=search');
  }, [collapseFabImmediately]);

  const handleRequestPress = useCallback(() => {
    collapseFabImmediately();
    router.push('/friends?tab=received');
  }, [collapseFabImmediately]);

  const handleSentPress = useCallback(() => {
    collapseFabImmediately();
    router.push('/friends?tab=sent');
  }, [collapseFabImmediately]);

const handleSettingsPress = useCallback(() => {
    setProfileModalVisible(false);
    router.push('/settings');
  }, []);

  const handleProfileMenuPress = useCallback(() => {
    setProfileModalVisible(false);
    router.push('/profile');
  }, []);

  const handleSearchSubmit = useCallback(() => {
    console.log("Searching for:", searchQuery);
  }, [searchQuery]);

  const handleLogout = useCallback(() => {
    setProfileModalVisible(false);
    logout();
  }, [logout]);

  const handleFriendSelect = useCallback((friend) => {
    ApiService.getMessages(friend._id).catch(err => {});
    
    router.push({
      pathname: `/chat/${friend._id}`,
      params: {
        friendData: JSON.stringify({
          _id: friend._id,
          fullname: friend.fullname,
          username: friend.username,
          profilePic: friend.profilePic
        })
      }
    });
  }, []);

  return (
    <SafeScreen>
      <View style={[styles.container, theme === 'dark' && styles.darkContainer]}>
        {/* HEADER */}
        <View style={[styles.header, theme === 'dark' && styles.darkHeader]}>
          <Text style={[styles.appName, theme === 'dark' && styles.darkAppName]}>Talkora</Text>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={handleProfilePress}
          >
            <Ionicons name="person-circle-outline" size={30} color={theme === 'dark' ? '#4CAF50' : '#1976D2'} />
          </TouchableOpacity>
        </View>

        {/* SEARCH BAR */}
        <View style={[styles.searchContainer, theme === 'dark' && styles.darkSearchContainer]}>
          <View style={[styles.searchBar, theme === 'dark' && styles.darkSearchBar]}>
            <Ionicons 
              name="search" 
              size={20} 
              color={theme === 'dark' ? '#9BA1A6' : '#666'} 
              style={styles.searchIcon}
            />
            <TextInput
              style={[styles.searchInput, theme === 'dark' && styles.darkSearchInput]}
              placeholder="Search contacts..."
              placeholderTextColor={theme === 'dark' ? '#9BA1A6' : '#999'}
              value={chatListSearchQuery}
              onChangeText={setChatListSearchQuery}
              returnKeyType="search"
            />
            {chatListSearchQuery.length > 0 && (
              <TouchableOpacity 
                onPress={() => setChatListSearchQuery('')}
                style={styles.clearButton}
              >
                <Ionicons 
                  name="close-circle" 
                  size={18} 
                  color={theme === 'dark' ? '#9BA1A6' : '#666'} 
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* MAIN CONTAINER */}
        <View style={styles.mainContainer}>
          <FriendsList 
            onFriendSelect={handleFriendSelect} 
            refreshTrigger={refreshKey}
            searchQuery={chatListSearchQuery}
          />
          
          {showOverlay && (
            <Animated.View
              style={[
                styles.fabOverlay,
                { opacity: overlayAnimation }
              ]}
            >
              <TouchableOpacity
                style={styles.fabOverlayTouchable}
                onPress={toggleFab}
                activeOpacity={1}
              />
            </Animated.View>
          )}
          
          <View style={styles.fabContainer}>
            {/* Request Button with Badge */}
            <Animated.View
              style={[
                styles.fabSubButton,
                {
                  opacity: fabAnimation,
                  transform: [
                    {
                      translateY: fabAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -140],
                      }),
                    },
                  ],
                },
              ]}
            >
              <TouchableOpacity
                style={[styles.fabButton, styles.fabSubButtonStyle]}
                onPress={handleRequestPress}
                activeOpacity={0.8}
              >
                <Ionicons name="person-add" size={20} color="#ffffff" />
              </TouchableOpacity>
              <Text style={styles.fabButtonLabel}>Requests</Text>
              
              {/* Notification Badge */}
              {pendingRequestsCount > 0 && (
                <View style={styles.fabBadge}>
                  <Text style={styles.fabBadgeText}>
                    {pendingRequestsCount > 9 ? '9+' : pendingRequestsCount}
                  </Text>
                </View>
              )}
            </Animated.View>
            
            {/* Search Button */}
            <Animated.View
              style={[
                styles.fabSubButton,
                {
                  opacity: fabAnimation,
                  transform: [
                    {
                      translateY: fabAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -70],
                      }),
                    },
                  ],
                },
              ]}
            >
              <TouchableOpacity
                style={[styles.fabButton, styles.fabSubButtonStyle]}
                onPress={handleSearchPress}
                activeOpacity={0.8}
              >
                <Ionicons name="search" size={20} color="#ffffff" />
              </TouchableOpacity>
              <Text style={styles.fabButtonLabel}>Search</Text>
            </Animated.View>
            
            {/* Sent Button */}
            <Animated.View
              style={[
                styles.fabSubButton,
                {
                  opacity: fabAnimation,
                  transform: [
                    {
                      translateY: fabAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -210],
                      }),
                    },
                  ],
                },
              ]}
            >
              <TouchableOpacity
                style={[styles.fabButton, styles.fabSubButtonStyle]}
                onPress={handleSentPress}
                activeOpacity={0.8}
              >
                <Ionicons name="paper-plane" size={20} color="#ffffff" />
              </TouchableOpacity>
              <Text style={styles.fabButtonLabel}>Sent</Text>
            </Animated.View>
            
            {/* Main FAB Button */}
            <Animated.View
              style={[
                styles.fabMain,
                {
                  transform: [
                    {
                      rotate: fabAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '45deg'],
                      }),
                    },
                  ],
                },
              ]}
            >
              <TouchableOpacity
                style={[styles.fabButton, styles.fabMainButtonStyle]}
                onPress={toggleFab}
                activeOpacity={0.8}
              >
                <Ionicons name="add" size={28} color="#ffffff" />
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>

        {/* PROFILE MODAL */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={profileModalVisible}
          onRequestClose={() => setProfileModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setProfileModalVisible(false)}
          >
            <View style={[styles.profileModal, theme === 'dark' && styles.darkProfileModal]}>
              <View style={[styles.modalHeader, theme === 'dark' && styles.darkModalHeader]}>
                <Text style={[styles.modalTitle, theme === 'dark' && styles.darkModalTitle]}>Account</Text>
              </View>
              <View style={[styles.modalContent, theme === 'dark' && styles.darkModalContent]}>
                <TouchableOpacity
                  style={[styles.modalOption, theme === 'dark' && styles.darkModalOption]}
                  onPress={handleProfileMenuPress}
                >
                  <View style={styles.modalOptionIcon}>
                    <Ionicons name="person-outline" size={20} color={theme === 'dark' ? '#9BA1A6' : '#666'} />
                  </View>
                  <Text style={[styles.modalOptionText, theme === 'dark' && styles.darkModalOptionText]}>Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalOption, theme === 'dark' && styles.darkModalOption]}
                  onPress={handleSettingsPress}
                >
                  <View style={styles.modalOptionIcon}>
                    <Ionicons name="settings-outline" size={20} color={theme === 'dark' ? '#9BA1A6' : '#666'} />
                  </View>
                  <Text style={[styles.modalOptionText, theme === 'dark' && styles.darkModalOptionText]}>Settings</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalOption, styles.modalOptionLast, theme === 'dark' && styles.darkModalOption]}
                  onPress={handleLogout}
                >
                  <View style={styles.modalOptionIcon}>
                    <Ionicons name="log-out-outline" size={20} color="#ff4444" />
                  </View>
                  <Text style={[styles.modalOptionText, { color: '#ff4444' }]}>Logout</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </SafeScreen>
  );
}