import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

const ChatContextMenu = ({ 
  visible, 
  onClose, 
  friend, 
  position,
  onPin,
  onBlock,
  onDelete,
  onMute,
  isPinned = false,
  isBlocked = false,
  isMuted = false,
}) => {
  const { theme } = useTheme();
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(animatedValue, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const menuOptions = [
    {
      id: 'pin',
      label: isPinned ? 'Unpin' : 'Pin',
      icon: isPinned ? 'bookmark' : 'bookmark-outline',
      onPress: onPin,
    },
    {
      id: 'mute',
      label: isMuted ? 'Unmute' : 'Mute',
      icon: isMuted ? 'volume-high' : 'volume-mute',
      onPress: onMute,
    },
    {
      id: 'block',
      label: isBlocked ? 'Unblock' : 'Block',
      icon: isBlocked ? 'checkmark-circle' : 'ban',
      onPress: onBlock,
      color: isBlocked ? '#4CAF50' : '#FF9800',
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: 'trash',
      onPress: onDelete,
      color: '#F44336',
    },
  ];

  // Calculate menu position
  const menuStyle = {
    position: 'absolute',
    top: Math.min(position.y - 10, height - 250), // Ensure menu doesn't go off screen
    left: Math.min(position.x - 50, width - 200),
    transform: [
      {
        scale: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0.3, 1],
        }),
      },
    ],
    opacity: animatedValue,
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <Animated.View style={[
            styles.menu,
            theme === 'dark' && styles.darkMenu,
            menuStyle
          ]}>
            <View style={styles.menuHeader}>
              <Text style={[
                styles.menuTitle,
                theme === 'dark' && styles.darkMenuTitle
              ]}>
                {friend?.fullname || friend?.username || 'Unknown User'}
              </Text>
            </View>
            
            {menuOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.menuOption,
                  theme === 'dark' && styles.darkMenuOption
                ]}
                onPress={() => {
                  option.onPress();
                  onClose();
                }}
              >
                <Ionicons
                  name={option.icon}
                  size={20}
                  color={option.color || (theme === 'dark' ? '#FFFFFF' : '#333333')}
                  style={styles.menuIcon}
                />
                <Text style={[
                  styles.menuOptionText,
                  theme === 'dark' && styles.darkMenuOptionText,
                  option.color && { color: option.color }
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  menu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    minWidth: 180,
    maxWidth: 220,
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowColor: '#000000',
  },
  darkMenu: {
    backgroundColor: '#2C2C2C',
  },
  menuHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  darkMenuTitle: {
    color: '#FFFFFF',
    borderBottomColor: '#444444',
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E0E0E0',
  },
  darkMenuOption: {
    borderBottomColor: '#444444',
  },
  menuIcon: {
    marginRight: 12,
    width: 20,
  },
  menuOptionText: {
    fontSize: 16,
    color: '#333333',
    flex: 1,
  },
  darkMenuOptionText: {
    color: '#FFFFFF',
  },
});

export default ChatContextMenu;
