import React from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Card, EmptyState, SectionHeader } from '../../components';
import { getTheme } from '../../theme/tokens';

const TYPE_LABELS = {
  inspection: 'Histórico',
  vessel: 'Embarcação',
  publication: 'Norma',
};

export const GlobalSearchPanel = ({ query, results, darkMode, onChangeQuery, onSelectResult }) => {
  const { colors, radii, spacing, typography } = getTheme(darkMode);
  const hasQuery = String(query || '').trim().length > 0;

  return (
    <View style={{ marginBottom: spacing.xl }}>
      <SectionHeader
        title="Busca global"
        description="Pesquise, sem internet, no histórico, nas embarcações salvas e nas publicações do aparelho."
        darkMode={darkMode}
      />
      <TextInput
        value={query}
        onChangeText={onChangeQuery}
        placeholder="Nome, TIE, norma, local ou termo"
        placeholderTextColor={colors.textMuted}
        accessibilityLabel="Busca global"
        returnKeyType="search"
        style={[
          typography.body,
          {
            minHeight: 48,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.control,
            backgroundColor: colors.surfaceElevated,
            color: colors.text,
            paddingHorizontal: spacing.md,
            marginBottom: spacing.md,
          },
        ]}
      />
      {hasQuery && !results.length ? (
        <EmptyState
          title="Nada encontrado"
          description="Tente outro nome, número de inscrição ou termo da publicação."
          darkMode={darkMode}
        />
      ) : null}
      {results.slice(0, 8).map((item) => (
        <Pressable
          key={`${item.type}-${item.id}`}
          onPress={() => onSelectResult(item)}
          accessibilityRole="button"
          accessibilityLabel={`${TYPE_LABELS[item.type] || item.type}: ${item.title}`}
        >
          <Card darkMode={darkMode} variant="outlined" style={{ marginBottom: spacing.sm }}>
            <Text style={[typography.label, { color: colors.primary }]}>{TYPE_LABELS[item.type] || item.type}</Text>
            <Text style={[typography.cardTitle, { color: colors.text, marginTop: spacing.xs }]}>{item.title}</Text>
            <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>{item.subtitle}</Text>
          </Card>
        </Pressable>
      ))}
      {results.length > 8 ? <Text style={[typography.caption, { color: colors.textMuted }]}>Mostrando 8 de {results.length} resultados.</Text> : null}
    </View>
  );
};
