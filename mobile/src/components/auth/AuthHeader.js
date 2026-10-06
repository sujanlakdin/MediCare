import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { COLORS, FONTS } from '../../theme';
import MedicareLogo from './MedicareLogo';

let RNSvg = null;
try {
  RNSvg = require('react-native-svg');
} catch (e) {}

/**
 * AuthHeader Component
 * Green gradient/block banner with logo tile, header title, subtitle,
 * accessible back button, and curved white bottom wave.
 */
export default function AuthHeader({
  title = 'MediCare',
  subtitle = 'Sign in to continue',
  onBack,
  logoSize = 76,
  paddingBottom = 48,
}) {
  const isWeb = Platform.OS === 'web';

  const renderWave = () => {
    if (isWeb) {
      return (
        <svg
          viewBox="0 0 390 42"
          preserveAspectRatio="none"
          style={{
            position: 'absolute',
            bottom: -1,
            left: 0,
            width: '100%',
            height: 38,
            display: 'block',
          }}
          aria-hidden="true"
        >
          <path
            d="M0 22 C90 4 170 6 250 18 C320 28 360 22 390 14 L390 42 L0 42Z"
            fill={COLORS.surface}
          />
        </svg>
      );
    }

    if (RNSvg) {
      const { Svg, Path } = RNSvg;
      return (
        <View style={styles.waveContainer} pointerEvents="none">
          <Svg
            viewBox="0 0 390 42"
            preserveAspectRatio="none"
            style={styles.waveSvg}
          >
            <Path
              d="M0 22 C90 4 170 6 250 18 C320 28 360 22 390 14 L390 42 L0 42Z"
              fill={COLORS.surface}
            />
          </Svg>
        </View>
      );
    }

    // Pure React Native curved organic wave fallback
    return (
      <View style={styles.nativeWaveFallback}>
        <View style={styles.nativeWaveArcLeft} />
        <View style={styles.nativeWaveArcRight} />
      </View>
    );
  };

  return (
    <View style={[styles.headerContainer, { paddingBottom }]}>
      {/* Accessible Back Button */}
      {onBack && (
        <TouchableOpacity
          onPress={onBack}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back to previous screen"
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.7}
        >
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
      )}

      {/* Center Logo Tile */}
      <View style={styles.logoWrapper}>
        <MedicareLogo size={logoSize} borderRadius={18} />
      </View>

      {/* Titles */}
      <Text
        style={styles.title}
        allowFontScaling={true}
        accessibilityRole="header"
      >
        {title}
      </Text>
      {subtitle ? (
        <Text style={styles.subtitle} allowFontScaling={true}>
          {subtitle}
        </Text>
      ) : null}

      {/* Curved Bottom Wave */}
      {renderWave()}
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: COLORS.brand,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Platform.OS === 'ios' ? 44 : 36,
    position: 'relative',
    overflow: 'hidden',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 44 : 32,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  backArrow: {
    color: COLORS.white,
    fontSize: 32,
    fontWeight: '600',
    marginTop: -4,
  },
  logoWrapper: {
    marginTop: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: FONTS.sizes.title,
    fontWeight: FONTS.weights.bold,
    color: COLORS.white,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: FONTS.sizes.body - 1,
    color: 'rgba(255, 255, 255, 0.92)',
    marginTop: 3,
    marginBottom: 18,
  },
  waveContainer: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 38,
  },
  waveSvg: {
    width: '100%',
    height: 38,
  },
  nativeWaveFallback: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 24,
    backgroundColor: 'transparent',
    flexDirection: 'row',
  },
  nativeWaveArcLeft: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderTopRightRadius: 28,
  },
  nativeWaveArcRight: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 18,
  },
});
