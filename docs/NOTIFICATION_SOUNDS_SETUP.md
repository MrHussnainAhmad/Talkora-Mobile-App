# Notification Sounds Setup Guide

This guide explains how notification sounds work in the Talkora app.

## Sound Files Used

1. **notification.mp3** - Plays for new messages from different chats and push notifications
2. **Confirm.wav** - Plays for all messages (sent and received) within the current chat

## Current Implementation

### In-App Sound Behavior
When the app is open:
- **Same Chat**: 
  - Sent messages → `Confirm.wav`
  - Received messages → `Confirm.wav`
- **Different Chat**:
  - Received messages → `notification.mp3`

### Push Notifications (App Closed/Background)
When the app is closed or in background:
- All push notifications → `notification.mp3`
- Handled by the system notification service

## Platform-Specific Setup

### Android
1. The app creates a notification channel with custom sound:
```javascript
await Notifications.setNotificationChannelAsync('default', {
  name: 'default',
  importance: Notifications.AndroidImportance.MAX,
  vibrationPattern: [0, 250, 250, 250],
  lightColor: '#FF231F7C',
  sound: 'notification.mp3',
});
```

2. For production builds, ensure the sound file is included:
   - Place `notification.mp3` in `android/app/src/main/res/raw/`
   - The file should be named `notification.mp3` (lowercase, no spaces)

### iOS
1. For iOS, add the sound file to your Xcode project:
   - Add `notification.mp3` to your iOS project
   - Ensure it's included in "Copy Bundle Resources"

2. The push notification payload should specify the sound:
```javascript
{
  sound: 'notification.mp3'
}
```

## Backend Configuration

When sending push notifications from the backend:

```javascript
const message = {
  to: pushToken,
  sound: 'default', // Uses the custom sound configured in the app
  title: 'New Message',
  body: messageText,
  data: { /* custom data */ },
  priority: 'high',
  channelId: 'default', // For Android
};
```

## Testing Sounds

### Development (Expo Go)
- In-app sounds (both notification and confirm) will work
- Push notification sounds are limited in Expo Go

### Production Build
- All sounds work as expected
- Custom notification sounds play for push notifications

## Troubleshooting

### Sound Not Playing for Push Notifications
1. **Check file format**: Use `.mp3` or `.wav` formats
2. **Check file size**: Keep under 30 seconds
3. **Check device settings**: Ensure notification sounds are enabled
4. **Check volume**: Device should not be in silent mode

### Android Specific Issues
- After changing notification channel settings, you may need to:
  1. Uninstall the app
  2. Reinstall to recreate the notification channel
  3. Or use a different channel ID

### iOS Specific Issues
- Ensure the sound file is properly included in the iOS bundle
- Check that the filename in code matches exactly (case-sensitive)

## Best Practices

1. **Keep sounds short**: Under 5 seconds for better UX
2. **Optimize file size**: Compress audio files appropriately
3. **Test on real devices**: Simulators may not play sounds correctly
4. **Respect user preferences**: Allow users to disable sounds in settings
