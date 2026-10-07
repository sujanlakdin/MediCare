import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, Text, Pressable, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, MaxContentWidth } from '@/constants/theme';

export default function AlertsScreen() {
  const [filter, setFilter] = useState<'all' | 'critical' | 'resolved'>('all');
  const [isCriticalResolved, setIsCriticalResolved] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.wrapper}>
          {/* Header */}
          <View style={styles.headerRow}>
            <Text style={styles.pageTitle}>Missed Dose Alerts</Text>
            <Text style={styles.pageSub}>Action required</Text>
          </View>

          {/* Filter Pills */}
          <View style={styles.filterRow}>
            <Pressable
              style={[
                styles.filterPill,
                filter === 'all' && styles.filterPillActive,
              ]}
              onPress={() => setFilter('all')}>
              <Text
                style={[
                  styles.filterText,
                  filter === 'all' && styles.filterTextActive,
                ]}>
                All 4
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.filterPill,
                filter === 'critical' && styles.filterPillActive,
              ]}
              onPress={() => setFilter('critical')}>
              <Text
                style={[
                  styles.filterText,
                  filter === 'critical' && styles.filterTextActive,
                ]}>
                Critical 1
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.filterPill,
                filter === 'resolved' && styles.filterPillActive,
              ]}
              onPress={() => setFilter('resolved')}>
              <Text
                style={[
                  styles.filterText,
                  filter === 'resolved' && styles.filterTextActive,
                ]}>
                Resolved 3
              </Text>
            </Pressable>
          </View>

          {/* TODAY Section */}
          {(filter === 'all' || filter === 'critical') && !isCriticalResolved && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionHeader}>Today</Text>

              <View style={styles.criticalCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.iconTitleRow}>
                    <View style={styles.warningCircle}>
                      <Ionicons name="alert" size={18} color={Colors.light.alert} />
                    </View>
                    <View>
                      <Text style={styles.criticalMedTitle}>Metformin 500mg</Text>
                      <Text style={styles.dueSub}>Due at 12:30 PM today</Text>
                    </View>
                  </View>
                  <View style={styles.criticalBadge}>
                    <Text style={styles.criticalBadgeText}>CRITICAL</Text>
                  </View>
                </View>

                {/* Buttons */}
                <View style={styles.actionButtonsRow}>
                  <Pressable
                    style={styles.contactBtn}
                    onPress={() => {
                      Linking.openURL('tel:+15550192831').catch(() =>
                        Alert.alert('Contacting Eleanor', 'Dialing +1 (555) 019-2831...')
                      );
                    }}>
                    <Ionicons name="call-outline" size={16} color={Colors.light.primary} />
                    <Text style={styles.contactBtnText}>Contact Eleanor</Text>
                  </Pressable>

                  <Pressable
                    style={styles.resolveBtn}
                    onPress={() => setIsCriticalResolved(true)}>
                    <Text style={styles.resolveBtnText}>Mark Resolved</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          )}

          {/* YESTERDAY Section */}
          {(filter === 'all' || filter === 'resolved') && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionHeader}>Yesterday</Text>

              <View style={styles.resolvedCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.iconTitleRow}>
                    <View style={styles.checkCircle}>
                      <Ionicons name="checkmark" size={16} color={Colors.light.accent} />
                    </View>
                    <View>
                      <Text style={styles.medTitle}>Amlodipine 5mg</Text>
                      <Text style={styles.resolvedSub}>
                        Missed yesterday 9:00 PM{'\n'}
                        <Text style={styles.resolvedBold}>Resolved — Taken late 9:45 PM</Text>
                      </Text>
                    </View>
                  </View>
                  <View style={styles.resolvedBadge}>
                    <Text style={styles.resolvedBadgeText}>RESOLVED</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* EARLIER THIS WEEK Section */}
          {(filter === 'all' || filter === 'resolved') && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionHeader}>Earlier This Week</Text>

              <View style={styles.resolvedCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.iconTitleRow}>
                    <View style={styles.medCol}>
                      <Text style={styles.medTitle}>Metformin 500mg</Text>
                      <Text style={styles.dueSub}>Missed on Monday at 12:30 PM</Text>
                    </View>
                  </View>
                  <View style={styles.resolvedBadge}>
                    <Text style={styles.resolvedBadgeText}>RESOLVED</Text>
                  </View>
                </View>
              </View>

              <View style={[styles.resolvedCard, { marginTop: 10 }]}>
                <View style={styles.cardHeader}>
                  <View style={styles.iconTitleRow}>
                    <View style={styles.medCol}>
                      <Text style={styles.medTitle}>Lisinopril 10mg</Text>
                      <Text style={styles.dueSub}>Missed on Sunday at 8:00 AM</Text>
                    </View>
                  </View>
                  <View style={styles.resolvedBadge}>
                    <Text style={styles.resolvedBadgeText}>RESOLVED</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Summary Box */}
          <View style={styles.summaryBox}>
            <Ionicons name="information-circle-outline" size={18} color={Colors.light.primary} />
            <Text style={styles.summaryText}>This Week: 4 missed doses, 3 resolved</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    alignItems: 'center',
  },
  wrapper: {
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  headerRow: {
    paddingVertical: 12,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  pageSub: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E8F2EC',
  },
  filterPillActive: {
    backgroundColor: Colors.light.primary,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  sectionContainer: {
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.primary,
    marginBottom: 8,
  },
  criticalCard: {
    backgroundColor: '#FFF5F5',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  iconTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  warningCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  criticalMedTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
  },
  dueSub: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  criticalBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  criticalBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.light.alert,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  contactBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: Colors.light.primary,
    borderRadius: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  contactBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  resolveBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    paddingVertical: 10,
  },
  resolveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  resolvedCard: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  medTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.text,
  },
  resolvedSub: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  resolvedBold: {
    color: Colors.light.accent,
    fontWeight: '600',
  },
  resolvedBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  resolvedBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.light.textSecondary,
  },
  medCol: {
    flex: 1,
  },
  summaryBox: {
    backgroundColor: '#E8F2EC',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  summaryText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.primary,
  },
});
