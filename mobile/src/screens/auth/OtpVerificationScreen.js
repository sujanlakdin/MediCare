import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../../theme';
import SafeScreen from '../../components/auth/SafeScreen';
import AuthHeader from '../../components/auth/AuthHeader';
import OtpInput from '../../components/auth/OtpInput';
import PrimaryButton from '../../components/auth/PrimaryButton';
import StepIndicator from '../../components/auth/StepIndicator';
import Toast from '../../components/auth/Toast';
import { maskIdentifier } from '../../components/auth/validation';
import authService from '../../services/authService';

/**
 * OtpVerificationScreen (Step 2 of 3)
 * Prompts user for 6-digit verification code sent via SMS/Email.
 * Features 30s resend countdown and error shake.
 */
export default function OtpVerificationScreen({ route, navigation }) {
  const params = route?.params || {};
  const identifier = params.id || params.destination || 'user@medicare.com';

  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [errorText, setErrorText] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  // 30 second resend timer
  const [countdown, setCountdown] = useState(30);
  const timerRef = useRef(null);

  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setToastVisible(true);
  };

  useEffect(() => {
    startCountdown();
    return () => clearInterval(timerRef.current);
  }, []);

  const startCountdown = () => {
    clearInterval(timerRef.current);
    setCountdown(30);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleDigitsChange = (newDigits) => {
    setDigits(newDigits);
    if (errorText || isError) {
      setErrorText('');
      setIsError(false);
    }
  };

  const handleVerify = async (codeToVerify) => {
    const code = codeToVerify || digits.join('');

    if (code.length < 6) {
      setErrorText('Enter all 6 digits of the code.');
      setIsError(true);
      return;
    }

    setLoading(true);
    try {
      await authService.verifyOtp(identifier, code);
      clearInterval(timerRef.current);
      showToast('Code verified successfully!');

      setTimeout(() => {
        if (navigation?.navigate) {
          navigation.navigate('ResetPassword', {
            id: identifier,
          });
        }
      }, 500);
    } catch (err) {
      setErrorText(err.message || 'That code is not correct. Check it and try again.');
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    try {
      await authService.sendResetCode(identifier);
      showToast('A new code has been sent!');
      setDigits(['', '', '', '', '', '']);
      setErrorText('');
      setIsError(false);
      startCountdown();
    } catch (err) {
      showToast(err.message || 'Failed to resend code.');
    }
  };

  const handleBack = () => {
    if (navigation?.goBack) {
      navigation.goBack();
    } else if (navigation?.navigate) {
      navigation.navigate('ForgotPassword');
    }
  };

  return (
    <SafeScreen backgroundColor={COLORS.brand} barStyle="light-content">
      {/* Header with back button */}
      <AuthHeader
        title="MediCare"
        subtitle="Verification"
        onBack={handleBack}
        logoSize={76}
      />

      <View style={styles.formBody}>
        {/* Step Indicator (2 of 3) */}
        <StepIndicator currentStep={2} totalSteps={3} />

        {/* Masked destination notice */}
        <Text style={styles.note} allowFontScaling={true}>
          Enter the 6-digit code we sent to{'\n'}
          <Text style={styles.destinationHighlight}>
            {maskIdentifier(identifier)}
          </Text>
        </Text>

        {/* 6 Digit Input Boxes */}
        <OtpInput
          code={digits}
          onChangeCode={handleDigitsChange}
          isError={isError}
          onComplete={handleVerify}
        />

        {/* Error Feedback */}
        {Boolean(errorText) && (
          <Text
            style={styles.errorText}
            allowFontScaling={true}
            accessibilityRole="alert"
          >
            {errorText}
          </Text>
        )}

        {/* Resend with 30s countdown */}
        <View style={styles.resendContainer}>
          <Text style={styles.resendText} allowFontScaling={true}>
            Didn't get the code?{' '}
          </Text>
          <TouchableOpacity
            onPress={handleResend}
            disabled={countdown > 0}
            accessibilityRole="button"
            accessibilityLabel={`Resend code ${countdown > 0 ? `in ${countdown} seconds` : 'now'}`}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text
              style={[
                styles.resendLink,
                countdown > 0 && styles.resendLinkDisabled,
              ]}
              allowFontScaling={true}
            >
              Resend {countdown > 0 ? `(${countdown}s)` : ''}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Demo Mode Info Banner */}
        <View style={styles.infoBanner}>
          <Text style={styles.infoText} allowFontScaling={true}>
            Demo mode: use code <Text style={styles.infoBold}>123456</Text>. Replace this check with your backend later.
          </Text>
        </View>

        {/* Verify Code Button */}
        <PrimaryButton
          title="Verify Code"
          onPress={() => handleVerify()}
          loading={loading}
          accessibilityLabel="Verify 6-digit code"
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
  destinationHighlight: {
    color: COLORS.deep,
    fontWeight: FONTS.weights.bold,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semibold,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 12,
  },
  resendText: {
    color: COLORS.muted,
    fontSize: FONTS.sizes.body - 1,
  },
  resendLink: {
    color: COLORS.brand,
    fontSize: FONTS.sizes.body - 1,
    fontWeight: FONTS.weights.bold,
  },
  resendLinkDisabled: {
    color: COLORS.placeholder,
    fontWeight: FONTS.weights.medium,
  },
  infoBanner: {
    backgroundColor: COLORS.mint,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginVertical: 16,
  },
  infoText: {
    color: COLORS.deep,
    fontSize: FONTS.sizes.sm,
    lineHeight: 20,
    textAlign: 'center',
  },
  infoBold: {
    fontWeight: FONTS.weights.bold,
  },
});
