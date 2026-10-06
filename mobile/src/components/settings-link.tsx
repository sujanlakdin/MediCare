import { Link, type Href } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useAccessibility } from '@/contexts/accessibility-context';
import { useTheme } from '@/hooks/use-theme';

type SettingsLinkProps = {
  href: string;
  title: string;
  subtitle: string;
  symbol: SymbolViewProps['name'];
};

export function SettingsLink({ href, title, subtitle, symbol }: SettingsLinkProps) {
  const theme = useTheme();
  const { settings } = useAccessibility();
  return (
    <Link href={href as Href} asChild>
      <Pressable accessibilityRole="button" accessibilityLabel={`${title}. ${subtitle}`} style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}>
        <ThemedView type="backgroundElement" style={[styles.row, settings.largerButtons && styles.largeRow]}>
          <SymbolView name={symbol} size={26} tintColor={theme.text} />
          <View style={styles.copy}>
            <ThemedText type="smallBold">{title}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">{subtitle}</ThemedText>
          </View>
          <SymbolView name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} size={18} tintColor={theme.textSecondary} />
        </ThemedView>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  pressable: { borderRadius: 8 },
  pressed: { opacity: 0.72 },
  row: { minHeight: 82, flexDirection: 'row', alignItems: 'center', gap: Spacing.three, padding: Spacing.three, borderRadius: 8 },
  largeRow: { minHeight: 96 },
  copy: { flex: 1, gap: Spacing.one },
});