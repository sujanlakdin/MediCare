import type { PropsWithChildren, ReactNode } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useAccessibility } from '@/contexts/accessibility-context';

type ScreenProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
  simpleSubtitle?: string;
  rightAction?: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
}>;

export function Screen({
  title,
  subtitle,
  simpleSubtitle,
  rightAction,
  refreshing,
  onRefresh,
  children,
}: ScreenProps) {
  const { settings } = useAccessibility();
  const displaySubtitle = settings.simpleLanguage && simpleSubtitle ? simpleSubtitle : subtitle;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={Boolean(refreshing)}
              onRefresh={onRefresh}
              colors={['#145c44']}
              tintColor="#145c44"
            />
          ) : undefined
        }>
        <ThemedView style={styles.container}>
          <View style={styles.heading}>
            <View style={styles.headingText}>
              <ThemedText type="subtitle" style={styles.title}>{title}</ThemedText>
              {displaySubtitle ? (
                <ThemedText themeColor="textSecondary" style={styles.subtitle}>
                  {displaySubtitle}
                </ThemedText>
              ) : null}
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
      <ThemedText type="smallBold" style={styles.sectionHeader}>{title}</ThemedText>
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
  subtitle: { fontSize: 15, lineHeight: 20 },
  section: { gap: Spacing.two },
  sectionHeader: { fontSize: 16, lineHeight: 22, color: '#145c44', fontWeight: '700' },
});