import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { COLORS } from '../../theme';

let RNSvg = null;
try {
  RNSvg = require('react-native-svg');
} catch (e) {
  // Graceful fallback if react-native-svg is not installed
}

/**
 * MedicareLogo Component
 * Renders the MediCare heart & caregiver emblem inside a pill/square tile.
 */
export default function MedicareLogo({
  size = 76,
  borderRadius = 18,
  showLabel = false,
  variant = 'plain', // 'plain' or 'with-text'
}) {
  const isWeb = Platform.OS === 'web';

  const renderSvgWeb = () => (
    <svg
      viewBox="0 0 120 120"
      width={size * 0.76}
      height={size * 0.76}
      style={{ display: 'block' }}
      aria-hidden="true"
    >
      <path
        d="M60 100 C28 80 12 60 12 38 C12 22 24 12 38 12 C48 12 56 18 60 26 C64 18 72 12 82 12 C96 12 108 22 108 38 C108 60 92 80 60 100Z"
        fill="#E4EFEA"
      />
      <path
        d="M28 30 C28 22 36 18 44 20 C52 22 58 30 60 38 C62 30 70 22 80 20 C94 18 100 32 96 46 C92 62 76 78 60 84 C46 80 34 72 28 58 C24 50 26 40 28 30Z"
        fill="#00714F"
      />
      <circle cx="48" cy="40" r="7" fill={variant === 'with-text' ? '#0B6B4C' : '#FFFFFF'} />
      <path
        d="M38 68 C38 54 42 50 48 50 C54 50 58 54 58 68Z"
        fill={variant === 'with-text' ? '#0B6B4C' : '#FFFFFF'}
      />
      <circle cx="68" cy="48" r="6" fill="#2EB584" />
      <path
        d="M60 70 C60 58 63 55 68 55 C73 55 76 58 76 70Z"
        fill="#2EB584"
      />
      {variant === 'with-text' && (
        <text
          x="60"
          y="114"
          textAnchor="middle"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="700"
          fontSize="13"
          fill="#0B6B4C"
        >
          MediCare
        </text>
      )}
    </svg>
  );

  const renderRNSvg = () => {
    if (!RNSvg) return null;
    const { Svg, Path, Circle, Text: SvgText } = RNSvg;
    return (
      <Svg
        viewBox="0 0 120 120"
        width={size * 0.76}
        height={size * 0.76}
        accessibilityRole="image"
      >
        <Path
          d="M60 100 C28 80 12 60 12 38 C12 22 24 12 38 12 C48 12 56 18 60 26 C64 18 72 12 82 12 C96 12 108 22 108 38 C108 60 92 80 60 100Z"
          fill="#E4EFEA"
        />
        <Path
          d="M28 30 C28 22 36 18 44 20 C52 22 58 30 60 38 C62 30 70 22 80 20 C94 18 100 32 96 46 C92 62 76 78 60 84 C46 80 34 72 28 58 C24 50 26 40 28 30Z"
          fill="#00714F"
        />
        <Circle
          cx="48"
          cy="40"
          r="7"
          fill={variant === 'with-text' ? '#0B6B4C' : '#FFFFFF'}
        />
        <Path
          d="M38 68 C38 54 42 50 48 50 C54 50 58 54 58 68Z"
          fill={variant === 'with-text' ? '#0B6B4C' : '#FFFFFF'}
        />
        <Circle cx="68" cy="48" r="6" fill="#2EB584" />
        <Path
          d="M60 70 C60 58 63 55 68 55 C73 55 76 58 76 70Z"
          fill="#2EB584"
        />
        {variant === 'with-text' && (
          <SvgText
            x="60"
            y="114"
            textAnchor="middle"
            fontWeight="700"
            fontSize="13"
            fill="#0B6B4C"
          >
            MediCare
          </SvgText>
        )}
      </Svg>
    );
  };

  const renderNativeFallback = () => (
    <View style={styles.nativeEmblem}>
      <View style={styles.mintHeart}>
        <View style={styles.carePlusHorizontal} />
        <View style={styles.carePlusVertical} />
      </View>
      <View style={styles.elderFigure}>
        <View style={styles.figureHead} />
        <View style={styles.figureBody} />
      </View>
      <View style={styles.caregiverFigure}>
        <View style={styles.caregiverHead} />
        <View style={styles.caregiverBody} />
      </View>
    </View>
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
      ]}
      accessibilityRole="image"
      accessibilityLabel="MediCare Logo"
    >
      {isWeb ? renderSvgWeb() : RNSvg ? renderRNSvg() : renderNativeFallback()}
      {showLabel && <Text style={styles.tileLabel}>MediCare</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.deep,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 8,
  },
  tileLabel: {
    color: '#0B6B4C',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  nativeEmblem: {
    width: '75%',
    height: '75%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  mintHeart: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 24,
    backgroundColor: '#E4EFEA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  carePlusHorizontal: {
    position: 'absolute',
    width: 22,
    height: 7,
    backgroundColor: COLORS.brand,
    borderRadius: 3.5,
  },
  carePlusVertical: {
    position: 'absolute',
    width: 7,
    height: 22,
    backgroundColor: COLORS.brand,
    borderRadius: 3.5,
  },
  elderFigure: {
    position: 'absolute',
    left: '26%',
    top: '32%',
    alignItems: 'center',
  },
  figureHead: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },
  figureBody: {
    width: 14,
    height: 14,
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
    backgroundColor: '#FFFFFF',
    marginTop: 2,
  },
  caregiverFigure: {
    position: 'absolute',
    right: '26%',
    top: '40%',
    alignItems: 'center',
  },
  caregiverHead: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
  },
  caregiverBody: {
    width: 12,
    height: 12,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    backgroundColor: COLORS.accent,
    marginTop: 1,
  },
});
