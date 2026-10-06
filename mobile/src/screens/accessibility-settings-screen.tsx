import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

import { Screen } from '@/components/screen';
import { useAccessibility, type AccessibilitySettings } from '@/contexts/accessibility-context';
import { ApiError } from '@/services/api';

export default function AccessibilitySettingsScreen() {
  const { settings, saveSettings } = useAccessibility();

  const [draft, setDraft] = useState<AccessibilitySettings>(settings);
  const [voiceAssistance, setVoiceAssistance] = useState(false);
  const [simpleLanguage, setSimpleLanguage] = useState(true);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  function update<K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) {
    const updated = { ...draft, [key]: value };
    setDraft(updated);
    void saveSettings(updated).catch(() => undefined);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  }

  async function handleSave() {
    setIsSaving(true);
    setError('');
    try {
      await saveSettings(draft);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Unable to save settings. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  }

  const sizeLabels: Record<AccessibilitySettings['fontSize'], string> = {
    standard: 'Standard',
    large: 'Large',
    extraLarge: 'Extra Large (Recommended)',
  };

  return (
    <Screen
      title="Accessibility"
      subtitle="Adjust display & visual assists"
      showBack={true}
      activeTab="profile">
      <View style={styles.container}>
        {/* Card 1: System Text Size */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>System Text Size</Text>

          {/* Interactive Stepper / Slider Track */}
          <View style={styles.sliderRow}>
            <Text style={styles.sliderLetterSmall}>A</Text>

            <View style={styles.trackContainer}>
              <View style={styles.trackBackground} />
              <View
                style={[
                  styles.trackActive,
                  draft.fontSize === 'standard' && { width: '33%' },
                  draft.fontSize === 'large' && { width: '66%' },
                  draft.fontSize === 'extraLarge' && { width: '100%' },
                ]}
              />

              {/* 3 Step Targets */}
              <View style={styles.stepsRow}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Standard Text Size"
                  onPress={() => update('fontSize', 'standard')}
                  style={styles.stepTouch}>
                  <View
                    style={[
                      styles.stepDot,
                      draft.fontSize === 'standard' && styles.stepDotActive,
                    ]}
                  />
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Large Text Size"
                  onPress={() => update('fontSize', 'large')}
                  style={styles.stepTouch}>
                  <View
                    style={[
                      styles.stepDot,
                      draft.fontSize === 'large' && styles.stepDotActive,
                    ]}
                  />
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Extra Large Text Size"
                  onPress={() => update('fontSize', 'extraLarge')}
                  style={styles.stepTouch}>
                  <View
                    style={[
                      styles.stepDot,
                      draft.fontSize === 'extraLarge' && styles.stepDotActive,
                    ]}
                  />
                </Pressable>
              </View>
            </View>

            <Text style={styles.sliderLetterLarge}>A</Text>
          </View>

          <Text style={styles.currentSizeText}>
            Current Size: <Text style={styles.sizeHighlight}>{sizeLabels[draft.fontSize]}</Text>
          </Text>
        </View>

        {/* Card 2: Elderly-Friendly Options */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Elderly-Friendly Options</Text>

          {/* High Contrast Display */}
          <View style={styles.row}>
            <View style={styles.copy}>
              <Text style={styles.itemTitle}>High Contrast Display</Text>
              <Text style={styles.itemSubtitle}>Darker text and lighter background</Text>
            </View>
            <Switch
              value={draft.highContrast}
              onValueChange={(v) => update('highContrast', v)}
              trackColor={{ true: '#22996E', false: '#D9E3DE' }}
              thumbColor="#FFFFFF"
              accessibilityLabel="High Contrast Display"
            />
          </View>

          <View style={styles.divider} />

          {/* Larger Touch Targets */}
          <View style={styles.row}>
            <View style={styles.copy}>
              <Text style={styles.itemTitle}>Larger Touch Targets</Text>
              <Text style={styles.itemSubtitle}>Bigger buttons for easier pressing</Text>
            </View>
            <Switch
              value={draft.largerButtons}
              onValueChange={(v) => update('largerButtons', v)}
              trackColor={{ true: '#22996E', false: '#D9E3DE' }}
              thumbColor="#FFFFFF"
              accessibilityLabel="Larger Touch Targets"
            />
          </View>

          <View style={styles.divider} />

          {/* Voice Assistance */}
          <View style={styles.row}>
            <View style={styles.copy}>
              <Text style={styles.itemTitle}>Voice Assistance</Text>
              <Text style={styles.itemSubtitle}>Read on-screen activity aloud</Text>
            </View>
            <Switch
              value={voiceAssistance}
              onValueChange={setVoiceAssistance}
              trackColor={{ true: '#22996E', false: '#D9E3DE' }}
              thumbColor="#FFFFFF"
              accessibilityLabel="Voice Assistance"
            />
          </View>

          <View style={styles.divider} />

          {/* Reduce Motion */}
          <View style={styles.row}>
            <View style={styles.copy}>
              <Text style={styles.itemTitle}>Reduce Motion</Text>
              <Text style={styles.itemSubtitle}>Disables screen transitions</Text>
            </View>
            <Switch
              value={draft.reduceMotion}
              onValueChange={(v) => update('reduceMotion', v)}
              trackColor={{ true: '#22996E', false: '#D9E3DE' }}
              thumbColor="#FFFFFF"
              accessibilityLabel="Reduce Motion"
            />
          </View>

          <View style={styles.divider} />

          {/* Simple Language Mode */}
          <View style={styles.row}>
            <View style={styles.copy}>
              <Text style={styles.itemTitle}>Simple Language Mode</Text>
              <Text style={styles.itemSubtitle}>Simplifies difficult medical jargon</Text>
            </View>
            <Switch
              value={simpleLanguage}
              onValueChange={setSimpleLanguage}
              trackColor={{ true: '#22996E', false: '#D9E3DE' }}
              thumbColor="#FFFFFF"
              accessibilityLabel="Simple Language Mode"
            />
          </View>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {saveSuccess ? (
          <Text style={styles.successText}>✓ Accessibility preferences updated</Text>
        ) : null}

        {/* Save Button */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Save Accessibility Preferences"
          disabled={isSaving}
          onPress={() => void handleSave()}
          style={({ pressed }) => [
            styles.saveButton,
            draft.largerButtons && styles.largeSaveButton,
            pressed && styles.pressed,
          ]}>
          {isSaving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Save Accessibility Preferences</Text>
          )}
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5EDE8',
    padding: 16,
    gap: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0E3E2F',
    marginBottom: 4,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
  },
  sliderLetterSmall: {
    fontSize: 14,
    color: '#6B8278',
    fontWeight: '700',
  },
  sliderLetterLarge: {
    fontSize: 22,
    color: '#0E3E2F',
    fontWeight: '700',
  },
  trackContainer: {
    flex: 1,
    height: 32,
    justifyContent: 'center',
    position: 'relative',
  },
  trackBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E5EDE8',
  },
  trackActive: {
    position: 'absolute',
    left: 0,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22996E',
  },
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
  },
  stepTouch: {
    padding: 8,
  },
  stepDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#C6D8CE',
  },
  stepDotActive: {
    borderColor: '#22996E',
    backgroundColor: '#22996E',
  },
  currentSizeText: {
    fontSize: 13,
    color: '#6B8278',
    fontWeight: '500',
    marginTop: 2,
  },
  sizeHighlight: {
    color: '#0E3E2F',
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    gap: 12,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C2A24',
  },
  itemSubtitle: {
    fontSize: 12,
    color: '#71827A',
  },
  divider: {
    height: 1,
    backgroundColor: '#EDF2EE',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  successText: {
    color: '#1B7D54',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  saveButton: {
    height: 52,
    backgroundColor: '#22996E',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#22996E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    marginTop: 4,
    marginBottom: 16,
  },
  largeSaveButton: {
    height: 62,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.8,
  },
});