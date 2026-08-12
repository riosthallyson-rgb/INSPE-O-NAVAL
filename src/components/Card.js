import React from 'react';
import { View } from 'react-native';
import { getTheme } from '../theme/tokens';

export const Card = ({ children, darkMode = false, variant = 'default', style, ...props }) => {
  const { colors, radii, spacing } = getTheme(darkMode);
  const variants = {
    default: { backgroundColor: colors.surface, borderColor: colors.border },
    elevated: { backgroundColor: colors.surfaceElevated, borderColor: colors.border, elevation: 3 },
    outlined: { backgroundColor: 'transparent', borderColor: colors.border },
    warning: { backgroundColor: colors.warningSurface, borderColor: colors.pending },
  };

  return (
    <View
      style={[
        {
          borderRadius: radii.card,
          borderWidth: 1,
          padding: spacing.lg,
          marginBottom: spacing.lg,
        },
        variants[variant] || variants.default,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};
