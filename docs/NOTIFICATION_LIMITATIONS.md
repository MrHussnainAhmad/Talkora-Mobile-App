# Notification Limitations in Expo Go

## Current Implementation
The app uses `simpleNotificationService.js` which provides:
- ✅ Sound notifications when app is open
- ✅ Different sounds for same chat (confirm) vs different chat (notification)
- ✅ Vibration on notifications
- ✅ Volume control for sounds

## Limitations in Expo Go

### 1. Background Notifications
- ❌ **No notifications when app is closed/background** - This is a limitation of Expo Go SDK 53
- Push notifications were removed from Expo Go in SDK 53
- To get background notifications, you need to:
  1. Create a development build using EAS Build
  2. Use a proper push notification service

### 2. Visual Notifications
- ❌ No visual notification banners in Expo Go
- Only sound and vibration work

## Solutions

### For Development (Expo Go)
- Sounds and vibration work fine
- Good for testing basic notification functionality

### For Production (Development Build)
To get full notification support:

1. **Create a development build:**
   ```bash
   eas build --platform android --profile development
   eas build --platform ios --profile development
   ```

2. **Use a notification service like:**
   - Firebase Cloud Messaging (FCM) for Android
   - Apple Push Notification Service (APNS) for iOS
   - OneSignal (cross-platform)
   - Notifee (already installed)

3. **Update the notification service to use proper push notifications**

## Current Sound Settings
- Notification sound: 50% volume
- Confirm sound: 30% volume
- Can be adjusted in `simpleNotificationService.js`
