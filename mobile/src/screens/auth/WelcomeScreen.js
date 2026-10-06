import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { COLORS, FONTS } from '../../theme';
import MedicareLogo from '../../components/auth/MedicareLogo';
import PrimaryButton from '../../components/auth/PrimaryButton';
import { useAuth } from '../../contexts/auth-context';

let RNSvg = null;
try {
  RNSvg = require('react-native-svg');
} catch (e) {}

const { width, height } = Dimensions.get('window');

/**
 * WelcomeScreen Component
 * Full-screen deep teal background, abstract art illustration, centered logo tile,
 * white pill "Get Started" button, and "Already have an account? Sign In" link.
 */
export default function WelcomeScreen({ navigation }) {
  const isWeb = Platform.OS === 'web';
  const { token, user } = useAuth();
  const isAuthenticated = Boolean(token && user);

  const goToDashboard = () => {
    router.replace('/');
  };

  const firstName = user?.fullName ? user.fullName.split(' ')[0] : 'Patient';

  const renderBackgroundArt = () => {
    if (isWeb) {
      return (
        <svg
          viewBox="0 0 390 844"
          preserveAspectRatio="xMidYMid slice"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
          aria-hidden="true"
        >
          <path
            d="M-20 300 C80 260 160 330 260 300 C320 280 380 300 420 270 L420 520 C300 560 200 500 100 540 C40 560 0 540 -20 520Z"
            fill="#2E7F76"
            opacity=".35"
          />
          <path
            d="M-20 560 C100 520 180 600 300 560 C350 545 400 560 420 540 L420 860 L-20 860Z"
            fill="#0B3434"
            opacity=".55"
          />
          <ellipse cx="215" cy="560" rx="120" ry="70" fill="#E8A184" opacity=".85" />
          <ellipse cx="270" cy="600" rx="60" ry="46" fill="#F0B79D" opacity=".9" />
          <ellipse cx="170" cy="520" rx="46" ry="30" fill="#D98E73" opacity=".8" />
          <g fill="#E58B7E">
            <circle cx="60" cy="640" r="9" />
            <circle cx="330" cy="700" r="8" />
            <circle cx="90" cy="410" r="7" />
            <circle cx="320" cy="400" r="8" />
            <circle cx="40" cy="760" r="10" />
          </g>
          <g fill="#F2A98F" opacity=".9">
            <ellipse cx="120" cy="690" rx="16" ry="6" transform="rotate(-30 120 690)" />
            <ellipse cx="300" cy="460" rx="16" ry="6" transform="rotate(25 300 460)" />
            <ellipse cx="70" cy="520" rx="14" ry="5" transform="rotate(-50 70 520)" />
            <ellipse cx="350" cy="620" rx="14" ry="5" transform="rotate(40 350 620)" />
          </g>
        </svg>
      );
    }

    if (RNSvg) {
      const { Svg, Path, Ellipse, Circle, G } = RNSvg;
      return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Svg
            viewBox="0 0 390 844"
            preserveAspectRatio="xMidYMid slice"
            style={StyleSheet.absoluteFill}
          >
            <Path
              d="M-20 300 C80 260 160 330 260 300 C320 280 380 300 420 270 L420 520 C300 560 200 500 100 540 C40 560 0 540 -20 520Z"
              fill="#2E7F76"
              opacity={0.35}
            />
            <Path
              d="M-20 560 C100 520 180 600 300 560 C350 545 400 560 420 540 L420 860 L-20 860Z"
              fill="#0B3434"
              opacity={0.55}
            />
            <Ellipse cx={215} cy={560} rx={120} ry={70} fill="#E8A184" opacity={0.85} />
            <Ellipse cx={270} cy={600} rx={60} ry={46} fill="#F0B79D" opacity={0.9} />
            <Ellipse cx={170} cy={520} rx={46} ry={30} fill="#D98E73" opacity={0.8} />
            <G fill="#E58B7E">
              <Circle cx={60} cy={640} r={9} />
              <Circle cx={330} cy={700} r={8} />
              <Circle cx={90} cy={410} r={7} />
              <Circle cx={320} cy={400} r={8} />
              <Circle cx={40} cy={760} r={10} />
            </G>
            <G fill="#F2A98F" opacity={0.9}>
              <Ellipse cx={120} cy={690} rx={16} ry={6} transform="rotate(-30 120 690)" />
              <Ellipse cx={300} cy={460} rx={16} ry={6} transform="rotate(25 300 460)" />
              <Ellipse cx={70} cy={520} rx={14} ry={5} transform="rotate(-50 70 520)" />
              <Ellipse cx={350} cy={620} rx={14} ry={5} transform="rotate(40 350 620)" />
            </G>
          </Svg>
        </View>
      );
    }

    // Pure React Native geometric decorative shapes
    return (
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={styles.artOrb1} />
        <View style={styles.artOrb2} />
        <View style={styles.artOrb3} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1B5A5C" />

      {/* Full-screen background art */}
      {renderBackgroundArt()}

      {/* Floating Center Logo Tile */}
      <View style={styles.logoTileWrapper}>
        <MedicareLogo
          size={84}
          borderRadius={20}
          showLabel={false}
          variant="plain"
        />
      </View>

      {/* Bottom Actions Container */}
      <View style={styles.actionsContainer}>
        {isAuthenticated && currentUser ? (
          <>
            <PrimaryButton
              title={`Continue to Dashboard (${firstName})`}
              variant="white"
              onPress={goToDashboard}
              accessibilityLabel={`Continue to Dashboard as ${firstName}`}
            />

            <View style={styles.authSwitchRow}>
              <TouchableOpacity
                onPress={() => navigation?.navigate('Login')}
                accessibilityRole="button"
                accessibilityLabel="Switch Account or Sign In"
                activeOpacity={0.7}
              >
                <Text style={styles.authSwitchLink} allowFontScaling={true}>
                  Switch Account
                </Text>
              </TouchableOpacity>
              <Text style={styles.authSwitchDivider}>•</Text>
              <TouchableOpacity
                onPress={() => navigation?.navigate('SignUp')}
                accessibilityRole="button"
                accessibilityLabel="Create a new account"
                activeOpacity={0.7}
              >
                <Text style={styles.authSwitchLink} allowFontScaling={true}>
                  Create New Account
                </Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <PrimaryButton
              title="Get Started"
              variant="white"
              onPress={() => navigation?.navigate('SignUp')}
              accessibilityLabel="Get Started with MediCare. Create a new account."
            />

            <View style={styles.signinRow}>
              <Text style={styles.signinText} allowFontScaling={true}>
                Already have an account?
              </Text>
              <TouchableOpacity
                onPress={() => navigation?.navigate('Login')}
                accessibilityRole="button"
                accessibilityLabel="Already have an account? Sign In"
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                activeOpacity={0.7}
              >
                <Text style={styles.signinLink} allowFontScaling={true}>
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      {/* Bottom Home Indicator Bar */}
      <View style={styles.homeBar} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#124447',
    justifyContent: 'flex-end',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  artOrb1: {
    position: 'absolute',
    top: height * 0.35,
    right: -40,
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: (width * 0.7) / 2,
    backgroundColor: '#2E7F76',
    opacity: 0.35,
  },
  artOrb2: {
    position: 'absolute',
    bottom: height * 0.18,
    left: -20,
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: (width * 0.8) / 2,
    backgroundColor: '#0B3434',
    opacity: 0.55,
  },
  artOrb3: {
    position: 'absolute',
    bottom: height * 0.22,
    alignSelf: 'center',
    width: 240,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#E8A184',
    opacity: 0.85,
  },
  logoTileWrapper: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 220 : 190,
    alignSelf: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 10,
  },
  actionsContainer: {
    width: '100%',
    paddingHorizontal: 40,
    paddingBottom: Platform.OS === 'ios' ? 64 : 48,
    zIndex: 20,
    alignItems: 'center',
  },
  signinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 26,
    gap: 6,
  },
  signinText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.body - 1,
    fontWeight: FONTS.weights.semibold,
  },
  signinLink: {
    color: COLORS.white,
    fontSize: FONTS.sizes.body - 1,
    fontWeight: FONTS.weights.heavy,
    textDecorationLine: 'underline',
  },
  authSwitchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 12,
  },
  authSwitchLink: {
    color: COLORS.white,
    fontSize: FONTS.sizes.sm + 0.5,
    fontWeight: FONTS.weights.semibold,
    textDecorationLine: 'underline',
  },
  authSwitchDivider: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: FONTS.sizes.sm,
  },
  homeBar: {
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
    width: 134,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
  },
});
