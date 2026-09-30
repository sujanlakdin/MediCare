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
  success: "#2E7D32",
};

export default function ResetPasswordScreen({ navigation }) {
  const [step, setStep] = useState(1); // 1 = Request code, 2 = Verify & Set Password
  const [email, setEmail] = useState("chathura.rajapakse@medicare.com");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });

  // Step 1: Send Verification Code
  const handleRequestCode = async () => {
    setStatusMessage({ type: "", text: "" });
    if (!email.trim()) {
      setStatusMessage({ type: "error", text: "Please enter your registered email address." });
      return;
    }

    setLoading(true);
    try {
      const response = await authService.forgotPassword(email.trim());
      if (response.success) {
        setStatusMessage({
          type: "success",
          text: `Verification code sent to ${email}. (Test Code: ${response.verificationCode || "123456"})`,
        });
        if (response.verificationCode) {
          setResetCode(response.verificationCode);
        }
        setStep(2);
      } else {
        setStatusMessage({ type: "error", text: response.message || "Failed to send code." });
      }
    } catch (error) {
      setStatusMessage({ type: "error", text: error.message || "Could not process request." });
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify Code and Reset Password
  const handleResetPassword = async () => {
    setStatusMessage({ type: "", text: "" });
    if (!resetCode.trim()) {
      setStatusMessage({ type: "error", text: "Please enter the 6-digit verification code." });
      return;
    }
    if (!newPassword || newPassword.length < 4) {
      setStatusMessage({ type: "error", text: "New password must be at least 4 characters long." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatusMessage({ type: "error", text: "Passwords do not match. Please re-type." });
      return;
    }

    setLoading(true);
    try {
      const response = await authService.resetPassword({
        email: email.trim(),
        resetCode: resetCode.trim(),
        newPassword,
      });

      if (response.success) {
        Alert.alert(
          "Password Reset Complete",
          "Your password has been successfully updated. You can now log in with your new password.",
          [
            {
              text: "Sign In Now",
              onPress: () => {
                if (navigation && navigation.navigate) {
                  navigation.navigate("Login");
                }
              },
            },
          ]
        );
      } else {
        setStatusMessage({ type: "error", text: response.message || "Failed to reset password." });
      }
    } catch (error) {
      setStatusMessage({ type: "error", text: error.message || "Error updating password." });
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
              onPress={() => (step === 2 ? setStep(1) : navigation?.goBack())}
              accessibilityLabel="Go back"
              accessibilityRole="button"
            >
              <Ionicons name="arrow-back" size={26} color={THEME.primary} />
            </TouchableOpacity>
            <Text style={styles.topBarTitle}>Password Help</Text>
            <View style={{ width: 44 }} />
          </View>

          {/* Heading */}
          <View style={styles.introSection}>
            <Text style={styles.heading}>
              {step === 1 ? "Reset Your Password" : "Enter Verification Code"}
            </Text>
            <Text style={styles.subheading}>
              {step === 1
                ? "Don't worry! Enter your email address below and we will send a simple 6-digit verification code to reset your account."
                : "Enter the code sent to your email along with your new secure password."}
            </Text>
          </View>

          {/* Status Alert Banner */}
          {statusMessage.text ? (
            <View
              style={[
                styles.statusBanner,
                statusMessage.type === "success"
                  ? styles.successBanner
                  : styles.errorBanner,
              ]}
            >
              <Ionicons
                name={
                  statusMessage.type === "success"
                    ? "checkmark-circle"
                    : "alert-circle"
                }
                size={24}
                color={
                  statusMessage.type === "success"
                    ? THEME.success
                    : THEME.danger
                }
              />
              <Text
                style={[
                  styles.statusText,
                  {
                    color:
                      statusMessage.type === "success"
                        ? THEME.success
                        : THEME.danger,
                  },
                ]}
              >
                {statusMessage.text}
              </Text>
            </View>
          ) : null}

          {/* Step 1: Request Code */}
          {step === 1 ? (
            <View style={styles.formCard}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Registered Email Address</Text>
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
                  />
                </View>
              </View>

              <TouchableOpacity
                style={styles.actionButton}
                activeOpacity={0.85}
                onPress={handleRequestCode}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Ionicons name="send-outline" size={24} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>
                      Send Verification Code
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            /* Step 2: Verification Code and New Password */
            <View style={styles.formCard}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>6-Digit Verification Code</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="key-outline"
                    size={24}
                    color={THEME.primary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.textInput, { letterSpacing: 3, fontWeight: "700" }]}
                    value={resetCode}
                    onChangeText={setResetCode}
                    placeholder="123456"
                    placeholderTextColor="#8FA39A"
                    keyboardType="numeric"
                    maxLength={6}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>New Password</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={24}
                    color={THEME.primary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.textInput}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="Enter new password"
                    placeholderTextColor="#8FA39A"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={24}
                      color={THEME.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm New Password</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={24}
                    color={THEME.primary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.textInput}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Re-type new password"
                    placeholderTextColor="#8FA39A"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <TouchableOpacity
                style={styles.actionButton}
                activeOpacity={0.85}
                onPress={handleResetPassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>
                      Save New Password
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryTextBtn}
                onPress={() => setStep(1)}
              >
                <Text style={styles.secondaryBtnText}>
                  Change Email or Resend Code
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Return to Sign In */}
          <View style={styles.footerRow}>
            <TouchableOpacity onPress={() => navigation?.navigate("Login")}>
              <Text style={styles.footerLink}>← Return to Member Sign In</Text>
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
    marginBottom: 8,
  },
  subheading: {
    fontSize: 16,
    color: THEME.textSecondary,
    lineHeight: 23,
  },
  statusBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    marginBottom: 18,
    gap: 10,
    borderWidth: 1,
  },
  errorBanner: {
    backgroundColor: "#FEECEC",
    borderColor: "#F5C2C2",
  },
  successBanner: {
    backgroundColor: "#E8F5E9",
    borderColor: "#C8E6C9",
  },
  statusText: {
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
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
    minHeight: 56,
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
  actionButton: {
    height: 58,
    backgroundColor: THEME.primary,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginTop: 8,
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  secondaryTextBtn: {
    marginTop: 16,
    alignItems: "center",
    paddingVertical: 6,
  },
  secondaryBtnText: {
    fontSize: 15,
    color: THEME.accent,
    fontWeight: "700",
  },
  footerRow: {
    alignItems: "center",
    marginTop: 28,
  },
  footerLink: {
    fontSize: 17,
    fontWeight: "700",
    color: THEME.primary,
    textDecorationLine: "underline",
  },
});
