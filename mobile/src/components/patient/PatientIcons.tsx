import React from 'react';
import { View, Platform, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const ICON_PATHS: Record<string, string> = {
  home: 'M3 11l9-8 9 8M5 10v10h14V10',
  pill: 'M10.5 20.5a5 5 0 01-7-7l10-10a5 5 0 017 7z M8.5 8.5l7 7',
  bell: 'M6 9a6 6 0 0112 0c0 6 2 7 2 7H4s2-1 2-7 M10 20a2 2 0 004 0',
  chart: 'M4 20V4 M4 20h16 M8 16v-5 M12 16V8 M16 16v-3',
  user: 'M12 12a4 4 0 100-8 4 4 0 000 8 M4 21c0-4 4-6 8-6s8 2 8 6',
  plus: 'M12 5v14 M5 12h14',
  minus: 'M5 12h14',
  search: 'M11 18a7 7 0 100-14 7 7 0 000 14 M21 21l-5-5',
  edit: 'M4 20h4L19 9l-4-4L4 16z M13 7l4 4',
  trash: 'M4 7h16 M9 7V4h6v3 M6 7l1 13h10l1-13',
  clock: 'M12 21a9 9 0 100-18 9 9 0 000 18 M12 7v5l3 2',
  back: 'M15 5l-7 7 7 7',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  sun: 'M12 17a5 5 0 100-10 5 5 0 000 10 M12 2v2 M12 20v2 M4.9 4.9l1.4 1.4 M17.7 17.7l1.4 1.4 M2 12h2 M20 12h2 M4.9 19.1l1.4-1.4 M17.7 6.3l1.4-1.4',
  moon: 'M21 13A9 9 0 1111 3a7 7 0 0010 10z',
  camera: 'M4 8h3l2-3h6l2 3h3v11H4z M12 17a4 4 0 100-8 4 4 0 000 8',
  cal: 'M4 6h16v14H4z M4 10h16 M8 3v4 M16 3v4',
  'arrow-left': 'M19 12H5 M12 19l-7-7 7-7',
};

interface PatientIconProps {
  name: keyof typeof ICON_PATHS | string;
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: any;
}

export default function PatientIcon({
  name,
  size = 22,
  color = 'currentColor',
  strokeWidth = 2,
  style,
}: PatientIconProps) {
  const pathD = ICON_PATHS[name];
  if (!pathD) return null;

  if (Platform.OS === 'web') {
    return (
      <View style={[{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }, style]}>
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ display: 'block' }}
          aria-hidden="true"
        >
          <path d={pathD} />
        </svg>
      </View>
    );
  }

  return (
    <View style={[{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }, style]}>
      <Svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
      >
        <Path
          d={pathD}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}
