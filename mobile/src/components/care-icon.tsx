import React from 'react';
import { View } from 'react-native';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';

export type CareIconName =
  | 'phone'
  | 'mail'
  | 'location'
  | 'medical'
  | 'pencil'
  | 'heart'
  | 'chevron-right'
  | 'arrow-left'
  | 'plus'
  | 'minus'
  | 'trash'
  | 'bell'
  | 'eye'
  | 'shield'
  | 'help'
  | 'logout'
  | 'pharmacist'
  | 'guide'
  | 'chat'
  | 'alert-triangle'
  | 'dashboard'
  | 'patients'
  | 'reports'
  | 'alerts'
  | 'profile'
  | 'check';

type CareIconProps = {
  name: CareIconName;
  size?: number;
  color?: string;
  style?: any;
};

// SF & Material Symbols mapping for native
const nativeSymbolMap: Record<CareIconName, SymbolViewProps['name']> = {
  phone: { ios: 'phone.fill', android: 'phone', web: 'phone' },
  mail: { ios: 'envelope.fill', android: 'email', web: 'email' },
  location: { ios: 'mappin.and.ellipse', android: 'location_on', web: 'location_on' },
  medical: { ios: 'waveform.path.ecg', android: 'monitor_heart', web: 'monitor_heart' },
  pencil: { ios: 'pencil', android: 'edit', web: 'edit' },
  heart: { ios: 'heart.fill', android: 'favorite', web: 'favorite' },
  'chevron-right': { ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' },
  'arrow-left': { ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' },
  plus: { ios: 'plus', android: 'add', web: 'add' },
  minus: { ios: 'minus', android: 'remove', web: 'remove' },
  trash: { ios: 'trash', android: 'delete', web: 'delete' },
  bell: { ios: 'bell.fill', android: 'notifications', web: 'notifications' },
  eye: { ios: 'eye.fill', android: 'visibility', web: 'visibility' },
  shield: { ios: 'shield.fill', android: 'security', web: 'security' },
  help: { ios: 'questionmark.circle', android: 'help_outline', web: 'help_outline' },
  logout: { ios: 'rectangle.portrait.and.arrow.right', android: 'logout', web: 'logout' },
  pharmacist: { ios: 'cross.vial.fill', android: 'local_pharmacy', web: 'local_pharmacy' },
  guide: { ios: 'book.closed.fill', android: 'menu_book', web: 'menu_book' },
  chat: { ios: 'message.fill', android: 'chat', web: 'chat' },
  'alert-triangle': { ios: 'exclamationmark.triangle.fill', android: 'warning', web: 'warning' },
  dashboard: { ios: 'square.grid.2x2.fill', android: 'grid_view', web: 'grid_view' },
  patients: { ios: 'person.2.fill', android: 'group', web: 'group' },
  reports: { ios: 'doc.text.fill', android: 'description', web: 'description' },
  alerts: { ios: 'bell.badge.fill', android: 'notifications_active', web: 'notifications_active' },
  profile: { ios: 'person.crop.circle.fill', android: 'person', web: 'person' },
  check: { ios: 'checkmark', android: 'check', web: 'check' },
};

export function CareIcon({ name, size = 20, color = '#0E3E2F', style }: CareIconProps) {
  const symbol = nativeSymbolMap[name];
  if (!symbol) return null;

  return (
    <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
      <SymbolView name={symbol} size={size} tintColor={color} />
    </View>
  );
}
