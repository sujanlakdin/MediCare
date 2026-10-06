import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, METRICS } from '../../theme';
import SafeScreen from '../../components/auth/SafeScreen';
import AuthHeader from '../../components/auth/AuthHeader';
import PrimaryButton from '../../components/auth/PrimaryButton';
import StepIndicator from '../../components/auth/StepIndicator';
import Toast from '../../components/auth/Toast';
import { isEmail } from '../../components/auth/validation';
import authService from '../../services/authService';

/**
 * ForgotPasswordScreen (Step 1 of 2)
 * Allows the user to enter their registered email or phone number and request a 6-digit OTP.
 */
export default function ForgotPasswordRoute() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+94');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [devOtpNotice, setDevOtpNotice] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
  };

  const handlePhoneChange = (text: string) => {
    // Keep numbers and spaces/plus
    setPhoneNumber(text);
    if (error) setError('');
  };

  const fillDemoPhone = () => {
    setCountryCode('+94');
    setPhoneNumber('77 123 4567');
    setError('');
  };

  const handleRequestOtp = async () => {
    const rawIdentifier = phoneNumber.trim();
    if (!rawIdentifier) {
      setError('Please enter your registered email or phone number');
      return;
    }

    let identifier = rawIdentifier;
    if (rawIdentifier.includes('@')) {
      if (!isEmail(rawIdentifier)) {
        setError('Please enter a valid email address');
        return;
      }
    } else {
      const digitsOnly = rawIdentifier.replace(/\D/g, '');
      if (digitsOnly.length < 7) {
        setError('Please enter a valid email or phone number');
        return;
      }
      if (!identifier.startsWith('+')) {
        identifier = identifier.startsWith('0')
          ? `${countryCode} ${identifier.slice(1)}`
          : `${countryCode} ${identifier}`;
      }
    }

    setLoading(true);
    setError('');
    try {
      const response = await authService.sendResetCode(identifier);

      const otp = response.otp || response.demoCode;
      if (otp) {
        setDevOtpNotice(`Dev OTP: ${otp}`);
      }

      showToast(response.message || 'OTP verification code sent!');

      // Navigate to Reset Password screen with phone parameter
      setTimeout(() => {
        router.push({
          pathname: '/(auth)/reset-password',
          params: {
            phone: identifier,
            devOtp: otp || '',
          },
        } as any);
      }, 700);
    } catch (err: any) {
      const errMsg = err?.message || 'Failed to send OTP. Please check your phone number.';
      setError(errMsg);
      showToast(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.replace('/(auth)/login' as any);
  };

  return (
    <SafeScreen backgroundColor={COLORS.brand} barStyle="light-content">
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* MediCare Auth Header with Back Button */}
          <AuthHeader
            title="MediCare"
            subtitle="Reset your password"
            onBack={handleBackToLogin}
            logoSize={72}
          />

          <View style={styles.contentBody}>
            {/* Step Indicator (1 of 2) */}
            <View style={styles.stepContainer}>
              <StepIndicator currentStep={1} totalSteps={2} />
              <Text style={styles.stepLabel} allowFontScaling={true}>
                Step 1 of 2: Phone Verification
              </Text>
            </View>

            {/* Title & Guidance */}
            <View style={styles.titleSection}>
              <Text style={styles.heading} allowFontScaling={true}>
                Forgot Password?
              </Text>
              <Text style={styles.subheading} allowFontScaling={true}>
                Enter your registered email or phone number. We will send a 6-digit OTP code to safely reset your password.
              </Text>
            </View>

            {/* Quick Demo Fill Helper */}
            <TouchableOpacity
              style={styles.demoChip}
              onPress={fillDemoPhone}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Fill demo phone number"
            >
              <Ionicons name="sparkles" size={15} color={COLORS.brand} style={{ marginRight: 6 }} />
              <Text style={styles.demoChipText} allowFontScaling={true}>
                Use Demo Phone: +94 77 123 4567
              </Text>
            </TouchableOpacity>

            {/* Email or Phone Input Row */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel} allowFontScaling={true}>
                Email or Phone Number
              </Text>
              <View style={[styles.phoneRow, Boolean(error) && styles.phoneRowError]}>
                {!phoneNumber.includes('@') && (
                  <View style={styles.countryCodeBadge}>
                    <Text style={styles.flagIcon}>🇱🇰</Text>
                    <Text style={styles.countryCodeText} allowFontScaling={true}>
                      {countryCode}
                    </Text>
                  </View>
                )}

                <TextInput
                  style={styles.phoneInput}
                  placeholder="Email address or phone number"
                  placeholderTextColor={COLORS.placeholder}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={phoneNumber}
                  onChangeText={handlePhoneChange}
                  returnKeyType="done"
                  onSubmitEditing={handleRequestOtp}
                  accessibilityLabel="Email address or phone number"
                  accessibilityHint="Enter your registered email address or phone number"
                  allowFontScaling={true}
                />

                {phoneNumber.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setPhoneNumber('')}
                    style={styles.clearBtn}
                    accessibilityRole="button"
                    accessibilityLabel="Clear email or phone number"
                  >
                    <Ionicons name="close-circle" size={18} color={COLORS.muted} />
                  </TouchableOpacity>
                )}
              </View>

              {/* Error Message */}
              {Boolean(error) && (
                <View style={styles.errorRow}>
                  <Ionicons name="alert-circle" size={16} color={COLORS.danger} />
                  <Text style={styles.errorText} allowFontScaling={true}>
                    {error}
                  </Text>
                </View>
              )}
            </View>

            {/* Dev Mode OTP Banner (if generated) */}
            {devOtpNotice && (
              <View style={styles.devBanner}>
                <Ionicons name="code-slash-outline" size={18} color={COLORS.brand} style={{ marginRight: 6 }} />
                <Text style={styles.devBannerText} allowFontScaling={true}>
                  {devOtpNotice} (Valid for 5 minutes)
                </Text>
              </View>
            )}

            {/* Request OTP Button */}
            <View style={styles.buttonWrapper}>
              <PrimaryButton
                title="Send Verification Code"
                onPress={handleRequestOtp}
                loading={loading}
                accessibilityLabel="Send OTP verification code"
              />
            </View>

            {/* Security Note for Elderly Users */}
            <View style={styles.securityBox}>
              <Ionicons name="shield-checkmark-outline" size={18} color={COLORS.brand} style={{ marginRight: 8 }} />
              <Text style={styles.securityText} allowFontScaling={true}>
                Your data is protected. MediCare will never ask for your password over phone or SMS.
              </Text>
            </View>

            {/* Return to Login link */}
            <View style={styles.loginRow}>
              <Text style={styles.rememberText} allowFontScaling={true}>
                Remember your password?{' '}
              </Text>
              <TouchableOpacity
                onPress={handleBackToLogin}
                accessibilityRole="button"
                accessibilityLabel="Go back to Login"
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Text style={styles.loginLink} allowFontScaling={true}>
                  Log In
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Floating Toast Notice */}
      <Toast
        message={toastMessage}
        visible={toastVisible}
        onDismiss={() => setToastVisible(false)}
      />
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: COLORS.surface,
  },
  contentBody: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 40,
    backgroundColor: COLORS.surface,
  },
  stepContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  stepLabel: {
    marginTop: 8,
    fontSize: FONTS.sizes.sm,
    color: COLORS.muted,
    fontFamily: FONTS.family,
    fontWeight: FONTS.weights.medium as any,
  },
  titleSection: {
    marginBottom: 20,
  },
  heading: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.bold as any,
    color: COLORS.deep,
    fontFamily: FONTS.family,
    marginBottom: 8,
    textAlign: 'center',
  },
  subheading: {
    fontSize: FONTS.sizes.body,
    color: COLORS.muted,
    fontFamily: FONTS.family,
    lineHeight: 22,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  demoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: COLORS.mint,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#C7EAD8',
  },
  demoChipText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.brandDark,
    fontFamily: FONTS.family,
    fontWeight: FONTS.weights.semibold as any,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semibold as any,
    color: COLORS.text,
    fontFamily: FONTS.family,
    marginBottom: 8,
    marginLeft: 4,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: METRICS.inputHeight,
    backgroundColor: '#F8FAF8',
    borderRadius: METRICS.inputRadius,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
  },
  phoneRowError: {
    borderColor: COLORS.danger,
    backgroundColor: '#FFF8F8',
  },
  countryCodeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
    marginRight: 12,
  },
  flagIcon: {
    fontSize: 18,
    marginRight: 4,
  },
  countryCodeText: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold as any,
    color: COLORS.text,
    fontFamily: FONTS.family,
  },
  phoneInput: {
    flex: 1,
    height: '100%',
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    fontFamily: FONTS.family,
  },
  clearBtn: {
    padding: 6,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginLeft: 4,
  },
  errorText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.danger,
    fontFamily: FONTS.family,
    marginLeft: 4,
  },
  devBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDF8F3',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.brand,
  },
  devBannerText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.deep,
    fontFamily: FONTS.family,
    fontWeight: FONTS.weights.medium as any,
  },
  buttonWrapper: {
    marginTop: 8,
    marginBottom: 20,
  },
  securityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4FBF7',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2F3EA',
    marginBottom: 24,
  },
  securityText: {
    flex: 1,
    fontSize: FONTS.sizes.xs,
    color: COLORS.muted,
    fontFamily: FONTS.family,
    lineHeight: 18,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  rememberText: {
    fontSize: FONTS.sizes.body,
    color: COLORS.muted,
    fontFamily: FONTS.family,
  },
  loginLink: {
    fontSize: FONTS.sizes.body,
    fontWeight: FONTS.weights.bold as any,
    color: COLORS.brand,
    fontFamily: FONTS.family,
    textDecorationLine: 'underline',
  },
});
