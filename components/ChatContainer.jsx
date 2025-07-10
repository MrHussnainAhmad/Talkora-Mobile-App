import React, { useRef, useEffect, useMemo } from 'react';
import { View, FlatList, Text, Image, TouchableOpacity, Alert } from 'react-native';
import styles from '../assets/styles/chatContainer.style';

const ChatContainer = React.memo(({ messages, currentUserId, loading }) => {
  const flatListRef = useRef(null);

  const handleImagePress = (imageUri) => {
    Alert.alert(
      'Image Options',
      'What would you like to do with this image?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'View Full Size', onPress: () => console.log('View image:', imageUri) },
        { text: 'Save to Gallery', onPress: () => console.log('Save image:', imageUri) },
      ]
    );
  };

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      // Small delay to ensure the new message is rendered before scrolling
      setTimeout(() => {
        try {
          flatListRef.current?.scrollToEnd({
            animated: true,
          });
        } catch (error) {
          // Fallback if scrollToEnd fails
          console.log('Scroll error:', error);
        }
      }, 100);
    }
  }, [messages]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading messages...</Text>
      </View>
    );
  }

  const renderMessage = React.useCallback(({ item: message }) => {
    const isCurrentUser = message.senderId === currentUserId;
    const messageStyle = isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage;
    const textStyle = isCurrentUser ? styles.currentUserMessageText : styles.otherUserMessageText;

    return (
      <View style={[styles.messageBubble, messageStyle]}>
        {/* Render image if present */}
        {message.image && (
          <TouchableOpacity 
            style={styles.imageContainer}
            onPress={() => handleImagePress(message.image)}
          >
            <Image 
              source={{ uri: message.image }} 
              style={styles.messageImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
        )}
        
        {/* Render text if present */}
        {message.text && (
          <Text style={[styles.messageText, textStyle]}>{message.text}</Text>
        )}
        
        {/* Handle case where message has neither text nor image */}
        {!message.text && !message.image && (
          <Text style={[styles.messageText, textStyle, styles.emptyMessageText]}>
            Message content unavailable
          </Text>
        )}
      </View>
    );
  }, [currentUserId]);

  // Messages are already sorted from parent component
  const safeMessages = Array.isArray(messages) ? messages : [];

  return (
    <FlatList
      ref={flatListRef}
      style={styles.container}
      data={safeMessages}
      renderItem={renderMessage}
      keyExtractor={(item, index) => item._id || item.id || index.toString()}
      showsVerticalScrollIndicator={false}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={20}
      getItemLayout={undefined}
    />
  );
});

export default ChatContainer;
