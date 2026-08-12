import React, { useState } from 'react';
import { Alert, Linking, Platform, ScrollView, Text, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, EmptyState, SectionHeader, StatusBadge } from '../../src/components';
import { getPublicationById } from '../../src/data/publications';
import { getPublicationUri } from '../../src/infrastructure/publicationPdf';
import { getTheme } from '../../src/theme/tokens';

export default function PublicationDetailsRoute() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const publicationId = Array.isArray(params.id) ? params.id[0] : params.id;
  const publication = getPublicationById(publicationId);
  const darkMode = params.dark === '1';
  const requestedPage = Number(Array.isArray(params.page) ? params.page[0] : params.page);
  const [opening, setOpening] = useState(false);
  const { colors, spacing, typography } = getTheme(darkMode);

  const openPdf = async () => {
    if (!publication || opening) return;
    setOpening(true);
    try {
      const uri = await getPublicationUri(publication);
      try {
        await Linking.openURL(Number.isInteger(requestedPage) && requestedPage > 0 ? `${uri}#page=${requestedPage}` : uri);
      } catch (openError) {
        if (Platform.OS === 'web' || !(await Sharing.isAvailableAsync())) throw openError;
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: `Abrir ${publication.title}`,
        });
      }
    } catch (error) {
      Alert.alert('PDF indisponível', `Não foi possível abrir este documento: ${error.message}`);
    } finally {
      setOpening(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'bottom', 'left', 'right']}>
      <Stack.Screen options={{ title: publication?.title || 'Norma' }} />
      <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: spacing.xxxl }}>
        <Button
          label="Voltar para Normas"
          variant="ghost"
          darkMode={darkMode}
          onPress={() => router.back()}
          style={{ alignSelf: 'flex-start', marginBottom: spacing.md }}
        />
        {!publication ? (
          <EmptyState
            title="Publicação não encontrada"
            description="O documento solicitado não faz parte desta versão do aplicativo."
            actionLabel="Voltar"
            onAction={() => router.back()}
            darkMode={darkMode}
          />
        ) : (
          <>
            <SectionHeader
              title={publication.title}
              description={publication.officialTitle}
              darkMode={darkMode}
            />
            <Card darkMode={darkMode} variant="warning" accessibilityRole="alert">
              <StatusBadge
                status={publication.verificationStatus === 'verified' ? 'verificado' : 'validacao pendente'}
                darkMode={darkMode}
              />
              <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.md }]}>
                Confira a edição e o conteúdo do PDF antes de fundamentar uma ação.
              </Text>
            </Card>
            <Card darkMode={darkMode} variant="outlined">
              <Text style={[typography.cardTitle, { color: colors.text }]}>Dados do documento</Text>
              <View style={{ marginTop: spacing.md, gap: spacing.sm }}>
                <Text style={[typography.body, { color: colors.textMuted }]}>Arquivo: {publication.source}</Text>
                <Text style={[typography.body, { color: colors.textMuted }]}>Edição: {publication.edition}</Text>
                <Text style={[typography.body, { color: colors.textMuted }]}>Disponível offline: {publication.embeddedPages} páginas</Text>
              </View>
            </Card>
            {Number.isInteger(requestedPage) && requestedPage > 0 ? <Card darkMode={darkMode} variant="outlined"><Text style={[typography.bodyStrong, { color: colors.text }]}>Citação localizada na página PDF {requestedPage}</Text><Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>O aplicativo solicitará a abertura nessa página. O suporte ao posicionamento depende do visualizador de PDF do aparelho.</Text></Card> : null}
            <Card darkMode={darkMode} variant="outlined">
              <Text style={[typography.cardTitle, { color: colors.text }]}>Texto de apoio</Text>
              <Text style={[typography.body, { color: colors.textMuted, marginTop: spacing.sm }]}>
                {publication.summary || publication.content}
              </Text>
            </Card>
            <Button
              label="Abrir PDF"
              loading={opening}
              darkMode={darkMode}
              onPress={openPdf}
              accessibilityLabel={`Abrir PDF de ${publication.title}`}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
