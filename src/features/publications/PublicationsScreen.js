import React from 'react';
import { FlatList, Platform, Text, TextInput, View } from 'react-native';
import { Button, Card, EmptyState, SectionHeader, StatusBadge } from '../../components';
import { getTheme } from '../../theme/tokens';

const PublicationCard = ({ publication, darkMode, onOpen }) => {
  const { colors, spacing, typography } = getTheme(darkMode);
  return (
    <Card darkMode={darkMode} variant="outlined">
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md }}>
        <View style={{ flex: 1 }}>
          <Text style={[typography.cardTitle, { color: colors.text }]}>{publication.title}</Text>
          <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>
            {publication.officialTitle}
          </Text>
        </View>
        <StatusBadge
          status={publication.verificationStatus === 'verified' ? 'verificado' : 'validacao pendente'}
          darkMode={darkMode}
        />
      </View>
      <View style={{ marginTop: spacing.md, gap: spacing.xs }}>
        <Text style={[typography.caption, { color: colors.textMuted }]}>Arquivo: {publication.source}</Text>
        <Text style={[typography.caption, { color: colors.textMuted }]}>Edição: {publication.edition}</Text>
        <Text style={[typography.caption, { color: colors.textMuted }]}>{publication.embeddedPages} páginas disponíveis offline</Text>
      </View>
      <Text style={[typography.body, { color: colors.text, marginTop: spacing.md }]}>
        {publication.summary || publication.content}
      </Text>
      {publication.verificationStatus !== 'verified' ? (
        <Text style={[typography.caption, { color: colors.pending, marginTop: spacing.sm }]}>
          Texto de apoio sem validação por artigo e página.
        </Text>
      ) : null}
      <Button
        label={Platform.OS === 'web' ? 'Visualizar PDF' : 'Abrir PDF'}
        onPress={() => onOpen(publication)}
        darkMode={darkMode}
        style={{ marginTop: spacing.lg }}
        accessibilityLabel={`Abrir PDF de ${publication.title}`}
      />
    </Card>
  );
};

export const PublicationsScreen = ({
  publications,
  filter,
  isDarkMode,
  header,
  onChangeFilter,
  onOpenPublication,
}) => {
  const { colors, radii, spacing, typography } = getTheme(isDarkMode);

  return (
    <FlatList
      data={publications}
      keyExtractor={(publication) => publication.id}
      renderItem={({ item }) => (
        <PublicationCard publication={item} darkMode={isDarkMode} onOpen={onOpenPublication} />
      )}
      ListHeaderComponent={
        <>
          {header}
          <SectionHeader
            title="Normas"
            description="Documentos embarcados no aplicativo para consulta sem conexão."
            darkMode={isDarkMode}
          />
          <Card darkMode={isDarkMode} variant="warning" accessibilityRole="alert">
            <Text style={[typography.bodyStrong, { color: colors.pending }]}>Ferramenta de apoio</Text>
            <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>
              Confira o PDF e a edição vigente antes de fundamentar uma ação. Os resumos não substituem o documento oficial.
            </Text>
          </Card>
          <TextInput
            value={filter}
            onChangeText={onChangeFilter}
            placeholder="Título, arquivo ou conteúdo"
            placeholderTextColor={colors.textMuted}
            accessibilityLabel="Filtrar normas"
            style={[
              typography.body,
              {
                minHeight: 48,
                paddingHorizontal: spacing.md,
                marginBottom: spacing.lg,
                borderRadius: radii.control,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.surface,
                color: colors.text,
              },
            ]}
          />
        </>
      }
      ListEmptyComponent={
        <EmptyState
          title="Nenhuma norma encontrada"
          description="Revise o texto do filtro para consultar os documentos disponíveis."
          darkMode={isDarkMode}
        />
      }
      contentContainerStyle={{ padding: spacing.xl, paddingBottom: 164, flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
      initialNumToRender={7}
      windowSize={5}
    />
  );
};
