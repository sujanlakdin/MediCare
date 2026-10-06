import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
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
};

export default function AccessibilityScreen({ navigation }) {
  const currentUser = authService.getCurrentUser();
  const initialSettings = currentUser?.accessibilitySettings || {};

  const [highContrast, setHighContrast] = useState(Boolean(initialSettings.highContrast));
  const [largerTouchTargets, setLargerTouchTargets] = useState(
    initialSettings.largerTouchTargets !== undefined ? Boolean(initialSettings.largerTouchTargets) : true
  );
  const [voiceAssistance, setVoiceAssistance] = useState(Boolean(initialSettings.voiceAssistance));
  const [reduceMotion, setReduceMotion] = useState(Boolean(initialSettings.reduceMotion));
  const [simpleLanguage, setSimpleLanguage] = useState(
    initialSettings.simpleLanguage !== undefined ? Boolean(initialSettings.simpleLanguage) : true
  );
  const [textSize, setTextSize] = useState(initialSettings.textSize || "large");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Sync with backend on mount
    const fetchSettings = async () => {
      try {
        const user = await profileService.getProfile("current");
        if (user?.accessibilitySettings) {
          const s = user.accessibilitySettings;
          setHighContrast(Boolean(s.highContrast));
          setLargerTouchTargets(s.largerTouchTargets !== undefined ? Boolean(s.largerTouchTargets) : true);
          setVoiceAssistance(Boolean(s.voiceAssistance));
          setReduceMotion(Boolean(s.reduceMotion));
          setSimpleLanguage(s.simpleLanguage !== undefined ? Boolean(s.simpleLanguage) : true);
          setTextSize(s.textSize || "large");
        }
      } catch (e) {
        console.warn("AccessibilityScreen fetch error:", e);
      }
    };
    fetchSettings();
  }, []);

  /**
   * CRUD Operation 2: Update elderly accessibility toggle preferences
   */
  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      const preferences = {
        highContrast,
        largerTouchTargets,
        voiceAssistance,
        reduceMotion,
        simpleLanguage,
        textSize,
      };

      await profileService.updateAccessibility(currentUser?._id, preferences);

      Alert.alert(
        "Preferences Saved",
        "Your elderly accessibility display settings have been updated across your MediCare app.",
        [
          {
            text: "Back to Profile",
            onPress: () => navigation?.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert("Notice", error.message || "Failed to update preferences.");
    } finally {
      setLoading(false);
    }
  };

  // Helper for font scale preview
  const getPreviewFontSize = () => {
    if (textSize === "extra-large") return 22;
    if (textSize === "large") return 18;
    return 15;
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        highContrast && { backgroundColor: "#FFFFFF" },
      ]}
    >
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
          <Text style={styles.topBarTitle}>Accessibility Settings</Text>
          <View style={{ width: 48 }} />
        </View>

        {/* Intro Banner */}
        <View style={styles.introCard}>
          <Ionicons name="accessibility" size={30} color={THEME.accent} />
          <View style={{ flex: 1 }}>
            <Text style={styles.introTitle}>Elderly Friendly Display</Text>
            <Text style={styles.introDesc}>
              Customize button sizes, text scale, and contrast to make MediCare comfortable for your eyes and fingers.
            </Text>
          </View>
        </View>

        {/* Live Interactive Preview Card */}
        <View
          style={[
            styles.previewCard,
            highContrast && styles.previewCardHighContrast,
          ]}
        >
          <View style={styles.previewHeader}>
            <Ionicons name="eye" size={20} color={highContrast ? "#000000" : THEME.primary} />
            <Text
              style={[
                styles.previewTitle,
                highContrast && { color: "#000000" },
              ]}
            >
              Live Visual Preview
            </Text>
          </View>
          <Text
            style={[
              styles.previewText,
              { fontSize: getPreviewFontSize() },
              highContrast && { color: "#000000", fontWeight: "700" },
            ]}
          >
            {simpleLanguage
              ? "Good morning, Chathura! Time to take your blood pressure pill with a glass of water."
              : "Morning reminder: Ingest prescribed 10mg Antihypertensive medication orally."}
          </Text>

          <View
            style={[
              styles.previewButton,
              largerTouchTargets && styles.previewButtonLarge,
              highContrast && styles.previewButtonHighContrast,
            ]}
          >
            <Ionicons
              name="checkmark-circle"
              size={largerTouchTargets ? 24 : 18}
              color="#FFFFFF"
            />
            <Text
              style={[
                styles.previewButtonText,
                { fontSize: largerTouchTargets ? 17 : 14 },
              ]}
            >
              Sample Button Target
            </Text>
          </View>
        </View>

        {/* Text Size Selector Card */}
        <View style={styles.settingCard}>
          <View style={styles.settingHeader}>
            <Ionicons name="text-outline" size={24} color={THEME.primary} />
            <Text style={styles.settingTitle}>System Text Size</Text>
          </View>
          <Text style={styles.settingDescription}>
            Choose a comfortable text size for all medication schedules and instructions.
          </Text>

          <View style={styles.textSizeOptionsContainer}>
            <TouchableOpacity
              style={[
                styles.textSizeOption,
                textSize === "normal" && styles.textSizeOptionSelected,
              ]}
              onPress={() => setTextSize("normal")}
              accessibilityLabel="Select normal text size"
            >
              <Text
                style={[
                  styles.textSizeLabel,
                  textSize === "normal" && styles.textSizeLabelSelected,
                ]}
              >
                Normal
              </Text>
              <Text style={styles.textSizeSub}>15px</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.textSizeOption,
                textSize === "large" && styles.textSizeOptionSelected,
              ]}
              onPress={() => setTextSize("large")}
              accessibilityLabel="Select large text size"
            >
              <Text
                style={[
                  styles.textSizeLabel,
                  { fontSize: 18 },
                  textSize === "large" && styles.textSizeLabelSelected,
                ]}
              >
                Large
              </Text>
              <Text style={styles.textSizeSub}>Recommended</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.textSizeOption,
                textSize === "extra-large" && styles.textSizeOptionSelected,
              ]}
              onPress={() => setTextSize("extra-large")}
              accessibilityLabel="Select extra large text size"
            >
              <Text
                style={[
                  styles.textSizeLabel,
                  { fontSize: 20 },
                  textSize === "extra-large" && styles.textSizeLabelSelected,
                ]}
              >
                XL
              </Text>
              <Text style={styles.textSizeSub}>22px</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Accessibility Toggles Card */}
        <View style={styles.settingCard}>
          <Text style={styles.togglesCardTitle}>Vision & Touch Assistance</Text>

          {/* Toggle 1: High Contrast */}
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <View style={styles.toggleTitleRow}>
                <Ionicons name="contrast-outline" size={22} color={THEME.primary} />
                <Text style={styles.toggleLabel}>High Contrast Mode</Text>
              </View>
              <Text style={styles.toggleCaption}>
                Enhances colors and borders for clear visibility in bright sunlight or low vision.
              </Text>
            </View>
            <Switch
              value={highContrast}
              onValueChange={setHighContrast}
              trackColor={{ false: "#D1DDD7", true: THEME.accent }}
              thumbColor={highContrast ? THEME.primary : "#FFFFFF"}
              style={styles.switchTouch}
            />
          </View>

          <View style={styles.divider} />

          {/* Toggle 2: Larger Touch Targets */}
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <View style={styles.toggleTitleRow}>
                <Ionicons name="finger-print-outline" size={22} color={THEME.primary} />
                <Text style={styles.toggleLabel}>Larger Touch Targets</Text>
              </View>
              <Text style={styles.toggleCaption}>
                Enlarges all buttons to at least 56px following Fitts's Law for easier tapping.
              </Text>
            </View>
            <Switch
              value={largerTouchTargets}
              onValueChange={setLargerTouchTargets}
              trackColor={{ false: "#D1DDD7", true: THEME.accent }}
              thumbColor={largerTouchTargets ? THEME.primary : "#FFFFFF"}
              style={styles.switchTouch}
            />
          </View>

          <View style={styles.divider} />

          {/* Toggle 3: Simple Language Mode */}
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <View style={styles.toggleTitleRow}>
                <Ionicons name="chatbubble-ellipses-outline" size={22} color={THEME.primary} />
                <Text style={styles.toggleLabel}>Simple Language Mode</Text>
              </View>
              <Text style={styles.toggleCaption}>
                Replaces complex medical terminology with plain, everyday words.
              </Text>
            </View>
            <Switch
              value={simpleLanguage}
              onValueChange={setSimpleLanguage}
              trackColor={{ false: "#D1DDD7", true: THEME.accent }}
              thumbColor={simpleLanguage ? THEME.primary : "#FFFFFF"}
              style={styles.switchTouch}
            />
          </View>

          <View style={styles.divider} />

          {/* Toggle 4: Voice Assistance */}
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <View style={styles.toggleTitleRow}>
                <Ionicons name="volume-high-outline" size={22} color={THEME.primary} />
                <Text style={styles.toggleLabel}>Voice Assistance Prompts</Text>
              </View>
              <Text style={styles.toggleCaption}>
                Provides spoken audio prompts when alarms and medication reminders trigger.
              </Text>
            </View>
            <Switch
              value={voiceAssistance}
              onValueChange={setVoiceAssistance}
              trackColor={{ false: "#D1DDD7", true: THEME.accent }}
              thumbColor={voiceAssistance ? THEME.primary : "#FFFFFF"}
              style={styles.switchTouch}
            />
          </View>

          <View style={styles.divider} />

          {/* Toggle 5: Reduce Motion */}
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <View style={styles.toggleTitleRow}>
                <Ionicons name="pause-circle-outline" size={22} color={THEME.primary} />
                <Text style={styles.toggleLabel}>Reduce Motion</Text>
              </View>
              <Text style={styles.toggleCaption}>
                Stops fast page animations and sliding effects for a calmer reading experience.
              </Text>
            </View>
            <Switch
              value={reduceMotion}
              onValueChange={setReduceMotion}
              trackColor={{ false: "#D1DDD7", true: THEME.accent }}
              thumbColor={reduceMotion ? THEME.primary : "#FFFFFF"}
              style={styles.switchTouch}
            />
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={styles.saveButton}
          activeOpacity={0.85}
          onPress={handleSaveSettings}
          disabled={loading}
          accessibilityLabel="Save Accessibility Preferences button"
          accessibilityRole="button"
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Ionicons name="checkmark-done-circle" size={24} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>
                Save Accessibility Preferences
              </Text>
            </>
          )}
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
    borderRadius: 18,
    padding: 18,
    borderWidth: 1.5,
    borderColor: THEME.border,
    marginBottom: 18,
    gap: 12,
  },
  introTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: THEME.primary,
    marginBottom: 4,
  },
  introDesc: {
    fontSize: 14,
    color: THEME.textSecondary,
    lineHeight: 20,
  },
  previewCard: {
    backgroundColor: THEME.card,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
    borderColor: THEME.border,
    marginBottom: 18,
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  previewCardHighContrast: {
    backgroundColor: "#FFFFFF",
    borderColor: "#000000",
    borderWidth: 2.5,
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
  },
  previewTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: THEME.primary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  previewText: {
    color: THEME.textPrimary,
    lineHeight: 26,
    marginBottom: 14,
    fontWeight: "500",
  },
  previewButton: {
    backgroundColor: THEME.primary,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  previewButtonLarge: {
    minHeight: 56, // Large touch target
    paddingVertical: 14,
    borderRadius: 16,
  },
  previewButtonHighContrast: {
    backgroundColor: "#000000",
    borderWidth: 2,
    borderColor: "#000000",
  },
  previewButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  settingCard: {
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
  settingHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 6,
  },
  settingTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: THEME.primary,
  },
  settingDescription: {
    fontSize: 14,
    color: THEME.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  textSizeOptionsContainer: {
    flexDirection: "row",
    gap: 10,
  },
  textSizeOption: {
    flex: 1,
    backgroundColor: THEME.background,
    borderWidth: 1.5,
    borderColor: THEME.border,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  textSizeOptionSelected: {
    backgroundColor: "#EAF6F0",
    borderColor: THEME.accent,
    borderWidth: 2,
  },
  textSizeLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: THEME.textSecondary,
    marginBottom: 2,
  },
  textSizeLabelSelected: {
    color: THEME.primary,
  },
  textSizeSub: {
    fontSize: 12,
    color: THEME.textSecondary,
    fontWeight: "500",
  },
  togglesCardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: THEME.primary,
    marginBottom: 16,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    gap: 12,
  },
  toggleInfo: {
    flex: 1,
  },
  toggleTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: THEME.primary,
  },
  toggleCaption: {
    fontSize: 13,
    color: THEME.textSecondary,
    lineHeight: 18,
  },
  switchTouch: {
    transform: [{ scaleX: 1.15 }, { scaleY: 1.15 }],
  },
  divider: {
    height: 1,
    backgroundColor: THEME.border,
    marginVertical: 8,
  },
  saveButton: {
    height: 58,
    backgroundColor: THEME.primary,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginTop: 6,
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
});
