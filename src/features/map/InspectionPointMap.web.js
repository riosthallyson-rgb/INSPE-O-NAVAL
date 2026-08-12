import React from 'react';
import { Text, View } from 'react-native';
import { getTheme } from '../../theme/tokens';

export const InspectionPointMap = ({ latitude, longitude, darkMode }) => {
  const { colors, spacing, typography } = getTheme(darkMode);
  return <View accessible accessibilityLabel={`Local da inspeção, latitude ${latitude}, longitude ${longitude}`} style={{ minHeight: 120, marginTop: spacing.md, padding: spacing.md, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.surfaceElevated }}><Text style={[typography.bodyStrong, { color: colors.text }]}>Visualização textual do ponto</Text><Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>{latitude.toFixed(6)}, {longitude.toFixed(6)}</Text><Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>O mapa nativo está disponível no iOS e Android.</Text></View>;
};
