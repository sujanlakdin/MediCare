import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
  AccessibilityInfo,
  Dimensions,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Logo from '../../components/auth/Logo';

const { width } = Dimensions.get('window');

/**
 * SplashScreen Component (Logo Page - First Screen)
 * Displays gradient background, soft glowing blurred circles,
 * centered 150x150 white logo tile, "MediCare" title, and tagline.
 * Features spring entrance animation, reduce-motion support,
 * and 2.8s auto-forward / tap-to-continue navigation to /onboarding.
 */
export default function SplashScreen() {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.72)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const hasNavigatedRef = useRef(false);

  const handleContinue = () => {
    if (hasNavigatedRef.current) return;
    hasNavigatedRef.current = true;
    router.replace('/onboarding' as any);
  };

  useEffect(() => {
    let isMounted = true;

    // Check accessibility reduce-motion setting
    AccessibilityInfo.isReduceMotionEnabled()
      .then((reduced) => {
        if (!isMounted) return;
        if (reduced) {
          logoOpacity.setValue(1);
          logoScale.setValue(1);
          textOpacity.setValue(1);
        } else {
          Animated.sequence([
            Animated.parallel([
              Animated.timing(logoOpacity, {
                toValue: 1,
                duration: 650,
                useNativeDriver: true,
              }),
              Animated.spring(logoScale, {
                toValue: 1,
                friction: 6,
                tension: 45,
                useNativeDriver: true,
              }),
            ]),
            Animated.timing(textOpacity, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
          ]).start();
        }
      })
      .catch(() => {
        if (!isMounted) return;
        logoOpacity.setValue(1);
        logoScale.setValue(1);
        textOpacity.setValue(1);
      });

    // Auto navigate after ~2.8 seconds
    const timer = setTimeout(() => {
      handleContinue();
    }, 2800);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handleContinue}
      activeOpacity={0.98}
      accessibilityRole="button"
      accessibilityLabel="MediCare Splash Screen. Tap anywhere to continue to onboarding."
    >
      <StatusBar barStyle="dark-content" backgroundColor="#D8F0EE" />

      {/* Full-screen soft gradient: top-left mint-teal to bottom-right light green */}
      <LinearGradient
        colors={['#D8F0EE', '#CDEFE0', '#D4F7E5']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Two soft blurred glow circles */}
      <View style={styles.glowOrbTop} />
      <View style={styles.glowOrbBottom} />

      {/* Center content with spring & fade entrance */}
      <View style={styles.centerContent}>
        <Animated.View
          style={[
            styles.logoTileWrapper,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          {/* Centered white rounded logo tile (150x150, radius 34) */}
          <View style={styles.logoTile}>
            {/* Fallback to <Logo /> component; seamlessly switches if image asset is present */}
            <Logo size={112} borderRadius={26} showText={false} />
          </View>
        </Animated.View>

        <Animated.View style={[styles.textWrapper, { opacity: textOpacity }]}>
          <Text
            style={styles.title}
            accessibilityRole="header"
            allowFontScaling={true}
          >
            MediCare
          </Text>
          <Text style={styles.tagline} allowFontScaling={true}>
            Health in your hand, one reminder at a time.
          </Text>
        </Animated.View>
      </View>

      {/* Home indicator bar */}
      <View style={styles.homeBar} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  glowOrbTop: {
    position: 'absolute',
    top: -50,
    right: -40,
    width: width * 0.75,
    height: width * 0.75,
    borderRadius: (width * 0.75) / 2,
    backgroundColor: '#B6E8E3',
    opacity: 0.5,
  },
  glowOrbBottom: {
    position: 'absolute',
    bottom: -60,
    left: -50,
    width: width * 0.85,
    height: width * 0.85,
    borderRadius: (width * 0.85) / 2,
    backgroundColor: '#BAEAD4',
    opacity: 0.55,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoTileWrapper: {
    shadowColor: '#0A4D38',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.22,
    shadowRadius: 30,
    elevation: 12,
  },
  logoTile: {
    width: 150,
    height: 150,
    borderRadius: 34,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrapper: {
    alignItems: 'center',
    marginTop: 32,
  },
  title: {
    fontSize: 40,
    fontWeight: '800',
    color: '#0A4D38',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  tagline: {
    marginTop: 10,
    maxWidth: 260,
    fontSize: 16,
    lineHeight: 23,
    color: '#17493A',
    fontWeight: '500',
    textAlign: 'center',
  },
  homeBar: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    width: 134,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(23, 73, 58, 0.2)',
  },
});
