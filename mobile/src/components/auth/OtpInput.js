import React, { useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { COLORS, FONTS } from '../../theme';

/**
 * OtpInput Component
 * 6 auto-advancing digit boxes with paste support, backspace navigation,
 * filled visual feedback, and shake animation on invalid submission.
 * @param {Object} props
 * @param {string[]} [props.code]
 * @param {(digits: string[]) => void} [props.onChangeCode]
 * @param {boolean} [props.isError]
 * @param {(code: string) => void} [props.onComplete]
 */
export default function OtpInput({
  code = ['', '', '', '', '', ''],
  onChangeCode = () => {},
  isError = false,
  onComplete = () => {},
}) {
  const inputRefs = useRef([]);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Trigger shake animation on error
  useEffect(() => {
    if (isError) {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
    }
  }, [isError, shakeAnim]);

  const handleChangeText = (text, index) => {
    // Check if pasted full code (e.g. 6 digits)
    const sanitized = text.replace(/\D/g, '');

    if (sanitized.length > 1) {
      const newDigits = [...code];
      for (let i = 0; i < 6; i++) {
        if (sanitized[i]) {
          newDigits[i] = sanitized[i];
        }
      }
      onChangeCode(newDigits);
      const nextIndex = Math.min(sanitized.length, 5);
      if (inputRefs.current[nextIndex]) {
        inputRefs.current[nextIndex].focus();
      }
      if (newDigits.every((d) => d !== '') && onComplete) {
        onComplete(newDigits.join(''));
      }
      return;
    }

    const digit = sanitized.slice(-1);
    const newDigits = [...code];
    newDigits[index] = digit;
    onChangeCode(newDigits);

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newDigits.every((d) => d !== '') && onComplete) {
      onComplete(newDigits.join(''));
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (!code[index] && index > 0) {
        const newDigits = [...code];
        newDigits[index - 1] = '';
        onChangeCode(newDigits);
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateX: shakeAnim }] },
      ]}
      accessibilityRole="text"
      accessibilityLabel="6 digit verification code input"
    >
      {[0, 1, 2, 3, 4, 5].map((index) => {
        const val = code[index] || '';
        const isFilled = Boolean(val);

        return (
          <TextInput
            key={index}
            ref={(ref) => (inputRefs.current[index] = ref)}
            style={[
              styles.box,
              isFilled && styles.boxFilled,
              isError && styles.boxError,
            ]}
            value={val}
            onChangeText={(txt) => handleChangeText(txt, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={6} // Allow paste up to 6 on first box
            autoFocus={index === 0}
            selectTextOnFocus={true}
            allowFontScaling={true}
            textContentType="oneTimeCode"
            autoComplete={Platform.OS === 'android' ? 'sms-otp' : 'one-time-code'}
            accessibilityLabel={`Digit ${index + 1}`}
          />
        );
      })}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 12,
    gap: 8,
  },
  box: {
    flex: 1,
    height: 60,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: FONTS.weights.bold,
    color: COLORS.deep,
    fontFamily: FONTS.family,
    outlineStyle: 'none',
  },
  boxFilled: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.mint,
  },
  boxError: {
    borderColor: COLORS.danger,
    backgroundColor: COLORS.dangerBg,
  },
});
