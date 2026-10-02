import { StyleSheet, View } from 'react-native';

import { Collapsible } from '@/components/ui/collapsible';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';

const questions = [
  {
    category: 'Medication reminders',
    items: [
      ['How do I add a medication?', 'Medication management is not available in this project yet. When that feature is added, you will be able to enter a medication and its schedule there.'],
      ['How does a medication reminder work?', 'The notification settings can be saved to your account. Device reminders are not connected yet because this project does not have a medication schedule or notification service.'],
      ['What happens if I miss a medication?', 'You can turn on missed medication alerts in Notification Settings. Alerts will become active when medication tracking is implemented.'],
    ],
  },
  {
    category: 'Caregivers',
    items: [
      ['How do I add a caregiver?', 'Open Settings, choose Emergency & caregivers, then select Add caregiver. Enter their name, relationship, phone number, and any optional preferences.'],
      ['How does a caregiver receive notifications?', 'You can choose which alerts a caregiver is allowed to receive. Delivery is not active until a notification service is connected.'],
      ['Can I remove a caregiver?', 'Yes. Open Emergency & caregivers, choose the caregiver, and select Remove.'],
    ],
  },
  {
    category: 'Account',
    items: [
      ['How do I update my profile?', 'Open your Profile tab, select Edit profile, make your changes, and save.'],
      ['How do I change my settings?', 'Open the Settings tab and choose the area you want to update.'],
    ],
  },
  {
    category: 'Accessibility',
    items: [
      ['How do I increase the font size?', 'Open Settings, select Accessibility, choose Large or Extra large, and save your settings.'],
      ['How do I enable high contrast mode?', 'Open Settings, select Accessibility, turn on High contrast, and save your settings.'],
    ],
  },
];

export default function FaqScreen() {
  return (
    <Screen title="Frequently asked questions" subtitle="Select a question to see its answer">
      {questions.map((section) => (
        <View key={section.category} style={styles.section}>
          <ThemedText type="smallBold">{section.category}</ThemedText>
          {section.items.map(([question, answer]) => (
            <Collapsible key={question} title={question}>
              <ThemedText>{answer}</ThemedText>
            </Collapsible>
          ))}
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({ section: { gap: 12 } });