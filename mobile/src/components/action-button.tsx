import { ActivityIndicator, Pressable, StyleSheet, type PressableProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useAccessibility } from '@/contexts/accessibility-context';
import { useTheme } from '@/hooks/use-theme';

type ActionButtonProps = Omit<PressableProps, 'children'> & {
  label: string;
  secondary?: boolean;
  destructive?: boolean;
  loading?: boolean;
};

export function ActionButton({ label, secondary, destructive, loading, style, ...props }: ActionButtonProps) {
  const { settings } = useAccessibility();
  const theme = useTheme();
  const isLarge = settings.largerButtons || settings.largerTouchTargets;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={loading || props.disabled}
      style={(state) => [
        styles.button,
        isLarge && styles.largeButton,
        secondary && styles.secondary,
        destructive && styles.destructive,
        state.pressed && styles.pressed,
        (loading || props.disabled) && styles.disabled,
        typeof style === 'function' ? style(state) : style,
      ]}
      {...props}>
      {loading ? (
        <ActivityIndicator color={secondary ? '#145c44' : '#ffffff'} />
      ) : (
        <ThemedText
          style={[
            styles.label,
            secondary && { color: settings.highContrast ? theme.text : '#145c44' },
            destructive && styles.destructiveLabel,
          ]}>
          {label}
        </ThemedText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#145c44',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  largeButton: { minHeight: 64, paddingHorizontal: 24 },
  secondary: {
    borderWidth: 2,
    borderColor: '#145c44',
    backgroundColor: '#ffffff',
    elevation: 0,
    shadowOpacity: 0,
  },
  destructive: { backgroundColor: '#dc2626' },
  pressed: { opacity: 0.8 },
  disabled: { opacity: 0.55 },
  label: { color: '#ffffff', fontWeight: '700', fontSize: 17, textAlign: 'center' },
  destructiveLabel: { color: '#ffffff' },
});