import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import SocketService from '../services/socket';

const SocketDebug = ({ userId }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [lastMessage, setLastMessage] = useState(null);

  useEffect(() => {
    if (!userId) return;

    // Connection status listener
    const unsubscribeConnection = SocketService.onConnectionChange((connected) => {
      setIsConnected(connected);
    });

    // Online users listener
    const unsubscribeOnlineUsers = SocketService.onOnlineUsersUpdate((users) => {
      setOnlineUsers(users);
    });

    // Message listener
    const unsubscribeMessage = SocketService.onNewMessage((message) => {
      setLastMessage(message);
    });

    // Initial state
    setIsConnected(SocketService.getConnectionStatus());

    return () => {
      unsubscribeConnection();
      unsubscribeOnlineUsers();
      unsubscribeMessage();
    };
  }, [userId]);

  const handleReconnect = () => {
    if (userId) {
      SocketService.disconnect();
      setTimeout(() => {
        SocketService.connect(userId);
      }, 1000);
    }
  };

  if (!__DEV__) {
    return null; // Only show in development
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Socket Debug</Text>
      <Text style={[styles.status, { color: isConnected ? 'green' : 'red' }]}>
        Status: {isConnected ? 'Connected' : 'Disconnected'}
      </Text>
      <Text style={styles.info}>
        Online Users: {onlineUsers.length} ({onlineUsers.join(', ')})
      </Text>
      {lastMessage && (
        <Text style={styles.info}>
          Last Message: {lastMessage.text || 'Image'} from {lastMessage.senderId}
        </Text>
      )}
      <TouchableOpacity style={styles.button} onPress={handleReconnect}>
        <Text style={styles.buttonText}>Reconnect</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 10,
    borderRadius: 5,
    zIndex: 1000,
  },
  title: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  status: {
    fontSize: 11,
    marginVertical: 2,
  },
  info: {
    color: 'white',
    fontSize: 10,
    marginVertical: 1,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 5,
    borderRadius: 3,
    marginTop: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 10,
    textAlign: 'center',
  },
});

export default SocketDebug;
