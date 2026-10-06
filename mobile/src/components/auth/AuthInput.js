import React, { useRef, useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { COLORS, FONTS, METRICS } from '../../theme';

let RNSvg = null;
try {
  RNSvg = require('react-native-svg');
} catch (e) {}

/**
 * Renders left field icon (user, mail, lock, refresh)
 */
function FieldIcon({ name, color = COLORS.brand, size = 22 }) {
  const isWeb = Platform.OS === 'web';

  if (isWeb) {
    let pathContent = null;
    if (name === 'user') {
      pathContent = (
        <>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
        </>
      );
    } else if (name === 'mail') {
      pathContent = (
        <>
          <rect x="3" y="5" width="18" height="14" rx="3" />
          <path d="M3.5 7l8.5 6 8.5-6" />
        </>
      );
    } else if (name === 'refresh') {
      pathContent = (
        <>
          <path d="M20 12a8 8 0 01-14 5.3M4 12a8 8 0 0114-5.3" />
          <path d="M18 3v4h-4M6 21v-4h4" />
        </>
      );
    } else {
      // Default to 'lock'
      pathContent = (
        <>
          <rect x="5" y="11" width="14" height="10" rx="3" />
          <path d="M8 11V8a4 4 0 018 0v3" />
        </>
      );
    }

    return (
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        style={{
          stroke: color,
          fill: 'none',
          strokeWidth: 1.9,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          flexShrink: 0,
        }}
        aria-hidden="true"
      >
        {pathContent}
      </svg>
    );
  }

  if (RNSvg) {
    const { Svg, Path, Circle, Rect } = RNSvg;
    return (
      <Svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="none"
        stroke={color}
        strokeWidth={1.9}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {name === 'user' && (
          <>
            <Circle cx="12" cy="8" r="4" />
            <Path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
          </>
        )}
        {name === 'mail' && (
          <>
            <Rect x="3" y="5" width="18" height="14" rx="3" />
            <Path d="M3.5 7l8.5 6 8.5-6" />
          </>
        )}
        {name === 'refresh' && (
          <>
            <Path d="M20 12a8 8 0 01-14 5.3M4 12a8 8 0 0114-5.3" />
            <Path d="M18 3v4h-4M6 21v-4h4" />
          </>
        )}
        {name !== 'user' && name !== 'mail' && name !== 'refresh' && (
          <>
            <Rect x="5" y="11" width="14" height="10" rx="3" />
            <Path d="M8 11V8a4 4 0 018 0v3" />
          </>
        )}
      </Svg>
    );
  }

  // Cross-platform fallback text symbols
  const symbolMap = {
    user: '👤',
    mail: '✉️',
    lock: '🔒',
    refresh: '🔄',
  };
  return (
    <Text style={{ fontSize: 18, color, width: size, textAlign: 'center' }}>
      {symbolMap[name] || '🔒'}
    </Text>
  );
}

/**
 * Eye toggle icon
 */
function EyeIcon({ visible }) {
  const isWeb = Platform.OS === 'web';

  if (isWeb) {
    return (
      <svg
        viewBox="0 0 24 24"
        width="22"
        height="22"
        style={{
          stroke: COLORS.placeholder,
          fill: 'none',
          strokeWidth: 1.8,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        }}
        aria-hidden="true"
      >
        {visible ? (
          <>
            <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
            <circle cx="12" cy="12" r="3" />
          </>
        ) : (
          <>
            <path d="M3 3l18 18" />
            <path d="M10.6 6.1A9.8 9.8 0 0112 5c6.4 0 10 7 10 7a17 17 0 01-3.2 4M6.5 7.5A17 17 0 002 12s3.6 7 10 7c1.8 0 3.4-.5 4.8-1.2" />
            <path d="M9.9 9.9a3 3 0 004.2 4.2" />
          </>
        )}
      </svg>
    );
  }

  if (RNSvg) {
    const { Svg, Path, Circle } = RNSvg;
    return (
      <Svg
        viewBox="0 0 24 24"
        width={22}
        height={22}
        fill="none"
        stroke={COLORS.placeholder}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {visible ? (
          <>
            <Path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
            <Circle cx="12" cy="12" r="3" />
          </>
        ) : (
          <>
            <Path d="M3 3l18 18" />
            <Path d="M10.6 6.1A9.8 9.8 0 0112 5c6.4 0 10 7 10 7a17 17 0 01-3.2 4M6.5 7.5A17 17 0 002 12s3.6 7 10 7c1.8 0 3.4-.5 4.8-1.2" />
            <Path d="M9.9 9.9a3 3 0 004.2 4.2" />
          </>
        )}
      </Svg>
    );
  }

  return (
    <Text style={{ fontSize: 18, color: COLORS.muted }}>
      {visible ? '👁️' : '🙈'}
    </Text>
  );
}

/**
 * AuthInput Component
 * Highly accessible elderly-friendly input field.
 * Height 58, radius 20, 1.5px border, brand left icon, focus ring,
 * password eye toggle, and inline red error text.
 */
export default function AuthInput({
  icon = 'user',
  placeholder,
  value,
  onChangeText,
  error,
  isPassword = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoComplete,
  accessibilityLabel,
  editable = true,
  style,
  ...rest
}) {
  const focusedRef = useRef(false);
  const [showPassword, setShowPassword] = useState(!isPassword);

  const hasError = Boolean(error);

  return (
    <View style={[styles.fieldContainer, style]}>
      <View
        style={[
          styles.inputWrapper,
          focusedRef.current && styles.inputWrapperFocused,
          hasError && styles.inputWrapperError,
        ]}
      >
        {/* Left Icon */}
        <View style={styles.iconContainer}>
          <FieldIcon
            name={icon}
            color={hasError ? COLORS.danger : focusedRef.current ? COLORS.brand : COLORS.brand}
          />
        </View>

        {/* Text Input */}
        <TextInput
          style={styles.textInput}
          placeholder={placeholder}
          placeholderTextColor={COLORS.placeholder}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isPassword && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={Platform.OS === 'android' ? 'off' : autoComplete}
          editable={editable}
          allowFontScaling={true}
          onFocus={() => { focusedRef.current = true; }}
          onBlur={() => { focusedRef.current = false; }}
          accessibilityLabel={accessibilityLabel || placeholder}
          accessibilityRole="text"
          {...rest}
        />

        {/* Password Eye Toggle */}
        {isPassword && (
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword((prev) => !prev)}
            accessibilityRole="button"
            accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <EyeIcon visible={showPassword} />
          </TouchableOpacity>
        )}
      </View>

      {/* Inline Red Error */}
      {hasError ? (
        <Text
          style={styles.errorText}
          allowFontScaling={true}
          accessibilityRole="alert"
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fieldContainer: {
    marginBottom: 14,
    width: '100%',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: METRICS.inputHeight,
    borderRadius: METRICS.inputRadius,
    borderWidth: METRICS.borderWidth,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    transition: 'border-color 0.15s, box-shadow 0.15s',
  },
  inputWrapperFocused: {
    borderColor: COLORS.brand,
    backgroundColor: COLORS.surface,
    shadowColor: COLORS.brand,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
  },
  inputWrapperError: {
    borderColor: COLORS.danger,
    backgroundColor: COLORS.dangerBg,
  },
  iconContainer: {
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: 26,
    height: 26,
  },
  textInput: {
    flex: 1,
    height: '100%',
    color: COLORS.text,
    fontSize: FONTS.sizes.body,
    fontWeight: FONTS.weights.medium,
    fontFamily: FONTS.family,
    paddingVertical: 0,
    outlineStyle: 'none',
  },
  eyeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semibold,
    marginTop: 6,
    marginLeft: 8,
  },
});
