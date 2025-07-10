import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import NotificationService from '../services/basicNotification';

const NotificationTest = () => {
  const testNotification = async () => {
    try {
      await NotificationService.testNotification();
      Alert.alert('Success', 'Test notification sent!');
    } catch (error) {
      Alert.alert('Error', 'Failed to send test notification');
      console.error('Test notification error:', error);
    }
  };

  const testNotificationSound = async () => {
    try {
      await NotificationService.playNotificationSound();
      Alert.alert('Success', 'Notification sound played!');
    } catch (error) {
      Alert.alert('Error', 'Failed to play notification sound');
      console.error('Notification sound error:', error);
    }
  };

  const testConfirmSound = async () => {
    try {
      await NotificationService.playConfirmSound();
      Alert.alert('Success', 'Confirm sound played!');
    } catch (error) {
      Alert.alert('Error', 'Failed to play confirm sound');
      console.error('Confirm sound error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notification Test</Text>
      
      <TouchableOpacity style={styles.button} onPress={testNotification}>
        <Text style={styles.buttonText}>Test Notification</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={testNotificationSound}>
        <Text style={styles.buttonText}>Test Notification Sound</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={testConfirmSound}>
        <Text style={styles.buttonText}>Test Confirm Sound</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    margin: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginVertical: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default NotificationTest;
