import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  StyleSheet,
  Platform,
  Pressable,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import PatientIcon from './PatientIcons';

interface MedicationImagePickerProps {
  value?: string;
  onChange: (uri?: string) => void;
}

/**
 * MedicationImagePicker Component
 * Allows user to take a medicine picture using camera or gallery.
 * Returns base64 data URI format.
 * Displays dashed placeholder or rounded preview (height 220) with Change / Remove options.
 */
export default function MedicationImagePicker({
  value,
  onChange,
}: MedicationImagePickerProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [permissionError, setPermissionError] = useState('');

  const isWeb = Platform.OS === 'web';

  const handleOpenPicker = () => {
    setPermissionError('');
    setModalVisible(true);
  };

  const handleTakePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        setPermissionError(
          'Camera access is turned off. Allow it in your phone settings, or choose a photo from the gallery.'
        );
        return;
      }

      setPermissionError('');
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.4,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const mimeType = asset.mimeType || 'image/jpeg';
        const dataUri = asset.base64
          ? `data:${mimeType};base64,${asset.base64}`
          : asset.uri;
        onChange(dataUri);
        setModalVisible(false);
      }
    } catch (e) {
      setPermissionError('Could not launch camera. Please try choosing from gallery.');
    }
  };

  const handleChooseFromGallery = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setPermissionError('Gallery access is required to choose a medicine photo.');
        return;
      }

      setPermissionError('');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.4,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const mimeType = asset.mimeType || 'image/jpeg';
        const dataUri = asset.base64
          ? `data:${mimeType};base64,${asset.base64}`
          : asset.uri;
        onChange(dataUri);
        setModalVisible(false);
      }
    } catch (e) {
      setPermissionError('Could not open photo gallery. Please try again.');
    }
  };

  const handleRemovePhoto = () => {
    onChange('');
  };

  return (
    <View style={styles.container}>
      {value ? (
        // Preview View when photo is attached
        <View style={styles.previewContainer}>
          <Image
            source={{ uri: value }}
            style={styles.previewImage}
            resizeMode="cover"
            accessibilityLabel="Attached medicine photograph"
          />
          <View style={styles.previewActionsRow}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.changeBtn]}
              onPress={handleOpenPicker}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Change medicine photo"
            >
              <PatientIcon name="camera" size={18} color="#006A4E" strokeWidth={2.2} />
              <Text style={styles.changeBtnText}>Change Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.removeBtn]}
              onPress={handleRemovePhoto}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Remove medicine photo"
            >
              <PatientIcon name="trash" size={18} color="#C94A4A" strokeWidth={2.2} />
              <Text style={styles.removeBtnText}>Remove</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        // Dashed Photo Box when no photo exists
        <TouchableOpacity
          style={styles.dashedBox}
          onPress={handleOpenPicker}
          activeOpacity={0.82}
          accessibilityRole="button"
          accessibilityLabel="Tap to add medicine photo. Take a photo or choose one from your gallery."
        >
          <View style={styles.iconCircle}>
            <PatientIcon name="camera" size={28} color="#006A4E" strokeWidth={2} />
          </View>
          <Text style={styles.dashedTitle} allowFontScaling={true}>
            Tap to add photo
          </Text>
          <Text style={styles.dashedSubtitle} allowFontScaling={true}>
            Take a photo or choose one from your gallery
          </Text>
        </TouchableOpacity>
      )}

      {/* Bottom Sheet Modal for Photo Selection */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <Pressable style={styles.bottomSheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle} allowFontScaling={true}>
              Medication Photo
            </Text>
            <Text style={styles.sheetSubtitle} allowFontScaling={true}>
              Add a clear photo of your medicine or prescription label.
            </Text>

            {/* Permission Denied Error Alert */}
            {!!permissionError && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText} allowFontScaling={true}>
                  {permissionError}
                </Text>
              </View>
            )}

            {/* Camera Option (hidden on web) */}
            {!isWeb && (
              <TouchableOpacity
                style={styles.sheetOption}
                onPress={handleTakePhoto}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Take a photo with camera"
              >
                <View style={styles.sheetIconBox}>
                  <PatientIcon name="camera" size={22} color="#006A4E" />
                </View>
                <View style={styles.sheetOptionTextContainer}>
                  <Text style={styles.sheetOptionTitle}>Take a photo</Text>
                  <Text style={styles.sheetOptionSub}>Use your phone camera</Text>
                </View>
              </TouchableOpacity>
            )}

            {/* Gallery Option */}
            <TouchableOpacity
              style={styles.sheetOption}
              onPress={handleChooseFromGallery}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Choose photo from gallery"
            >
              <View style={styles.sheetIconBox}>
                <PatientIcon name="pill" size={22} color="#006A4E" />
              </View>
              <View style={styles.sheetOptionTextContainer}>
                <Text style={styles.sheetOptionTitle}>Choose from gallery</Text>
                <Text style={styles.sheetOptionSub}>Select from your photos</Text>
              </View>
            </TouchableOpacity>

            {/* Cancel Button */}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Cancel photo picker"
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  dashedBox: {
    borderWidth: 2,
    borderColor: '#3AB68B',
    borderStyle: 'dashed',
    borderRadius: 20,
    backgroundColor: '#F3FAF6',
    paddingVertical: 26,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E4F5EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  dashedTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F3D2E',
    marginBottom: 4,
  },
  dashedSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },
  previewContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  previewImage: {
    width: '100%',
    height: 220,
    backgroundColor: '#E4F5EC',
  },
  previewActionsRow: {
    flexDirection: 'row',
    padding: 12,
    gap: 10,
    backgroundColor: '#FFFFFF',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  changeBtn: {
    backgroundColor: '#E4F5EC',
  },
  changeBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#006A4E',
  },
  removeBtn: {
    backgroundColor: '#FDE8E8',
  },
  removeBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#C94A4A',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 16,
  },
  sheetHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F3D2E',
    marginBottom: 4,
  },
  sheetSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
  },
  errorBox: {
    backgroundColor: '#FDE8E8',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  errorText: {
    fontSize: 13,
    color: '#C94A4A',
    lineHeight: 18,
    fontWeight: '500',
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    marginBottom: 10,
  },
  sheetIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#E4F5EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  sheetOptionTextContainer: {
    flex: 1,
  },
  sheetOptionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F3D2E',
    marginBottom: 2,
  },
  sheetOptionSub: {
    fontSize: 13,
    color: '#64748B',
  },
  cancelButton: {
    marginTop: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#475569',
  },
});
