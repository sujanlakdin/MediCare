import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../../theme';

/**
 * Toast Component
 * Floating notification pill matching HTML reference.
 */
export default function Toast({
  visible = false,
  message = '',
  onDismiss = () => {},
  onHide = () => {},
  duration = 2600,
}) {
  const handleDismiss = onDismiss || onHide;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(14)).current;

  useEffect(() => {
    if (visible && message) {
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 220,
            useNativeDriver: true,
          }),
          Animated.timing(translateYAnim, {
            toValue: 10,
            duration: 220,
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (handleDismiss) handleDismiss();
        });
      }, duration);

      return () => clearTimeout(timer);
    } else {
      opacityAnim.setValue(0);
      translateYAnim.setValue(14);
    }
  }, [visible, message, duration, opacityAnim, translateYAnim, onDismiss]);

  if (!visible && !message) return null;

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        {
          opacity: opacityAnim,
          transform: [{ translateY: translateYAnim }],
        },
      ]}
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
      pointerEvents="none"
    >
      <Text style={styles.toastText} allowFontScaling={true}>
        {message}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 36,
    zIndex: 9999,
    backgroundColor: COLORS.deep,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  toastText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.sm + 0.5,
    fontWeight: FONTS.weights.semibold,
    textAlign: 'center',
    fontFamily: FONTS.family,
  },
});
