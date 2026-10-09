import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { COLORS, FONTS } from '../../theme';
import SafeScreen from '../../components/auth/SafeScreen';
import AuthHeader from '../../components/auth/AuthHeader';
import AuthInput from '../../components/auth/AuthInput';
import PrimaryButton from '../../components/auth/PrimaryButton';
import SocialButtons from '../../components/auth/SocialButtons';
import PasswordStrengthMeter from '../../components/auth/PasswordStrengthMeter';
import Toast from '../../components/auth/Toast';
import { isEmail, hasRequiredComplexity } from '../../components/auth/validation';
import { useAuth } from '../../contexts/auth-context';

let RNSvg = null;
try {
  RNSvg = require('react-native-svg');
} catch (e) {}

/**
 * Role icon for Patient vs Caregiver
 */
function RoleIcon({ role, active }) {
  const color = active ? COLORS.white : COLORS.muted;
  const isWeb = Platform.OS === 'web';

  if (isWeb) {
    if (role === 'patient') {
      return (
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          style={{
            stroke: color,
            fill: 'none',
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
          }}
          aria-hidden="true"
        >
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
        </svg>
      );
    }
    // Caregiver heart
    return (
      <svg
        viewBox="0 0 24 24"
        width="18"
        height="18"
        style={{
          stroke: color,
          fill: 'none',
          strokeWidth: 2,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        }}
        aria-hidden="true"
      >
        <path d="M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z" />
      </svg>
    );
  }

  if (RNSvg) {
    const { Svg, Path, Circle } = RNSvg;
    if (role === 'patient') {
      return (
        <Svg
          viewBox="0 0 24 24"
          width={18}
          height={18}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <Circle cx="12" cy="8" r="4" />
          <Path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
        </Svg>
      );
    }
    return (
      <Svg
        viewBox="0 0 24 24"
        width={18}
        height={18}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z" />
      </Svg>
    );
  }

  return (
    <Text style={{ fontSize: 15, color }}>
      {role === 'patient' ? '👤' : '❤️'}
    </Text>
  );
}

/**
 * SignUpScreen Component
 * Patient & Caregiver registration with role switch, password strength meter,
 * terms check, and inline validation.
 */
