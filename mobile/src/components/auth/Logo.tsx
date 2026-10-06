import React from 'react';
import { View, StyleSheet, Platform, StyleProp, ViewStyle } from 'react-native';
import Svg, { Path, Circle, Text as SvgText } from 'react-native-svg';

interface LogoProps {
  size?: number;
  borderRadius?: number;
  showText?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Logo Component
 * Vector MediCare emblem (caregiver & patient inside a heart) with soft mint background.
 * Used as primary brand logo and fallback when assets/images/medicare-logo.png is absent.
 */
export default function Logo({
  size = 110,
  borderRadius = 28,
  showText = false,
  style,
}: LogoProps) {
  const isWeb = Platform.OS === 'web';

  const renderVector = () => (
    <Svg
      viewBox="0 0 120 120"
      width={size * 0.76}
      height={size * 0.76}
      accessibilityRole="image"
      accessibilityLabel="MediCare Emblem"
    >
      {/* Outer mint heart glow */}
      <Path
        d="M60 100 C28 80 12 60 12 38 C12 22 24 12 38 12 C48 12 56 18 60 26 C64 18 72 12 82 12 C96 12 108 22 108 38 C108 60 92 80 60 100Z"
        fill="#E4EFEA"
      />
      {/* Inner deep green heart */}
      <Path
        d="M28 30 C28 22 36 18 44 20 C52 22 58 30 60 38 C62 30 70 22 80 20 C94 18 100 32 96 46 C92 62 76 78 60 84 C46 80 34 72 28 58 C24 50 26 40 28 30Z"
        fill="#006A4E"
      />
      {/* Adult figure */}
      <Circle cx="48" cy="40" r="7" fill="#FFFFFF" />
      <Path d="M38 68 C38 54 42 50 48 50 C54 50 58 54 58 68Z" fill="#FFFFFF" />
      {/* Child / cared-for figure */}
      <Circle cx="68" cy="48" r="6" fill="#3AB68B" />
      <Path d="M60 70 C60 58 63 55 68 55 C73 55 76 58 76 70Z" fill="#3AB68B" />
      {showText && (
        <SvgText
          x="60"
          y="114"
          textAnchor="middle"
          fontWeight="700"
          fontSize="13"
          fill="#006A4E"
        >
          MediCare
        </SvgText>
      )}
    </Svg>
  );

  return (
    <View
      style={[
        styles.tile,
        {
          width: size,
          height: size,
          borderRadius: borderRadius,
        },
        style,
      ]}
      accessible={true}
      accessibilityRole="image"
      accessibilityLabel="MediCare Logo"
    >
      {renderVector()}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
