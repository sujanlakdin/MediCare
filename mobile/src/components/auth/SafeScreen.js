import React from 'react';
import {
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
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
  const KeyboardWrapper = Platform.OS === 'ios' ? KeyboardAvoidingView : View;

  const renderContent = () => (
    <View style={[styles.contentContainer, contentContainerStyle]}>
      {children}
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }, style]}>
      <StatusBar barStyle={barStyle} backgroundColor={backgroundColor} />
      <KeyboardWrapper
        {...(Platform.OS === 'ios' ? { behavior: 'padding' } : {})}
        style={styles.keyboardAvoid}>
        {scrollable ? (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="always"
            keyboardDismissMode="none"
            showsVerticalScrollIndicator={false}
          >
            {renderContent()}
          </ScrollView>
        ) : (
          renderContent()
        )}
      </KeyboardWrapper>
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
  contentContainer: {
    flexGrow: 1,
  },
});
