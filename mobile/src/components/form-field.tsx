import { StyleSheet, TextInput, type TextInputProps, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useAccessibility } from '@/contexts/accessibility-context';
import { useTheme } from '@/hooks/use-theme';

type FormFieldProps = TextInputProps & {
  label: string;
  error?: string;
};

export function FormField({ label, error, style, ...props }: FormFieldProps) {
  const theme = useTheme();
  const { settings } = useAccessibility();
  return (
    <View style={styles.wrapper}>
      <ThemedText type="smallBold">{label}</ThemedText>
      <TextInput
        accessibilityLabel={label}
        accessibilityHint={error}
        placeholder={label}
        placeholderTextColor={theme.textSecondary}
        style={[
          styles.input,
          { color: theme.text, borderColor: error ? '#a22121' : theme.textSecondary },
          settings.largerButtons && styles.largeInput,
          style,
        ]}
        {...props}
      />
      {error ? <ThemedText accessibilityRole="alert" style={styles.error}>{error}</ThemedText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  input: {
    minHeight: 54,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 18,
    backgroundColor: '#ffffff',
  },
  largeInput: { minHeight: 64 },
  error: { color: '#a22121' },
});