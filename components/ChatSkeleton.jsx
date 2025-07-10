import React from 'react';
import { View, Text } from 'react-native';
import { StyleSheet, Animated } from 'react-native';

const ChatSkeleton = () => {
  const opacity = React.useRef(new Animated.Value(0.3)).current;

  React.useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, [opacity]);

  const SkeletonMessage = ({ isCurrentUser }) => (
    <View style={[
      styles.messageBubble,
      isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage
    ]}>
      <Animated.View style={[
        styles.skeletonText,
        { opacity },
        isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble
      ]} />
    </View>
  );

  return (
    <View style={styles.container}>
      <SkeletonMessage isCurrentUser={false} />
      <SkeletonMessage isCurrentUser={true} />
      <SkeletonMessage isCurrentUser={false} />
      <SkeletonMessage isCurrentUser={true} />
      <SkeletonMessage isCurrentUser={false} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  messageBubble: {
    maxWidth: '80%',
    marginVertical: 8,
    padding: 12,
    borderRadius: 16,
  },
  currentUserMessage: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  otherUserMessage: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  skeletonText: {
    height: 16,
    borderRadius: 8,
  },
  currentUserBubble: {
    backgroundColor: '#1976D2',
  },
  otherUserBubble: {
    backgroundColor: '#e0e0e0',
  },
});

export default ChatSkeleton;
