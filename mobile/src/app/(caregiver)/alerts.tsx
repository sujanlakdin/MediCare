import React, { useState, useCallback } from 'react';
import { ScrollView, StyleSheet, View, Text, Pressable, Linking, Alert, ActivityIndicator, Modal, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, MaxContentWidth } from '@/constants/theme';
import { patientApi, medicationApi, PatientItem, MedicationItem } from '@/services/api';

interface AlertItem {
  id: string;
  medicationName: string;
  dosage: string;
  patientName: string;
  patientPhone: string;
  time: string;
  type: 'critical' | 'resolved';
  reason: string;
  patientId: string;
  isLowStock?: boolean;
  currentStock?: number;
}

export default function AlertsScreen() {
  const [filter, setFilter] = useState<'all' | 'critical' | 'resolved'>('all');
  const [loading, setLoading] = useState(true);
  const [alertsList, setAlertsList] = useState<AlertItem[]>([]);
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set());

  // Refill Modal state
  const [refillModalVisible, setRefillModalVisible] = useState(false);
  const [selectedAlertForRefill, setSelectedAlertForRefill] = useState<AlertItem | null>(null);
  const [addedTablets, setAddedTablets] = useState('30');
  const [submittingRefill, setSubmittingRefill] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadAlertsData();
    }, [])
  );

  const loadAlertsData = async () => {
    try {
      setLoading(true);
      const patients = await patientApi.getPatients();
      const allMeds = await medicationApi.getMedications();
      const generatedAlerts: AlertItem[] = [];

      const validPatients = patients.filter((p) => !(p.role && p.role.toLowerCase() === 'caregiver'));
      const processedMedIds = new Set<string>();

      for (const p of validPatients) {
        const patientMeds = await medicationApi.getMedications(p._id);
        const patientMedsLocal = allMeds.filter((m) => m.patientId === p._id || (!m.patientId && p._id === '650000000000000000000001'));
        const combinedMeds = [...patientMeds, ...patientMedsLocal];

        combinedMeds.forEach((m) => {
          const medId = m._id || m.id || `${p._id}-${m.name}`;
          if (processedMedIds.has(medId)) return;
          processedMedIds.add(medId);

          const stockNum = m.stock !== undefined && m.stock !== null ? Number(m.stock) : undefined;
          const isLowStock = stockNum !== undefined && !isNaN(stockNum) && stockNum < 15;

          if (m.status === 'missed' || isLowStock) {
            generatedAlerts.push({
              id: medId,
              medicationName: `${m.name} ${m.dosage || ''}`.trim(),
              dosage: m.dosage || '',
              patientName: p.name,
              patientPhone: p.phone || '+1 (555) 019-2831',
              time: m.scheduledTime || '12:30 PM',
              type: 'critical',
              reason: isLowStock
                ? `Low Stock Alert (${stockNum} tablets left — Refill Needed)`
                : `Missed dose due at ${m.scheduledTime || '12:30 PM'}`,
              patientId: p._id,
              isLowStock,
              currentStock: stockNum || 0,
            });
          } else if (m.status === 'taken') {
            generatedAlerts.push({
              id: medId,
              medicationName: `${m.name} ${m.dosage || ''}`.trim(),
              dosage: m.dosage || '',
              patientName: p.name,
              patientPhone: p.phone || '+1 (555) 019-2831',
              time: m.scheduledTime || '8:00 AM',
              type: 'resolved',
              reason: `Taken on schedule (${m.scheduledTime || '08:00 AM'})`,
              patientId: p._id,
              isLowStock: false,
              currentStock: stockNum || 0,
            });
          }
        });
      }

      // Process any orphan medications
      allMeds.forEach((m) => {
        const medId = m._id || m.id;
        if (!medId || processedMedIds.has(medId)) return;
        processedMedIds.add(medId);

        const stockNum = m.stock !== undefined && m.stock !== null ? Number(m.stock) : undefined;
        const isLowStock = stockNum !== undefined && !isNaN(stockNum) && stockNum < 15;

        if (m.status === 'missed' || isLowStock) {
          generatedAlerts.push({
            id: medId,
            medicationName: `${m.name} ${m.dosage || ''}`.trim(),
            dosage: m.dosage || '',
            patientName: 'Monitored Patient',
            patientPhone: '+1 (555) 019-2831',
            time: m.scheduledTime || '12:30 PM',
            type: 'critical',
            reason: isLowStock
              ? `Low Stock Alert (${stockNum} tablets left — Refill Needed)`
              : `Missed dose due at ${m.scheduledTime || '12:30 PM'}`,
            patientId: m.patientId || '',
            isLowStock,
            currentStock: stockNum || 0,
          });
        }
      });

      setAlertsList(generatedAlerts);
    } catch (err) {
      console.error('Failed to load dynamic alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveAlert = (id: string) => {
    setResolvedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const handlePressResolve = (item: AlertItem) => {
    if (item.isLowStock) {
      setSelectedAlertForRefill(item);
      setAddedTablets('30');
      setRefillModalVisible(true);
    } else {
      handleResolveAlert(item.id);
    }
  };

  const handleConfirmRefill = async () => {
    if (!selectedAlertForRefill) return;
    try {
      setSubmittingRefill(true);
      const added = Math.max(1, Number(addedTablets) || 30);
      const current = selectedAlertForRefill.currentStock || 0;
      const newTotal = current + added;

      await medicationApi.updateMedication(selectedAlertForRefill.id, {
        stock: newTotal,
      });

      setRefillModalVisible(false);
      setSelectedAlertForRefill(null);
      await loadAlertsData();

      Alert.alert(
        'Stock Refilled! 💊',
        `${selectedAlertForRefill.medicationName} stock updated to ${newTotal} tablets.`
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update stock');
    } finally {
      setSubmittingRefill(false);
    }
  };

  const criticalAlerts = alertsList.filter((a) => a.type === 'critical' && !resolvedIds.has(a.id));
  const resolvedAlerts = [
    ...alertsList.filter((a) => a.type === 'resolved'),
    ...alertsList.filter((a) => a.type === 'critical' && resolvedIds.has(a.id)),
  ];

  const criticalCount = criticalAlerts.length;
  const resolvedCount = resolvedAlerts.length;
  const totalCount = criticalCount + resolvedCount;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.wrapper}>
          {/* Header */}
          <View style={styles.headerRow}>
            <Text style={styles.pageTitle}>Missed Dose & Stock Alerts</Text>
            <Text style={styles.pageSub}>Dynamic patient alert oversight</Text>
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
                All {totalCount}
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
                Critical {criticalCount}
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
                Resolved {resolvedCount}
              </Text>
            </Pressable>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={Colors.light.primary} style={{ marginVertical: 30 }} />
          ) : (
            <>
              {/* CRITICAL ALERTS Section */}
              {(filter === 'all' || filter === 'critical') && (
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionHeader}>Action Required ({criticalCount})</Text>

                  {criticalAlerts.length === 0 ? (
                    <Text style={styles.emptyText}>No critical alerts at this time.</Text>
                  ) : (
                    criticalAlerts.map((item) => (
                      <View key={item.id} style={styles.criticalCard}>
                        <View style={styles.cardHeader}>
                          <View style={styles.iconTitleRow}>
                            <View style={styles.warningCircle}>
                              <Ionicons name="alert" size={18} color={Colors.light.alert} />
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.criticalMedTitle}>{item.medicationName}</Text>
                              <Text style={styles.dueSub}>{item.patientName} — {item.reason}</Text>
                            </View>
                          </View>
                          <View style={styles.criticalBadge}>
                            <Text style={styles.criticalBadgeText}>CRITICAL</Text>
                          </View>
                        </View>

                        {/* Action Buttons */}
                        <View style={styles.actionButtonsRow}>
                          <Pressable
                            style={styles.contactBtn}
                            onPress={() => {
                              Linking.openURL(`tel:${item.patientPhone}`).catch(() =>
                                Alert.alert(`Contacting ${item.patientName}`, `Dialing ${item.patientPhone}...`)
                              );
                            }}>
                            <Ionicons name="call-outline" size={16} color={Colors.light.primary} />
                            <Text style={styles.contactBtnText}>Contact {item.patientName.split(' ')[0]}</Text>
                          </Pressable>

                          <Pressable
                            style={styles.resolveBtn}
                            onPress={() => handlePressResolve(item)}>
                            <Text style={styles.resolveBtnText}>
                              {item.isLowStock ? 'Refill Stock' : 'Mark Resolved'}
                            </Text>
                          </Pressable>
                        </View>
                      </View>
                    ))
                  )}
                </View>
              )}

              {/* RESOLVED ALERTS Section */}
              {(filter === 'all' || filter === 'resolved') && (
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionHeader}>Resolved Doses ({resolvedCount})</Text>

                  {resolvedAlerts.length === 0 ? (
                    <Text style={styles.emptyText}>No resolved alerts yet.</Text>
                  ) : (
                    resolvedAlerts.map((item) => (
                      <View key={item.id} style={[styles.resolvedCard, { marginBottom: 10 }]}>
                        <View style={styles.cardHeader}>
                          <View style={styles.iconTitleRow}>
                            <View style={styles.checkCircle}>
                              <Ionicons name="checkmark" size={16} color={Colors.light.accent} />
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.medTitle}>{item.medicationName}</Text>
                              <Text style={styles.resolvedSub}>
                                {item.patientName} — {item.reason}{'\n'}
                                <Text style={styles.resolvedBold}>Status: Resolved</Text>
                              </Text>
                            </View>
                          </View>
                          <View style={styles.resolvedBadge}>
                            <Text style={styles.resolvedBadgeText}>RESOLVED</Text>
                          </View>
                        </View>
                      </View>
                    ))
                  )}
                </View>
              )}
            </>
          )}

          {/* Summary Box */}
          <View style={styles.summaryBox}>
            <Ionicons name="information-circle-outline" size={18} color={Colors.light.primary} />
            <Text style={styles.summaryText}>Total Active Doses Monitored: {totalCount}</Text>
          </View>
        </View>
      </ScrollView>

      {/* REFILL STOCK MODAL */}
      <Modal
        visible={refillModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRefillModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconBg}>
                <Ionicons name="cube-outline" size={24} color={Colors.light.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Refill Medication Stock</Text>
                <Text style={styles.modalSub}>
                  {selectedAlertForRefill?.patientName} • {selectedAlertForRefill?.medicationName}
                </Text>
              </View>
            </View>

            <View style={styles.stockInfoBox}>
              <Text style={styles.stockInfoText}>
                Current Stock: <Text style={{ fontWeight: '700', color: Colors.light.alert }}>{selectedAlertForRefill?.currentStock || 0} tablets</Text>
              </Text>
            </View>

            <Text style={styles.inputLabel}>Added Tablets Count *</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="numeric"
              placeholder="e.g. 30"
              placeholderTextColor="#94A3B8"
              value={addedTablets}
              onChangeText={setAddedTablets}
            />

            {/* Quick Add Presets */}
            <View style={{ flexDirection: 'row', gap: 8, marginVertical: 10 }}>
              {['15', '30', '60', '100'].map((num) => (
                <TouchableOpacity
                  key={num}
                  style={[
                    styles.presetChip,
                    addedTablets === num && styles.presetChipActive,
                  ]}
                  onPress={() => setAddedTablets(num)}>
                  <Text
                    style={[
                      styles.presetText,
                      addedTablets === num && styles.presetTextActive,
                    ]}>
                    +{num}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.newTotalText}>
              New Stock Total: <Text style={{ fontWeight: '800', color: Colors.light.accent }}>{(selectedAlertForRefill?.currentStock || 0) + (Number(addedTablets) || 0)} tablets</Text>
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setRefillModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSubmitBtn}
                disabled={submittingRefill}
                onPress={handleConfirmRefill}>
                {submittingRefill ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.modalSubmitText}>Refill & Resolve</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  emptyText: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    fontStyle: 'italic',
    paddingVertical: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  modalIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8F2EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  modalSub: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  stockInfoBox: {
    backgroundColor: '#FFF5F5',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  stockInfoText: {
    fontSize: 13,
    color: Colors.light.text,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 6,
  },
  modalInput: {
    borderWidth: 1.5,
    borderColor: Colors.light.borderLight,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    backgroundColor: '#F8FAFC',
  },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  presetChipActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  presetText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.textSecondary,
  },
  presetTextActive: {
    color: '#FFFFFF',
  },
  newTotalText: {
    fontSize: 13,
    color: Colors.light.text,
    marginTop: 4,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.light.borderLight,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.textSecondary,
  },
  modalSubmitBtn: {
    flex: 1.5,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
  },
  modalSubmitText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
