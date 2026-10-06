import React from 'react';
import { View, Text, StyleSheet, Platform, StatusBar } from 'react-native';
import { COLORS, FONTS } from '../../theme';
import PrimaryButton from '../../components/auth/PrimaryButton';

let RNSvg = null;
try {
  RNSvg = require('react-native-svg');
} catch (e) {}

/**
 * Green checkmark tick icon
 */
function CheckmarkIcon({ size = 52 }) {
  const isWeb = Platform.OS === 'web';

  if (isWeb) {
    return (
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        style={{
          stroke: COLORS.accent,
          fill: 'none',
          strokeWidth: 3.2,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        }}
        aria-hidden="true"
      >
        <path d="M5 12.5l4.5 4.5L19 7.5" />
      </svg>
    );
  }

  if (RNSvg) {
    const { Svg, Path } = RNSvg;
    return (
      <Svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="none"
        stroke={COLORS.accent}
        strokeWidth={3.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="M5 12.5l4.5 4.5L19 7.5" />
      </Svg>
    );
  }

  return (
    <Text style={{ fontSize: 44, color: COLORS.accent, fontWeight: '800' }}>
      ✓
    </Text>
  );
}

import { router } from 'expo-router';

/**
 * SuccessScreen Component
 * Displays a celebratory green circular check badge, route-driven title & message,
 * and a direct action button to proceed back to Login or Dashboard.
 */
export default function SuccessScreen({ route, navigation }) {
  const params = route?.params || {};
  const title = params.title || 'All done';
  const message =
    params.message ||
    'Your action has been completed successfully. You can now continue.';
  const buttonText = params.buttonText || 'Go to Login';
  const nextRoute = params.nextRoute || 'Login';

  const handleAction = () => {
    if (nextRoute && (nextRoute.startsWith('/') || nextRoute === 'Dashboard')) {
      const destination = nextRoute === 'Dashboard' ? '/(patient)/dashboard' : nextRoute;
      router.replace(destination);
      return;
    }
    if (navigation?.reset) {
      navigation.reset({
        index: 0,
        routes: [{ name: nextRoute }],
      });
    } else if (navigation?.navigate) {
      navigation.navigate(nextRoute);
    }
  };

  return (
    <View style={styles.container} accessibilityLiveRegion="polite">
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Mint Circle with Green Checkmark */}
      <View style={styles.tickCircle}>
        <CheckmarkIcon size={52} />
      </View>

      {/* Heading */}
      <Text
        style={styles.title}
        allowFontScaling={true}
        accessibilityRole="header"
      >
        {title}
      </Text>

      {/* Description Message */}
      <Text style={styles.message} allowFontScaling={true}>
        {message}
      </Text>

      {/* Primary Action Button */}
      <View style={styles.buttonWrapper}>
        <PrimaryButton
          title={buttonText}
          onPress={handleAction}
          accessibilityLabel={`${buttonText}. Proceed to Login screen.`}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
  },
  tickCircle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: COLORS.mint,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 6,
  },
  title: {
    marginTop: 26,
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.deep,
    textAlign: 'center',
    fontFamily: FONTS.family,
  },
  message: {
    marginTop: 10,
    marginBottom: 32,
    fontSize: FONTS.sizes.body - 0.5,
    lineHeight: 24,
    color: COLORS.muted,
    textAlign: 'center',
    maxWidth: 300,
    fontFamily: FONTS.family,
  },
  buttonWrapper: {
    width: '100%',
    maxWidth: 300,
  },
});
