import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Switch, View } from 'react-native';

import { ActionButton } from '@/components/action-button';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { useAccessibility, type AccessibilitySettings } from '@/contexts/accessibility-context';
import { useTheme } from '@/hooks/use-theme';
import { ApiError } from '@/services/api';

const fontOptions: AccessibilitySettings['fontSize'][] = ['standard', 'large', 'extraLarge'];
const fontLabels: Record<AccessibilitySettings['fontSize'], string> = {
  standard: 'Standard',
  large: 'Large',
  extraLarge: 'Extra large',
};

export default function AccessibilitySettingsScreen() {
  const { settings, saveSettings } = useAccessibility();
  const theme = useTheme();
  const [draft, setDraft] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  function update<K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }

  async function save() {
    setIsSaving(true);
    setError('');
    try {
      await saveSettings(draft);
      setSaved(true);
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : 'Unable to save accessibility settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Screen title="Accessibility" subtitle="Adjust how MediCare looks and responds">
      <ThemedText type="smallBold">Text size</ThemedText>
      <View style={styles.options} accessibilityRole="radiogroup" accessibilityLabel="Text size">
        {fontOptions.map((option) => (
          <Pressable
            key={option}
            accessibilityRole="radio"
            accessibilityState={{ checked: draft.fontSize === option }}
            accessibilityLabel={fontLabels[option]}
            onPress={() => update('fontSize', option)}
            style={[styles.option, { borderColor: draft.fontSize === option ? '#145c44' : theme.textSecondary }]}>
            <ThemedText style={option === 'extraLarge' ? styles.big : option === 'large' ? styles.large : undefined}>{fontLabels[option]}</ThemedText>
          </Pressable>
        ))}
      </View>
      <Toggle label="High contrast" detail="Use stronger text and surface contrast" value={draft.highContrast} onChange={(value) => update('highContrast', value)} />
      <Toggle label="Larger buttons" detail="Increase touch target size across settings and forms" value={draft.largerButtons} onChange={(value) => update('largerButtons', value)} />
      <Toggle label="Reduce animation" detail="Minimize decorative movement" value={draft.reduceMotion} onChange={(value) => update('reduceMotion', value)} />
      {error ? <ThemedText accessibilityRole="alert" style={styles.error}>{error}</ThemedText> : null}
      <ActionButton label={saved ? 'Settings saved' : 'Save settings'} loading={isSaving} onPress={() => void save()} />
    </Screen>
  );
}

function Toggle({ label, detail, value, onChange }: { label: string; detail: string; value: boolean; onChange: (value: boolean) => void }) {
  const theme = useTheme();
  return (
    <View style={styles.row}>
      <View style={styles.copy}>
        <ThemedText type="smallBold">{label}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">{detail}</ThemedText>
      </View>
      <Switch value={value} onValueChange={onChange} accessibilityRole="switch" accessibilityLabel={label} accessibilityHint={detail} trackColor={{ true: '#145c44', false: theme.backgroundSelected }} />
    </View>
  );
}

const styles = StyleSheet.create({
  options: { gap: 8 },
  option: { minHeight: 54, justifyContent: 'center', paddingHorizontal: 14, borderWidth: 2, borderRadius: 8 },
  large: { fontSize: 21 },
  big: { fontSize: 24 },
  row: { minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#777777' },
  copy: { flex: 1, gap: 4 },
  error: { color: '#a22121' },
});