import React, { useState } from "react";
import { View, StyleSheet } from "react-native";

// Import all Member 1 Screens
import WelcomeScreen from "../screens/auth/WelcomeScreen";
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import ResetPasswordScreen from "../screens/auth/ResetPasswordScreen";
import MyProfileScreen from "../screens/profile/MyProfileScreen";
import EditProfileScreen from "../screens/profile/EditProfileScreen";
import SettingsScreen from "../screens/profile/SettingsScreen";
import AccessibilityScreen from "../screens/profile/AccessibilityScreen";

export {
  WelcomeScreen,
  LoginScreen,
  RegisterScreen,
  ResetPasswordScreen,
  MyProfileScreen,
  EditProfileScreen,
  SettingsScreen,
  AccessibilityScreen,
};

// Check if @react-navigation/native-stack is available
let createNativeStackNavigator = null;
try {
  createNativeStackNavigator =
    require("@react-navigation/native-stack").createNativeStackNavigator;
} catch (e) {
  // Not installed yet; fallback navigator below ensures 100% zero-crash operation
}

/**
 * Native React Navigation Stack implementation (when @react-navigation is installed)
 */
function NativeAuthNavigator() {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#F2F9F5" },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <Stack.Screen name="MyProfile" component={MyProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Accessibility" component={AccessibilityScreen} />
    </Stack.Navigator>
  );
}

/**
 * Self-Contained Standalone Navigator
 * Works out-of-the-box in any React Native / Expo environment without external packages.
 */
function StandaloneAuthNavigator({ initialScreen = "Welcome" }) {
  const [history, setHistory] = useState([initialScreen]);

  const currentScreenName = history[history.length - 1];

  const navigation = {
    navigate: (screenName) => {
      setHistory((prev) => [...prev, screenName]);
    },
    goBack: () => {
      setHistory((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
    },
    replace: (screenName) => {
      setHistory((prev) => [...prev.slice(0, -1), screenName]);
    },
    reset: (screenName) => {
      setHistory([screenName]);
    },
  };

  const renderCurrentScreen = () => {
    switch (currentScreenName) {
      case "Welcome":
        return <WelcomeScreen navigation={navigation} />;
      case "Login":
        return <LoginScreen navigation={navigation} />;
      case "Register":
        return <RegisterScreen navigation={navigation} />;
      case "ResetPassword":
        return <ResetPasswordScreen navigation={navigation} />;
      case "MyProfile":
        return <MyProfileScreen navigation={navigation} />;
      case "EditProfile":
        return <EditProfileScreen navigation={navigation} />;
      case "Settings":
        return <SettingsScreen navigation={navigation} />;
      case "Accessibility":
        return <AccessibilityScreen navigation={navigation} />;
      default:
        return <WelcomeScreen navigation={navigation} />;
    }
  };

  return <View style={styles.container}>{renderCurrentScreen()}</View>;
}

/**
 * Primary Export: AuthStackNavigator
 * Seamlessly uses Native Stack if installed, or Standalone Navigator for foolproof execution.
 */
export default function AuthStackNavigator(props) {
  if (createNativeStackNavigator) {
    try {
      return <NativeAuthNavigator {...props} />;
    } catch (err) {
      return <StandaloneAuthNavigator {...props} />;
    }
  }
  return <StandaloneAuthNavigator {...props} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F9F5",
  },
});
