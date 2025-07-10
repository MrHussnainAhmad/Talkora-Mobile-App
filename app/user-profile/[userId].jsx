import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import ApiService from '../../services/api';
import styles from '../../assets/styles/profile.style';

export default function UserProfileScreen() {
  const { userId } = useLocalSearchParams();
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  const fetchUserProfile = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const profileData = await ApiService.getUserProfile(userId);
      // Extract the user object from the response
      setUserProfile(profileData.user || profileData);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      Alert.alert('Error', `Failed to load user profile: ${error.message || 'User not found'}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    fetchUserProfile(true);
  };

  const handleBack = () => {
    router.back();
  };

  const formatMemberSince = (dateString) => {
    if (!dateString) return 'Unknown';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Unknown';
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      return 'Unknown';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1976D2" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!userProfile) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="person-outline" size={64} color="#ccc" />
        <Text style={styles.loadingText}>User not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#1976D2" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#1976D2']}
          />
        }
      >
        {/* Profile Picture Section */}
        <View style={styles.profilePictureSection}>
          <View style={styles.profilePictureContainer}>
            <Image
              source={{
                uri: userProfile.profilePic || 'https://via.placeholder.com/150x150/cccccc/666666?text=U',
              }}
              style={styles.profilePicture}
            />
          </View>
        </View>

        {/* User Info Section */}
        <View style={styles.userInfoSection}>
          <Text style={styles.fullName}>{userProfile.fullname}</Text>
          <Text style={styles.username}>@{userProfile.username}</Text>
          <Text style={styles.email}>{userProfile.email}</Text>
        </View>

        {/* About Section */}
        <View style={styles.aboutSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>About</Text>
          </View>
          <Text style={styles.aboutText}>
            {userProfile.about || 'Yes, I am using Talkora!'}
          </Text>
        </View>

        {/* Member Since Section */}
        <View style={styles.memberSection}>
          <Text style={styles.sectionTitle}>Member Since</Text>
          <Text style={styles.memberSinceText}>
            {formatMemberSince(userProfile.createdAt)}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}