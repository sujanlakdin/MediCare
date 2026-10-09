import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, MaxContentWidth } from '@/constants/theme';
import PatientBottomNav from '@/components/patient/BottomNav';
import { useMedicareStore, ScheduleItem } from '@/medicare';

type Filter = 'all' | 'missed' | 'due';

export default function DoseAlertsScreen() {
  const router = useRouter();
  const { schedule } = useMedicareStore();
  const [filter, setFilter] = useState<Filter>('all');

  const missed = schedule.filter((i) => i.status === 'MISSED');
  const due = schedule.filter((i) => i.status === 'DUE_SOON');
  const resolved = schedule.filter(
    (i) => i.status === 'TAKEN' || i.status === 'SKIPPED'
  );
  const needsAction = missed.length + due.length;

  const showMissed = filter === 'all' || filter === 'missed';
  const showDue = filter === 'all' || filter === 'due';
  const showResolved = filter === 'all';
  const nothingToShow =
    (showMissed ? missed.length : 0) + (showDue ? due.length : 0) === 0;

  const openMissedDose = (item: ScheduleItem) => {
    router.push({
      pathname: '/missed-dose',
      params: { id: item.id, from: '/dose-alerts' },
    });
  };

  const openMarkTaken = (item: ScheduleItem) => {
    router.push({
      pathname: '/mark-as-taken',
      params: { id: item.id, from: '/dose-alerts' },
    });
  };

  const renderPill = (key: Filter, label: string) => {
    const active = filter === key;
    return (
      <TouchableOpacity
        key={key}
        style={[styles.pill, active && styles.pillActive]}
        onPress={() => setFilter(key)}
        activeOpacity={0.8}>
        <Text style={[styles.pillText, active && styles.pillTextActive]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderMissed = (item: ScheduleItem) => (
    <View key={item.id} style={[styles.card, styles.cardMissed]}>
      <View style={styles.cardTop}>
        <View style={[styles.iconCircle, styles.iconCircleMissed]}>
          <Ionicons name="alert" size={20} color={Colors.light.alert} />
        </View>
        <View style={styles.cardText}>
          <Text style={styles.medName}>
            {item.name} {item.dosage}
          </Text>
          <Text style={styles.metaText}>{item.nextTime}</Text>
        </View>
        <View style={styles.badgeMissed}>
          <Text style={styles.badgeMissedText}>MISSED</Text>
        </View>
      </View>
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => openMissedDose(item)}
          activeOpacity={0.8}>
          <Text style={styles.secondaryBtnText}>View details</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => openMarkTaken(item)}
          activeOpacity={0.8}>
          <Text style={styles.primaryBtnText}>Log as taken</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderDue = (item: ScheduleItem) => (
    <View key={item.id} style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.iconCircle}>
          <Ionicons name="time-outline" size={20} color="#059669" />
        </View>
        <View style={styles.cardText}>
          <Text style={styles.medName}>
            {item.name} {item.dosage}
          </Text>
          <Text style={styles.metaText}>{item.nextTime}</Text>
        </View>
        <View style={styles.badgeDue}>
          <Text style={styles.badgeDueText}>DUE SOON</Text>
        </View>
      </View>
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => openMarkTaken(item)}
          activeOpacity={0.8}>
          <Text style={styles.primaryBtnText}>Log dose</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderResolved = (item: ScheduleItem) => {
    const skipped = item.status === 'SKIPPED';
    return (
      <View key={item.id} style={styles.resolvedRow}>
        <View style={styles.resolvedIcon}>
          <Ionicons
            name={skipped ? 'close' : 'checkmark'}
            size={18}
            color={skipped ? '#64748B' : '#10B981'}
          />
        </View>
        <View style={styles.cardText}>
          <Text style={styles.resolvedName}>
            {item.name} {item.dosage}
          </Text>
          <Text style={styles.metaText}>{skipped ? 'Skipped' : 'Taken'}</Text>
        </View>
        <View style={styles.badgeResolved}>
          <Text style={styles.badgeResolvedText}>RESOLVED</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.wrapper}>
          <Text style={styles.title}>Medication Alerts</Text>
          <Text style={styles.subtitle}>
            {needsAction === 0
              ? 'All caught up'
              : `${needsAction} ${needsAction === 1 ? 'dose needs' : 'doses need'} your attention`}
          </Text>

          <View style={styles.pillRow}>
            {renderPill('all', `All ${schedule.length}`)}
            {renderPill('missed', `Missed ${missed.length}`)}
            {renderPill('due', `Due soon ${due.length}`)}
          </View>

          {showMissed && missed.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Missed</Text>
              {missed.map(renderMissed)}
            </>
          )}

          {showDue && due.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Due soon</Text>
              {due.map(renderDue)}
            </>
          )}

          {nothingToShow && (
            <View style={styles.emptyCard}>
              <Ionicons name="checkmark-circle" size={36} color="#10B981" />
              <Text style={styles.emptyTitle}>Nothing needs your attention</Text>
              <Text style={styles.emptyText}>
                Missed and due doses will show up here.
              </Text>
            </View>
          )}

          {showResolved && resolved.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Resolved today</Text>
              {resolved.map(renderResolved)}
            </>
          )}

          <View style={styles.summaryBox}>
            <Ionicons name="information-circle-outline" size={18} color="#4A6054" />
            <Text style={styles.summaryText}>
              Today: {missed.length} missed, {due.length} due soon,{' '}
              {resolved.length} resolved
            </Text>
          </View>
        </View>
      </ScrollView>

      <PatientBottomNav currentTab="alert" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F3FAF7' },
  scrollContent: { paddingBottom: 24, alignItems: 'center' },
  wrapper: { width: '100%', maxWidth: MaxContentWidth, paddingHorizontal: 20, paddingTop: 20 },
  title: { fontSize: 24, fontWeight: '800', color: '#154D38' },
  subtitle: { fontSize: 14, color: '#4A6054', marginTop: 4, marginBottom: 16 },
  pillRow: { flexDirection: 'row', gap: 8, marginBottom: 8, flexWrap: 'wrap' },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E6F0EB',
  },
  pillActive: { backgroundColor: '#154D38' },
  pillText: { fontSize: 13, fontWeight: '700', color: '#4A6054' },
  pillTextActive: { color: '#FFFFFF' },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#154D38',
    marginTop: 18,
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E6EFE9',
  },
  cardMissed: { backgroundColor: '#FFF5F5', borderColor: '#FCA5A5' },
  cardTop: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D1FAE5',
    marginRight: 12,
  },
  iconCircleMissed: { backgroundColor: '#FFE4E4' },
  cardText: { flex: 1 },
  medName: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  metaText: { fontSize: 12, color: Colors.light.textSecondary, marginTop: 2 },
  badgeMissed: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeMissedText: { fontSize: 10, fontWeight: '800', color: Colors.light.alert },
  badgeDue: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeDueText: { fontSize: 10, fontWeight: '800', color: '#059669' },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  primaryBtn: {
    flex: 1,
    backgroundColor: '#154D38',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  secondaryBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#154D38',
  },
  secondaryBtnText: { color: '#154D38', fontSize: 14, fontWeight: '700' },
  resolvedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E6EFE9',
  },
  resolvedIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    marginRight: 12,
  },
  resolvedName: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  badgeResolved: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeResolvedText: { fontSize: 10, fontWeight: '800', color: '#64748B' },
  emptyCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 28,
    paddingHorizontal: 16,
    marginTop: 18,
    borderWidth: 1,
    borderColor: '#E6EFE9',
    gap: 6,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  emptyText: { fontSize: 13, color: '#64748B', textAlign: 'center' },
  summaryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E6F0EB',
    borderRadius: 12,
    padding: 14,
    marginTop: 18,
  },
  summaryText: { flex: 1, fontSize: 13, fontWeight: '600', color: '#154D38' },
});
