import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { authService } from "../../services/authService";

const THEME = {
  primary: "#123C2D", // Deep Teal
  accent: "#38B48B", // Mint Accent
  background: "#F2F9F5", // Soft Background
  card: "#FFFFFF", // White Cards
  border: "#E4ECE6", // Card Border
  textPrimary: "#123C2D",
  textSecondary: "#4A6359",
  danger: "#D9383A",
};

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("chathura.rajapakse@medicare.com");
  const [password, setPassword] = useState("MedicarePass2026!");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async () => {
    setErrorMessage("");
    if (!email.trim() || !password) {
      setErrorMessage("Please enter both your email and password.");
      return;
    }

    setLoading(true);
    try {
      const response = await authService.login({
        email: email.trim(),
        password,
      });

      if (response.success) {
        Alert.alert(
          "Welcome to MediCare",
          `Signed in as ${response.user?.fullName || "Chathura Rajapakse"}`,
          [
            {
              text: "Continue to Profile",
              onPress: () => {
                if (navigation && navigation.navigate) {
                  navigation.navigate("MyProfile");
                }
              },
            },
          ]
        );
      } else {
        setErrorMessage(response.message || "Invalid credentials.");
      }
    } catch (error) {
      setErrorMessage(error.message || "Could not connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOneTapDemo = async () => {
    setEmail("chathura.rajapakse@medicare.com");
    setPassword("MedicarePass2026!");
    setLoading(true);
    try {
      await authService.loginAsDemoElderly();
      if (navigation && navigation.navigate) {
        navigation.navigate("MyProfile");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Bar with Back Button */}
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation?.goBack()}
              accessibilityLabel="Go back"
              accessibilityRole="button"
            >
              <Ionicons name="arrow-back" size={26} color={THEME.primary} />
            </TouchableOpacity>
            <Text style={styles.topBarTitle}>Member Sign In</Text>
            <View style={{ width: 44 }} />
          </View>

          {/* Intro Card */}
          <View style={styles.introSection}>
            <Text style={styles.heading}>Welcome Back</Text>
            <Text style={styles.subheading}>
              Sign in to manage your health profile, medicines, and accessibility preferences.
            </Text>
          </View>

          {/* Error Banner */}
          {errorMessage ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={24} color={THEME.danger} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Form Card */}
          <View style={styles.formCard}>
            {/* Email Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="mail-outline"
                  size={24}
                  color={THEME.primary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.textInput}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="e.g. chathura@medicare.com"
                  placeholderTextColor="#8FA39A"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  accessibilityLabel="Email input"
                />
              </View>
            </View>

            {/* Password Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="lock-closed-outline"
                  size={24}
                  color={THEME.primary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.textInput}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  placeholderTextColor="#8FA39A"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  accessibilityLabel="Password input"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                  accessibilityLabel="Toggle password visibility"
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={24}
                    color={THEME.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password Link */}
            <TouchableOpacity
              style={styles.forgotPasswordContainer}
              onPress={() => navigation?.navigate("ResetPassword")}
            >
              <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
            </TouchableOpacity>

            {/* Sign In Button */}
            <TouchableOpacity
              style={styles.signInButton}
              activeOpacity={0.85}
              onPress={handleLogin}
              disabled={loading}
              accessibilityLabel="Sign in"
              accessibilityRole="button"
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Ionicons name="log-in" size={24} color="#FFFFFF" />
                  <Text style={styles.signInButtonText}>Sign In</Text>
                </>
              )}
            </TouchableOpacity>

            {/* One-Tap Senior Demo Button */}
            <TouchableOpacity
              style={styles.demoLoginButton}
              activeOpacity={0.85}
              onPress={handleOneTapDemo}
              accessibilityLabel="Quick sign in as Chathura Rajapakse"
              accessibilityRole="button"
            >
              <Ionicons name="sparkles" size={22} color={THEME.primary} />
              <Text style={styles.demoLoginText}>
                Demo Login: Chathura (72 yrs)
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer Navigation */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>New to MediCare?</Text>
            <TouchableOpacity onPress={() => navigation?.navigate("Register")}>
              <Text style={styles.footerLink}> Create an Account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: THEME.card,
    borderWidth: 1.5,
    borderColor: THEME.border,
    justifyContent: "center",
    alignItems: "center",
  },
  topBarTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: THEME.primary,
  },
  introSection: {
    marginBottom: 20,
  },
  heading: {
    fontSize: 28,
    fontWeight: "800",
    color: THEME.primary,
    marginBottom: 6,
  },
  subheading: {
    fontSize: 16,
    color: THEME.textSecondary,
    lineHeight: 22,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEECEC",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#F5C2C2",
    marginBottom: 18,
    gap: 10,
  },
  errorText: {
    fontSize: 15,
    color: THEME.danger,
    flex: 1,
    fontWeight: "600",
  },
  formCard: {
    backgroundColor: THEME.card,
    borderRadius: 20,
    padding: 22,
    borderWidth: 1.5,
    borderColor: THEME.border,
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
    color: THEME.primary,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.background,
    borderWidth: 1.5,
    borderColor: THEME.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    minHeight: 56, // Fitts's Law large touch target
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 17,
    color: THEME.textPrimary,
    fontWeight: "500",
  },
  eyeButton: {
    padding: 8,
  },
  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginBottom: 20,
    paddingVertical: 4,
  },
  forgotPasswordText: {
    fontSize: 15,
    fontWeight: "600",
    color: THEME.primary,
    textDecorationLine: "underline",
  },
  signInButton: {
    height: 58,
    backgroundColor: THEME.primary,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  signInButtonText: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "700",
  },
  demoLoginButton: {
    height: 52,
    backgroundColor: "#DDF1E8",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: THEME.accent,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  demoLoginText: {
    color: THEME.primary,
    fontSize: 16,
    fontWeight: "700",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 26,
  },
  footerText: {
    fontSize: 16,
    color: THEME.textSecondary,
  },
  footerLink: {
    fontSize: 16,
    fontWeight: "800",
    color: THEME.primary,
    textDecorationLine: "underline",
  },
});
