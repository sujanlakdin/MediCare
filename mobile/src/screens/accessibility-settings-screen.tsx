import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Switch, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { ActionButton } from '@/components/action-button';
import { Screen, ScreenSection } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useAccessibility, type AccessibilitySettings } from '@/contexts/accessibility-context';
import { useTheme } from '@/hooks/use-theme';
import { ApiError } from '@/services/api';

const fontSizes: { id: AccessibilitySettings['fontSize']; label: string; scaleText: string }[] = [
  { id: 'standard', label: 'Standard', scaleText: '100%' },
  { id: 'large', label: 'Large', scaleText: '118%' },
  { id: 'extraLarge', label: 'Extra Large', scaleText: '135%' },
];

export default function AccessibilitySettingsScreen() {
  const { settings, saveSettings, isLoading: isContextLoading } = useAccessibility();
  const theme = useTheme();

  const [draft, setDraft] = useState<AccessibilitySettings>(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  function handleFontSizeChange(size: AccessibilitySettings['fontSize']) {
    setDraft((prev) => ({ ...prev, fontSize: size }));
    setHasChanges(true);
    setSuccessMessage('');
  }

  function handleToggle<K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) {
    setDraft((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'largerTouchTargets') next.largerButtons = Boolean(value);
      if (key === 'largerButtons') next.largerTouchTargets = Boolean(value);
      return next;
    });
    setHasChanges(true);
    setSuccessMessage('');
  }

  async function handleSave() {
    setIsSaving(true);
    setError('');
    setSuccessMessage('');
    try {
      await saveSettings(draft);
      setSuccessMessage('Accessibility preferences saved successfully.');
      setHasChanges(false);
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : 'Unable to save accessibility preferences. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (isContextLoading) {
    return (
      <Screen title="Accessibility" subtitle="Adjust display and touch assist">
        <View style={styles.state}>
          <ActivityIndicator size="large" color="#145c44" />
          <ThemedText style={styles.loadingText}>Loading accessibility options...</ThemedText>
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      title="Accessibility"
      subtitle="Adjust display and touch assist"
      simpleSubtitle="Display and helper settings">
      {successMessage ? (
        <View style={styles.successBanner} accessibilityRole="alert">
          <ThemedText style={styles.successText}>✓ {successMessage}</ThemedText>
        </View>
      ) : null}

      {error ? (
        <View style={styles.errorBanner} accessibilityRole="alert">
          <ThemedText style={styles.errorBannerText}>{error}</ThemedText>
        </View>
      ) : null}

      {/* System Text Size Control */}
      <ScreenSection title="System Text Size">
        <ThemedView type="backgroundElement" style={styles.textSizeCard}>
          <View style={styles.textSizeAVisual}>
            <ThemedText style={styles.smallA}>A</ThemedText>
            <View style={styles.textSizeCenterLabel}>
              <ThemedText type="smallBold" style={styles.textSizeCurrentLabel}>
                Current Size: {fontSizes.find((f) => f.id === draft.fontSize)?.label}
              </ThemedText>
            </View>
            <ThemedText style={styles.largeA}>A</ThemedText>
          </View>

          <View
            style={styles.fontOptionGroup}
            accessibilityRole="radiogroup"
            accessibilityLabel="System font size selector">
            {fontSizes.map((f) => {
              const selected = draft.fontSize === f.id;
              return (
                <Pressable
                  key={f.id}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  accessibilityLabel={`${f.label} text size`}
                  onPress={() => handleFontSizeChange(f.id)}
                  style={[
                    styles.fontOptionButton,
                    selected && styles.fontOptionSelected,
                  ]}>
                  <ThemedText
                    style={[
                      styles.fontOptionText,
                      selected && styles.fontOptionTextSelected,
                      f.id === 'large' && styles.fontOptionLarge,
                      f.id === 'extraLarge' && styles.fontOptionExtraLarge,
                    ]}>
                    {f.label}
                  </ThemedText>
                  <ThemedText
                    type="small"
                    style={[
                      styles.fontOptionScale,
                      selected && styles.fontOptionScaleSelected,
                    ]}>
                    {f.scaleText}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </ThemedView>
      </ScreenSection>

      {/* Elderly-Friendly Options */}
      <ScreenSection title="Elderly-Friendly Options">
        <AccessibilityToggle
          title="High Contrast Display"
          description="Strengthen text contrast and surface clarity for visual comfort"
          value={draft.highContrast}
          onValueChange={(val) => handleToggle('highContrast', val)}
          icon={{ ios: 'circle.lefthalf.filled', android: 'contrast', web: 'contrast' }}
        />

        <AccessibilityToggle
          title="Larger Touch Targets"
          description="Expand button heights and touch zones for easier tapping"
          value={draft.largerTouchTargets || draft.largerButtons}
          onValueChange={(val) => handleToggle('largerTouchTargets', val)}
          icon={{ ios: 'hand.tap.fill', android: 'touch_app', web: 'touch_app' }}
        />

        <AccessibilityToggle
          title="Voice Assistance"
          description="Speak screen descriptions and provide auditory feedback"
          value={draft.voiceAssistance}
          onValueChange={(val) => handleToggle('voiceAssistance', val)}
          icon={{ ios: 'waveform.circle.fill', android: 'record_voice_over', web: 'record_voice_over' }}
        />

        <AccessibilityToggle
          title="Reduce Motion"
          description="Minimize animated transitions and screen movement"
          value={draft.reduceMotion}
          onValueChange={(val) => handleToggle('reduceMotion', val)}
          icon={{ ios: 'arrow.left.and.right.circle.fill', android: 'motion_photos_off', web: 'motion_photos_off' }}
        />

        <AccessibilityToggle
          title="Simple Language Mode"
          description="Show simplified explanations and straightforward instructions"
          value={draft.simpleLanguage}
          onValueChange={(val) => handleToggle('simpleLanguage', val)}
          icon={{ ios: 'text.book.closed.fill', android: 'menu_book', web: 'menu_book' }}
        />
      </ScreenSection>

      <View style={styles.saveGroup}>
        <ActionButton
          label={isSaving ? 'Saving Preferences...' : hasChanges ? 'Save Changes' : 'Saved'}
          loading={isSaving}
          onPress={() => void handleSave()}
        />
      </View>
    </Screen>
  );
}

function AccessibilityToggle({
  title,
  description,
  value,
  onValueChange,
  icon,
}: {
  title: string;
  description: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
  icon: { ios?: any; android?: string; web?: string };
}) {
  const theme = useTheme();
  const { settings } = useAccessibility();

  return (
    <ThemedView
      type="backgroundElement"
      style={[
        styles.toggleRow,
        settings.largerButtons && styles.largeToggleRow,
      ]}>
      <View style={styles.iconWrapper}>
        <SymbolView name={icon} size={22} tintColor="#145c44" />
      </View>

      <View style={styles.toggleContent}>
        <ThemedText type="smallBold" style={styles.toggleTitle}>
          {title}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.toggleDesc}>
          {description}
        </ThemedText>
      </View>

      <Switch
        value={value}
        onValueChange={onValueChange}
        accessibilityRole="switch"
        accessibilityLabel={title}
        accessibilityHint={description}
        trackColor={{ true: '#145c44', false: theme.backgroundSelected }}
        thumbColor="#ffffff"
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  state: {
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.six,
  },
  loadingText: {
    fontSize: 16,
    color: '#60646C',
  },
  textSizeCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: Spacing.four,
    gap: Spacing.three,
  },
  textSizeAVisual: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.two,
  },
  smallA: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6b7280',
  },
  textSizeCenterLabel: {
    alignItems: 'center',
  },
  textSizeCurrentLabel: {
    fontSize: 15,
    color: '#145c44',
  },
  largeA: {
    fontSize: 32,
    fontWeight: '800',
    color: '#145c44',
  },
  fontOptionGroup: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  fontOptionButton: {
    flex: 1,
    minHeight: 56,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.one,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  fontOptionSelected: {
    borderColor: '#145c44',
    backgroundColor: '#ecfdf5',
  },
  fontOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  fontOptionTextSelected: {
    color: '#145c44',
    fontWeight: '700',
  },
  fontOptionLarge: {
    fontSize: 16,
  },
  fontOptionExtraLarge: {
    fontSize: 18,
  },
  fontOptionScale: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },
  fontOptionScaleSelected: {
    color: '#145c44',
    fontWeight: '600',
  },
  toggleRow: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: Spacing.two,
  },
  largeToggleRow: {
    minHeight: 90,
    paddingVertical: Spacing.four,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e6f4ea',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleContent: {
    flex: 1,
    gap: 2,
  },
  toggleTitle: {
    fontSize: 17,
    lineHeight: 22,
  },
  toggleDesc: {
    lineHeight: 18,
  },
  saveGroup: {
    marginTop: Spacing.four,
    marginBottom: Spacing.four,
  },
  successBanner: {
    backgroundColor: '#dcfce7',
    borderColor: '#86efac',
    borderWidth: 1,
    borderRadius: 8,
    padding: Spacing.three,
  },
  successText: {
    color: '#166534',
    fontWeight: '700',
    fontSize: 16,
  },
  errorBanner: {
    backgroundColor: '#fee2e2',
    borderColor: '#fca5a5',
    borderWidth: 1,
    borderRadius: 8,
    padding: Spacing.three,
  },
  errorBannerText: {
    color: '#991b1b',
    fontWeight: '600',
    fontSize: 15,
  },
});