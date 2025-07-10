import React from 'react';
import { View, Text, TouchableOpacity, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from '../assets/styles/chatMenu.style';

const ChatMenu = ({ 
  visible, 
  onClose, 
  onPrivacyPlus, 
  onDeleteFriend, 
  friendName 
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
