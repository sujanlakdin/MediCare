import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { COLORS, FONTS, METRICS } from '../../theme';

/**
 * PrimaryButton Component
 * Height 58, pill-shape rounded (radius 999), bold 18px white text,
 * soft green shadow, loading spinner, and double-tap prevention.
 */
export default function PrimaryButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'brand', // 'brand' | 'white' | 'dark'
  accessibilityLabel = '',
  style = null,
  textStyle = null,
}) {
  const isBrand = variant === 'brand';
  const isWhite = variant === 'white';
  const isDark = variant === 'dark';

  const isDisabled = disabled || loading;

  const handlePress = () => {
    if (isDisabled || !onPress) return;
    onPress();
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isBrand && styles.buttonBrand,
        isWhite && styles.buttonWhite,
        isDark && styles.buttonDark,
        isDisabled && styles.buttonDisabled,
        style,
      ]}
      onPress={handlePress}
      disabled={isDisabled}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={isWhite ? COLORS.brand : COLORS.white}
        />
      ) : (
        <Text
          style={[
            styles.buttonText,
            isBrand && styles.textWhite,
            isDark && styles.textWhite,
            isWhite && styles.textBrand,
            textStyle,
          ]}
          allowFontScaling={true}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: METRICS.buttonHeight,
    borderRadius: METRICS.buttonRadius,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: METRICS.minTouchTarget,
    paddingHorizontal: 24,
  },
  buttonBrand: {
    backgroundColor: COLORS.brand,
    shadowColor: COLORS.brand,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 20,
    elevation: 6,
  },
  buttonWhite: {
    backgroundColor: COLORS.white,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 5,
  },
  buttonDark: {
    backgroundColor: COLORS.deep,
    shadowColor: COLORS.deep,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.55,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  textWhite: {
    color: COLORS.white,
  },
  textBrand: {
    color: COLORS.brand,
  },
});
