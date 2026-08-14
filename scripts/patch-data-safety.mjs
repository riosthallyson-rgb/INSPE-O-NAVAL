import { readFileSync, writeFileSync } from 'node:fs';

const path = 'src/features/history/InspectionHistoryScreen.js';
let source = readFileSync(path, 'utf8');
source = source.replace(
  "import { HistoryInspectionMap } from '../map/HistoryInspectionMap';",
  "import { HistoryInspectionMap } from '../map/HistoryInspectionMap';\nimport { DataSafetyPanel } from './DataSafetyPanel';",
);

const before = `      <Card darkMode={isDarkMode} variant={backupHealth?.status === 'stale' || backupHealth?.status === 'never' ? "warning" : "outlined"}>
        <Text style={[typography.bodyStrong, { color: colors.text }]}>Backup manual local</Text>
        <Text style={[typography.caption, { color: backupHealth?.status === 'stale' || backupHealth?.status === 'never' ? colors.pending : colors.textMuted, marginTop: spacing.xs }]}>{backupHealth?.message || 'O backup é opcional e permanece sob controle do inspetor.'}</Text>
        <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>A exportação gera um JSON local com histórico e embarcações salvas. Nenhum dado é enviado para servidor.</Text>
        <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
          <Button label="Exportar backup" variant="secondary" disabled={!hasStoredHistory} onPress={onExportBackup} darkMode={isDarkMode} style={{ flex: 1 }} />
          <Button label="Importar backup" variant="secondary" onPress={onImportBackup} darkMode={isDarkMode} style={{ flex: 1 }} />
        </View>
      </Card>`;
const after = `      <DataSafetyPanel
        darkMode={isDarkMode}
        backupHealth={backupHealth}
        hasHistory={hasStoredHistory}
        onExportBackup={onExportBackup}
        onImportBackup={onImportBackup}
      />`;

if (!source.includes(before)) throw new Error('Bloco de backup esperado não encontrado.');
source = source.replace(before, after);
writeFileSync(path, source);
