import { Tabs, TabSlot } from 'expo-router/ui';
import { StyleSheet, View } from 'react-native';

export default function AppTabs() {
  return (
    <Tabs>
      <View style={styles.container}>
        <TabSlot style={styles.slot} />
      </View>
    </Tabs>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    backgroundColor: '#F5F8F6',
  },
  slot: {
    height: '100%',
  },
});
