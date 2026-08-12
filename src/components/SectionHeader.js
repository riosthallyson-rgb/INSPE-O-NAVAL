import React from 'react';
import { Text, View } from 'react-native';
import { getTheme } from '../theme/tokens';

export const SectionHeader = ({ title, description, action, darkMode = false, style }) => {
  const { colors, spacing, typography } = getTheme(darkMode);

  return (
    <View style={[{ marginBottom: spacing.lg }, style]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text accessibilityRole="header" style={[typography.sectionTitle, { color: colors.text, flex: 1 }]}>
          {title}
        </Text>
        {action || null}
      </View>
      {description ? (
        <Text style={[typography.body, { color: colors.textMuted, marginTop: spacing.xs }]}>
          {description}
        </Text>
      ) : null}
    </View>
  );
};
