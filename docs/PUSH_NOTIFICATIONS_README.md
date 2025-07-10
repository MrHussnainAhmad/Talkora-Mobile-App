# Push Notifications Implementation

This document explains the push notification implementation in the Talkora mobile app.

## Overview

Push notifications are implemented using Expo's push notification service. When users are outside the app, they receive notifications for:
- New messages from friends
- Friend requests
- Other app events

## How It Works

1. **Token Registration**: When a user logs in, the app registers for push notifications and sends the token to the backend
2. **Backend Integration**: The backend stores the push token and uses it to send notifications via Expo's servers
3. **Notification Handling**: The app handles both foreground and background notifications

## Mobile App Components

### 1. Notification Service (`services/notification.js`)
- Handles push notification registration
- Manages notification permissions
- Plays notification sounds
- Routes users to appropriate screens when notifications are tapped

### 2. Authentication Integration (`context/AuthContext.js`)
- Automatically registers push token on login
- Updates push token on app startup
- Clears token on logout

### 3. API Service (`services/api.js`)
- `updatePushToken(token)`: Sends push token to backend

## Testing Push Notifications

### In Development (Expo Go)
- Push notifications have limited functionality in Expo Go
- Notification sounds will work
- Visual notifications may not appear
- Use the "Test Notification" button in Settings (dev mode only)

### In Production/Standalone App
- Full push notification support
- Notifications appear even when app is closed
- Tapping notifications opens the relevant chat

## User Experience

1. **Permission Request**: Users are asked for notification permission on first login
2. **Notification Content**: Shows sender name and message preview
3. **Privacy**: Long messages are truncated, images show as "Photo"
4. **Smart Sound System**:
   - Same chat: `Confirm.wav` for all messages (subtle confirmation)
   - Different chat: `notification.mp3` (attention-grabbing)
   - App closed: `notification.mp3` for push notifications
5. **Smart Delivery**: Visual notifications only for messages from different chats

## Backend Requirements

The backend needs to implement the following (see `PUSH_NOTIFICATIONS_BACKEND.md`):

1. Store push tokens in user model
2. Implement `/api/auth/push-token` endpoint
3. Send push notifications when users are offline
4. Handle token invalidation

## Troubleshooting

### Notifications Not Working
1. Check notification permissions in device settings
2. Ensure you're testing on a real device (not simulator)
3. Verify push token is being sent to backend
4. Check backend logs for push notification errors

### In Expo Go
- This is expected - push notifications are limited in Expo Go
- Build a standalone app for full functionality

### Token Issues
- Tokens may change - the app automatically updates them
- Invalid tokens are handled by the backend

## Privacy & Security

1. **Message Content**: Only shows preview, not full message
2. **User Control**: Users can disable notifications in device settings
3. **Token Security**: Push tokens are transmitted securely
4. **Data Minimization**: Minimal data sent in notifications

## Future Enhancements

1. **Notification Settings**: In-app control over notification types
2. **Do Not Disturb**: Time-based notification preferences
3. **Group Notifications**: Bundled notifications for multiple messages
4. **Rich Notifications**: Show sender avatar in notification

## Development Notes

- Push tokens are Expo-specific (format: `ExponentPushToken[...]`)
- Notifications use Expo's infrastructure (no Firebase/APNs setup needed)
- The notification service is initialized early in app lifecycle
- Sounds are preloaded for better performance
