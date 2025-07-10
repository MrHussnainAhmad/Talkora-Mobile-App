import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ApiService from '../services/api';
import styles from '../assets/styles/verification.style';

const VerificationModal = ({ visible, onClose, email, onVerificationComplete }) => {
  const [resending, setResending] = useState(false);

  const handleResendVerification = async () => {
    if (!email) {
      Alert.alert('Error', 'Email address is required');
      return;
    }

    setResending(true);
    try {
      await ApiService.resendVerification(email);
      Alert.alert(
        'Success',
        'Verification email sent successfully. Please check your email.',
      );
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to resend verification email');
    } finally {
      setResending(false);
    }
  };

  const handleDismiss = () => {
    onClose();
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={handleDismiss}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.headerContainer}>
            <View style={styles.iconContainer}>
              <Ionicons name="mail-outline" size={60} color="#1976D2" />
            </View>
            <Text style={styles.title}>Verify Your Email</Text>
            <Text style={styles.subtitle}>
              We've sent a verification link to:
            </Text>
            <Text style={styles.emailText}>{email}</Text>
          </View>

          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionText}>
              • Check your email inbox and spam folder
            </Text>
            <Text style={styles.instructionText}>
              • Click the verification link in the email
            </Text>
            <Text style={styles.instructionText}>
              • Return to the app to login
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.resendButton]}
              onPress={handleResendVerification}
              disabled={resending}
            >
              {resending ? (
                <ActivityIndicator color="#1976D2" size="small" />
              ) : (
                <>
                  <Ionicons name="refresh-outline" size={20} color="#1976D2" />
                  <Text style={styles.resendButtonText}>Resend Email</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.doneButton]}
              onPress={handleDismiss}
            >
              <Text style={styles.doneButtonText}>Got it!</Text>
            </TouchableOpacity>
          </View>

          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={handleDismiss}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default VerificationModal;
