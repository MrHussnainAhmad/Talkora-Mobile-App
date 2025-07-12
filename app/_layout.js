import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppState } from "react-native";
import "../global.css";
import SafeScreen from "../components/SafeScreen";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "../context/AuthContext";
import { ThemeProvider } from "../context/ThemeContext";
import { useEffect, useState } from "react";
import { loadFonts } from "../utils/fonts";
import NotificationService from '../services/simpleNotificationService';

export default function RootLayout() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      // Initialize notification service early
      try {
        await NotificationService.initialize();
        console.log('📱 Notification service initialized in app layout');
      } catch (error) {
        console.error('Failed to initialize notifications:', error);
      }
      
      // Load fonts
      await loadFonts();
      setFontsLoaded(true);
    };
    
    initializeApp();
  }, []);

  // Handle app state changes for notifications
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      const isActive = nextAppState === 'active';
      NotificationService.setAppActive(isActive);
      console.log('📱 App state changed:', nextAppState, 'isActive:', isActive);
    };

    // Set initial state
    NotificationService.setAppActive(AppState.currentState === 'active');

    // Subscribe to app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
    };
  }, []);

  if (!fontsLoaded) {
    return null; // or a loading screen
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ThemeProvider>
          <SafeScreen>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="home" />
              <Stack.Screen name="settings" />
            </Stack>
          </SafeScreen>
          <StatusBar style="dark" />
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
