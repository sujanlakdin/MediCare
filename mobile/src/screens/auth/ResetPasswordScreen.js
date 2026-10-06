import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../../theme';
import SafeScreen from '../../components/auth/SafeScreen';
import AuthHeader from '../../components/auth/AuthHeader';
import AuthInput from '../../components/auth/AuthInput';
import PrimaryButton from '../../components/auth/PrimaryButton';
import PasswordStrengthMeter from '../../components/auth/PasswordStrengthMeter';
import StepIndicator from '../../components/auth/StepIndicator';
import Toast from '../../components/auth/Toast';
import { hasRequiredComplexity } from '../../components/auth/validation';
import authService from '../../services/authService';

/**
 * ResetPasswordScreen (Step 3 of 3)
 * Prompts user for New Password and Confirm Password with strength meter.
 */
export default function ResetPasswordScreen({ route, navigation }) {
  const params = route?.params || {};
  const identifier = params.id || 'user@medicare.com';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');

  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setToastVisible(true);
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    if (passwordError) setPasswordError('');
    if (confirmError && text === confirmPassword) setConfirmError('');
  };

  const handleConfirmChange = (text) => {
    setConfirmPassword(text);
    if (confirmError) setConfirmError('');
  };

  const validate = () => {
    let valid = true;

    // Password validation: min 8 characters, at least 2 categories
    if (!password) {
      setPasswordError('Enter a new password');
      valid = false;
    } else if (password.length < 8) {
      setPasswordError('Use at least 8 characters');
      valid = false;
    } else if (!hasRequiredComplexity(password)) {
      setPasswordError('Add numbers or capital letters');
      valid = false;
    } else {
      setPasswordError('');
    }

    // Confirm password match
    if (!confirmPassword) {
      setConfirmError('Confirm your new password');
      valid = false;
    } else if (password !== confirmPassword) {
      setConfirmError('Passwords do not match');
      valid = false;
    } else {
      setConfirmError('');
    }

    return valid;
  };

  const handleReset = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await authService.resetPassword(identifier, password);

      if (navigation?.navigate) {
        navigation.navigate('Success', {
          title: 'Password updated',
          message: 'You can now sign in with your new password.',
          buttonText: 'Back to Login',
          nextRoute: 'Login',
        });
      }
    } catch (err) {
      showToast(err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (navigation?.goBack) {
      navigation.goBack();
    } else if (navigation?.navigate) {
      navigation.navigate('OtpVerification');
    }
  };

  return (
    <SafeScreen backgroundColor={COLORS.brand} barStyle="light-content">
      {/* Header with back button */}
      <AuthHeader
        title="MediCare"
        subtitle="Create new password"
        onBack={handleBack}
        logoSize={76}
      />

      <View style={styles.formBody}>
        {/* Step Indicator (3 of 3) */}
        <StepIndicator currentStep={3} totalSteps={3} />

        {/* Note on uniqueness */}
        <Text style={styles.note} allowFontScaling={true}>
          New password must be different from previously used password
        </Text>

        {/* New Password Input + 4-bar Strength Meter */}
        <AuthInput
          icon="lock"
          placeholder="New Password"
          value={password}
          onChangeText={handlePasswordChange}
          error={passwordError}
          isPassword={true}
          autoComplete="new-password"
          accessibilityLabel="New Password"
        />
        <PasswordStrengthMeter password={password} />

        {/* Confirm Password Input */}
        <AuthInput
          icon="refresh"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={handleConfirmChange}
          error={confirmError}
          isPassword={true}
          autoComplete="new-password"
          accessibilityLabel="Confirm Password"
        />

        <View style={{ height: 16 }} />

        {/* Submit Reset Button */}
        <PrimaryButton
          title="Reset Password"
          onPress={handleReset}
          loading={loading}
          accessibilityLabel="Reset Password"
        />
      </View>

      {/* Feedback Toast */}
      <Toast
        visible={toastVisible}
        message={toastMessage}
        onDismiss={() => setToastVisible(false)}
      />
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  formBody: {
    flex: 1,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 28,
    paddingTop: 8,
    paddingBottom: 40,
  },
  note: {
    textAlign: 'center',
    color: COLORS.muted,
    fontSize: FONTS.sizes.sm + 0.5,
    lineHeight: 22,
    marginTop: 6,
    marginHorizontal: 4,
    marginBottom: 16,
    fontFamily: FONTS.family,
  },
});
