import React, { useState } from 'react';
import { FlatList, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Button, Card, EmptyState, SectionHeader, StatusBadge } from '../../components';
import { formatDate } from '../../domain/report';
import { getTheme } from '../../theme/tokens';
import { HistoryInspectionMap } from '../map/HistoryInspectionMap';

const resultFilters = ['Todos', 'Conforme', 'Não conforme', 'Em andamento'];

const HistorySummary = ({ summary, darkMode }) => {
  const { colors, spacing, typography } = getTheme(darkMode);
  const metrics = [
    { label: 'Inspeções', value: summary.total, color: colors.primary },
    { label: 'Conformes', value: summary.conforming, color: colors.conform },
    { label: 'Não conformes', value: summary.nonConforming, color: colors.nonConform },
    { label: 'Taxa de conformidade', value: `${summary.conformityRate}%`, color: colors.action },
  ];

  return (
    <View accessibilityRole="summary" accessibilityLabel={`Resumo dos últimos ${summary.periodDays} dias`}>
      <Text style={[typography.label, { color: colors.textMuted, marginBottom: spacing.sm }]}>ÚLTIMOS {summary.periodDays} DIAS</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md }}>
        {metrics.map((metric) => (
          <Card
            key={metric.label}
            darkMode={darkMode}
            variant="elevated"
            style={{ flexGrow: 1, flexBasis: '45%', minWidth: 140, marginBottom: 0 }}
            accessible
            accessibilityLabel={`${metric.label}: ${metric.value}`}
          >
            <Text style={[typography.screenTitle, { color: metric.color }]}>{metric.value}</Text>
            <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>{metric.label}</Text>
          </Card>
        ))}
      </View>
    </View>
  );
};

const HistoryCard = ({ inspection, darkMode, onShareReport }) => {
  const { colors, spacing, typography } = getTheme(darkMode);
  const [sharing, setSharing] = useState(false);
  const vesselName = inspection.vessel.name || 'embarcação';
  const isWeb = Platform.OS === 'web';

  const handleShare = async () => {
    if (sharing) return;
    setSharing(true);
    try {
      await onShareReport(inspection);
    } finally {
      setSharing(false);
    }
  };

  return (
    <Card darkMode={darkMode} variant="outlined">
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md }}>
        <View style={{ flex: 1 }}>
          <Text style={[typography.cardTitle, { color: colors.text }]}>{inspection.vessel.name || 'Embarcação sem nome'}</Text>
          <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>TIE {inspection.vessel.tie || 'não informado'}</Text>
        </View>
        <StatusBadge status={inspection.result} darkMode={darkMode} />
      </View>
      <View style={{ marginTop: spacing.md, gap: spacing.xs }}>
        <Text style={[typography.caption, { color: colors.textMuted }]}>Data: {formatDate(inspection.completedAt || inspection.createdAt)}</Text>
        <Text style={[typography.caption, { color: colors.textMuted }]}>Inspetor: {inspection.inspector?.name || 'Não informado'}</Text>
        <Text style={[typography.caption, { color: colors.textMuted }]}>Etapa final: {inspection.stage || 'Não informada'}</Text>
      </View>
      <Button
        label={isWeb ? 'Abrir relatório PDF' : 'Compartilhar relatório PDF'}
        loading={sharing}
        darkMode={darkMode}
        onPress={handleShare}
        accessibilityLabel={isWeb ? `Abrir relatório PDF de ${vesselName}` : `Compartilhar relatório PDF de ${vesselName}`}
        style={{ marginTop: spacing.lg }}
      />
    </Card>
  );
};

