import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../../theme';
import SafeScreen from '../../components/auth/SafeScreen';
import AuthHeader from '../../components/auth/AuthHeader';
import AuthInput from '../../components/auth/AuthInput';
import PrimaryButton from '../../components/auth/PrimaryButton';
import StepIndicator from '../../components/auth/StepIndicator';
import Toast from '../../components/auth/Toast';
import { isValidEmailOrPhone } from '../../components/auth/validation';
import authService from '../../services/authService';

/**
 * ForgotPasswordScreen (Step 1 of 3)
 * Prompts user for registered Email or Phone to dispatch a verification code.
 */
export default function ForgotPasswordScreen({ navigation }) {
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setToastVisible(true);
  };

  const handleIdChange = (text) => {
    setIdentifier(text);
    if (error) setError('');
  };

  const handleSendCode = async () => {
    const cleanId = identifier.trim();
    if (!cleanId) {
      setError('Enter your email or phone number');
      return;
    }
    if (!isValidEmailOrPhone(cleanId)) {
      setError('Enter a valid email or phone number');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.sendResetCode(cleanId);
      showToast(response.message || 'Verification code sent!');

      setTimeout(() => {
        if (navigation?.navigate) {
          navigation.navigate('OtpVerification', {
            id: cleanId,
            destination: cleanId,
          });
        }
      }, 500);
    } catch (err) {
      showToast(err.message || 'Failed to send reset code.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (navigation?.goBack) {
      navigation.goBack();
    } else if (navigation?.navigate) {
      navigation.navigate('Login');
    }
  };

  return (
    <SafeScreen backgroundColor={COLORS.brand} barStyle="light-content">
      {/* Header with back button */}
      <AuthHeader
        title="MediCare"
        subtitle="Forgot password"
        onBack={handleBack}
        logoSize={76}
      />

      <View style={styles.formBody}>
        {/* Step Indicator (1 of 3) */}
        <StepIndicator currentStep={1} totalSteps={3} />

        {/* Informative Explanation Note */}
        <Text style={styles.note} allowFontScaling={true}>
          Enter the email or phone number linked to your account. We will send you a code to reset your password.
        </Text>

        {/* Email or Phone Input */}
        <AuthInput
          icon="user"
          placeholder="Email or Phone"
          value={identifier}
          onChangeText={handleIdChange}
          error={error}
          autoComplete="username"
          accessibilityLabel="Email or Phone to receive reset code"
        />

        <View style={{ height: 10 }} />

        {/* Submit Send Code Button */}
        <PrimaryButton
          title="Send Code"
          onPress={handleSendCode}
          loading={loading}
          accessibilityLabel="Send verification code to reset password"
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
    marginBottom: 20,
    fontFamily: FONTS.family,
  },
});
