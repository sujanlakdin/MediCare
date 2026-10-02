import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useAccessibility } from '@/contexts/accessibility-context';
import { useTheme } from '@/hooks/use-theme';

type FaqItemData = {
  id: string;
  question: string;
  answer: string;
};

const faqData: FaqItemData[] = [
  {
    id: 'reminders',
    question: 'How do medication reminders work?',
    answer:
      'MediCare alerts you at your configured reminder times (Morning, Noon, and Evening). When an alert sounds, tap the notification on your phone to confirm your dose was taken, or snooze if you need a few minutes.',
  },
  {
    id: 'caregiver_missed',
    question: 'Can my caregiver see if I missed a dose?',
    answer:
      'Yes. When you link a trusted caregiver under Emergency & Caregiver and leave "Medication Dose SMS Alerts" enabled, they receive an automated update if a scheduled medication window passes without confirmation.',
  },
  {
    id: 'volume',
    question: 'How do I change the alert volume?',
    answer:
      'You can customize voice assistance, reminder sound, and vibration mode in Settings > Notification Settings. For ringtone loudness, use your phone\'s side volume buttons while an alert is playing.',
  },
  {
    id: 'privacy',
    question: 'Is my medical data kept private?',
    answer:
      'Yes, absolutely. All your medical data, profile records, and caregiver relationships are stored securely using encryption. Only you and caregivers you explicitly authorize have access to your medication schedule.',
  },
  {
    id: 'text_size',
    question: 'Can I make the text bigger and easier to read?',
    answer:
      'Yes! Open Settings > Accessibility Options. You can choose between Standard, Large, and Extra Large text sizes, as well as enable High Contrast and Larger Touch Targets for effortless reading.',
  },
  {
    id: 'emergency',
    question: 'What happens when I press Call 119 or SOS Alert?',
    answer:
      'Emergency buttons are designed for urgent situations. Tapping Call 119 asks for confirmation before dialing national emergency services. Sending an SOS Alert immediately notifies your active linked caregivers.',
  },
];

export default function FaqScreen() {
  const [expandedId, setExpandedId] = useState<string | null>('reminders');

  function toggleItem(id: string) {
    setExpandedId((current) => (current === id ? null : id));
  }

  return (
    <Screen
      title="FAQs"
      subtitle="Find answers to common questions"
      simpleSubtitle="Questions and answers">
      <View style={styles.faqList}>
        {faqData.map((item) => (
          <FaqAccordionItem
            key={item.id}
            item={item}
            isExpanded={expandedId === item.id}
            onToggle={() => toggleItem(item.id)}
          />
        ))}
      </View>
    </Screen>
  );
}

function FaqAccordionItem({
  item,
  isExpanded,
  onToggle,
}: {
  item: FaqItemData;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const theme = useTheme();
  const { settings: a11y } = useAccessibility();

  return (
    <ThemedView
      type="backgroundElement"
      style={[
        styles.card,
        isExpanded && styles.cardExpanded,
        a11y.largerButtons && styles.cardLarge,
      ]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${item.question}. ${isExpanded ? 'Expanded' : 'Collapsed'}`}
        accessibilityHint="Double tap to toggle answer"
        onPress={onToggle}
        style={({ pressed }) => [
          styles.headerPressable,
          pressed && styles.pressed,
        ]}>
        <View style={styles.questionRow}>
          <View style={styles.bulletDot} />
          <ThemedText
            type="smallBold"
            style={[
              styles.questionText,
              isExpanded && styles.questionTextExpanded,
            ]}>
            {item.question}
          </ThemedText>
        </View>

        <View style={styles.chevronWrapper}>
          <SymbolView
            name={{
              ios: isExpanded ? 'chevron.up' : 'chevron.down',
              android: isExpanded ? 'expand_less' : 'expand_more',
              web: isExpanded ? 'expand_less' : 'expand_more',
            }}
            size={20}
            tintColor={isExpanded ? '#145c44' : theme.textSecondary}
          />
        </View>
      </Pressable>

      {isExpanded ? (
        <View style={styles.answerContainer}>
          <View style={styles.divider} />
          <ThemedText style={styles.answerText}>{item.answer}</ThemedText>
        </View>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  faqList: {
    gap: Spacing.three,
    marginBottom: Spacing.four,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  cardExpanded: {
    borderColor: '#86efac',
    backgroundColor: '#fbfdfc',
  },
  cardLarge: {
    borderRadius: 16,
  },
  headerPressable: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.three,
    gap: Spacing.three,
  },
  pressed: {
    opacity: 0.75,
  },
  questionRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  bulletDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#145c44',
  },
  questionText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
  },
  questionTextExpanded: {
    color: '#145c44',
  },
  chevronWrapper: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  answerContainer: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.three,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#e5e7eb',
    marginBottom: Spacing.two,
  },
  answerText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#374151',
  },
});