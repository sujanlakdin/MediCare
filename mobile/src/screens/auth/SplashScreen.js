import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { COLORS, FONTS } from '../../theme';
import MedicareLogo from '../../components/auth/MedicareLogo';
import authService from '../../services/authService';

/**
 * SplashScreen
 * Displays large logo tile (150x150), MediCare title, and tagline on mint background.
 * If user is already authenticated, seamlessly routes them to /(patient)/dashboard.
 * Otherwise, transitions to Welcome screen.
 */
export default function SplashScreen({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      goToNext();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const goToNext = () => {
    if (authService.isAuthenticated && authService.isAuthenticated()) {
      if (navigation?.navigate) {
        try {
          navigation.navigate('/(patient)/dashboard');
        } catch (e) {
          router.replace('/(patient)/dashboard');
        }
      } else {
        router.replace('/(patient)/dashboard');
      }
    } else {
      if (navigation?.replace) {
        navigation.replace('Welcome');
      } else if (navigation?.navigate) {
        navigation.navigate('Welcome');
      }
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={goToNext}
      activeOpacity={0.98}
      accessibilityRole="button"
      accessibilityLabel="MediCare Splash Screen. Tap to continue."
    >
      <StatusBar barStyle="dark-content" backgroundColor="#D8F0EE" />

      {/* Decorative Mint Background Radiance Circles */}
      <View style={styles.mintOrbTop} />
      <View style={styles.mintOrbBottom} />

      {/* Logo Tile with Soft Green Glow */}
      <View style={styles.logoTileWrapper}>
        <MedicareLogo
          size={146}
          borderRadius={34}
          showLabel={false}
          variant="with-text"
        />
      </View>

      {/* Brand Title */}
      <Text
        style={styles.title}
        allowFontScaling={true}
        accessibilityRole="header"
      >
        MediCare
      </Text>

      {/* Tagline */}
      <Text style={styles.tagline} allowFontScaling={true}>
        Health in your hand, one reminder at a time.
      </Text>

      {/* Bottom Home Indicator Bar */}
      <View style={styles.homeBar} />
    </TouchableOpacity>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D8F0EE',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    position: 'relative',
    overflow: 'hidden',
  },
  mintOrbTop: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: (width * 0.8) / 2,
    backgroundColor: '#B6E8E3',
    opacity: 0.6,
  },
  mintOrbBottom: {
    position: 'absolute',
    bottom: -80,
    left: -60,
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: (width * 0.9) / 2,
    backgroundColor: '#B9EBD3',
    opacity: 0.65,
  },
  logoTileWrapper: {
    shadowColor: COLORS.brand,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.28,
    shadowRadius: 36,
    elevation: 12,
  },
  title: {
    marginTop: 34,
    fontSize: FONTS.sizes.hero,
    fontWeight: FONTS.weights.heavy,
    color: '#0A4D38',
    letterSpacing: -0.5,
    fontFamily: FONTS.family,
    textAlign: 'center',
  },
  tagline: {
    marginTop: 10,
    maxWidth: 270,
    fontSize: FONTS.sizes.body,
    lineHeight: 24,
    color: '#17493A',
    fontWeight: FONTS.weights.medium,
    fontFamily: FONTS.family,
    textAlign: 'center',
  },
  homeBar: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    width: 134,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#B4C6BD',
  },
});
