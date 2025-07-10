import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  Animated,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ApiService from "../services/api";
import { useAuth } from "../context/AuthContext";
import styles from "../assets/styles/welcome.style";

const { width, height } = Dimensions.get("window");

export default function WelcomeScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [showProceedButton, setShowProceedButton] = useState(false);
  const [countdown, setCountdown] = useState(3);
  
  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [logoScaleAnim] = useState(new Animated.Value(0.8));
  const [titlePulseAnim] = useState(new Animated.Value(1));
  const [buttonFadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    checkFirstTimeUser();
  }, []);

  const checkFirstTimeUser = async () => {
    try {
      const hasOpenedBefore = await AsyncStorage.getItem('hasOpenedBefore');
      const isNewUser = !hasOpenedBefore;
      
      setIsFirstTime(isNewUser);
      
      if (isNewUser) {
        // First time user - show proceed button
        await AsyncStorage.setItem('hasOpenedBefore', 'true');
        startFirstTimeAnimations();
      } else {
        // Returning user - auto redirect after 3 seconds
        startReturningUserAnimations();
        startCountdown();
      }
    } catch (error) {
      console.error('Error checking first time user:', error);
      // Default to first time user behavior
      setIsFirstTime(true);
      startFirstTimeAnimations();
    }
  };

  const startFirstTimeAnimations = () => {
    // Animate entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(logoScaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Show proceed button after animations
      setShowProceedButton(true);
      Animated.timing(buttonFadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
      
      // Start title pulse animation
      startTitlePulseAnimation();
    });
  };

  const startReturningUserAnimations = () => {
    // Faster animations for returning users
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(logoScaleAnim, {
        toValue: 1,
        tension: 80,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Start title pulse animation
      startTitlePulseAnimation();
    });
  };

  const startTitlePulseAnimation = () => {
    const pulseAnimation = Animated.sequence([
      Animated.timing(titlePulseAnim, {
        toValue: 1.05,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(titlePulseAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]);
    
    Animated.loop(pulseAnimation).start();
  };

  const startCountdown = () => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleProceed();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleProceed = async () => {
    setLoading(true);
    
    try {
      // Check if user is already authenticated
      const userData = await ApiService.checkAuth();
      
      // Check if user is verified
      if (userData && userData.isVerified) {
        // If authenticated and verified, redirect to home
        router.replace('/home');
      } else {
        // If not verified, redirect to login
        router.replace('/(auth)');
      }
    } catch (error) {
      // If not authenticated, redirect to login
      // Don't log "Unauthorized" as an error - it's expected
      if (!error.message?.includes('Unauthorized')) {
        console.error('Auth Check Error:', error);
      }
      router.replace('/(auth)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1976D2" />
      
      <LinearGradient
        colors={['#1976D2', '#1565C0', '#0D47A1']}
        style={styles.gradient}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Animated.Image
              source={require('../assets/images/Logo.png')}
              style={[
                styles.logo,
                {
                  transform: [{ scale: logoScaleAnim }],
                },
              ]}
              resizeMode="contain"
            />
          </View>

          {/* Welcome Text */}
          <View style={styles.textContainer}>
            <Animated.Text
              style={[
                styles.title,
                {
                  transform: [{ scale: titlePulseAnim }],
                },
              ]}
            >
              Welcome To Talkora!
            </Animated.Text>
            <Text style={styles.subtitle}>Your private chat</Text>
          </View>

          {/* Conditional Content based on user type */}
          {isFirstTime ? (
            // First Time User - Show Proceed Button
            showProceedButton && (
              <Animated.View
                style={[
                  styles.buttonContainer,
                  {
                    opacity: buttonFadeAnim,
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.proceedButton}
                  onPress={handleProceed}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#1976D2" />
                  ) : (
                    <Text style={styles.proceedButtonText}>Proceed</Text>
                  )}
                </TouchableOpacity>
              </Animated.View>
            )
          ) : (
            // Returning User - Silent countdown (no visible countdown)
            <View style={styles.countdownContainer}>
              {/* Silent countdown - no visible text or loading */}
            </View>
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {isFirstTime ? 'Secure • Private • Reliable' : 'Welcome back!'}
            </Text>
          </View>
        </Animated.View>
      </LinearGradient>
    </View>
  );
}

