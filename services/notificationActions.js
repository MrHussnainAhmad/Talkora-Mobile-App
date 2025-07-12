import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Define notification categories with actions
export const NOTIFICATION_CATEGORIES = {
  MESSAGE: 'message_category',
  GENERAL: 'general_category',
};

// Define notification actions
export const NOTIFICATION_ACTIONS = {
  MARK_AS_READ: 'mark_as_read',
  REPLY: 'reply',
  OPEN_CHAT: 'open_chat',
};

// Configure notification actions for different platforms
const createNotificationActions = () => {
  const actions = [];

  // Mark as Read action
  actions.push({
    identifier: NOTIFICATION_ACTIONS.MARK_AS_READ,
    buttonTitle: '✓ Mark as Read',
    options: {
      isDestructive: false,
      isAuthenticationRequired: false,
      opensAppToForeground: false,
    },
  });

  // Reply action
  actions.push({
    identifier: NOTIFICATION_ACTIONS.REPLY,
    buttonTitle: '↩ Reply',
    textInput: {
      submitButtonTitle: 'Send',
      placeholder: 'Type your reply...',
    },
    options: {
      isDestructive: false,
      isAuthenticationRequired: false,
      opensAppToForeground: false,
    },
  });

  // Open Chat action (for Android primarily)
  if (Platform.OS === 'android') {
    actions.push({
      identifier: NOTIFICATION_ACTIONS.OPEN_CHAT,
      buttonTitle: '📱 Open Chat',
      options: {
        isDestructive: false,
        isAuthenticationRequired: false,
        opensAppToForeground: true,
      },
    });
  }

  return actions;
};

// Create notification categories
const createNotificationCategories = () => {
  const categories = [];

  // Message category with interactive actions
  categories.push({
    identifier: NOTIFICATION_CATEGORIES.MESSAGE,
    actions: createNotificationActions(),
    options: {
      customDismissAction: true,
      allowInCarPlay: true,
      allowAnnouncement: true,
      showTitle: true,
      showSubtitle: true,
    },
  });

  // General category (no actions)
  categories.push({
    identifier: NOTIFICATION_CATEGORIES.GENERAL,
    actions: [],
    options: {
      customDismissAction: false,
      allowInCarPlay: false,
      allowAnnouncement: false,
      showTitle: true,
      showSubtitle: true,
    },
  });

  return categories;
};

// Initialize notification categories
export const initializeNotificationCategories = async () => {
  try {
    const categories = createNotificationCategories();
    
    // Set notification categories
    await Notifications.setNotificationCategoryAsync(
      NOTIFICATION_CATEGORIES.MESSAGE,
      categories.find(cat => cat.identifier === NOTIFICATION_CATEGORIES.MESSAGE).actions,
      categories.find(cat => cat.identifier === NOTIFICATION_CATEGORIES.MESSAGE).options
    );

    await Notifications.setNotificationCategoryAsync(
      NOTIFICATION_CATEGORIES.GENERAL,
      categories.find(cat => cat.identifier === NOTIFICATION_CATEGORIES.GENERAL).actions,
      categories.find(cat => cat.identifier === NOTIFICATION_CATEGORIES.GENERAL).options
    );

    console.log('🔔 Notification categories initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize notification categories:', error);
    return false;
  }
};

// Helper function to get category for notification type
export const getCategoryForNotificationType = (type) => {
  switch (type) {
    case 'message':
      return NOTIFICATION_CATEGORIES.MESSAGE;
    default:
      return NOTIFICATION_CATEGORIES.GENERAL;
  }
};

// Helper function to create notification content with proper category
export const createNotificationContent = (type, title, body, data = {}) => {
  const category = getCategoryForNotificationType(type);
  
  return {
    title,
    body,
    data: {
      ...data,
      type,
      timestamp: new Date().toISOString(),
    },
    categoryIdentifier: category,
    sound: true,
    badge: 1,
    priority: type === 'message' ? 'high' : 'normal',
  };
};

// Helper function to schedule a notification with actions
export const scheduleNotificationWithActions = async (type, title, body, data = {}, trigger = null) => {
  try {
    const content = createNotificationContent(type, title, body, data);
    
    await Notifications.scheduleNotificationAsync({
      content,
      trigger,
    });
    
    console.log(`🔔 Scheduled ${type} notification with actions`);
    return true;
  } catch (error) {
    console.error('Failed to schedule notification with actions:', error);
    return false;
  }
};

export default {
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_ACTIONS,
  initializeNotificationCategories,
  getCategoryForNotificationType,
  createNotificationContent,
  scheduleNotificationWithActions,
};
