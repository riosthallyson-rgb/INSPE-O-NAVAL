import React from 'react';
import { Text, View } from 'react-native';
import { getTheme } from '../../theme/tokens';

export const HistoryInspectionMap = ({ inspections, darkMode }) => {
  const { colors, spacing, typography } = getTheme(darkMode);
  return <View>{inspections.map((item) => <View key={item.id} style={{ paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border }}><Text style={[typography.bodyStrong, { color: colors.text }]}>Inspeção {item.id}</Text><Text style={[typography.caption, { color: colors.textMuted }]}>{item.vesselName} · {item.date}</Text><Text style={[typography.caption, { color: colors.textMuted }]}>{item.latitude.toFixed(6)}, {item.longitude.toFixed(6)}</Text></View>)}</View>;
};
