import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { router } from 'expo-router';
import MyProfileScreen from '../../screens/profile/MyProfileScreen';
import EditProfileScreen from '../../screens/profile/EditProfileScreen';
import SettingsScreen from '../../screens/profile/SettingsScreen';
import AccessibilityScreen from '../../screens/profile/AccessibilityScreen';
import BottomNav from '../../components/patient/BottomNav';
import PatientIcon from '../../components/patient/PatientIcons';
import Toast from '../../components/auth/Toast';
import { PATIENT_COLORS } from '../../constants/patientTheme';

export default function ProfileRoute() {
  const [subScreen, setSubScreen] = useState<'MyProfile' | 'EditProfile' | 'Settings' | 'Accessibility'>('MyProfile');
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
  };

  const navigation = {
    navigate: (screenName: string) => {
      if (screenName === 'Welcome' || screenName === 'Login' || screenName === '/') {
        router.replace((screenName.startsWith('/') ? screenName : `/?route=${screenName}`) as any);
        return;
      }
      if (screenName === 'Dashboard' || screenName === '/(patient)/dashboard' || screenName === '/dashboard') {
        router.replace('/(patient)/dashboard' as any);
        return;
      }
      if (
        screenName === 'MyProfile' ||
        screenName === 'EditProfile' ||
        screenName === 'Settings' ||
        screenName === 'Accessibility'
      ) {
        setSubScreen(screenName as any);
      }
    },
    goBack: () => {
      if (subScreen !== 'MyProfile') {
        setSubScreen('MyProfile');
      } else {
        router.replace('/(patient)/dashboard' as any);
      }
    },
    replace: (screenName: string) => {
      if (screenName === 'Welcome' || screenName === 'Login' || screenName === '/') {
        router.replace((screenName.startsWith('/') ? screenName : `/?route=${screenName}`) as any);
        return;
      }
      if (screenName === 'Dashboard' || screenName === '/(patient)/dashboard') {
        router.replace('/(patient)/dashboard' as any);
        return;
      }
      setSubScreen(screenName as any);
    },
  };

  const renderActiveScreen = () => {
    switch (subScreen) {
      case 'EditProfile':
        return <EditProfileScreen navigation={navigation} />;
      case 'Settings':
        return <SettingsScreen navigation={navigation} />;
      case 'Accessibility':
        return <AccessibilityScreen navigation={navigation} />;
      case 'MyProfile':
      default:
        return <MyProfileScreen navigation={navigation} />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Bar with Back to Dashboard button */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (subScreen !== 'MyProfile') {
              setSubScreen('MyProfile');
            } else {
              router.replace('/(patient)/dashboard' as any);
            }
          }}
          accessibilityRole="button"
          accessibilityLabel={subScreen !== 'MyProfile' ? 'Back to profile' : 'Back to patient dashboard'}
        >
          <PatientIcon name="arrow-left" size={20} color={PATIENT_COLORS.deep} strokeWidth={2.4} />
          <Text style={styles.backText} allowFontScaling={true}>
            {subScreen !== 'MyProfile' ? 'Profile' : 'Dashboard'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.screenTitle} allowFontScaling={true}>
          {subScreen === 'MyProfile'
            ? 'Account & Settings'
            : subScreen === 'EditProfile'
            ? 'Edit Details'
            : subScreen === 'Settings'
            ? 'Settings'
            : 'Accessibility'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>{renderActiveScreen()}</View>

      {/* Floating Bottom Nav */}
      <BottomNav currentTab="profile" onShowToast={showToast} />

      <Toast
        visible={toastVisible}
        message={toastMessage}
        onDismiss={() => setToastVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PATIENT_COLORS.background,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 10,
    backgroundColor: PATIENT_COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: PATIENT_COLORS.border,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 4,
  },
  backText: {
    fontSize: 14,
    fontWeight: '700',
    color: PATIENT_COLORS.deep,
  },
  screenTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: PATIENT_COLORS.deep,
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
  },
});
