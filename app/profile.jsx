import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import ApiService from '../services/api';
import styles from '../assets/styles/profile.style';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [aboutText, setAboutText] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  useEffect(() => {
    if (user) {
      setProfileData(user);
      setAboutText(user.about || 'Yes, I am using Talkora!');
    }
  }, [user]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Refresh user data
      const userData = await ApiService.checkAuth();
      setProfileData(userData);
      setAboutText(userData.about || 'Yes, I am using Talkora!');
    } catch (error) {
      console.error('Error refreshing profile:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleBack = () => {
    router.back();
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
        await updateProfilePicture(base64Image);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const updateProfilePicture = async (base64Image) => {
    setLoading(true);
    try {
      const response = await ApiService.updateProfile({
        profilePic: base64Image,
      });

      setProfileData(response.updatedUser);
      Alert.alert('Success', 'Profile picture updated successfully!');
    } catch (error) {
      console.error('Error updating profile picture:', error);
      Alert.alert('Error', 'Failed to update profile picture. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAbout = async () => {
    if (aboutText.trim().length > 200) {
      Alert.alert('Error', 'About text cannot exceed 200 characters.');
      return;
    }

    setLoading(true);
    try {
      const response = await ApiService.updateProfile({
        about: aboutText.trim(),
      });

      setProfileData(response.updatedUser);
      setIsEditingAbout(false);
      Alert.alert('Success', 'About updated successfully!');
    } catch (error) {
      console.error('Error updating about:', error);
      Alert.alert('Error', 'Failed to update about. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      Alert.alert('Error', 'Please type "DELETE" to confirm account deletion.');
      return;
    }

    setLoading(true);
    try {
      await ApiService.deleteAccount();
      Alert.alert(
        'Account Deleted',
        'Your account has been permanently deleted.',
        [
          {
            text: 'OK',
            onPress: () => {
              setShowDeleteModal(false);
              logout();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error deleting account:', error);
      Alert.alert('Error', 'Failed to delete account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatMemberSince = (dateString) => {
    console.log('formatMemberSince received:', dateString);
    if (!dateString) {
      console.log('No date string provided');
      return 'Unknown';
    }
    
    try {
      const date = new Date(dateString);
      console.log('Parsed date:', date);
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        console.log('Invalid date');
        return 'Unknown';
      }
      
      const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      
      console.log('Formatted date:', formattedDate);
      return formattedDate;
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Unknown';
    }
  };

  if (!profileData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1976D2" />
        <Text style={styles.loadingText}>Loading profile...</Text>
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
                uri: profileData.profilePic || 'https://via.placeholder.com/150x150/cccccc/666666?text=U',
              }}
              style={styles.profilePicture}
            />
            <TouchableOpacity
              style={styles.editPictureButton}
              onPress={pickImage}
              disabled={loading}
            >
              <Ionicons name="camera" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* User Info Section */}
        <View style={styles.userInfoSection}>
          <Text style={styles.fullName}>{profileData.fullname}</Text>
          <Text style={styles.username}>@{profileData.username}</Text>
          <Text style={styles.email}>{profileData.email}</Text>
        </View>

        {/* About Section */}
        <View style={styles.aboutSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>About</Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditingAbout(!isEditingAbout)}
              disabled={loading}
            >
              <Ionicons
                name={isEditingAbout ? 'close' : 'pencil'}
                size={20}
                color="#1976D2"
              />
            </TouchableOpacity>
          </View>

          {isEditingAbout ? (
            <View style={styles.editAboutContainer}>
              <TextInput
                style={styles.aboutInput}
                value={aboutText}
                onChangeText={setAboutText}
                placeholder="Tell us about yourself..."
                multiline
                maxLength={200}
              />
              <Text style={styles.characterCount}>
                {aboutText.length}/200
              </Text>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleUpdateAbout}
                disabled={loading}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.aboutText}>
              {profileData.about || 'Yes, I am using Talkora!'}
            </Text>
          )}
        </View>

        {/* Member Since Section */}
        <View style={styles.memberSection}>
          <Text style={styles.sectionTitle}>Member Since</Text>
          <Text style={styles.memberSinceText}>
            {formatMemberSince(profileData.createdAt)}
          </Text>
        </View>

        {/* Danger Zone */}
        <View style={styles.dangerZone}>
          <Text style={styles.dangerZoneTitle}>Danger Zone</Text>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => setShowDeleteModal(true)}
            disabled={loading}
          >
            <Ionicons name="trash" size={20} color="#FF4444" />
            <Text style={styles.deleteButtonText}>Delete Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Delete Account Modal */}
      <Modal
        visible={showDeleteModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModal}>
            <Text style={styles.deleteModalTitle}>Delete Account</Text>
            <Text style={styles.deleteModalText}>
              This action cannot be undone. This will permanently delete your account and all associated data.
            </Text>
            <Text style={styles.deleteModalWarning}>
              Type "DELETE" to confirm:
            </Text>
            <TextInput
              style={styles.deleteInput}
              value={deleteConfirmation}
              onChangeText={setDeleteConfirmation}
              placeholder="DELETE"
              autoCapitalize="characters"
            />
            <View style={styles.deleteModalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmation('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.confirmDeleteButton,
                  deleteConfirmation !== 'DELETE' && styles.disabledButton,
                ]}
                onPress={handleDeleteAccount}
                disabled={deleteConfirmation !== 'DELETE' || loading}
              >
                <Text style={styles.confirmDeleteButtonText}>
                  {loading ? 'Deleting...' : 'Delete'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#1976D2" />
          <Text style={styles.loadingText}>Processing...</Text>
        </View>
      )}
    </View>
  );
}
