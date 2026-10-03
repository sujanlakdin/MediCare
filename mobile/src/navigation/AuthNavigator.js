import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import authService from '../services/authService';

// Import all Member 1 Authentication Screens
import SplashScreen from '../screens/auth/SplashScreen';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import OtpVerificationScreen from '../screens/auth/OtpVerificationScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';
import SuccessScreen from '../screens/auth/SuccessScreen';
import MyProfileScreen from '../screens/profile/MyProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import AccessibilityScreen from '../screens/profile/AccessibilityScreen';

export {
  SplashScreen,
  WelcomeScreen,
  LoginScreen,
  SignUpScreen,
  ForgotPasswordScreen,
  OtpVerificationScreen,
  ResetPasswordScreen,
  SuccessScreen,
  MyProfileScreen,
  EditProfileScreen,
  SettingsScreen,
  AccessibilityScreen,
};

// Check if @react-navigation/native-stack is available in environment
let createNativeStackNavigator = null;
try {
  createNativeStackNavigator =
    require('@react-navigation/native-stack').createNativeStackNavigator;
} catch (e) {
  // Graceful fallback navigator ensures 100% zero-crash operation
}

/**
 * Native React Navigation Stack
 * Active when @react-navigation/native-stack is installed in project.
 */
function NativeAuthNavigator({ initialRoute = 'Splash' }) {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#F1F7F3' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <Stack.Screen name="Success" component={SuccessScreen} />
      <Stack.Screen name="MyProfile" component={MyProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Accessibility" component={AccessibilityScreen} />
    </Stack.Navigator>
  );
}

/**
 * Standalone Navigator
 * Self-contained stack emulator that works out-of-the-box in any React Native / Expo environment
 * without external navigation packages.
 */
function StandaloneAuthNavigator({ initialRoute = 'Splash' }) {
  const [history, setHistory] = useState([{ name: initialRoute, params: {} }]);

  useEffect(() => {
    if (initialRoute) {
      setHistory([{ name: initialRoute, params: {} }]);
    }
  }, [initialRoute]);

  const currentRoute = history[history.length - 1];

  const handleRouteRedirect = (name) => {
    if (name === '/(patient)/dashboard' || name === '/dashboard' || name === 'Dashboard') {
      router.replace('/(patient)/dashboard');
      return true;
    }
    if (name === '/(patient)/profile' || name === '/profile') {
      router.replace('/(patient)/profile');
      return true;
    }
    if (typeof name === 'string' && name.startsWith('/')) {
      router.replace(name);
      return true;
    }
    return false;
  };

  const navigation = {
    navigate: (name, params = {}) => {
      if (handleRouteRedirect(name)) return;
      setHistory((prev) => [...prev, { name, params }]);
    },
    goBack: () => {
      if (history.length > 1) {
        setHistory((prev) => prev.slice(0, -1));
      } else {
        if (authService.isAuthenticated && authService.isAuthenticated()) {
          router.replace('/(patient)/dashboard');
        }
      }
    },
    replace: (name, params = {}) => {
      if (handleRouteRedirect(name)) return;
      setHistory((prev) => [...prev.slice(0, -1), { name, params }]);
    },
    reset: (state) => {
      const firstRoute = state?.routes?.[0] || { name: 'Login', params: {} };
      if (handleRouteRedirect(firstRoute.name)) return;
      setHistory([firstRoute]);
    },
  };

  const route = {
    params: currentRoute?.params || {},
  };

  const renderScreen = () => {
    switch (currentRoute.name) {
      case 'Splash':
        return <SplashScreen navigation={navigation} route={route} />;
      case 'Welcome':
        return <WelcomeScreen navigation={navigation} route={route} />;
      case 'Login':
        return <LoginScreen navigation={navigation} route={route} />;
      case 'SignUp':
        return <SignUpScreen navigation={navigation} route={route} />;
      case 'ForgotPassword':
        return <ForgotPasswordScreen navigation={navigation} route={route} />;
      case 'OtpVerification':
        return <OtpVerificationScreen navigation={navigation} route={route} />;
      case 'ResetPassword':
        return <ResetPasswordScreen navigation={navigation} route={route} />;
      case 'Success':
        return <SuccessScreen navigation={navigation} route={route} />;
      case 'MyProfile':
        return <MyProfileScreen navigation={navigation} route={route} />;
      case 'EditProfile':
        return <EditProfileScreen navigation={navigation} route={route} />;
      case 'Settings':
        return <SettingsScreen navigation={navigation} route={route} />;
      case 'Accessibility':
        return <AccessibilityScreen navigation={navigation} route={route} />;
      default:
        return <WelcomeScreen navigation={navigation} route={route} />;
    }
  };

  return <View style={styles.container}>{renderScreen()}</View>;
}

/**
 * Primary Export: AuthNavigator
 * Automatically connects to native stack or runs in self-contained mode.
 */
export default function AuthNavigator({ initialRoute = 'Splash', ...props }) {
  if (createNativeStackNavigator) {
    try {
      return <NativeAuthNavigator initialRoute={initialRoute} {...props} />;
    } catch (err) {
      return <StandaloneAuthNavigator initialRoute={initialRoute} {...props} />;
    }
  }
  return <StandaloneAuthNavigator initialRoute={initialRoute} {...props} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F7F3',
  },
});
