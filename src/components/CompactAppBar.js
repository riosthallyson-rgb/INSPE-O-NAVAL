import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { ErrorBanner } from './ErrorBanner';
import { getTheme } from '../theme/tokens';

export const CompactAppBar = ({ title, darkMode, storageError, storageNotice, onDismissStorageError, onDismissStorageNotice, onToggleTheme }) => {
  const { colors, radii, spacing, typography } = getTheme(darkMode);
  return <>
    {storageError ? <ErrorBanner message={storageError} onDismiss={onDismissStorageError} darkMode={darkMode} /> : null}
    {storageNotice ? <View accessibilityRole="alert" style={{ borderWidth: 1, borderColor: colors.border, borderRadius: radii.control, padding: spacing.md, marginBottom: spacing.md, backgroundColor: colors.infoSurface }}><View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm }}><Text style={[typography.caption, { color: colors.text, flex: 1 }]}>{storageNotice}</Text><Pressable onPress={onDismissStorageNotice} accessibilityRole="button" accessibilityLabel="Dispensar aviso de armazenamento" style={{ minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}><Text style={[typography.label, { color: colors.action }]}>Fechar</Text></Pressable></View></View> : null}
    <View style={{ minHeight: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, marginBottom: spacing.lg, borderRadius: radii.card, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        <View style={{ width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary }}><Text style={[typography.label, { color: darkMode ? colors.background : colors.onAction }]}>IN</Text></View>
        <View style={{ marginLeft: spacing.sm, flex: 1 }}><Text style={[typography.bodyStrong, { color: colors.text }]}>{title}</Text><Text style={[typography.label, { color: colors.textMuted }]}>Offline · salvo neste dispositivo</Text></View>
      </View>
      <Pressable onPress={onToggleTheme} accessibilityRole="button" accessibilityLabel={darkMode ? 'Ativar modo claro' : 'Ativar modo escuro'} style={{ minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}><Text style={[typography.label, { color: colors.action }]}>{darkMode ? 'Claro' : 'Escuro'}</Text></Pressable>
    </View>
  </>;
};
