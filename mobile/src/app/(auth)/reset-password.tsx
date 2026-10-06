import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, METRICS } from '../../theme';
import SafeScreen from '../../components/auth/SafeScreen';
import AuthHeader from '../../components/auth/AuthHeader';
import PrimaryButton from '../../components/auth/PrimaryButton';
import StepIndicator from '../../components/auth/StepIndicator';
import Toast from '../../components/auth/Toast';
import OtpInput from '../../components/auth/OtpInput';
import PasswordStrengthMeter from '../../components/auth/PasswordStrengthMeter';
import authService from '../../services/authService';

/**
 * ResetPasswordScreen (Step 2 of 2)
 * Mobile frontend screen to input the 6-digit OTP and set a new password.
 */
export default function ResetPasswordRoute() {
  const params = useLocalSearchParams<{ phone?: string; devOtp?: string }>();
  const phone = (params.phone as string) || '+94 77 123 4567';
  const initialDevOtp = (params.devOtp as string) || '';

  // OTP digits state (6 digits)
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [isOtpError, setIsOtpError] = useState(false);

  // Password fields
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');

  // Status & loading
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // 45s resend timer
  const [countdown, setCountdown] = useState(45);
  const timerRef = useRef<any>(null);

  // Autofill dev OTP if provided
  useEffect(() => {
    if (initialDevOtp && initialDevOtp.length === 6) {
      const codeDigits = initialDevOtp.split('').slice(0, 6);
      setDigits(codeDigits);
    }
  }, [initialDevOtp]);

  // Start countdown on mount
  useEffect(() => {
    startCountdown();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startCountdown = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCountdown(45);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
  };

  const handleDigitsChange = (newDigits: string[]) => {
    setDigits(newDigits);
    if (otpError || isOtpError) {
      setOtpError('');
      setIsOtpError(false);
    }
  };

  const handleAutofillDevOtp = (code: string) => {
    if (code && code.length === 6) {
      setDigits(code.split('').slice(0, 6));
      setOtpError('');
      setIsOtpError(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    try {
      const response = await authService.sendResetCode(phone);
      startCountdown();
      showToast(response.message || 'A new 6-digit code has been sent!');
      if (response.otp) {
        handleAutofillDevOtp(response.otp);
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to resend code.');
    }
  };

  const validate = (): boolean => {
    let valid = true;

    // Check OTP
    const otpCode = digits.join('').trim();
    if (otpCode.length < 6) {
      setOtpError('Enter the full 6-digit verification code');
      setIsOtpError(true);
      valid = false;
    } else {
      setOtpError('');
      setIsOtpError(false);
    }

    // Check Password
    if (!newPassword) {
      setPasswordError('Please enter a new password');
      valid = false;
    } else if (newPassword.length < 6) {
      setPasswordError('Password must be at least 10 characters');
      valid = false;
    } else {
      setPasswordError('');
    }

    // Check Confirm Password
    if (!confirmPassword) {
      setConfirmError('Please confirm your new password');
      valid = false;
    } else if (newPassword !== confirmPassword) {
      setConfirmError('Passwords do not match');
      valid = false;
    } else {
      setConfirmError('');
    }

    return valid;
  };

  const handleResetPassword = async () => {
    if (!validate()) return;

    const otpCode = digits.join('').trim();
    setLoading(true);
    try {
      const result = await authService.resetPassword(phone, newPassword, otpCode);
      setIsSuccess(true);
      showToast(result.message || 'Password successfully updated!');
    } catch (err: any) {
      const msg = err?.message || 'Failed to reset password. Please verify the code.';
      if (msg.toLowerCase().includes('code') || msg.toLowerCase().includes('otp')) {
        setOtpError(msg);
        setIsOtpError(true);
      } else {
        setPasswordError(msg);
      }
      showToast(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.replace('/(auth)/login' as any);
  };

  const handleEditPhone = () => {
    router.back();
  };

  // Render Success Confirmation View
  if (isSuccess) {
    return (
      <SafeScreen backgroundColor={COLORS.brand} barStyle="light-content">
        <View style={styles.successContainer}>
          <View style={styles.successCard}>
            <View style={styles.successIconCircle}>
              <Ionicons name="checkmark-sharp" size={44} color={COLORS.surface} />
            </View>

            <Text style={styles.successTitle} allowFontScaling={true}>
              Password Updated!
            </Text>

            <Text style={styles.successMessage} allowFontScaling={true}>
              Your MediCare account password has been safely updated. You can now log in using your new credentials.
            </Text>

            <View style={styles.successButtonWrapper}>
              <PrimaryButton
                title="Back to Login"
                onPress={handleBackToLogin}
                accessibilityLabel="Go to Login screen"
              />
            </View>
          </View>
        </View>
      </SafeScreen>
    );
  }

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
          {/* Header with back navigation */}
          <AuthHeader
            title="MediCare"
            subtitle="Verify & set new password"
            onBack={handleBackToLogin}
            logoSize={72}
          />

          <View style={styles.contentBody}>
            {/* Step Indicator (2 of 2) */}
            <View style={styles.stepContainer}>
              <StepIndicator currentStep={2} totalSteps={2} />
              <Text style={styles.stepLabel} allowFontScaling={true}>
                Step 2 of 2: OTP Verification & New Password
              </Text>
            </View>

            {/* Target Phone Badge */}
            <View style={styles.phoneBadgeContainer}>
              <View style={styles.phoneBadge}>
                <Ionicons name="phone-portrait-outline" size={16} color={COLORS.brandDark} style={{ marginRight: 6 }} />
                <Text style={styles.phoneBadgeText} allowFontScaling={true}>
                  Code sent to <Text style={styles.phoneBadgeBold}>{phone}</Text>
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleEditPhone}
                style={styles.editPhoneBtn}
                accessibilityRole="button"
                accessibilityLabel="Change phone number"
              >
                <Text style={styles.editPhoneText} allowFontScaling={true}>
                  Edit
                </Text>
              </TouchableOpacity>
            </View>

            {/* Dev Mode OTP Banner (for testing ease) */}
            {initialDevOtp ? (
              <TouchableOpacity
                style={styles.devOtpCard}
                onPress={() => handleAutofillDevOtp(initialDevOtp)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Tap to autofill test OTP"
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.devOtpCardTitle}>Testing Mode Code: {initialDevOtp}</Text>
                  <Text style={styles.devOtpCardSubtitle}>Tap here to autofill the 6-digit code</Text>
                </View>
                <Ionicons name="arrow-forward-circle" size={24} color={COLORS.brand} />
              </TouchableOpacity>
            ) : null}

            {/* Section 1: 6-Digit OTP Input */}
            <View style={styles.section}>
              <Text style={styles.inputLabel} allowFontScaling={true}>
                Enter 6-Digit Code
              </Text>

              <OtpInput
                code={digits}
                onChangeCode={handleDigitsChange}
                isError={isOtpError}
              />

              {Boolean(otpError) && (
                <View style={styles.errorRow}>
                  <Ionicons name="alert-circle" size={16} color={COLORS.danger} />
                  <Text style={styles.errorText} allowFontScaling={true}>
                    {otpError}
                  </Text>
                </View>
              )}

              {/* Resend Countdown */}
              <View style={styles.resendRow}>
                {countdown > 0 ? (
                  <Text style={styles.countdownText} allowFontScaling={true}>
                    Resend code in <Text style={styles.countdownBold}>{countdown}s</Text>
                  </Text>
                ) : (
                  <TouchableOpacity
                    onPress={handleResendOtp}
                    accessibilityRole="button"
                    accessibilityLabel="Resend 6-digit OTP code"
                  >
                    <Text style={styles.resendLink} allowFontScaling={true}>
                      Resend Code
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Section 2: New Password */}
            <View style={styles.section}>
              <Text style={styles.inputLabel} allowFontScaling={true}>
                New Password
              </Text>
              <View style={[styles.passwordField, Boolean(passwordError) && styles.fieldError]}>
                <Ionicons name="lock-closed-outline" size={20} color={COLORS.brand} style={{ marginRight: 10 }} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter new password (min. 6 chars)"
                  placeholderTextColor={COLORS.placeholder}
                  secureTextEntry={!showPassword}
                  value={newPassword}
                  onChangeText={(val) => {
                    setNewPassword(val);
                    if (passwordError) setPasswordError('');
                  }}
                  autoCapitalize="none"
                  accessibilityLabel="New password input"
                  allowFontScaling={true}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={COLORS.muted}
                  />
                </TouchableOpacity>
              </View>

              {/* Password Strength Meter */}
              <PasswordStrengthMeter password={newPassword} />

              {Boolean(passwordError) && (
                <View style={styles.errorRow}>
                  <Ionicons name="alert-circle" size={16} color={COLORS.danger} />
                  <Text style={styles.errorText} allowFontScaling={true}>
                    {passwordError}
                  </Text>
                </View>
              )}
            </View>

            {/* Section 3: Confirm New Password */}
            <View style={styles.section}>
              <Text style={styles.inputLabel} allowFontScaling={true}>
                Confirm New Password
              </Text>
              <View style={[styles.passwordField, Boolean(confirmError) && styles.fieldError]}>
                <Ionicons name="shield-outline" size={20} color={COLORS.brand} style={{ marginRight: 10 }} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Re-type new password"
                  placeholderTextColor={COLORS.placeholder}
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={(val) => {
                    setConfirmPassword(val);
                    if (confirmError) setConfirmError('');
                  }}
                  autoCapitalize="none"
                  accessibilityLabel="Confirm new password input"
                  allowFontScaling={true}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeBtn}
                  accessibilityRole="button"
                  accessibilityLabel={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={COLORS.muted}
                  />
                </TouchableOpacity>
              </View>

              {/* Match Indicator */}
              {confirmPassword.length > 0 && newPassword === confirmPassword && (
                <View style={styles.matchRow}>
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.accent} />
                  <Text style={styles.matchText} allowFontScaling={true}>
                    Passwords match
                  </Text>
                </View>
              )}

              {Boolean(confirmError) && (
                <View style={styles.errorRow}>
                  <Ionicons name="alert-circle" size={16} color={COLORS.danger} />
                  <Text style={styles.errorText} allowFontScaling={true}>
                    {confirmError}
                  </Text>
                </View>
              )}
            </View>

            {/* Submit Button */}
            <View style={styles.buttonWrapper}>
              <PrimaryButton
                title="Reset Password"
                onPress={handleResetPassword}
                loading={loading}
                accessibilityLabel="Confirm and reset password"
              />
            </View>

            {/* Cancel / Return link */}
            <View style={styles.cancelRow}>
              <TouchableOpacity
                onPress={handleBackToLogin}
                accessibilityRole="button"
                accessibilityLabel="Cancel and return to Login"
              >
                <Text style={styles.cancelLink} allowFontScaling={true}>
                  Cancel and Return to Sign In
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Toast Notification */}
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
  phoneBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F3F9F5',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2F0E7',
  },
  phoneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  phoneBadgeText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text,
    fontFamily: FONTS.family,
  },
  phoneBadgeBold: {
    fontWeight: FONTS.weights.bold as any,
    color: COLORS.deep,
  },
  editPhoneBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  editPhoneText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold as any,
    color: COLORS.brand,
    fontFamily: FONTS.family,
    textDecorationLine: 'underline',
  },
  devOtpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF7F1',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#C8EAD9',
  },
  devOtpCardTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold as any,
    color: COLORS.brandDark,
    fontFamily: FONTS.family,
  },
  devOtpCardSubtitle: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.muted,
    fontFamily: FONTS.family,
    marginTop: 2,
  },
  section: {
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
  passwordField: {
    flexDirection: 'row',
    alignItems: 'center',
    height: METRICS.inputHeight,
    backgroundColor: '#F8FAF8',
    borderRadius: METRICS.inputRadius,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
  },
  fieldError: {
    borderColor: COLORS.danger,
    backgroundColor: '#FFF8F8',
  },
  textInput: {
    flex: 1,
    height: '100%',
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    fontFamily: FONTS.family,
  },
  eyeBtn: {
    padding: 8,
  },
  resendRow: {
    alignItems: 'center',
    marginTop: 12,
  },
  countdownText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.muted,
    fontFamily: FONTS.family,
  },
  countdownBold: {
    fontWeight: FONTS.weights.bold as any,
    color: COLORS.brand,
  },
  resendLink: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold as any,
    color: COLORS.brand,
    fontFamily: FONTS.family,
    textDecorationLine: 'underline',
  },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginLeft: 4,
  },
  matchText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.accent,
    fontFamily: FONTS.family,
    marginLeft: 4,
    fontWeight: FONTS.weights.medium as any,
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
  buttonWrapper: {
    marginTop: 10,
    marginBottom: 16,
  },
  cancelRow: {
    alignItems: 'center',
    marginTop: 4,
  },
  cancelLink: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.muted,
    fontFamily: FONTS.family,
    textDecorationLine: 'underline',
  },
  // Success Card Styles
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: COLORS.surface,
  },
  successCard: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    shadowColor: COLORS.shadowDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E8F3ED',
  },
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.brand,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: COLORS.brand,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  successTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold as any,
    color: COLORS.deep,
    fontFamily: FONTS.family,
    marginBottom: 12,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: FONTS.sizes.body,
    color: COLORS.muted,
    fontFamily: FONTS.family,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  successButtonWrapper: {
    width: '100%',
  },
});
