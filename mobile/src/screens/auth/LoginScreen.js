import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { COLORS, FONTS } from '../../theme';
import SafeScreen from '../../components/auth/SafeScreen';
import AuthHeader from '../../components/auth/AuthHeader';
import AuthInput from '../../components/auth/AuthInput';
import PrimaryButton from '../../components/auth/PrimaryButton';
import SocialButtons from '../../components/auth/SocialButtons';
import Toast from '../../components/auth/Toast';
import { isEmail } from '../../components/auth/validation';
import { useAuth } from '../../contexts/auth-context';

/**
 * LoginScreen Component
 * Authenticates patient or caregiver via Email or Sri Lankan phone number.
 */
export default function LoginScreen({ navigation }) {
  const { signIn } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  // Inline validation errors
  const [idError, setIdError] = useState('');
  const [pwError, setPwError] = useState('');

  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setToastVisible(true);
  };

  const handleIdChange = (text) => {
    setIdentifier(text);
    if (idError) setIdError('');
  };

  const handlePwChange = (text) => {
    setPassword(text);
    if (pwError) setPwError('');
  };

  const validate = () => {
    let valid = true;
    const cleanId = identifier.trim();

    if (!cleanId) {
      setIdError('Enter your email or phone number');
      valid = false;
    } else if (!isEmail(cleanId)) {
      setIdError('Enter a valid email address');
      valid = false;
    } else {
      setIdError('');
    }

    if (!password) {
      setPwError('Enter your password');
      valid = false;
    } else if (password.length < 6) {
      setPwError('Password must be at least 6 characters');
      valid = false;
    } else {
      setPwError('');
    }

    return valid;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await signIn(identifier.trim(), password);
      showToast('Login successful!');
      setTimeout(() => {
        router.replace('/');
      }, 600);
    } catch (err) {
      showToast(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSelect = (provider) => {
    showToast(`${provider} sign-in will be connected to the backend later`);
  };

  return (
    <SafeScreen backgroundColor={COLORS.brand} barStyle="light-content">
      {/* Auth Header with Curved Wave and Logo */}
      <AuthHeader
        title="MediCare"
        subtitle="Sign in to continue"
        logoSize={76}
      />

      {/* Main Form Body */}
      <View style={styles.formBody}>
        {/* Email Field */}
        <AuthInput
          icon="user"
          placeholder="Email"
          value={identifier}
          onChangeText={handleIdChange}
          error={idError}
          autoComplete="username"
          accessibilityLabel="Email address"
        />

        {/* Password Field */}
        <AuthInput
          icon="lock"
          placeholder="Password"
          value={password}
          onChangeText={handlePwChange}
          error={pwError}
          isPassword={true}
          autoComplete="current-password"
          accessibilityLabel="Password"
        />

        {/* Forgot Password Link */}
        <View style={styles.forgotRow}>
          <TouchableOpacity
            onPress={() => navigation?.navigate('ForgotPassword')}
            accessibilityRole="button"
            accessibilityLabel="Forgot password? Tap to reset."
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.forgotLink} allowFontScaling={true}>
              Forgot password?
            </Text>
          </TouchableOpacity>
        </View>

        {/* Submit Login Button */}
        <PrimaryButton
          title="Login"
          onPress={handleLogin}
          loading={loading}
          accessibilityLabel="Login to MediCare"
        />

        {/* Social Sign-In Buttons */}
        <SocialButtons onSelectProvider={handleSocialSelect} />

        {/* Don't have an account? Sign Up Switch */}
        <View style={styles.switchRow}>
          <Text style={styles.switchText} allowFontScaling={true}>
            Don't have an account?
          </Text>
          <TouchableOpacity
            onPress={() => navigation?.navigate('SignUp')}
            accessibilityRole="button"
            accessibilityLabel="Don't have an account? Sign Up"
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.switchLink} allowFontScaling={true}>
              Sign Up
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
    flex: 1,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 28,
    paddingTop: 8,
    paddingBottom: 40,
  },
  forgotRow: {
    alignItems: 'flex-end',
    marginTop: -2,
    marginBottom: 20,
    paddingHorizontal: 2,
  },
  forgotLink: {
    color: COLORS.brand,
    fontSize: FONTS.sizes.sm + 0.5,
    fontWeight: FONTS.weights.bold,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 24,
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
