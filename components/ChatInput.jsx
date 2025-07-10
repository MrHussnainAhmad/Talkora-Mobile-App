import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import SocketService from '../services/socket';
import styles from '../assets/styles/chatInput.style';

const ChatInput = ({ onSendMessage, onSendImage, friendId }) => {
  const [messageText, setMessageText] = useState('');
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  const handleSendMessage = () => {
    if (messageText.trim()) {
      handleStopTyping();
      onSendMessage(messageText.trim());
      setMessageText('');
    }
  };

  const handleStartTyping = () => {
    if (!isTypingRef.current && friendId) {
      console.log('⌨️ Starting typing for friendId:', friendId);
      isTypingRef.current = true;
      SocketService.emitTypingStarted(friendId);
    }
  };

  const handleStopTyping = () => {
    if (isTypingRef.current && friendId) {
      console.log('⌨️ Stopping typing for friendId:', friendId);
      isTypingRef.current = false;
      SocketService.emitTypingStopped(friendId);
    }
  };

  const handleTextChange = (text) => {
    setMessageText(text);
    
    if (text.trim() && friendId) {
      handleStartTyping();
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        handleStopTyping();
      }, 2000);
    } else {
      handleStopTyping();
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      handleStopTyping();
    };
  }, []);

  const handleImagePicker = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please grant permission to access your photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const selectedImage = result.assets[0];
        
        if (!selectedImage.base64) {
          Alert.alert('Error', 'Failed to process image. Please try again.');
          return;
        }
        
        const base64Image = `data:image/jpeg;base64,${selectedImage.base64}`;
        
        if (onSendImage) {
          onSendImage(base64Image);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.imageButton} onPress={handleImagePicker}>
        <Ionicons name="image" size={24} color="#1976D2" />
      </TouchableOpacity>
      
      <TextInput
        style={styles.textInput}
        placeholder="Type a message..."
        value={messageText}
        onChangeText={handleTextChange}
        multiline
        maxLength={1000}
        returnKeyType="send"
        onSubmitEditing={handleSendMessage}
      />
      
      <TouchableOpacity 
        style={[styles.sendButton, messageText.trim() ? styles.sendButtonActive : styles.sendButtonInactive]} 
        onPress={handleSendMessage}
        disabled={!messageText.trim()}
      >
        <Ionicons name="send" size={20} color={messageText.trim() ? "#ffffff" : "#ccc"} />
      </TouchableOpacity>
    </View>
  );
};

export default ChatInput;