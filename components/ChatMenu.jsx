import React from 'react';
import { View, Text, TouchableOpacity, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from '../assets/styles/chatMenu.style';

const ChatMenu = ({ 
  visible, 
  onClose, 
  onPrivacyPlus, 
  onDeleteFriend, 
  onBlockUnblock,
  friendName,
  isBlocked = false
}) => {
  const handlePrivacyPlus = () => {
    Alert.alert(
      "Privacy+",
      "This will delete all messages between you and this friend. This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete Messages",
          style: "destructive",
          onPress: () => {
            onPrivacyPlus();
            onClose();
          }
        }
      ]
    );
  };

  const handleDeleteFriend = () => {
    Alert.alert(
      "Delete Friend",
      `Are you sure you want to remove ${friendName} from your friends list? This will delete all messages and remove them from your chat list.`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete Friend",
          style: "destructive",
          onPress: () => {
            onDeleteFriend();
            onClose();
          }
        }
      ]
    );
  };

  const handleBlockUnblock = () => {
    Alert.alert(
      isBlocked ? 'Unblock User' : `Block ${friendName}?`,
      isBlocked 
        ? `Are you sure you want to unblock ${friendName}? They will be able to send you messages again.`
        : `Are you sure you want to block ${friendName}? They won't be able to send you messages or see when you're online.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: isBlocked ? 'Unblock' : 'Block',
          style: 'destructive',
          onPress: () => {
            onBlockUnblock();
            onClose();
          },
        },
      ]
    );
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handlePrivacyPlus}
          >
            <Ionicons name="shield-outline" size={20} color="#1976D2" />
            <Text style={styles.menuItemText}>Privacy+</Text>
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleBlockUnblock}
          >
            <Ionicons 
              name={isBlocked ? "unlock-outline" : "lock-closed-outline"} 
              size={20} 
              color={isBlocked ? "#4CAF50" : "#FF9800"} 
            />
            <Text style={[styles.menuItemText, { color: isBlocked ? "#4CAF50" : "#FF9800" }]}>
              {isBlocked ? "Unblock" : "Block"} {friendName}
            </Text>
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleDeleteFriend}
          >
            <Ionicons name="person-remove-outline" size={20} color="#f44336" />
            <Text style={[styles.menuItemText, styles.deleteText]}>Delete Friend</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default ChatMenu;
