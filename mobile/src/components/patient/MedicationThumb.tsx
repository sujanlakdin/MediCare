import React from 'react';
import { View, Image, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Svg, { Rect, Path } from 'react-native-svg';

interface MedicationThumbProps {
  uri?: string;
  size?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * MedicationThumb Component
 * Displays a medication photo thumbnail, or a mint rounded square
 * with a crisp medkit icon when no photo is provided.
 */
export default function MedicationThumb({
  uri,
  size = 56,
  radius = 16,
  style,
}: MedicationThumbProps) {
  if (uri && uri.trim().length > 0) {
    return (
      <View
        style={[
          styles.container,
          {
            width: size,
            height: size,
            borderRadius: radius,
          },
          style,
        ]}
      >
        <Image
          source={{ uri }}
          style={[
            styles.image,
            {
              width: size,
              height: size,
              borderRadius: radius,
            },
          ]}
          resizeMode="cover"
          accessibilityRole="image"
          accessibilityLabel="Medication photo"
        />
      </View>
    );
  }

  // Medkit vector fallback
  const iconSize = Math.round(size * 0.52);

  return (
    <View
      style={[
        styles.fallbackBox,
        {
          width: size,
          height: size,
          borderRadius: radius,
        },
        style,
      ]}
      accessible={true}
      accessibilityRole="image"
      accessibilityLabel="Default medicine icon"
    >
      <Svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="none"
      >
        {/* Medkit briefcase handle */}
        <Path
          d="M9 6V4C9 3.44772 9.44772 3 10 3H14C14.5523 3 15 3.44772 15 4V6"
          stroke="#006A4E"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Medkit bag body */}
        <Rect
          x="3"
          y="6"
          width="18"
          height="14"
          rx="3"
          stroke="#006A4E"
          strokeWidth="2"
        />
        {/* Cross on bag */}
        <Path
          d="M12 9.5V16.5M8.5 13H15.5"
          stroke="#006A4E"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#E4F5EC',
  },
  image: {
    backgroundColor: '#E4F5EC',
  },
  fallbackBox: {
    backgroundColor: '#E4F5EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
