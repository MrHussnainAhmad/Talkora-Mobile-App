import { Text, View, ActivityIndicator, Alert } from "react-native";
import { KeyboardAvoidingView, Platform } from "react-native";
import styles from "../../assets/styles/signup.style ";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { TextInput } from "react-native";
import { TouchableOpacity } from "react-native";
import { Link, router } from "expo-router";
import ApiService from "../../services/api";
import VerificationModal from "../../components/VerificationModal";
import { useAuth } from "../../context/AuthContext";

export default function Signup() {
  const { user, loading } = useAuth();
  
  useEffect(() => {
    // Check if user is already logged in
    if (user && !loading) {
      router.replace('/home');
    }
  }, [user, loading]);
  const [fullname, setFullName] = useState("");
  const [username, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const handleSubmit = async () => {
    // Validation
    if (!fullname || !username || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      await ApiService.signup({
        fullname,
        username,
        email,
        password,
      });

      // Show verification modal
      setUserEmail(email);
      setShowVerificationModal(true);
      
    } catch (error) {
      console.error('Signup Error:', error);
      Alert.alert('Signup Failed', error.message || 'An error occurred during signup');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.title}>
          <Text style={styles.titleText}>Create Account</Text>
          <Text style={styles.subtitleText}>
            Join our secure chat platform.
          </Text>
        </View>

        {/* FORM */}
        <View style={styles.card}>
          <View style={styles.formContainer}>
            {/* Fullname */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="person"
                  size={22}
                  color="#000"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your name"
                  value={fullname}
                  onChangeText={setFullName}
                  keyboardType="default"
                  autoCapitalize="none"
                ></TextInput>
              </View>
            </View>

            {/* Username */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Username</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="person"
                  size={22}
                  color="#000"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your username"
                  value={username}
                  onChangeText={setUserName}
                  keyboardType="default"
                  autoCapitalize="none"
                ></TextInput>
              </View>
            </View>

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

            {/* CONFIRM PASSWORD */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={22}
                  color="#000"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                    size={22}
                    color="#000"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* LOGIN BUTTON */}
            <View style={styles.inputGroup}>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Create Account</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* FOOTER */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Link href="/(auth)" asChild>
                <TouchableOpacity>
                  <Text style={styles.link}>Login</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </View>
      </View>
      
      {/* VERIFICATION MODAL */}
      <VerificationModal
        visible={showVerificationModal}
        onClose={() => {
          setShowVerificationModal(false);
          router.push('/(auth)'); // Navigate back to login
        }}
        email={userEmail}
        onVerificationComplete={() => {
          setShowVerificationModal(false);
          router.push('/(auth)'); // Navigate back to login
        }}
      />
    </KeyboardAvoidingView>
  );
}
