import React from 'react';
import {
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  Pressable,
  Keyboard,
  Platform,
  StyleSheet,
  StatusBar,
  View,
} from 'react-native';
import { COLORS } from '../../theme';

/**
 * SafeScreen Wrapper
 * Combines SafeAreaView + KeyboardAvoidingView + ScrollView
 * Guarantees that keyboard interactions never obscure input fields.
 * Safely supports multiple children and cross-platform (Web, iOS, Android).
 * @param {Object} props
 * @param {any} [props.children]
 * @param {any} [props.style]
 * @param {any} [props.contentContainerStyle]
 * @param {boolean} [props.scrollable]
 * @param {any} [props.barStyle]
 * @param {string} [props.backgroundColor]
 */
export default function SafeScreen({
  children,
  style = undefined,
  contentContainerStyle = undefined,
  scrollable = true,
  barStyle = 'light-content',
  backgroundColor = COLORS.surface,
}) {
  const handleDismissKeyboard = () => {
    if (Platform.OS !== 'web') {
      Keyboard.dismiss();
    }
  };

  const renderContent = () => (
    <View style={[styles.contentContainer, contentContainerStyle]}>
      {children}
    </View>
  );

  const innerContent =
    Platform.OS === 'web' ? (
      renderContent()
    ) : (
      <Pressable
        onPress={handleDismissKeyboard}
        style={styles.pressableWrapper}
        accessible={false}
      >
        {renderContent()}
      </Pressable>
    );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }, style]}>
      <StatusBar barStyle={barStyle} backgroundColor={backgroundColor} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoid}
      >
        {scrollable ? (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {innerContent}
          </ScrollView>
        ) : (
          innerContent
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  pressableWrapper: {
    flexGrow: 1,
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    flex: 1,
  },
});
