import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { getTheme } from '../theme/tokens';

export const Button = ({
  label,
  onPress,
  darkMode = false,
  variant = 'primary',
  disabled = false,
  loading = false,
  accessibilityLabel,
  style,
}) => {
  const { colors, radii, spacing, typography } = getTheme(darkMode);
  const variants = {
    primary: { backgroundColor: colors.action, borderColor: colors.action, color: colors.onAction },
    secondary: { backgroundColor: colors.surfaceElevated, borderColor: colors.border, color: colors.primary },
    danger: {
      backgroundColor: colors.nonConform,
      borderColor: colors.nonConform,
      color: darkMode ? '#07131D' : '#FFFFFF',
    },
    ghost: { backgroundColor: 'transparent', borderColor: 'transparent', color: colors.action },
  };
  const selectedVariant = variants[variant] || variants.primary;
  const { color: labelColor, ...containerVariant } = selectedVariant;
  const unavailable = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={unavailable}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      accessibilityState={{ disabled: unavailable, busy: loading }}
      style={({ pressed }) => [
        {
          minHeight: 48,
          paddingHorizontal: spacing.lg,
          borderRadius: radii.control,
          borderWidth: 1,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: unavailable ? 0.55 : pressed ? 0.82 : 1,
          transform: [{ scale: pressed && !unavailable ? 0.985 : 1 }],
        },
        containerVariant,
        style,
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {loading ? <ActivityIndicator size="small" color={labelColor} /> : null}
        <Text
          style={[
            typography.bodyStrong,
            { color: labelColor, marginLeft: loading ? spacing.sm : 0 },
          ]}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
};
