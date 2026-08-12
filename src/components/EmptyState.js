import React from 'react';
import { Text, View } from 'react-native';
import { getTheme } from '../theme/tokens';
import { Button } from './Button';

export const EmptyState = ({ title, description, actionLabel, onAction, darkMode = false }) => {
  const { colors, radii, spacing, typography } = getTheme(darkMode);

  return (
    <View
      style={{
        alignItems: 'center',
        padding: spacing.xxl,
        borderRadius: radii.card,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
      }}
      accessibilityRole="summary"
    >
      <View
        style={{
          width: 40,
          height: 4,
          borderRadius: 2,
          backgroundColor: colors.action,
          marginBottom: spacing.lg,
        }}
      />
      <Text style={[typography.sectionTitle, { color: colors.text, textAlign: 'center' }]}>
        {title}
      </Text>
      <Text
        style={[
          typography.body,
          { color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm },
        ]}
      >
        {description}
      </Text>
      {actionLabel && onAction ? (
        <Button
          label={actionLabel}
          onPress={onAction}
          darkMode={darkMode}
          variant="secondary"
          style={{ alignSelf: 'stretch', marginTop: spacing.lg }}
        />
      ) : null}
    </View>
  );
};
