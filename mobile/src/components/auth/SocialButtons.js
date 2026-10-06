import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { COLORS, FONTS } from '../../theme';

let RNSvg = null;
try {
  RNSvg = require('react-native-svg');
} catch (e) {}

/**
 * Social Provider Icon (Google, Apple, Facebook)
 */
function ProviderIcon({ provider }) {
  const isWeb = Platform.OS === 'web';

  if (isWeb) {
    if (provider === 'google') {
      return (
        <svg viewBox="0 0 48 48" width="26" height="26" aria-hidden="true">
          <path
            fill="#EA4335"
            d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"
          />
          <path
            fill="#4285F4"
            d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.4 5.7c4.3-4 6.9-9.9 6.9-17.1z"
          />
          <path
            fill="#FBBC05"
            d="M10.5 28.7a14.5 14.5 0 010-9.4l-7.9-6.1a24 24 0 000 21.6z"
          />
          <path
            fill="#34A853"
            d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.7c-2.1 1.4-4.8 2.3-8.5 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"
          />
        </svg>
      );
    }
    if (provider === 'apple') {
      return (
        <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
          <path
            fill="#111111"
            d="M16.4 12.6c0-2.4 2-3.5 2.1-3.6-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9s-1.9-.9-3.200-.8c-1.600 0-3.100 1-4 2.400-1.700 3-.4 7.300 1.200 9.700.8 1.200 1.800 2.500 3 2.400 1.200 0 1.700-.8 3.100-.8s1.900.8 3.200.7c1.300 0 2.200-1.200 3-2.400.9-1.400 1.300-2.700 1.300-2.800-.1 0-2.500-1-2.500-3.800zM14 5.300c.7-.8 1.100-1.900 1-3-1 0-2.100.7-2.800 1.500-.6.700-1.200 1.800-1 2.900 1.100.1 2.100-.6 2.800-1.400z"
          />
        </svg>
      );
    }
    // Facebook
    return (
      <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
        <circle cx="12" cy="12" r="11" fill="#1877F2" />
        <path
          fill="#FFFFFF"
          d="M13.4 22v-8h2.7l.4-3.1h-3.1V9c0-.9.3-1.5 1.6-1.5h1.7V4.7c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4.1v2.2H7.6V14h2.7v8z"
        />
      </svg>
    );
  }

  if (RNSvg) {
    const { Svg, Path, Circle } = RNSvg;
    if (provider === 'google') {
      return (
        <Svg viewBox="0 0 48 48" width={26} height={26}>
          <Path
            fill="#EA4335"
            d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"
          />
          <Path
            fill="#4285F4"
            d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.4 5.7c4.3-4 6.9-9.9 6.9-17.1z"
          />
          <Path
            fill="#FBBC05"
            d="M10.5 28.7a14.5 14.5 0 010-9.4l-7.9-6.1a24 24 0 000 21.6z"
          />
          <Path
            fill="#34A853"
            d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.7c-2.1 1.4-4.8 2.3-8.5 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"
          />
        </Svg>
      );
    }
    if (provider === 'apple') {
      return (
        <Svg viewBox="0 0 24 24" width={24} height={24}>
          <Path
            fill="#111111"
            d="M16.4 12.6c0-2.4 2-3.5 2.1-3.6-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9s-1.9-.9-3.200-.8c-1.600 0-3.100 1-4 2.400-1.700 3-.4 7.300 1.200 9.700.8 1.200 1.800 2.500 3 2.400 1.200 0 1.700-.8 3.100-.8s1.900.8 3.200.7c1.300 0 2.200-1.200 3-2.400.9-1.400 1.300-2.700 1.300-2.800-.1 0-2.500-1-2.500-3.800zM14 5.300c.7-.8 1.100-1.900 1-3-1 0-2.100.7-2.800 1.500-.6.700-1.200 1.800-1 2.900 1.100.1 2.100-.6 2.800-1.400z"
          />
        </Svg>
      );
    }
    return (
      <Svg viewBox="0 0 24 24" width={26} height={26}>
        <Circle cx="12" cy="12" r="11" fill="#1877F2" />
        <Path
          fill="#FFFFFF"
          d="M13.4 22v-8h2.7l.4-3.1h-3.1V9c0-.9.3-1.5 1.6-1.5h1.7V4.7c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4.1v2.2H7.6V14h2.7v8z"
        />
      </Svg>
    );
  }

  // Pure React Native text / logo icon fallback
  if (provider === 'google') {
    return <Text style={{ fontSize: 20, fontWeight: '700', color: '#EA4335' }}>G</Text>;
  }
  if (provider === 'apple') {
    return <Text style={{ fontSize: 22, color: '#111' }}></Text>;
  }
  return <Text style={{ fontSize: 20, fontWeight: '700', color: '#1877F2' }}>f</Text>;
}

/**
 * SocialButtons Component
 * Shows "or continue with" divider and buttons for Google, Apple, and Facebook.
 */
export default function SocialButtons({ onSelectProvider }) {
  return (
    <View style={styles.container}>
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText} allowFontScaling={true}>
          or continue with
        </Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.socialRow}>
        <TouchableOpacity
          style={styles.socialBtn}
          onPress={() => onSelectProvider && onSelectProvider('Google')}
          accessibilityRole="button"
          accessibilityLabel="Continue with Google"
          activeOpacity={0.7}
        >
          <ProviderIcon provider="google" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.socialBtn}
          onPress={() => onSelectProvider && onSelectProvider('Apple')}
          accessibilityRole="button"
          accessibilityLabel="Continue with Apple"
          activeOpacity={0.7}
        >
          <ProviderIcon provider="apple" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.socialBtn}
          onPress={() => onSelectProvider && onSelectProvider('Facebook')}
          accessibilityRole="button"
          accessibilityLabel="Continue with Facebook"
          activeOpacity={0.7}
        >
          <ProviderIcon provider="facebook" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 18,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    marginHorizontal: 12,
    color: COLORS.placeholder,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialBtn: {
    width: 64,
    height: 54,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
});
