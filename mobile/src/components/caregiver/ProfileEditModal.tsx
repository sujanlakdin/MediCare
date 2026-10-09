import React, { useState, useEffect } from 'react';
import {
  Modal,
  StyleSheet,
  View,
  Text,
  Pressable,
  TextInput,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '@/constants/theme';

export interface CaregiverProfileData {
  name: string;
  age: string;
  role: string;
  email: string;
  phone: string;
  avatarUrl: string;
}

interface ProfileEditModalProps {
  visible: boolean;
  onClose: () => void;
  initialData: CaregiverProfileData;
  onSave: (updatedData: CaregiverProfileData) => void;
  onDelete?: () => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150',
  'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150',
];

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  visible,
  onClose,
  initialData,
  onSave,
  onDelete,
}) => {
  const [name, setName] = useState(initialData.name);
  const [age, setAge] = useState(initialData.age || '32');
  const [role, setRole] = useState(initialData.role);
  const [email, setEmail] = useState(initialData.email);
  const [phone, setPhone] = useState(initialData.phone);
  const [avatarUrl, setAvatarUrl] = useState(initialData.avatarUrl);

  useEffect(() => {
    if (visible) {
      setName(initialData.name);
      setAge(initialData.age || '32');
      setRole(initialData.role);
      setEmail(initialData.email);
      setPhone(initialData.phone);
      setAvatarUrl(initialData.avatarUrl);
    }
  }, [visible, initialData]);

  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please allow access to your photo library to pick an avatar.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setAvatarUrl(result.assets[0].uri);
      }
    } catch {
      Alert.alert('Error', 'Could not open image picker.');
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Required Field', 'Please enter your name.');
      return;
    }

    onSave({
      name: name.trim(),
      age: age.trim() || '32',
      role: role.trim() || 'Primary Caregiver',
      email: email.trim() || 'caregiver@medicare.com',
      phone: phone.trim() || '0701982984',
      avatarUrl: avatarUrl.trim() || PRESET_AVATARS[1],
    });

    Alert.alert('Profile Updated! 👤', 'Caregiver profile details saved successfully.');
    onClose();
  };

  const handleDeleteProfile = () => {
    Alert.alert(
      'Delete Caregiver Profile?',
      'Are you sure you want to delete and reset your Caregiver Profile details?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Profile',
          style: 'destructive',
          onPress: () => {
            if (onDelete) onDelete();
            onClose();
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.iconWrap}>
                <Ionicons name="person" size={20} color={Colors.light.primary} />
              </View>
              <Text style={styles.headerTitle}>Edit Caregiver Profile</Text>
            </View>
            <Pressable style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={22} color="#64748B" />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollBody}>
            {/* Current Selected Avatar */}
            <Pressable style={styles.avatarPreviewContainer} onPress={handlePickImage}>
              <Image source={{ uri: avatarUrl }} style={styles.largeAvatar} />
              <View style={styles.cameraIconBadge}>
                <Ionicons name="camera" size={14} color="#FFFFFF" />
              </View>
            </Pressable>

            {/* Upload Custom Photo Button */}
            <Pressable style={styles.uploadPhotoBtn} onPress={handlePickImage}>
              <Ionicons name="cloud-upload-outline" size={18} color={Colors.light.primary} />
              <Text style={styles.uploadPhotoBtnText}>Upload Photo from Device</Text>
            </Pressable>

            {/* Avatar Selector Presets */}
            <Text style={styles.fieldLabel}>Or Choose Preset Avatar</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.avatarPresetsRow}>
              {PRESET_AVATARS.map((url, idx) => (
                <Pressable
                  key={idx}
                  style={[
                    styles.avatarChip,
                    avatarUrl === url && styles.avatarChipSelected,
                  ]}
                  onPress={() => setAvatarUrl(url)}>
                  <Image source={{ uri: url }} style={styles.presetAvatarImage} />
                  {avatarUrl === url && (
                    <View style={styles.checkBadge}>
                      <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                    </View>
                  )}
                </Pressable>
              ))}
            </ScrollView>

            {/* Profile Form */}
            <View style={styles.formGroup}>
              <Text style={styles.fieldLabel}>Full Name *</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="e.g. Kasun Perera"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.fieldLabel}>Age (Years)</Text>
              <TextInput
                style={styles.input}
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
                placeholder="e.g. 32"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.fieldLabel}>Role Title</Text>
              <TextInput
                style={styles.input}
                value={role}
                onChangeText={setRole}
                placeholder="e.g. Primary Caregiver / Senior Nurse"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.fieldLabel}>Email Address</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="e.g. kasun1234@gmail.com"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.fieldLabel}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholder="e.g. 0701982984"
              />
            </View>
          </ScrollView>

          {/* Action Footer */}
          <View style={styles.footer}>
            <Pressable style={styles.saveBtn} onPress={handleSave}>
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              <Text style={styles.saveBtnText}>Save Profile Changes</Text>
            </Pressable>

            {onDelete && (
              <Pressable style={styles.deleteProfileBtn} onPress={handleDeleteProfile}>
                <Ionicons name="trash-outline" size={18} color="#DC2626" />
                <Text style={styles.deleteProfileBtnText}>Delete / Reset Profile Details</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E6F4EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  avatarPreviewContainer: {
    alignSelf: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  largeAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: Colors.light.primary,
  },
  cameraIconBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.light.primary,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  uploadPhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#E6F4EA',
    borderWidth: 1,
    borderColor: '#C3E6CB',
    marginBottom: 16,
    alignSelf: 'center',
  },
  uploadPhotoBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
  },
  avatarPresetsRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  avatarChip: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
    position: 'relative',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  avatarChipSelected: {
    borderColor: Colors.light.primary,
  },
  presetAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
  },
  checkBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: Colors.light.primary,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formGroup: {
    marginBottom: 14,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  saveBtn: {
    backgroundColor: Colors.light.primary,
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  deleteProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    marginTop: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
  },
  deleteProfileBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#DC2626',
  },
});
