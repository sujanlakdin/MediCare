import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { notesApi, CaregiverNote } from '@/services/api';

interface CaregiverNotesSectionProps {
  patientId?: string;
  patientName?: string;
}

type CategoryType = 'Vitals' | 'Diet' | 'Doctor Visit' | 'General';

export const CaregiverNotesSection: React.FC<CaregiverNotesSectionProps> = ({
  patientId = 'p-1',
  patientName = 'Eleanor Johnson',
}) => {
  const [notes, setNotes] = useState<CaregiverNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CategoryType>('General');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadNotes();
  }, [patientId]);

  const loadNotes = async () => {
    setLoading(true);
    try {
      const data = await notesApi.getNotes(patientId);
      setNotes(data);
    } catch {
      // Fallback handled in API
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingNoteId(null);
    setTitle('');
    setCategory('Vitals');
    setContent('');
    setModalVisible(true);
  };

  const handleOpenEditModal = (note: CaregiverNote) => {
    setEditingNoteId(note.id);
    setTitle(note.title);
    setCategory(note.category);
    setContent(note.content);
    setModalVisible(true);
  };

  const handleSaveNote = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Required Fields', 'Please enter both a title and note details.');
      return;
    }

    setSaving(true);
    try {
      if (editingNoteId) {
        // UPDATE
        await notesApi.updateNote(editingNoteId, {
          title,
          category,
          content,
        });
        Alert.alert('Care Note Updated! 📝', 'The care observation note has been saved.');
      } else {
        // CREATE
        await notesApi.addNote({
          patientId,
          title,
          category,
          content,
          author: 'Caregiver Sarah',
        });
        Alert.alert('Care Note Created! 📝', 'New medical observation note added successfully.');
      }
      setModalVisible(false);
      loadNotes();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save note');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNote = (noteId: string, noteTitle: string) => {
    Alert.alert(
      'Delete Care Note?',
      `Are you sure you want to delete "${noteTitle}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await notesApi.deleteNote(noteId);
              loadNotes();
              Alert.alert('Deleted', 'Care note removed.');
            } catch {
              Alert.alert('Error', 'Failed to delete note.');
            }
          },
        },
      ]
    );
  };

  const filteredNotes = notes.filter(
    (n) => selectedCategory === 'All' || n.category === selectedCategory
  );

  const getCategoryColor = (cat: CategoryType) => {
    switch (cat) {
      case 'Vitals':
        return { bg: '#FEF2F2', text: '#DC2626', border: '#FCA5A5' };
      case 'Doctor Visit':
        return { bg: '#E0F2FE', text: '#0284C7', border: '#BAE6FD' };
      case 'Diet':
        return { bg: '#FEF3C7', text: '#D97706', border: '#FDE68A' };
      default:
        return { bg: '#F1F5F9', text: '#475569', border: '#CBD5E1' };
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.sectionTitle}>Caregiver Medical Notes</Text>
          <Text style={styles.sectionSub}>Observations for {patientName}</Text>
        </View>
        <Pressable style={styles.addBtn} onPress={handleOpenAddModal}>
          <Ionicons name="add-circle" size={18} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Add Note</Text>
        </Pressable>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {['All', 'Vitals', 'Doctor Visit', 'Diet', 'General'].map((cat) => (
          <Pressable
            key={cat}
            style={[styles.filterChip, selectedCategory === cat && styles.filterChipActive]}
            onPress={() => setSelectedCategory(cat)}>
            <Text
              style={[
                styles.filterChipText,
                selectedCategory === cat && styles.filterChipTextActive,
              ]}>
              {cat}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Notes List */}
      {loading ? (
        <ActivityIndicator size="small" color={Colors.light.primary} style={{ marginVertical: 20 }} />
      ) : filteredNotes.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="journal-outline" size={32} color="#94A3B8" />
          <Text style={styles.emptyText}>No care notes found in this category.</Text>
        </View>
      ) : (
        <View style={styles.notesList}>
          {filteredNotes.map((item) => {
            const colors = getCategoryColor(item.category);
            return (
              <View key={item.id} style={styles.noteCard}>
                <View style={styles.noteCardHeader}>
                  <View
                    style={[
                      styles.categoryBadge,
                      { backgroundColor: colors.bg, borderColor: colors.border },
                    ]}>
                    <Text style={[styles.categoryBadgeText, { color: colors.text }]}>
                      {item.category}
                    </Text>
                  </View>
                  <Text style={styles.dateText}>
                    {new Date(item.createdAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>

                <Text style={styles.noteTitle}>{item.title}</Text>
                <Text style={styles.noteContent}>{item.content}</Text>

                <View style={styles.noteCardFooter}>
                  <Text style={styles.authorText}>By {item.author}</Text>
                  <View style={styles.actionsRow}>
                    <Pressable
                      style={styles.iconBtn}
                      onPress={() => handleOpenEditModal(item)}>
                      <Ionicons name="create-outline" size={18} color={Colors.light.primary} />
                    </Pressable>
                    <Pressable
                      style={styles.iconBtn}
                      onPress={() => handleDeleteNote(item.id, item.title)}>
                      <Ionicons name="trash-outline" size={18} color="#DC2626" />
                    </Pressable>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Add / Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderTitle}>
                {editingNoteId ? 'Edit Care Note' : 'Add New Care Note'}
              </Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </Pressable>
            </View>

            <View style={styles.modalForm}>
              <Text style={styles.fieldLabel}>Note Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Evening BP & Pulse Check"
                value={title}
                onChangeText={setTitle}
              />

              <Text style={styles.fieldLabel}>Category</Text>
              <View style={styles.categoryPickerRow}>
                {(['Vitals', 'Doctor Visit', 'Diet', 'General'] as CategoryType[]).map((cat) => (
                  <Pressable
                    key={cat}
                    style={[
                      styles.categoryPickerChip,
                      category === cat && styles.categoryPickerChipActive,
                    ]}
                    onPress={() => setCategory(cat)}>
                    <Text
                      style={[
                        styles.categoryPickerText,
                        category === cat && styles.categoryPickerTextActive,
                      ]}>
                      {cat}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.fieldLabel}>Observation / Care Details *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Write patient status, vital measurements, or doctor instructions..."
                multiline
                numberOfLines={4}
                value={content}
                onChangeText={setContent}
              />

              <Pressable style={styles.saveBtn} onPress={handleSaveNote} disabled={saving}>
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                    <Text style={styles.saveBtnText}>
                      {editingNoteId ? 'Update Care Note' : 'Save Care Note'}
                    </Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  sectionSub: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  addBtn: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 14,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.light.cardBackground,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  filterChipActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  notesList: {
    gap: 12,
  },
  noteCard: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  noteCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  dateText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 4,
  },
  noteContent: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    lineHeight: 19,
    marginBottom: 10,
  },
  noteCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  authorText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBtn: {
    padding: 4,
  },
  emptyCard: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  emptyText: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalHeaderTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalForm: {
    gap: 12,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  categoryPickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryPickerChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryPickerChipActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  categoryPickerText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  categoryPickerTextActive: {
    color: '#FFFFFF',
  },
  saveBtn: {
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
