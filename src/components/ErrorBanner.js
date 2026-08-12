import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { getTheme } from '../theme/tokens';

export const ErrorBanner = ({ message, onDismiss, darkMode = false }) => {
  const { colors, radii, spacing, typography } = getTheme(darkMode);

  return (
    <View
      style={{
        backgroundColor: colors.dangerSurface,
        borderColor: colors.nonConform,
        borderWidth: 1,
        borderRadius: radii.control,
        padding: spacing.md,
        marginBottom: spacing.lg,
      }}
      accessibilityRole="alert"
    >
      <Text style={[typography.bodyStrong, { color: colors.text }]}>{message}</Text>
      {onDismiss ? (
        <Pressable
          onPress={onDismiss}
          accessibilityRole="button"
          accessibilityLabel="Fechar aviso"
          style={({ pressed }) => ({
            minHeight: 44,
            alignSelf: 'flex-start',
            justifyContent: 'center',
            marginTop: spacing.xs,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={[typography.bodyStrong, { color: colors.nonConform }]}>Fechar</Text>
        </Pressable>
      ) : null}
    </View>
  );
};
