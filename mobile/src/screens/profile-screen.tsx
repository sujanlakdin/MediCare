import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { launchCameraAsync, launchImageLibraryAsync, requestCameraPermissionsAsync, requestMediaLibraryPermissionsAsync, type ImagePickerAsset } from 'expo-image-picker';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { CareIcon } from '@/components/care-icon';
import { LogoutButton } from '@/components/logout-button';
import { Screen } from '@/components/screen';
import { useAccessibility } from '@/contexts/accessibility-context';
import { useAuth } from '@/contexts/auth-context';
import { ApiError } from '@/services/api';
import { getProfile, removeProfilePhoto, type Profile, updateProfile, uploadProfilePhoto } from '@/services/medicare-api';

const DEFAULT_PROFILE = {
  fullName: 'Chathura Rajapakse',
  age: '72 Years Old',
  phone: '+94 77 123 4567',
  email: 'chathura.r@gmail.com',
  address: 'No. 45, Galle Road, Colombo 03, Sri Lanka',
  medicalId: 'MRX-9082-72',
};

export default function ProfileScreen() {
  const { token } = useAuth();
  const { settings } = useAccessibility();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [photoMenuVisible, setPhotoMenuVisible] = useState(false);
  const [photoViewerVisible, setPhotoViewerVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState<{ uri: string; name?: string } | null>(null);
  const [previewMode, setPreviewMode] = useState<'camera' | 'gallery' | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [photoVersion, setPhotoVersion] = useState(Date.now());
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingName, setEditingName] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);

  const loadProfile = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const result = await getProfile(token);
      setProfile(result.profile);
      setImageLoadError(false);
      setPhotoVersion(Date.now());
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : 'Unable to load profile. Using local details.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const handlePhotoSelection = async (mode: 'camera' | 'gallery') => {
    if (!token) {
      Alert.alert('Profile Photo', 'Please sign in to update your profile photo.');
      return;
    }

    setPhotoMenuVisible(false);

    try {
      const permissions = mode === 'camera'
        ? await requestCameraPermissionsAsync()
        : await requestMediaLibraryPermissionsAsync();

      if (permissions.status !== 'granted') {
        Alert.alert(
          'Profile Photo',
          mode === 'camera'
            ? 'Camera permission is required to take a profile photo.'
            : 'Photo library permission is required to choose a profile photo.'
        );
        return;
      }

      const result = mode === 'camera'
        ? await launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.85,
            mediaTypes: ['images'],
          })
        : await launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.85,
            mediaTypes: ['images'],
          });

      if (result.canceled || !result.assets?.length) {
        Alert.alert('Profile Photo', mode === 'camera' ? 'Photo capture was cancelled.' : 'Photo selection was cancelled.');
        return;
      }

      const asset = result.assets[0];
      const fileSize = asset.fileSize ?? 0;
      const mimeType = asset.mimeType || 'image/jpeg';
      const fileName = asset.fileName || `profile-photo-${Date.now()}.jpg`;
      const validMimeType = ['image/jpeg', 'image/png', 'image/webp'].includes(mimeType);
      const validExtension = /\.(jpe?g|png|webp)$/i.test(fileName);

      if (fileSize > 5 * 1024 * 1024) {
        Alert.alert('Profile Photo', 'Please select a smaller image.');
        return;
      }

      if (!validMimeType && !validExtension) {
        Alert.alert('Profile Photo', 'Please select a valid image.');
        return;
      }

      setPreviewImage({ uri: asset.uri, name: fileName });
      setPreviewMode(mode);
    } catch {
      Alert.alert('Profile Photo', 'Unable to access the device camera or photo library.');
    }
  };

  const handleUpload = async () => {
    if (!token || !previewImage) return;
    setIsUploading(true);

    try {
      const response = await uploadProfilePhoto(token, previewImage.uri, previewImage.name);
      setProfile((current) => (current ? { ...current, profilePhotoUrl: response.profilePhoto } : current));
      setImageLoadError(false);
      setPhotoVersion(Date.now());
      setPreviewMode(null);
      setPreviewImage(null);
      Alert.alert('Profile Photo', response.message || 'Profile photo updated successfully.');
    } catch (requestError) {
      Alert.alert(
        'Profile Photo',
        requestError instanceof ApiError ? requestError.message : 'Unable to upload your profile photo. Please try again.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!token) {
      Alert.alert('Profile Photo', 'Please sign in to remove your profile photo.');
      return;
    }

    Alert.alert('Remove Profile Photo?', 'Are you sure you want to remove your profile photo?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            const response = await removeProfilePhoto(token);
            setProfile((current) => (current ? { ...current, profilePhotoUrl: '' } : current));
            setImageLoadError(false);
            setPhotoVersion(Date.now());
            Alert.alert('Profile Photo', response.message || 'Profile photo removed successfully.');
          } catch (requestError) {
            Alert.alert(
              'Profile Photo',
              requestError instanceof ApiError ? requestError.message : 'Unable to remove your profile photo. Please try again.'
            );
          }
        },
      },
    ]);
  };

  const handleStartEditName = () => {
    setEditingName(displayName);
    setIsEditingName(true);
  };

  const handleSaveName = async () => {
    if (!token || !editingName.trim()) {
      setIsEditingName(false);
      return;
    }

    setIsSavingName(true);
    try {
      await updateProfile(token, { fullName: editingName.trim() });
      setProfile((current) => (current ? { ...current, fullName: editingName.trim() } : current));
      setIsEditingName(false);
    } catch (requestError) {
      Alert.alert(
        'Profile Name',
        requestError instanceof ApiError ? requestError.message : 'Unable to update your name. Please try again.'
      );
    } finally {
      setIsSavingName(false);
    }
  };

  const handleCancelEditName = () => {
    setIsEditingName(false);
    setEditingName('');
  };

  // Derive display values from profile or fallback to the reference mockup
  const displayName = profile?.fullName?.trim() || DEFAULT_PROFILE.fullName;
  const displayEmail = profile?.email?.trim() || DEFAULT_PROFILE.email;
  const displayPhone = profile?.phone?.trim() || DEFAULT_PROFILE.phone;
  const displayAddress = profile?.address?.trim() || DEFAULT_PROFILE.address;
  const hasProfilePhoto = Boolean(profile?.profilePhotoUrl && profile.profilePhotoUrl.trim());

  // Compute age from dateOfBirth if available, otherwise default to 72 Years Old
  let displayAge = DEFAULT_PROFILE.age;
  if (profile?.dateOfBirth) {
    const birthYear = parseInt(profile.dateOfBirth.split('-')[0], 10);
    if (!isNaN(birthYear) && birthYear > 1900 && birthYear < 2026) {
      displayAge = `${2026 - birthYear} Years Old`;
    }
  }

  const displayMedicalId = profile?._id
    ? `MRX-${profile._id.slice(-4).toUpperCase()}-72`
    : DEFAULT_PROFILE.medicalId;

  const avatarSource = profile?.profilePhotoUrl && !imageLoadError
    ? { uri: `${profile.profilePhotoUrl}${profile.profilePhotoUrl.includes('?') ? '&' : '?'}v=${photoVersion}` }
    : require('@/assets/images/chathura_avatar.jpg');

  return (
    <Screen
      title="My Profile"
      subtitle="View your personal and medical profile details."
      activeTab="profile">
      {isLoading ? (
        <View style={styles.state}>
          <ActivityIndicator size="large" color="#0E3E2F" accessibilityLabel="Loading profile" />
          <Text style={styles.loadingText}>Loading profile details...</Text>
        </View>
      ) : (
        <>
          {/* Profile Header Block */}
          <View style={styles.identityBlock}>
            <View style={styles.avatarWrapper}>
              <Image
                source={avatarSource}
                style={styles.avatarImage}
                accessibilityLabel={`Profile image for ${displayName}`}
                onError={() => setImageLoadError(true)}
                onLoad={() => setImageLoadError(false)}
              />
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Change profile photo"
              accessibilityHint="Take a new photo, choose one from the gallery, view or remove your profile photo"
              onPress={() => setPhotoMenuVisible(true)}
              style={styles.cameraButton}>
              <Ionicons name="camera" size={18} color="#FFFFFF" />
            </Pressable>
            {isEditingName ? (
              <View style={styles.nameEditContainer}>
                <TextInput
                  style={[
                    styles.nameInput,
                    settings.fontSize === 'large' && styles.largeNameInput,
                    settings.fontSize === 'extraLarge' && styles.extraLargeNameInput,
                  ]}
                  value={editingName}
                  onChangeText={setEditingName}
                  placeholder="Full Name"
                  placeholderTextColor="#9CB0A6"
                  autoFocus
                  onSubmitEditing={handleSaveName}
                />
                <View style={styles.nameEditActions}>
                  <Pressable
                    onPress={handleCancelEditName}
                    style={styles.nameEditButton}
                    disabled={isSavingName}>
                    <Ionicons name="close" size={18} color="#71827A" />
                  </Pressable>
                  <Pressable
                    onPress={handleSaveName}
                    style={styles.nameEditButton}
                    disabled={isSavingName}>
                    {isSavingName ? (
                      <ActivityIndicator size={18} color="#22996E" />
                    ) : (
                      <Ionicons name="checkmark" size={18} color="#22996E" />
                    )}
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable onPress={handleStartEditName} style={styles.namePressable}>
                <Text
                  style={[
                    styles.nameText,
                    settings.fontSize === 'large' && styles.largeNameText,
                    settings.fontSize === 'extraLarge' && styles.extraLargeNameText,
                  ]}>
                  {displayName}
                </Text>
              </Pressable>
            )}
            <View style={styles.ageBadge}>
              <Text style={styles.ageBadgeText}>{displayAge}</Text>
            </View>
          </View>

          {/* Details Card */}
          <View style={styles.card}>
            {/* Phone */}
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <CareIcon name="phone" size={18} color="#22996E" />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Phone Number</Text>
                <Text style={styles.infoValue}>{displayPhone}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Email */}
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <CareIcon name="mail" size={18} color="#22996E" />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Email Address</Text>
                <Text style={styles.infoValue}>{displayEmail}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Address */}
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <CareIcon name="location" size={18} color="#22996E" />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Residential Address</Text>
                <Text style={styles.infoValue}>{displayAddress}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Medical ID */}
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <CareIcon name="medical" size={18} color="#22996E" />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Medical ID</Text>
                <Text style={styles.infoValue}>{displayMedicalId}</Text>
              </View>
            </View>
          </View>

          {/* Edit Profile Details Button */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Edit Profile Details"
            onPress={() => router.push('/(app)/(tabs)/profile/edit' as Href)}
            style={({ pressed }) => [
              styles.editButton,
              settings.largerButtons && styles.largeButton,
              pressed && styles.pressed,
            ]}>
            <CareIcon name="pencil" size={18} color="#FFFFFF" />
            <Text style={styles.editButtonText}>Edit Profile Details</Text>
          </Pressable>

          {/* Caregiver & Emergency Card */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Caregiver & Emergency"
            onPress={() => router.push('/settings/caregivers' as Href)}
            style={({ pressed }) => [
              styles.caregiverCard,
              settings.largerButtons && styles.largeCaregiverCard,
              pressed && styles.pressed,
            ]}>
            <View style={styles.caregiverIconCircle}>
              <CareIcon name="heart" size={18} color="#22996E" />
            </View>
            <Text style={styles.caregiverTitle}>Caregiver & Emergency</Text>
            <CareIcon name="chevron-right" size={18} color="#71827A" />
          </Pressable>

          <LogoutButton largerButtons={settings.largerButtons} />
        </>
      )}

      <Modal transparent visible={photoMenuVisible} animationType="fade" onRequestClose={() => setPhotoMenuVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setPhotoMenuVisible(false)}>
          <Pressable style={styles.modalCard} onPress={() => undefined}>
            <Text style={styles.modalTitle}>Profile Photo</Text>
            <Pressable style={styles.optionButton} onPress={() => void handlePhotoSelection('camera')}>
              <Text style={styles.optionText}>Take Photo</Text>
            </Pressable>
            <Pressable style={styles.optionButton} onPress={() => void handlePhotoSelection('gallery')}>
              <Text style={styles.optionText}>Choose From Gallery</Text>
            </Pressable>
            {hasProfilePhoto && (
              <>
                <Pressable style={styles.optionButton} onPress={() => { setPhotoMenuVisible(false); setPhotoViewerVisible(true); }}>
                  <Text style={styles.optionText}>View Photo</Text>
                </Pressable>
                <Pressable style={styles.optionButton} onPress={() => { setPhotoMenuVisible(false); void handleRemovePhoto(); }}>
                  <Text style={[styles.optionText, styles.destructiveText]}>Remove Photo</Text>
                </Pressable>
              </>
            )}
            <Pressable style={[styles.optionButton, styles.cancelButton]} onPress={() => setPhotoMenuVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal transparent visible={!!previewImage} animationType="slide" onRequestClose={() => setPreviewImage(null)}>
        <View style={styles.previewOverlay}>
          <View style={styles.previewCard}>
            <Text style={styles.previewTitle}>Confirm Profile Photo</Text>
            <Image source={{ uri: previewImage?.uri || '' }} style={styles.previewImage} />
            <View style={styles.previewActions}>
              <Pressable style={[styles.previewAction, styles.secondaryAction]} onPress={() => { setPreviewImage(null); setPreviewMode(null); }}>
                <Text style={styles.secondaryActionText}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.previewAction, styles.secondaryAction]} onPress={() => { setPreviewImage(null); setPreviewMode(null); setPhotoMenuVisible(true); }}>
                <Text style={styles.secondaryActionText}>{previewMode === 'camera' ? 'Retake' : 'Choose Another'}</Text>
              </Pressable>
              <Pressable style={[styles.previewAction, styles.primaryAction]} onPress={() => void handleUpload()} disabled={isUploading}>
                <Text style={styles.primaryActionText}>{isUploading ? 'Uploading...' : 'Use Photo'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={photoViewerVisible} animationType="fade" onRequestClose={() => setPhotoViewerVisible(false)}>
        <View style={styles.viewerOverlay}>
          <View style={styles.viewerCard}>
            <View style={styles.viewerHeader}>
              <Text style={styles.viewerTitle}>Profile Photo</Text>
              <Pressable onPress={() => setPhotoViewerVisible(false)} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>Close</Text>
              </Pressable>
            </View>
            {profile?.profilePhotoUrl ? (
              <Image
                source={{ uri: `${profile.profilePhotoUrl}${profile.profilePhotoUrl.includes('?') ? '&' : '?'}v=${photoVersion}` }}
                style={styles.viewerImage}
                resizeMode="contain"
                onError={() => setImageLoadError(true)}
              />
            ) : null}
          </View>
        </View>
      </Modal>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  state: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 48,
  },
  loadingText: {
    color: '#6B8278',
    fontSize: 14,
  },
  identityBlock: {
    position: 'relative',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  avatarWrapper: {
    width: 88,
    height: 88,
    borderRadius: 44,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    backgroundColor: '#E8F6EF',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  nameText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0E3E2F',
    letterSpacing: -0.2,
  },
  largeNameText: {
    fontSize: 25,
  },
  extraLargeNameText: {
    fontSize: 28,
  },
  namePressable: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  nameEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nameInput: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0E3E2F',
    letterSpacing: -0.2,
    minWidth: 200,
    textAlign: 'center',
    paddingVertical: 4,
  },
  largeNameInput: {
    fontSize: 25,
  },
  extraLargeNameInput: {
    fontSize: 28,
  },
  nameEditActions: {
    flexDirection: 'row',
    gap: 4,
  },
  nameEditButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F9F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ageBadge: {
    backgroundColor: '#E7F5EE',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#C6E7D6',
  },
  ageBadgeText: {
    color: '#1B7D54',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5EDE8',
    paddingHorizontal: 16,
    paddingVertical: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    gap: 14,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F9F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTextContainer: {
    flex: 1,
    gap: 2,
  },
  infoLabel: {
    fontSize: 12,
    color: '#71827A',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 15,
    color: '#1C2A24',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#EDF2EE',
  },
  editButton: {
    backgroundColor: '#0E3E2F',
    height: 52,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    elevation: 2,
    shadowColor: '#0E3E2F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  largeButton: {
    height: 62,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  caregiverCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5EDE8',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 58,
    gap: 12,
  },
  largeCaregiverCard: {
    height: 68,
  },
  caregiverIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8F6EF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  caregiverTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1C2A24',
  },
  pressed: {
    opacity: 0.8,
  },
  cameraButton: {
    position: 'absolute',
    right: 124,
    top: 56,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#0E3E2F',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(12, 35, 29, 0.35)',
    justifyContent: 'flex-end',
    padding: 16,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: '#E4EEE8',
  },
  modalTitle: {
    color: '#0E3E2F',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  optionButton: {
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: '#F3F9F5',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  optionText: {
    color: '#0E3E2F',
    fontSize: 15,
    fontWeight: '600',
  },
  destructiveText: {
    color: '#D14C4C',
  },
  cancelButton: {
    backgroundColor: '#EEF4F1',
  },
  cancelText: {
    color: '#0E3E2F',
    textAlign: 'center',
    fontWeight: '700',
  },
  previewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(12, 35, 29, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  previewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: '#E4EEE8',
  },
  previewTitle: {
    color: '#0E3E2F',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  previewImage: {
    width: '100%',
    height: 300,
    borderRadius: 14,
    backgroundColor: '#EDF5EE',
  },
  previewActions: {
    flexDirection: 'row',
    gap: 12,
  },
  previewAction: {
    flex: 1,
    minHeight: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryAction: {
    backgroundColor: '#EEF4F1',
  },
  secondaryActionText: {
    color: '#0E3E2F',
    fontWeight: '700',
  },
  primaryAction: {
    backgroundColor: '#0E3E2F',
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  viewerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(12, 35, 29, 0.6)',
    justifyContent: 'center',
    padding: 18,
  },
  viewerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E4EEE8',
  },
  viewerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2EE',
  },
  viewerTitle: {
    color: '#0E3E2F',
    fontSize: 17,
    fontWeight: '700',
  },
  closeButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  closeButtonText: {
    color: '#0E3E2F',
    fontWeight: '700',
  },
  viewerImage: {
    width: '100%',
    height: 380,
    backgroundColor: '#EDF5EE',
  },
  errorText: {
    color: '#B94B4B',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 10,
    textAlign: 'center',
  },
});