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

export default function RegisterScreen({ navigation }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState("72");
  const [residentialAddress, setResidentialAddress] = useState("");
  const [medicalId, setMedicalId] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleRegister = async () => {
    setErrorMessage("");

    if (!fullName.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }
    if (!email.trim()) {
      setErrorMessage("Please enter your email address.");
      return;
    }
    if (!phone.trim()) {
      setErrorMessage("Please enter your contact phone number.");
      return;
    }
    if (!password || password.length < 4) {
      setErrorMessage("Password must be at least 4 characters long.");
      return;
    }

    setLoading(true);
    try {
      const response = await authService.register({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        age: Number(age) || 72,
        residentialAddress: residentialAddress.trim() || "No. 45, Temple Road, Colombo 03",
        medicalId: medicalId.trim() || "MED-" + Math.floor(10000 + Math.random() * 90000),
      });

      if (response.success) {
        Alert.alert(
          "Registration Successful",
          `Welcome to MediCare, ${response.user?.fullName || fullName}! Your elderly-optimized profile has been created.`,
          [
            {
              text: "Go to My Profile",
              onPress: () => {
                if (navigation && navigation.navigate) {
                  navigation.navigate("MyProfile");
                }
              },
            },
          ]
        );
      } else {
        setErrorMessage(response.message || "Failed to register. Please check details.");
      }
    } catch (error) {
      setErrorMessage(error.message || "Registration failed. Please check network connection.");
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
            <Text style={styles.topBarTitle}>Create Account</Text>
            <View style={{ width: 44 }} />
          </View>

          {/* Heading */}
          <View style={styles.introSection}>
            <Text style={styles.heading}>Join MediCare</Text>
            <Text style={styles.subheading}>
              Fill in your details below. Large buttons and clear guidance are enabled by default for your comfort.
            </Text>
          </View>

          {/* Error Banner */}
          {errorMessage ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={24} color={THEME.danger} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          <View style={styles.formCard}>
            {/* Section 1: Personal Details */}
            <Text style={styles.sectionHeader}>1. Personal Information</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name *</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={22} color={THEME.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="e.g. Chathura Rajapakse"
                  placeholderTextColor="#8FA39A"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.label}>Age (Years)</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="calendar-outline" size={22} color={THEME.primary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    value={age}
                    onChangeText={setAge}
                    placeholder="72"
                    placeholderTextColor="#8FA39A"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={[styles.inputGroup, { flex: 1.6 }]}>
                <Text style={styles.label}>Phone Number *</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="call-outline" size={22} color={THEME.primary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="+94 77 123 4567"
                    placeholderTextColor="#8FA39A"
                    keyboardType="phone-pad"
                  />
                </View>
              </View>
            </View>

            {/* Section 2: Account Credentials */}
            <Text style={[styles.sectionHeader, { marginTop: 14 }]}>
              2. Account Security
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address *</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={22} color={THEME.primary} style={styles.inputIcon} />
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

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Create Password *</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={22} color={THEME.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="At least 4 characters"
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
                    size={22}
                    color={THEME.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Section 3: Medical & Residential */}
            <Text style={[styles.sectionHeader, { marginTop: 14 }]}>
              3. Medical & Address
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Residential Address</Text>
              <View style={[styles.inputWrapper, { height: 72, alignItems: "flex-start", paddingTop: 10 }]}>
                <Ionicons name="home-outline" size={22} color={THEME.primary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.textInput, { height: 50, textAlignVertical: "top" }]}
                  value={residentialAddress}
                  onChangeText={setResidentialAddress}
                  placeholder="No. 45, Temple Road, Colombo 03"
                  placeholderTextColor="#8FA39A"
                  multiline
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Medical / Clinic ID (Optional)</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="card-outline" size={22} color={THEME.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={medicalId}
                  onChangeText={setMedicalId}
                  placeholder="e.g. MED-72491"
                  placeholderTextColor="#8FA39A"
                />
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.registerButton}
              activeOpacity={0.85}
              onPress={handleRegister}
              disabled={loading}
              accessibilityLabel="Create Account button"
              accessibilityRole="button"
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Ionicons name="checkmark-done" size={24} color="#FFFFFF" />
                  <Text style={styles.registerButtonText}>Register Account</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer Back to Login */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation?.navigate("Login")}>
              <Text style={styles.footerLink}> Sign In</Text>
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
    marginBottom: 18,
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
    marginBottom: 18,
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
    marginBottom: 16,
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
    padding: 20,
    borderWidth: 1.5,
    borderColor: THEME.border,
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  sectionHeader: {
    fontSize: 17,
    fontWeight: "800",
    color: THEME.accent,
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
    color: THEME.primary,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.background,
    borderWidth: 1.5,
    borderColor: THEME.border,
    borderRadius: 14,
    paddingHorizontal: 12,
    minHeight: 54,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: THEME.textPrimary,
    fontWeight: "500",
  },
  eyeButton: {
    padding: 8,
  },
  registerButton: {
    height: 58,
    backgroundColor: THEME.primary,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginTop: 14,
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  registerButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
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
