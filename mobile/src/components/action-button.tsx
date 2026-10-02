import { Pressable, StyleSheet, type PressableProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useAccessibility } from '@/contexts/accessibility-context';

type ActionButtonProps = Omit<PressableProps, 'children'> & {
  label: string;
  secondary?: boolean;
  destructive?: boolean;
  loading?: boolean;
};

export function ActionButton({ label, secondary, destructive, loading, style, ...props }: ActionButtonProps) {
  const { settings } = useAccessibility();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={loading || props.disabled}
      style={(state) => [
        styles.button,
        settings.largerButtons && styles.largeButton,
        secondary && styles.secondary,
        destructive && styles.destructive,
        state.pressed && styles.pressed,
        (loading || props.disabled) && styles.disabled,
        typeof style === 'function' ? style(state) : style,
      ]}
      {...props}>
      <ThemedText style={styles.label}>{label}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#145c44',
    alignItems: 'center',
    justifyContent: 'center',
  },
  largeButton: { minHeight: 64 },
  secondary: { borderWidth: 1, borderColor: '#145c44', backgroundColor: 'transparent' },
  destructive: { backgroundColor: '#9b2c2c' },
  pressed: { opacity: 0.75 },
  disabled: { opacity: 0.55 },
  label: { color: '#ffffff', fontWeight: '700', fontSize: 17 },
});