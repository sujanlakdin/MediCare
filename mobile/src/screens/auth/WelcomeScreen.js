import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
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
};

export default function WelcomeScreen({ navigation }) {
  const handleQuickDemo = async () => {
    await authService.loginAsDemoElderly();
    if (navigation && navigation.navigate) {
      navigation.navigate("MyProfile");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={THEME.background} />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Header */}
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Ionicons name="medical" size={44} color={THEME.primary} />
          </View>
          <Text style={styles.appTitle}>MediCare</Text>
          <Text style={styles.tagline}>
            Senior Health & Medication Companion
          </Text>
        </View>

        {/* Elderly Reassurance Card */}
        <View style={styles.welcomeCard}>
          <View style={styles.cardHeader}>
            <Ionicons
              name="shield-checkmark"
              size={32}
              color={THEME.accent}
              style={{ marginRight: 10 }}
            />
            <Text style={styles.cardTitle}>Safe & Simple</Text>
          </View>
          <Text style={styles.cardBody}>
            Designed especially for seniors. Easy to read, simple to use, and always
            here to help you stay on track with your medications and care.
          </Text>

          <View style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={24} color={THEME.accent} />
            <Text style={styles.featureText}>Extra Large, Easy-to-Tap Buttons</Text>
          </View>
          <View style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={24} color={THEME.accent} />
            <Text style={styles.featureText}>Clear, Plain English Language</Text>
          </View>
          <View style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={24} color={THEME.accent} />
            <Text style={styles.featureText}>Direct Emergency Support (1990)</Text>
          </View>
        </View>

        {/* Primary Action Buttons (Fitts's Law Large Targets) */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.85}
            onPress={() => navigation?.navigate("Login")}
            accessibilityLabel="Sign In to My Account"
            accessibilityRole="button"
          >
            <Ionicons name="log-in-outline" size={26} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Sign In to My Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            activeOpacity={0.85}
            onPress={() => navigation?.navigate("Register")}
            accessibilityLabel="Create New Account"
            accessibilityRole="button"
          >
            <Ionicons name="person-add-outline" size={24} color={THEME.primary} />
            <Text style={styles.secondaryButtonText}>Create New Account</Text>
          </TouchableOpacity>

          {/* Quick Demo Access for Grading / Milestone Evaluation */}
          <TouchableOpacity
            style={styles.demoButton}
            activeOpacity={0.85}
            onPress={handleQuickDemo}
            accessibilityLabel="One-Tap Demo as Chathura Rajapakse"
            accessibilityRole="button"
          >
            <Ionicons name="flash-outline" size={22} color={THEME.accent} />
            <Text style={styles.demoButtonText}>
              One-Tap Demo: Chathura (72 yrs)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Emergency Assistance Banner */}
        <View style={styles.emergencyBanner}>
          <Ionicons name="call" size={22} color="#D9383A" />
          <Text style={styles.emergencyText}>
            Medical Emergency? Call{" "}
            <Text style={styles.emergencyBold}>1990 Suwa Seriya</Text>
          </Text>
        </View>
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
    paddingHorizontal: 22,
    paddingTop: 36,
    paddingBottom: 40,
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  logoBadge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#DDF1E8",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
    borderWidth: 2,
    borderColor: THEME.accent,
  },
  appTitle: {
    fontSize: 34,
    fontWeight: "800",
    color: THEME.primary,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 17,
    color: THEME.textSecondary,
    marginTop: 6,
    textAlign: "center",
    fontWeight: "500",
  },
  welcomeCard: {
    width: "100%",
    backgroundColor: THEME.card,
    borderRadius: 20,
    padding: 22,
    borderWidth: 1.5,
    borderColor: THEME.border,
    marginBottom: 26,
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: THEME.primary,
  },
  cardBody: {
    fontSize: 16,
    lineHeight: 24,
    color: THEME.textSecondary,
    marginBottom: 18,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  featureText: {
    fontSize: 16,
    color: THEME.textPrimary,
    fontWeight: "600",
    marginLeft: 10,
  },
  actionContainer: {
    width: "100%",
    gap: 14,
    marginBottom: 24,
  },
  primaryButton: {
    width: "100%",
    height: 58,
    backgroundColor: THEME.primary,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  secondaryButton: {
    width: "100%",
    height: 58,
    backgroundColor: THEME.card,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: THEME.primary,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  secondaryButtonText: {
    color: THEME.primary,
    fontSize: 18,
    fontWeight: "700",
  },
  demoButton: {
    width: "100%",
    height: 54,
    backgroundColor: "#EAF6F0",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: THEME.accent,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  demoButtonText: {
    color: THEME.primary,
    fontSize: 16,
    fontWeight: "700",
  },
  emergencyBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEECEC",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#F5C2C2",
    gap: 8,
  },
  emergencyText: {
    fontSize: 14,
    color: "#7A1D1E",
  },
  emergencyBold: {
    fontWeight: "800",
    color: "#D9383A",
  },
});
