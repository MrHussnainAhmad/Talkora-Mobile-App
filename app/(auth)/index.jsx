import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Text,
  View,
  Keyboard,
  Dimensions,
  Animated,
  Alert,
} from "react-native";
import { useState, useEffect, useRef } from "react";
import { Image } from "expo-image";
import styles from "../../assets/styles/login.style";
import { Ionicons } from "@expo/vector-icons";
import { TextInput } from "react-native";
import { TouchableOpacity } from "react-native";
import { Link, router } from "expo-router";
import ApiService from "../../services/api";
import VerificationModal from "../../components/VerificationModal";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const { user, loading, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const { width } = Dimensions.get("window");
  const imageScale = useRef(new Animated.Value(1)).current;
  const imageTranslateY = useRef(new Animated.Value(-30)).current; // Start pushed up

  useEffect(() => {
    // Check if user is already logged in
    if (user && !loading) {
      router.replace('/home');
    }
    
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
        // Animate to smaller size and push down slightly
        Animated.parallel([
          Animated.timing(imageScale, {
            toValue: 0.5, // Scale down to 50%
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(imageTranslateY, {
            toValue: 20, // Push down when keyboard is open
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
        // Animate back to original size and push up for better spacing
        Animated.parallel([
          Animated.timing(imageScale, {
            toValue: 1, // Scale back to 100%
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(imageTranslateY, {
            toValue: -30, // Push up when keyboard is closed for gap
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, [user, loading]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    try {
      await login({ email, password });
      // Navigation will be handled by AuthContext
      
    } catch (error) {
      console.error('Login Error:', error);
      
      // Handle verification required error
      if (error.message.includes('verify your email')) {
        setUserEmail(email);
        setShowVerificationModal(true);
      } else {
        Alert.alert('Login Failed', error.message || 'An error occurred during login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Animated image style with both scale and vertical positioning
  const getAnimatedImageStyle = () => {
    return {
      transform: [
        { scale: imageScale },
        { translateY: imageTranslateY }
      ],
    };
  };

  return (
    <KeyboardAvoidingView
    style={{flex:1}}
    behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.container}>
        <View style={styles.topIllustration}>
          <Animated.View style={getAnimatedImageStyle()}>
            <Image
              source={require("../../assets/images/Login.png")}
              style={styles.illustrationImage}
            />
          </Animated.View>
        </View>
        <View style={styles.card}>
          <View style={styles.formContainer}>
            {/* EMAIL */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="mail-outline"
                  size={22}
                  color="#000"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                ></TextInput>
              </View>
            </View>

            {/* PASSWORD */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name={
                    showPassword ? "lock-open-outline" : "lock-closed-outline"
                  }
                  size={22}
                  color="#000"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="********"
                  value={password}
                  onChangeText={setPassword}
                  keyboardType="password"
                  autoCapitalize="none"
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={22}
                    color="#000"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* LOGIN BUTTON */}
            <View style={styles.inputGroup}>
            <TouchableOpacity
              style={styles.button}
              onPress={handleLogin}
              disabled={isLoading}
            >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Login</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* FOOTER */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <Link href="/(auth)/signup" asChild>
                <TouchableOpacity>
                  <Text style={styles.link}>Sign Up</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </View>
      </View>
      
      {/* VERIFICATION MODAL */}
      <VerificationModal
        visible={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        email={userEmail}
        onVerificationComplete={() => {
          setShowVerificationModal(false);
          Alert.alert('Success', 'Please try logging in again after verification.');
        }}
      />
    </KeyboardAvoidingView>
  );
}