export const InspectionHistoryScreen = ({
  history,
  summary,
  hasStoredHistory,
  search,
  resultFilter,
  isDarkMode,
  header,
  onChangeSearch,
  onChangeResultFilter,
  onShareReport,
}) => {
  const { colors, radii, spacing, typography } = getTheme(isDarkMode);
  const filtering = Boolean(search.trim()) || resultFilter !== 'Todos';
  const [showMap, setShowMap] = useState(false);
  const mappedInspections = history.map((inspection) => {
    const location = inspection.context?.inspectionLocation;
    const latitude = Number(location?.latitude ?? inspection.context?.latitude);
    const longitude = Number(location?.longitude ?? inspection.context?.longitude);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
    return { id: inspection.id, latitude, longitude, vesselName: inspection.vessel?.name || 'Embarcação sem nome', date: formatDate(inspection.completedAt || inspection.createdAt), markerColor: inspection.result === 'Conforme' ? '#15803D' : inspection.findings?.length ? '#B91C1C' : '#1D4ED8' };
  }).filter(Boolean);

  const listHeader = (
    <>
      {header}
      <SectionHeader
        title="Histórico"
        description="Consulte inspeções arquivadas e compartilhe seus relatórios em PDF."
        darkMode={isDarkMode}
      />
      <HistorySummary summary={summary} darkMode={isDarkMode} />
      <Card darkMode={isDarkMode} variant="outlined"><Text style={[typography.bodyStrong, { color: colors.text }]}>Histórico no mapa</Text><Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>{mappedInspections.length} inspeção(ões) georreferenciada(s) nos resultados atuais. Somente registros deste dispositivo são exibidos.</Text><Button label={showMap ? 'Ocultar mapa' : 'Ver inspeções no mapa'} variant="secondary" disabled={!mappedInspections.length} onPress={() => setShowMap((current) => !current)} darkMode={isDarkMode} style={{ marginTop: spacing.md }} />{showMap && mappedInspections.length ? <View style={{ marginTop: spacing.md }}><HistoryInspectionMap inspections={mappedInspections} darkMode={isDarkMode} />{mappedInspections.length > 50 ? <Text style={[typography.caption, { color: colors.pending, marginTop: spacing.sm }]}>A visualização foi limitada aos 50 primeiros pontos para preservar desempenho e evitar sobreposição excessiva.</Text> : null}</View> : null}</Card>
      <TextInput
        value={search}
        onChangeText={onChangeSearch}
        placeholder="Embarcação, TIE ou armador"
        placeholderTextColor={colors.textMuted}
        accessibilityLabel="Pesquisar no histórico"
        style={[
          typography.body,
          {
            minHeight: 48,
            paddingHorizontal: spacing.md,
            marginBottom: spacing.md,
            borderRadius: radii.control,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.surface,
            color: colors.text,
          },
        ]}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: spacing.sm, paddingBottom: spacing.lg }}
        accessibilityRole="radiogroup"
      >
        {resultFilters.map((option) => {
          const selected = resultFilter === option;
          return (
            <Pressable
              key={option}
              onPress={() => onChangeResultFilter(option)}
              accessibilityRole="radio"
              accessibilityLabel={`Resultado: ${option}`}
              accessibilityState={{ selected }}
              style={({ pressed }) => ({
                minHeight: 44,
                justifyContent: 'center',
                paddingHorizontal: spacing.md,
                borderRadius: radii.pill,
                borderWidth: selected ? 2 : 1,
                borderColor: selected ? colors.action : colors.border,
                backgroundColor: selected ? colors.infoSurface : colors.surface,
                opacity: pressed ? 0.75 : 1,
              })}
            >
              <Text style={[typography.caption, { color: selected ? colors.primary : colors.textMuted }]}>{option}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </>
  );

  return (
    <FlatList
      data={history}
      keyExtractor={(item, index) => item.id || `inspecao-${index}`}
      renderItem={({ item }) => (
        <HistoryCard inspection={item} darkMode={isDarkMode} onShareReport={onShareReport} />
      )}
      ListHeaderComponent={listHeader}
      ListEmptyComponent={
        <EmptyState
          title={filtering && hasStoredHistory ? 'Nenhum resultado encontrado' : 'Nenhuma inspeção arquivada'}
          description={
            filtering && hasStoredHistory
              ? 'Ajuste o texto pesquisado ou selecione outro resultado.'
              : 'As inspeções concluídas serão exibidas aqui e permanecerão disponíveis sem conexão.'
          }
          darkMode={isDarkMode}
        />
      }
      contentContainerStyle={{ padding: spacing.xl, paddingBottom: 164, flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
      initialNumToRender={8}
      windowSize={7}
      removeClippedSubviews
    />
  );
};
