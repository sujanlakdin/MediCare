import type { PropsWithChildren, ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View, Text, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { CareIcon } from '@/components/care-icon';
import { BottomNavBar, type TabKey } from '@/components/bottom-nav-bar';
import { useAccessibility } from '@/contexts/accessibility-context';

type ScreenProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: ReactNode;
  activeTab?: TabKey;
  hideBottomNav?: boolean;
}>;

export function Screen({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightAction,
  activeTab = 'profile',
  hideBottomNav = false,
  children,
}: ScreenProps) {
  const { settings } = useAccessibility();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.rootWrapper}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.container}>
            {/* Screen Header */}
            <View style={styles.header}>
              <View style={styles.headerMain}>
                <View style={styles.titleRow}>
                  {showBack ? (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Go back"
                      onPress={handleBack}
                      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                      style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}>
                      <CareIcon name="arrow-left" size={22} color="#0E3E2F" />
                    </Pressable>
                  ) : null}
                  <Text
                    style={[
                      styles.title,
                      settings.fontSize === 'large' && styles.largeTitle,
                      settings.fontSize === 'extraLarge' && styles.extraLargeTitle,
                    ]}>
                    {title}
                  </Text>
                </View>
                {subtitle ? (
                  <Text
                    style={[
                      styles.subtitle,
                      settings.highContrast && styles.highContrastSubtitle,
                    ]}>
                    {subtitle}
                  </Text>
                ) : null}
              </View>
              {rightAction}
            </View>

            {/* Screen Body */}
            <View style={styles.body}>{children}</View>
          </View>
        </ScrollView>

        {/* Global Bottom Navigation Bar */}
        {!hideBottomNav ? <BottomNavBar activeTab={activeTab} /> : null}
      </View>
    </SafeAreaView>
  );
}

export function ScreenSection({ title, children }: PropsWithChildren<{ title: string }>) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F8F6',
  },
  rootWrapper: {
    flex: 1,
    backgroundColor: '#F5F8F6',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#F5F8F6',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  container: {
    width: '100%',
    maxWidth: 540,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingBottom: 4,
  },
  headerMain: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButton: {
    padding: 4,
    marginRight: 2,
    borderRadius: 8,
  },
  backButtonPressed: {
    opacity: 0.6,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0E3E2F',
    letterSpacing: -0.3,
  },
  largeTitle: {
    fontSize: 27,
  },
  extraLargeTitle: {
    fontSize: 30,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B8278',
    lineHeight: 18,
  },
  highContrastSubtitle: {
    color: '#34453D',
  },
  body: {
    gap: 16,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0E3E2F',
    letterSpacing: -0.2,
  },
});