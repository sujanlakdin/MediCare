import type { PropsWithChildren, ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

type ScreenProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
  rightAction?: ReactNode;
}>;

export function Screen({ title, subtitle, rightAction, children }: ScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <ThemedView style={styles.container}>
          <View style={styles.heading}>
            <View style={styles.headingText}>
              <ThemedText type="subtitle" style={styles.title}>{title}</ThemedText>
              {subtitle ? <ThemedText themeColor="textSecondary">{subtitle}</ThemedText> : null}
            </View>
            {rightAction}
          </View>
          {children}
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

export function ScreenSection({ title, children }: PropsWithChildren<{ title: string }>) {
  return (
    <View style={styles.section}>
      <ThemedText type="smallBold">{title}</ThemedText>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scroll: { flexGrow: 1 },
  container: { width: '100%', maxWidth: 760, alignSelf: 'center', padding: Spacing.three, gap: Spacing.four },
  heading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.three },
  headingText: { flex: 1, gap: Spacing.one },
  title: { fontSize: 30, lineHeight: 38 },
  section: { gap: Spacing.two },
});