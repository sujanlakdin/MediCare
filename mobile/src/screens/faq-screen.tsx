import { useState } from 'react';
import { LayoutAnimation, Platform, Pressable, StyleSheet, Text, UIManager, View } from 'react-native';

import { CareIcon } from '@/components/care-icon';
import { Screen } from '@/components/screen';
import { useAccessibility } from '@/contexts/accessibility-context';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type FaqItem = {
  id: string;
  question: string;
  answer: string;
  defaultExpanded?: boolean;
};

const FAQ_LIST: FaqItem[] = [
  {
    id: 'reminders',
    question: 'How do medication reminders work?',
    answer:
      'Reminders play a spoken voice alert and show a large notification on your screen at the exact time your dose is due.',
    defaultExpanded: true,
  },
  {
    id: 'caregiver-missed',
    question: 'Can my caregiver see if I missed a dose?',
    answer:
      'Yes. If Caregiver Sync is enabled, your linked caregiver gets an instant SMS or app alert whenever a scheduled dose is missed.',
    defaultExpanded: true,
  },
  {
    id: 'alert-volume',
    question: 'How do I change the alert volume?',
    answer:
      'You can customize reminder volume and sound prompts in Notification Settings, or adjust the media volume directly using your phone physical volume buttons.',
    defaultExpanded: false,
  },
  {
    id: 'privacy',
    question: 'Is my medical data kept private?',
    answer:
      'Yes, all your prescription schedules, adherence records, and medical contact information are encrypted under medical data privacy guidelines and never sold.',
    defaultExpanded: false,
  },
  {
    id: 'add-caregiver',
    question: 'How do I add a new caregiver?',
    answer:
      'Navigate to Emergency & Caregiver from Settings or the Main Menu, click Change or Add Caregiver, and enter their name, phone number, and relationship.',
    defaultExpanded: false,
  },
];

export default function FaqScreen() {
  const { settings: a11y } = useAccessibility();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    reminders: true,
    'caregiver-missed': true,
  });

  function toggle(id: string) {
    if (!a11y.reduceMotion) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    setExpanded((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }

  return (
    <Screen
      title="FAQs"
      subtitle="Find quick answers to common questions"
      showBack={true}
      activeTab="profile">
      <View style={styles.container}>
        {FAQ_LIST.map((item) => {
          const isOpen = Boolean(expanded[item.id]);

          return (
            <View key={item.id} style={styles.card}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={item.question}
                accessibilityState={{ expanded: isOpen }}
                onPress={() => toggle(item.id)}
                style={({ pressed }) => [
                  styles.headerRow,
                  a11y.largerButtons && styles.largeHeaderRow,
                  pressed && styles.pressed,
                ]}>
                <Text style={styles.questionText}>{item.question}</Text>
                <View style={[styles.toggleBox, isOpen && styles.toggleBoxActive]}>
                  {isOpen ? (
                    <CareIcon name="minus" size={14} color="#22996E" />
                  ) : (
                    <CareIcon name="plus" size={14} color="#71827A" />
                  )}
                </View>
              </Pressable>

              {isOpen ? (
                <View style={styles.answerBox}>
                  <Text style={styles.answerText}>{item.answer}</Text>
                </View>
              ) : null}
            </View>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5EDE8',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  largeHeaderRow: {
    paddingVertical: 20,
  },
  questionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#0E3E2F',
    letterSpacing: -0.2,
    lineHeight: 20,
  },
  toggleBox: {
    width: 26,
    height: 26,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#D8E8DF',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7FAF8',
  },
  toggleBoxActive: {
    borderColor: '#22996E',
    backgroundColor: '#E8F6EF',
  },
  answerBox: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 0,
  },
  answerText: {
    fontSize: 14,
    color: '#4A6054',
    lineHeight: 21,
  },
  pressed: {
    opacity: 0.8,
  },
});