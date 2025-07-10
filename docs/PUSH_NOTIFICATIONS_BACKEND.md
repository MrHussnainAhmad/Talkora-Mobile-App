# Push Notifications Backend Implementation Guide

This guide explains how to implement push notifications on your backend server for the Talkora app.

## Overview

Push notifications for Expo apps work through Expo's Push Notification Service. When a user is offline, the backend needs to send push notifications to Expo's servers, which then deliver them to the user's device.

## Prerequisites

1. Install the Expo Server SDK in your backend:
```bash
npm install expo-server-sdk
```

## Implementation Steps

### 1. Update User Model

Add a `pushToken` field to your User model to store the Expo push token:

```javascript
// In your User model (e.g., models/User.js)
const userSchema = new mongoose.Schema({
  // ... existing fields
  pushToken: {
    type: String,
    default: null
  },
  // ... other fields
});
```

### 2. Add Push Token Update Endpoint

Create an endpoint to receive and store push tokens from the mobile app:

```javascript
// In your auth routes (e.g., routes/auth.js)
router.post('/push-token', authenticate, async (req, res) => {
  try {
    const { pushToken } = req.body;
    const userId = req.user.id;

    // Update user's push token
    await User.findByIdAndUpdate(userId, { pushToken });

    res.json({ success: true, message: 'Push token updated' });
  } catch (error) {
    console.error('Error updating push token:', error);
    res.status(500).json({ error: 'Failed to update push token' });
  }
});
```

### 3. Create Push Notification Service

Create a service to handle sending push notifications:

```javascript
// services/pushNotification.js
const { Expo } = require('expo-server-sdk');

// Create a new Expo SDK client
const expo = new Expo();

class PushNotificationService {
  // Send push notification to a user
  async sendPushNotification(pushToken, title, body, data = {}) {
    // Check that the push token is valid
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Push token ${pushToken} is not a valid Expo push token`);
      return false;
    }

    // Create the message
    const message = {
      to: pushToken,
      sound: 'default', // This will use the custom sound configured in the app
      title: title,
      body: body,
      data: data,
      priority: 'high',
      channelId: 'default', // Android notification channel
    };

    try {
      // Send the notification
      const ticket = await expo.sendPushNotificationsAsync([message]);
      console.log('Push notification sent:', ticket);
      return true;
    } catch (error) {
      console.error('Error sending push notification:', error);
      return false;
    }
  }

  // Send message notification
  async sendMessageNotification(recipientUser, senderUser, message) {
    if (!recipientUser.pushToken) {
      console.log('Recipient has no push token');
      return false;
    }

    const title = senderUser.fullname || senderUser.username;
    let body = message.text || 'Photo';
    
    // Truncate long messages
    if (body.length > 100) {
      body = body.substring(0, 97) + '...';
    }

    const data = {
      senderId: senderUser._id.toString(),
      senderName: senderUser.fullname || senderUser.username,
      messageId: message._id.toString(),
      type: 'message'
    };

    return await this.sendPushNotification(
      recipientUser.pushToken,
      title,
      body,
      data
    );
  }

  // Send friend request notification
  async sendFriendRequestNotification(recipientUser, senderUser) {
    if (!recipientUser.pushToken) {
      return false;
    }

    const title = 'New Friend Request';
    const body = `${senderUser.fullname || senderUser.username} sent you a friend request`;
    
    const data = {
      senderId: senderUser._id.toString(),
      senderName: senderUser.fullname || senderUser.username,
      type: 'friendRequest'
    };

    return await this.sendPushNotification(
      recipientUser.pushToken,
      title,
      body,
      data
    );
  }
}

module.exports = new PushNotificationService();
```

### 4. Integrate Push Notifications with Message Sending

Update your message sending logic to send push notifications when the recipient is offline:

```javascript
// In your message controller or socket handler
const PushNotificationService = require('../services/pushNotification');
const User = require('../models/User');

// When sending a message
async function handleSendMessage(senderId, recipientId, messageData) {
  try {
    // ... existing message saving logic

    // Check if recipient is online
    const recipientSocketId = getSocketIdForUser(recipientId); // Your socket tracking logic
    
    if (recipientSocketId) {
      // Recipient is online, send via socket
      io.to(recipientSocketId).emit('newMessage', {
        message: savedMessage,
        sender: senderUser
      });
    } else {
      // Recipient is offline, send push notification
      const recipientUser = await User.findById(recipientId);
      const senderUser = await User.findById(senderId);
      
      if (recipientUser && senderUser) {
        await PushNotificationService.sendMessageNotification(
          recipientUser,
          senderUser,
          savedMessage
        );
      }
    }

    return savedMessage;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}
```

### 5. Handle User Logout

Clear the push token when user logs out:

```javascript
// In your logout endpoint
router.post('/logout', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Clear push token
    await User.findByIdAndUpdate(userId, { pushToken: null });
    
    // ... rest of logout logic
    
    res.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});
```

### 6. Socket.io Integration

If you're using Socket.io, update your connection handlers:

```javascript
// In your socket handler
io.on('connection', (socket) => {
  socket.on('authenticate', async (userId) => {
    // Store socket ID for user
    userSocketMap.set(userId, socket.id);
    
    // User is now online, no need for push notifications
    socket.userId = userId;
  });

  socket.on('disconnect', () => {
    if (socket.userId) {
      // User is offline, they'll receive push notifications
      userSocketMap.delete(socket.userId);
    }
  });
});
```

## Testing Push Notifications

1. **Development Testing**:
   - Push notifications won't work in Expo Go in development
   - Use a development build or standalone app for testing
   - Use Expo's Push Notification Tool: https://expo.dev/notifications

2. **Test Payload**:
   ```javascript
   // Test endpoint for push notifications
   router.post('/test-push', authenticate, async (req, res) => {
     try {
       const user = await User.findById(req.user.id);
       if (!user.pushToken) {
         return res.status(400).json({ error: 'No push token found' });
       }

       await PushNotificationService.sendPushNotification(
         user.pushToken,
         'Test Notification',
         'This is a test push notification from Talkora!',
         { type: 'test' }
       );

       res.json({ success: true, message: 'Test notification sent' });
     } catch (error) {
       console.error('Test push error:', error);
       res.status(500).json({ error: 'Failed to send test notification' });
     }
   });
   ```

## Error Handling

Handle cases where push tokens become invalid:

```javascript
// In your push notification service
async sendPushNotification(pushToken, title, body, data = {}) {
  try {
    const ticket = await expo.sendPushNotificationsAsync([{
      to: pushToken,
      sound: 'default',
      title,
      body,
      data,
    }]);

    // Check if the ticket has an error
    if (ticket[0].status === 'error') {
      // Handle invalid token
      if (ticket[0].details?.error === 'DeviceNotRegistered') {
        // Remove invalid token from database
        await User.updateOne(
          { pushToken },
          { $unset: { pushToken: 1 } }
        );
      }
    }

    return ticket[0].status === 'ok';
  } catch (error) {
    console.error('Push notification error:', error);
    return false;
  }
}
```

## Security Considerations

1. **Validate Push Tokens**: Always validate that push tokens are in the correct format
2. **Rate Limiting**: Implement rate limiting to prevent notification spam
3. **User Preferences**: Add user settings to control notification preferences
4. **Privacy**: Don't include sensitive information in notification body

## Monitoring

Log push notification events for monitoring:

```javascript
// Create a notification log model
const notificationLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: String,
  status: String,
  error: String,
  timestamp: { type: Date, default: Date.now }
});
```

This implementation will ensure that users receive push notifications for messages when they're outside the app!
