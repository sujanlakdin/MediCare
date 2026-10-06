import React, { useState, useEffect } from "react";
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
import { profileService } from "../../services/profileService";
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

export default function EditProfileScreen({ navigation }) {
  const currentUser = authService.getCurrentUser();

  const [fullName, setFullName] = useState(currentUser?.fullName || "Chathura Rajapakse");
  const [age, setAge] = useState(String(currentUser?.age || 72));
  const [phone, setPhone] = useState(currentUser?.phone || "+94 77 123 4567");
  const [residentialAddress, setResidentialAddress] = useState(
    currentUser?.residentialAddress || "No. 45, Temple Road, Colombo 03"
  );
  const [medicalId, setMedicalId] = useState(currentUser?.medicalId || "MED-72491");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // Sync with backend if needed
    const fetchLatest = async () => {
      try {
        const data = await profileService.getProfile("current");
        if (data) {
          setFullName(data.fullName || "Chathura Rajapakse");
          setAge(String(data.age || 72));
          setPhone(data.phone || "+94 77 123 4567");
          setResidentialAddress(data.residentialAddress || "No. 45, Temple Road, Colombo 03");
          setMedicalId(data.medicalId || "MED-72491");
        }
      } catch (e) {
        console.warn("EditProfile fetchLatest error:", e);
      }
    };
    fetchLatest();
  }, []);

  /**
   * CRUD Operation 1: Update personal & medical contact details
   */
  const handleSaveProfile = async () => {
    setErrorMessage("");

    if (!fullName.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }
    if (!phone.trim()) {
      setErrorMessage("Please enter your phone number.");
      return;
    }

    const parsedAge = Number(age);
    if (isNaN(parsedAge) || parsedAge < 0 || parsedAge > 125) {
      setErrorMessage("Please enter a valid age (e.g. 72).");
      return;
    }

    setLoading(true);
    try {
      const updatedData = {
        fullName: fullName.trim(),
        age: parsedAge,
        phone: phone.trim(),
        residentialAddress: residentialAddress.trim(),
        medicalId: medicalId.trim(),
      };

      const result = await profileService.updateProfile(currentUser?._id, updatedData);

      Alert.alert(
        "Profile Updated",
        "Your personal and medical contact details have been successfully saved to your MediCare profile.",
        [
          {
            text: "Back to Profile",
            onPress: () => navigation?.goBack(),
          },
        ]
      );
    } catch (error) {
      setErrorMessage(error.message || "Failed to update profile. Please try again.");
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
          {/* Top Bar */}
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation?.goBack()}
              accessibilityLabel="Back"
              accessibilityRole="button"
            >
              <Ionicons name="arrow-back" size={26} color={THEME.primary} />
            </TouchableOpacity>
            <Text style={styles.topBarTitle}>Edit Profile Details</Text>
            <View style={{ width: 48 }} />
          </View>

          {/* Intro Card */}
          <View style={styles.introCard}>
            <Ionicons name="create-outline" size={28} color={THEME.accent} />
            <Text style={styles.introText}>
              Keep your contact and clinic details up-to-date so caregivers and medical responders can reach you easily.
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
            {/* Full Name */}
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

            {/* Age & Phone Row */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.label}>Age</Text>
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

            {/* Residential Address */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Residential Address</Text>
              <View style={[styles.inputWrapper, { height: 80, alignItems: "flex-start", paddingTop: 10 }]}>
                <Ionicons name="home-outline" size={22} color={THEME.primary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.textInput, { height: 60, textAlignVertical: "top" }]}
                  value={residentialAddress}
                  onChangeText={setResidentialAddress}
                  placeholder="Enter home address"
                  placeholderTextColor="#8FA39A"
                  multiline
                />
              </View>
            </View>

            {/* Medical / Clinic ID */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Medical / Hospital ID</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="fitness-outline" size={22} color={THEME.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={medicalId}
                  onChangeText={setMedicalId}
                  placeholder="e.g. MED-72491"
                  placeholderTextColor="#8FA39A"
                />
              </View>
            </View>

            {/* Action Buttons */}
            <TouchableOpacity
              style={styles.saveButton}
              activeOpacity={0.85}
              onPress={handleSaveProfile}
              disabled={loading}
              accessibilityLabel="Save Profile Changes button"
              accessibilityRole="button"
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Ionicons name="save-outline" size={24} color="#FFFFFF" />
                  <Text style={styles.saveButtonText}>Save Profile Changes</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              activeOpacity={0.85}
              onPress={() => navigation?.goBack()}
              accessibilityLabel="Cancel button"
              accessibilityRole="button"
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
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
    marginBottom: 16,
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
    fontSize: 22,
    fontWeight: "800",
    color: THEME.primary,
  },
  introCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EAF6F0",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: THEME.border,
    marginBottom: 18,
    gap: 12,
  },
  introText: {
    flex: 1,
    fontSize: 15,
    color: THEME.textPrimary,
    lineHeight: 21,
    fontWeight: "500",
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
    padding: 22,
    borderWidth: 1.5,
    borderColor: THEME.border,
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  inputGroup: {
    marginBottom: 16,
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
    minHeight: 56, // Fitts's Law
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 17,
    color: THEME.textPrimary,
    fontWeight: "600",
  },
  saveButton: {
    height: 58,
    backgroundColor: THEME.primary,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginTop: 10,
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  cancelButton: {
    height: 52,
    backgroundColor: "transparent",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  cancelButtonText: {
    color: THEME.textSecondary,
    fontSize: 16,
    fontWeight: "700",
  },
});
