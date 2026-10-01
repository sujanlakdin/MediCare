import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { COLORS, FONTS } from '../../theme';
import SafeScreen from '../../components/auth/SafeScreen';
import AuthHeader from '../../components/auth/AuthHeader';
import AuthInput from '../../components/auth/AuthInput';
import PrimaryButton from '../../components/auth/PrimaryButton';
import SocialButtons from '../../components/auth/SocialButtons';
import Toast from '../../components/auth/Toast';
import { isValidEmailOrPhone } from '../../components/auth/validation';
import authService from '../../services/authService';

/**
 * LoginScreen Component
 * Authenticates patient or caregiver via Email or Sri Lankan phone number.
 */
export default function LoginScreen({ navigation }) {
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
    } else if (!isValidEmailOrPhone(cleanId)) {
      setIdError('Enter a valid email or a Sri Lankan phone number');
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
      const response = await authService.login(identifier, password);
      showToast(response.message || 'Login successful!');
      // Route to user home / profile if available or demo success
      setTimeout(() => {
        if (navigation?.navigate) {
          // If MyProfile route exists in root, navigate to it; otherwise show success
          try {
            navigation.navigate('MyProfile');
          } catch (e) {
            // Navigator stays on login with toast
          }
        }
      }, 700);
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
        {/* Email or Phone Field */}
        <AuthInput
          icon="user"
          placeholder="Email or Phone"
          value={identifier}
          onChangeText={handleIdChange}
          error={idError}
          autoComplete="username"
          accessibilityLabel="Email or Phone number"
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
});
