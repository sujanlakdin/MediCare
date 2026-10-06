import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  StatusBar,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
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
};

export default function MyProfileScreen({ navigation }) {
  const [user, setUser] = useState(authService.getCurrentUser());
  const [refreshing, setRefreshing] = useState(false);

  // Load Profile from backend (CRUD 1: Read Profile)
  const fetchProfileData = useCallback(async () => {
    try {
      const data = await profileService.getProfile("current");
      if (data) {
        setUser(data);
      }
    } catch (error) {
      console.warn("Error fetching profile:", error);
    }
  }, []);

  useEffect(() => {
    fetchProfileData();

    // Subscribe to dynamic updates from EditProfile and Accessibility screens
    const unsubscribe = profileService.subscribe((updatedUser) => {
      setUser({ ...updatedUser });
    });

    return () => unsubscribe();
  }, [fetchProfileData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProfileData();
    setRefreshing(false);
  };

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out of MediCare?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await authService.logout();
          if (navigation && navigation.navigate) {
            try {
              navigation.navigate("Welcome");
            } catch (e) {
              router.replace("/?route=Welcome");
            }
          } else {
            router.replace("/?route=Welcome");
          }
        },
      },
    ]);
  };

  // Get Initials
  const getInitials = (name) => {
    if (!name) return "CR";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const accessibility = user?.accessibilitySettings || {};
  const isHighContrast = accessibility.highContrast;

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        isHighContrast && { backgroundColor: "#FFFFFF" },
      ]}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor={isHighContrast ? "#FFFFFF" : THEME.background}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={THEME.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header */}
        <View style={styles.topBar}>
          <Text style={styles.pageTitle}>My Profile</Text>
          <TouchableOpacity
            style={styles.settingsIconButton}
            onPress={() => navigation?.navigate("Settings")}
            accessibilityLabel="Settings"
            accessibilityRole="button"
          >
            <Ionicons name="settings-outline" size={24} color={THEME.primary} />
          </TouchableOpacity>
        </View>

        {/* Patient Identity Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarSection}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {getInitials(user?.fullName || "Chathura Rajapakse")}
              </Text>
            </View>
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-sharp" size={16} color="#FFFFFF" />
            </View>
          </View>

          <Text style={styles.userName}>
            {user?.fullName || "Chathura Rajapakse"}
          </Text>

          <View style={styles.badgeRow}>
            <View style={styles.ageBadge}>
              <Ionicons name="person" size={14} color={THEME.primary} />
              <Text style={styles.ageBadgeText}>
                {user?.age ? `${user.age} Years Old` : "72 Years Old"}
              </Text>
            </View>

            <View style={styles.medicalIdBadge}>
              <Ionicons name="fitness" size={14} color="#0D5C3A" />
              <Text style={styles.medicalIdBadgeText}>
                ID: {user?.medicalId || "MED-72491"}
              </Text>
            </View>
          </View>
        </View>

        {/* Personal & Medical Contact Info Card (CRUD 1: Read Profile) */}
        <View style={styles.infoCard}>
          <View style={styles.infoCardHeader}>
            <Ionicons name="information-circle" size={22} color={THEME.primary} />
            <Text style={styles.infoCardTitle}>Contact & Medical Details</Text>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIconCircle}>
              <Ionicons name="call-outline" size={20} color={THEME.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Phone Number</Text>
              <Text style={styles.detailValue}>
                {user?.phone || "+94 77 123 4567"}
              </Text>
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.detailRow}>
            <View style={styles.detailIconCircle}>
              <Ionicons name="mail-outline" size={20} color={THEME.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Email Address</Text>
              <Text style={styles.detailValue}>
                {user?.email || "chathura.rajapakse@medicare.com"}
              </Text>
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.detailRow}>
            <View style={styles.detailIconCircle}>
              <Ionicons name="location-outline" size={20} color={THEME.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Residential Address</Text>
              <Text style={styles.detailValue}>
                {user?.residentialAddress || "No. 45, Temple Road, Colombo 03"}
              </Text>
            </View>
          </View>

          {/* Edit Details Action Button */}
          <TouchableOpacity
            style={styles.editButton}
            activeOpacity={0.85}
            onPress={() => navigation?.navigate("EditProfile")}
            accessibilityLabel="Edit Personal Details button"
            accessibilityRole="button"
          >
            <Ionicons name="create-outline" size={22} color="#FFFFFF" />
            <Text style={styles.editButtonText}>Edit Personal Details</Text>
          </TouchableOpacity>
        </View>

        {/* Accessibility Status Card (CRUD 2: Read Accessibility) */}
        <View style={styles.infoCard}>
          <View style={styles.infoCardHeader}>
            <Ionicons name="eye-outline" size={22} color={THEME.primary} />
            <Text style={styles.infoCardTitle}>Elderly Accessibility Status</Text>
          </View>

          <View style={styles.statusChipsContainer}>
            <View style={styles.statusChip}>
              <Ionicons
                name={accessibility.largerTouchTargets ? "checkmark-circle" : "close-circle"}
                size={18}
                color={accessibility.largerTouchTargets ? THEME.accent : "#8FA39A"}
              />
              <Text style={styles.statusChipText}>Large Touch Targets</Text>
            </View>

            <View style={styles.statusChip}>
              <Ionicons
                name={accessibility.simpleLanguage ? "checkmark-circle" : "close-circle"}
                size={18}
                color={accessibility.simpleLanguage ? THEME.accent : "#8FA39A"}
              />
              <Text style={styles.statusChipText}>Simple Language Mode</Text>
            </View>

            <View style={styles.statusChip}>
              <Ionicons
                name={accessibility.highContrast ? "checkmark-circle" : "ellipse-outline"}
                size={18}
                color={accessibility.highContrast ? THEME.accent : "#8FA39A"}
              />
              <Text style={styles.statusChipText}>
                High Contrast: {accessibility.highContrast ? "ON" : "OFF"}
              </Text>
            </View>

            <View style={styles.statusChip}>
              <Ionicons name="text" size={18} color={THEME.primary} />
              <Text style={styles.statusChipText}>
                Text Size: {accessibility.textSize ? accessibility.textSize.toUpperCase() : "LARGE"}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.accessibilityButton}
            activeOpacity={0.85}
            onPress={() => navigation?.navigate("Accessibility")}
            accessibilityLabel="Manage Elderly Accessibility Preferences"
            accessibilityRole="button"
          >
            <Ionicons name="options-outline" size={22} color={THEME.primary} />
            <Text style={styles.accessibilityButtonText}>
              Manage Accessibility Preferences
            </Text>
          </TouchableOpacity>
        </View>

        {/* Emergency Contact Quick Access */}
        <View style={styles.emergencyCard}>
          <View style={styles.emergencyRow}>
            <View style={styles.emergencyIcon}>
              <Ionicons name="medical" size={24} color="#D9383A" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.emergencyTitle}>Emergency Medical Support</Text>
              <Text style={styles.emergencyDesc}>
                1990 Suwa Seriya Ambulance Service
              </Text>
            </View>
          </View>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          style={styles.signOutButton}
          activeOpacity={0.85}
          onPress={handleSignOut}
          accessibilityLabel="Sign Out button"
          accessibilityRole="button"
        >
          <Ionicons name="log-out-outline" size={22} color={THEME.danger} />
          <Text style={styles.signOutText}>Sign Out of MediCare</Text>
        </TouchableOpacity>
      </ScrollView>
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
  pageTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: THEME.primary,
  },
  settingsIconButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: THEME.card,
    borderWidth: 1.5,
    borderColor: THEME.border,
    justifyContent: "center",
    alignItems: "center",
  },
  profileCard: {
    backgroundColor: THEME.card,
    borderRadius: 22,
    padding: 22,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: THEME.border,
    marginBottom: 20,
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  avatarSection: {
    position: "relative",
    marginBottom: 14,
  },
  avatarCircle: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: THEME.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: THEME.accent,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  verifiedBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: THEME.accent,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  userName: {
    fontSize: 24,
    fontWeight: "800",
    color: THEME.primary,
    marginBottom: 8,
    textAlign: "center",
  },
  badgeRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  ageBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EAF6F0",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 6,
  },
  ageBadgeText: {
    fontSize: 14,
    fontWeight: "700",
    color: THEME.primary,
  },
  medicalIdBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D8F3E5",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 6,
  },
  medicalIdBadgeText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0D5C3A",
  },
  infoCard: {
    backgroundColor: THEME.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: THEME.border,
    marginBottom: 18,
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  infoCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  infoCardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: THEME.primary,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  detailIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: THEME.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: THEME.textSecondary,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "700",
    color: THEME.textPrimary,
  },
  separator: {
    height: 1,
    backgroundColor: THEME.border,
    marginVertical: 4,
  },
  editButton: {
    height: 54,
    backgroundColor: THEME.primary,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginTop: 16,
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  editButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
  statusChipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  statusChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.background,
    borderWidth: 1,
    borderColor: THEME.border,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 6,
  },
  statusChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: THEME.textPrimary,
  },
  accessibilityButton: {
    height: 52,
    backgroundColor: "#EAF6F0",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: THEME.accent,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  accessibilityButtonText: {
    color: THEME.primary,
    fontSize: 16,
    fontWeight: "700",
  },
  emergencyCard: {
    backgroundColor: "#FEECEC",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F5C2C2",
    marginBottom: 18,
  },
  emergencyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  emergencyIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  emergencyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#7A1D1E",
  },
  emergencyDesc: {
    fontSize: 13,
    color: "#992224",
    marginTop: 2,
  },
  signOutButton: {
    height: 54,
    backgroundColor: THEME.card,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#F5C2C2",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  signOutText: {
    color: THEME.danger,
    fontSize: 16,
    fontWeight: "700",
  },
});
