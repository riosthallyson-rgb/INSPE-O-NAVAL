import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { Button, Card } from '../../components';
import { getStorageSafetySummary } from '../../domain/storageMetrics';
import { measureLocalAppStorage } from '../../infrastructure/localStorageMetrics';
import { getTheme } from '../../theme/tokens';

export const DataSafetyPanel = ({ darkMode, backupHealth, hasHistory, onExportBackup, onImportBackup }) => {
  const { colors, spacing, typography } = getTheme(darkMode);
  const [bytes, setBytes] = useState(0);
  const [measuring, setMeasuring] = useState(true);
  const [measurementError, setMeasurementError] = useState('');

  const refresh = () => {
    setMeasuring(true);
    setMeasurementError('');
    measureLocalAppStorage()
      .then((value) => setBytes(Number(value) || 0))
      .catch(() => {
        setBytes(0);
        setMeasurementError('Não foi possível calcular o espaço usado agora. Os dados continuam disponíveis no dispositivo.');
      })
      .finally(() => setMeasuring(false));
  };

  useEffect(() => {
    refresh();
  }, [backupHealth?.status, backupHealth?.daysSinceBackup]);

  const summary = getStorageSafetySummary({ bytes, backupHealth });

  return (
    <Card darkMode={darkMode} variant={summary.attentionRequired ? 'warning' : 'outlined'}>
      <Text style={[typography.cardTitle, { color: colors.text }]}>Segurança dos dados</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.md }}>
        <View style={{ minWidth: 120, flexGrow: 1 }}>
          <Text style={[typography.label, { color: colors.textMuted }]}>USO LOCAL</Text>
          <Text style={[typography.sectionTitle, { color: colors.text, marginTop: spacing.xs }]}>{measuring ? 'Calculando…' : measurementError ? 'Indisponível' : summary.formattedBytes}</Text>
          <Text style={[typography.caption, { color: colors.textMuted }]}>inclui registros e arquivos no diretório privado do app</Text>
        </View>
        <View style={{ minWidth: 150, flexGrow: 2 }}>
          <Text style={[typography.label, { color: colors.textMuted }]}>BACKUP MANUAL</Text>
          <Text style={[typography.bodyStrong, { color: summary.attentionRequired ? colors.pending : colors.text, marginTop: spacing.xs }]}>{summary.backupMessage}</Text>
        </View>
      </View>
      {measurementError ? <Text accessibilityRole="alert" style={[typography.caption, { color: colors.pending, marginTop: spacing.md }]}>{measurementError}</Text> : null}
      <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.md }]}>O backup é salvo ou compartilhado pelo sistema operacional. O aplicativo não envia esse conteúdo a um servidor.</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md }}>
        <Button label="Exportar backup" variant="secondary" disabled={!hasHistory} onPress={onExportBackup} darkMode={darkMode} style={{ flexGrow: 1, flexBasis: 160 }} />
        <Button label="Importar backup" variant="secondary" onPress={onImportBackup} darkMode={darkMode} style={{ flexGrow: 1, flexBasis: 160 }} />
      </View>
      <Button label="Atualizar uso local" variant="ghost" onPress={refresh} darkMode={darkMode} style={{ marginTop: spacing.sm }} />
    </Card>
  );
};
