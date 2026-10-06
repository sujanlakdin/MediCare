import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
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

export default function SettingsScreen({ navigation }) {
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [caregiverAlerts, setCaregiverAlerts] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [language, setLanguage] = useState("English");

  const languages = ["English", "සිංහල", "தமிழ்"];

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out of your account?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await authService.logout();
          if (navigation && navigation.navigate) {
            navigation.navigate("Welcome");
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
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
          <Text style={styles.topBarTitle}>Account & Settings</Text>
          <View style={{ width: 48 }} />
        </View>

        {/* Section: Elderly Accessibility Shortcut */}
        <TouchableOpacity
          style={styles.accessibilityBanner}
          activeOpacity={0.85}
          onPress={() => navigation?.navigate("Accessibility")}
          accessibilityLabel="Open Elderly Accessibility Settings"
          accessibilityRole="button"
        >
          <View style={styles.bannerIconCircle}>
            <Ionicons name="accessibility" size={26} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>Display & Accessibility</Text>
            <Text style={styles.bannerSubtitle}>
              Adjust text scale, contrast, and touch targets
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={THEME.primary} />
        </TouchableOpacity>

        {/* Section: Language Preference */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="globe-outline" size={22} color={THEME.primary} />
            <Text style={styles.cardTitle}>App Language</Text>
          </View>
          <Text style={styles.cardCaption}>
            Select your preferred display language for instructions.
          </Text>

          <View style={styles.languageOptions}>
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang}
                style={[
                  styles.languageButton,
                  language === lang && styles.languageButtonActive,
                ]}
                onPress={() => setLanguage(lang)}
              >
                <Text
                  style={[
                    styles.languageText,
                    language === lang && styles.languageTextActive,
                  ]}
                >
                  {lang}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Section: Notification & Reminders */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="notifications-outline" size={22} color={THEME.primary} />
            <Text style={styles.cardTitle}>Alerts & Notifications</Text>
          </View>

          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleLabel}>Medication Alarms</Text>
              <Text style={styles.toggleDesc}>
                Audible sound alarms when it is time to take pills
              </Text>
            </View>
            <Switch
              value={remindersEnabled}
              onValueChange={setRemindersEnabled}
              trackColor={{ false: "#D1DDD7", true: THEME.accent }}
              thumbColor={remindersEnabled ? THEME.primary : "#FFFFFF"}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleLabel}>Caregiver Sync Alerts</Text>
              <Text style={styles.toggleDesc}>
                Notify family or caregivers if a dose is delayed
              </Text>
            </View>
            <Switch
              value={caregiverAlerts}
              onValueChange={setCaregiverAlerts}
              trackColor={{ false: "#D1DDD7", true: THEME.accent }}
              thumbColor={caregiverAlerts ? THEME.primary : "#FFFFFF"}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleLabel}>Loud Chime Sounds</Text>
              <Text style={styles.toggleDesc}>
                High-volume chime suitable for hearing assistance
              </Text>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={setSoundEnabled}
              trackColor={{ false: "#D1DDD7", true: THEME.accent }}
              thumbColor={soundEnabled ? THEME.primary : "#FFFFFF"}
            />
          </View>
        </View>

        {/* Section: Emergency Contacts Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="call-outline" size={22} color={THEME.primary} />
            <Text style={styles.cardTitle}>Emergency Medical Support</Text>
          </View>
          <View style={styles.contactItem}>
            <Ionicons name="shield-checkmark" size={22} color={THEME.accent} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.contactName}>National Ambulance (Suwa Seriya)</Text>
              <Text style={styles.contactPhone}>Hotline: 1990 (Toll-Free)</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.contactItem}>
            <Ionicons name="heart" size={22} color="#D9383A" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.contactName}>Family Caregiver (Samantha R.)</Text>
              <Text style={styles.contactPhone}>+94 71 889 9123</Text>
            </View>
          </View>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          style={styles.signOutButton}
          activeOpacity={0.85}
          onPress={handleSignOut}
          accessibilityLabel="Sign Out of MediCare"
          accessibilityRole="button"
        >
          <Ionicons name="log-out-outline" size={24} color={THEME.danger} />
          <Text style={styles.signOutButtonText}>Sign Out of My Account</Text>
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
    fontSize: 22,
    fontWeight: "800",
    color: THEME.primary,
  },
  accessibilityBanner: {
    backgroundColor: "#DDF1E8",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: THEME.accent,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  bannerIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: THEME.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  bannerTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: THEME.primary,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: THEME.textSecondary,
    marginTop: 2,
  },
  card: {
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
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: THEME.primary,
  },
  cardCaption: {
    fontSize: 14,
    color: THEME.textSecondary,
    marginBottom: 14,
  },
  languageOptions: {
    flexDirection: "row",
    gap: 10,
  },
  languageButton: {
    flex: 1,
    height: 48,
    backgroundColor: THEME.background,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: THEME.border,
    justifyContent: "center",
    alignItems: "center",
  },
  languageButtonActive: {
    backgroundColor: THEME.primary,
    borderColor: THEME.primary,
  },
  languageText: {
    fontSize: 16,
    fontWeight: "700",
    color: THEME.textPrimary,
  },
  languageTextActive: {
    color: "#FFFFFF",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    gap: 12,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: THEME.primary,
    marginBottom: 2,
  },
  toggleDesc: {
    fontSize: 13,
    color: THEME.textSecondary,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: THEME.border,
    marginVertical: 6,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  contactName: {
    fontSize: 15,
    fontWeight: "700",
    color: THEME.primary,
  },
  contactPhone: {
    fontSize: 14,
    color: THEME.textSecondary,
    marginTop: 2,
  },
  signOutButton: {
    height: 56,
    backgroundColor: THEME.card,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#F5C2C2",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginTop: 6,
  },
  signOutButtonText: {
    color: THEME.danger,
    fontSize: 17,
    fontWeight: "800",
  },
});