export default function SignUpScreen({ navigation }) {
  const { register } = useAuth();
  const [role, setRole] = useState('patient'); // 'patient' | 'caregiver'
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAgreed, setTermsAgreed] = useState(false);

  // Field validation errors
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [termsError, setTermsError] = useState(false);

  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setToastVisible(true);
  };

  const handleNameChange = (text) => {
    setFullName(text);
    if (nameError) setNameError('');
  };

  const handleEmailChange = (text) => {
    setEmail(text);
    if (emailError) setEmailError('');
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

  const handleToggleTerms = () => {
    const nextVal = !termsAgreed;
    setTermsAgreed(nextVal);
    if (nextVal) setTermsError(false);
  };

  const validate = () => {
    let valid = true;

    // Name validation: min 2 characters
    if (fullName.trim().length < 2) {
      setNameError('Enter your full name');
      valid = false;
    } else {
      setNameError('');
    }

    // Email validation
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setEmailError('Enter your email');
      valid = false;
    } else if (!isEmail(cleanEmail)) {
      setEmailError('Enter a valid email address');
      valid = false;
    } else {
      setEmailError('');
    }

    // Password validation: min 8 chars, at least 2 of (upper+lower, number, symbol)
    if (!password) {
      setPasswordError('Enter a password');
      valid = false;
    } else if (password.length < 10) {
      setPasswordError('Use at least 10 characters');
      valid = false;
    } else if (!hasRequiredComplexity(password)) {
      setPasswordError('Add numbers or capital letters');
      valid = false;
    } else {
      setPasswordError('');
    }

    // Confirm password match
    if (!confirmPassword) {
      setConfirmError('Confirm your password');
      valid = false;
    } else if (password !== confirmPassword) {
      setConfirmError('Passwords do not match');
      valid = false;
    } else {
      setConfirmError('');
    }

    // Terms agreement
    if (!termsAgreed) {
      setTermsError(true);
      showToast('Please accept the Terms & Privacy Policy');
      valid = false;
    } else {
      setTermsError(false);
    }

    return valid;
  };

  const handleSignUp = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await register(fullName.trim(), email.trim(), password, role);
      showToast('Account created successfully!');

      setTimeout(() => {
        router.replace('/(patient)/complete-profile');
      }, 500);
    } catch (err) {
      showToast(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSelect = (provider) => {
    showToast(`${provider} sign-in will be connected to the backend later`);
  };

  return (
    <SafeScreen backgroundColor={COLORS.brand} barStyle="light-content">
      {/* Auth Header with curved wave */}
      <AuthHeader
        title="MediCare"
        subtitle="Create account to continue"
        logoSize={76}
      />

      <View style={styles.formBody}>
        {/* Role Selector: Patient vs Caregiver */}
        <View
          style={styles.roleContainer}
          accessibilityRole="radiogroup"
          accessibilityLabel="Select account type: Patient or Caregiver"
        >
          <TouchableOpacity
            style={[
              styles.roleOption,
              role === 'patient' && styles.roleOptionActive,
            ]}
            onPress={() => setRole('patient')}
            accessibilityRole="radio"
            accessibilityState={{ selected: role === 'patient' }}
            accessibilityLabel="Patient role"
          >
            <RoleIcon role="patient" active={role === 'patient'} />
            <Text
              style={[
                styles.roleText,
                role === 'patient' && styles.roleTextActive,
              ]}
              allowFontScaling={true}
            >
              Patient
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.roleOption,
              role === 'caregiver' && styles.roleOptionActive,
            ]}
            onPress={() => setRole('caregiver')}
            accessibilityRole="radio"
            accessibilityState={{ selected: role === 'caregiver' }}
            accessibilityLabel="Caregiver role"
          >
            <RoleIcon role="caregiver" active={role === 'caregiver'} />
            <Text
              style={[
                styles.roleText,
                role === 'caregiver' && styles.roleTextActive,
              ]}
              allowFontScaling={true}
            >
              Caregiver
            </Text>
          </TouchableOpacity>
        </View>

        {/* Full Name Field */}
        <AuthInput
          icon="user"
          placeholder="Full Name"
          value={fullName}
          onChangeText={handleNameChange}
          error={nameError}
          autoComplete="name"
          accessibilityLabel="Full Name"
        />

        {/* Email Field */}
        <AuthInput
          icon="mail"
          placeholder="Email ID"
          value={email}
          onChangeText={handleEmailChange}
          error={emailError}
          keyboardType="email-address"
          autoComplete="email"
          accessibilityLabel="Email ID"
        />

        {/* Password Field + 4-bar Strength Meter */}
        <AuthInput
          icon="lock"
          placeholder="Password"
          value={password}
          onChangeText={handlePasswordChange}
          error={passwordError}
          isPassword={true}
          autoComplete="new-password"
          accessibilityLabel="Password"
        />
        <PasswordStrengthMeter password={password} />

        {/* Confirm Password Field */}
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

        {/* Terms and Privacy Checkbox */}
        <TouchableOpacity
          style={[styles.termsRow, termsError && styles.termsRowError]}
          onPress={handleToggleTerms}
          activeOpacity={0.8}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: termsAgreed }}
          accessibilityLabel="I agree to Terms & Privacy Policy"
        >
          <View
            style={[
              styles.checkbox,
              termsAgreed && styles.checkboxChecked,
              termsError && styles.checkboxError,
            ]}
          >
            {termsAgreed && <Text style={styles.checkIcon}>✓</Text>}
          </View>
          <Text style={styles.termsText} allowFontScaling={true}>
            I agree to{' '}
            <Text style={styles.termsHighlight}>Terms & Privacy Policy</Text>
          </Text>
        </TouchableOpacity>

        {/* Submit Sign Up Button */}
        <PrimaryButton
          title="Sign Up"
          onPress={handleSignUp}
          loading={loading}
          accessibilityLabel="Sign Up for MediCare"
        />

        {/* Social Sign-In Buttons */}
        <SocialButtons onSelectProvider={handleSocialSelect} />

        {/* Already have an account? Sign In */}
        <View style={styles.switchRow}>
          <Text style={styles.switchText} allowFontScaling={true}>
            Already have an account?
          </Text>
          <TouchableOpacity
            onPress={() => navigation?.navigate('Login')}
            accessibilityRole="button"
            accessibilityLabel="Already have an account? Sign In"
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.switchLink} allowFontScaling={true}>
              Sign In
            </Text>
          </TouchableOpacity>
        </View>
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
    flexGrow: 1,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 28,
    paddingTop: 8,
    paddingBottom: 40,
  },
  roleContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: 20,
    padding: 5,
    marginBottom: 16,
    gap: 6,
  },
  roleOption: {
    flex: 1,
    height: 44,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'transparent',
  },
  roleOptionActive: {
    backgroundColor: COLORS.brand,
    shadowColor: COLORS.brand,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 4,
  },
  roleText: {
    color: COLORS.muted,
    fontSize: FONTS.sizes.sm + 1,
    fontWeight: FONTS.weights.semibold,
  },
  roleTextActive: {
    color: COLORS.white,
    fontWeight: FONTS.weights.bold,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
    marginBottom: 20,
    paddingVertical: 4,
  },
  termsRowError: {
    // highlighted if error
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: '#C5D0CA',
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.brand,
    borderColor: COLORS.brand,
  },
  checkboxError: {
    borderColor: COLORS.danger,
    backgroundColor: COLORS.dangerBg,
  },
  checkIcon: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '800',
    marginTop: -2,
  },
  termsText: {
    fontSize: FONTS.sizes.sm + 0.5,
    color: COLORS.text,
    fontWeight: FONTS.weights.regular,
  },
  termsHighlight: {
    color: COLORS.brand,
    fontWeight: FONTS.weights.semibold,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 6,
  },
  switchText: {
    color: COLORS.muted,
    fontSize: FONTS.sizes.body - 1,
    fontWeight: FONTS.weights.regular,
  },
  switchLink: {
    color: COLORS.brand,
    fontSize: FONTS.sizes.body - 1,
    fontWeight: FONTS.weights.heavy,
  },
  authenticatedBanner: {
    backgroundColor: '#E7F7EF',
    borderColor: '#B9E8D1',
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  authBannerTextContainer: {
    flex: 1,
  },
  authBannerTitle: {
    fontSize: FONTS.sizes.sm + 0.5,
    fontWeight: FONTS.weights.bold,
    color: '#0D5C3A',
  },
  authBannerSubtitle: {
    fontSize: FONTS.sizes.caption,
    color: '#3B735B',
    marginTop: 2,
  },
  authBannerButton: {
    backgroundColor: COLORS.brand,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  authBannerButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.caption + 1,
    fontWeight: FONTS.weights.bold,
  },
});
