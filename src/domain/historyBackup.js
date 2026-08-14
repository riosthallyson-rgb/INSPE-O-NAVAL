export const HISTORY_BACKUP_VERSION = 1;

const asArray = (value) => Array.isArray(value) ? value : [];
const timestampValue = (value) => {
  const timestamp = Date.parse(value || '');
  return Number.isFinite(timestamp) ? timestamp : 0;
};

const recordFreshness = (record) => Math.max(
  timestampValue(record?.updatedAt),
  timestampValue(record?.completedAt),
  timestampValue(record?.createdAt),
);

export const createHistoryBackup = ({ history = [], vessels = [], schemaVersion = null, createdAt = new Date().toISOString() } = {}) => ({
  kind: 'inspetor-naval-history-backup',
  backupVersion: HISTORY_BACKUP_VERSION,
  createdAt,
  sourceSchemaVersion: schemaVersion,
  history: asArray(history),
  vessels: asArray(vessels),
});

export const validateHistoryBackup = (payload) => {
  const errors = [];
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) errors.push('Arquivo de backup inválido.');
  if (payload?.kind !== 'inspetor-naval-history-backup') errors.push('Este arquivo não é um backup do Inspetor Naval.');
  if (payload?.backupVersion !== HISTORY_BACKUP_VERSION) errors.push('Versão de backup não suportada.');
  if (!Array.isArray(payload?.history)) errors.push('O histórico do backup está ausente ou inválido.');
  if (payload?.vessels !== undefined && !Array.isArray(payload.vessels)) errors.push('Os cadastros de embarcação do backup são inválidos.');
  if (!payload?.createdAt || !Number.isFinite(Date.parse(payload.createdAt))) errors.push('Data de criação do backup inválida.');
  return { valid: errors.length === 0, errors };
};

export const parseHistoryBackup = (text) => {
  try {
    const payload = JSON.parse(String(text || ''));
    const validation = validateHistoryBackup(payload);
    return validation.valid
      ? { ok: true, payload, errors: [] }
      : { ok: false, payload: null, errors: validation.errors };
  } catch {
    return { ok: false, payload: null, errors: ['O arquivo não contém JSON válido.'] };
  }
};

const mergeRecordsById = (currentRecords, importedRecords, idSelector) => {
  const merged = new Map();
  for (const record of [...asArray(currentRecords), ...asArray(importedRecords)]) {
    if (!record || typeof record !== 'object') continue;
    const key = idSelector(record);
    if (!key) continue;
    const previous = merged.get(key);
    if (!previous || recordFreshness(record) >= recordFreshness(previous)) merged.set(key, record);
  }
  return [...merged.values()];
};

export const mergeHistoryBackup = ({ currentHistory = [], currentVessels = [], backup }) => {
  const validation = validateHistoryBackup(backup);
  if (!validation.valid) return { ok: false, errors: validation.errors, history: currentHistory, vessels: currentVessels, importedHistoryCount: 0, importedVesselCount: 0 };

  const history = mergeRecordsById(currentHistory, backup.history, (record) => record.id || null)
    .sort((left, right) => recordFreshness(right) - recordFreshness(left));
  const vessels = mergeRecordsById(currentVessels, backup.vessels, (record) => record.id || String(record.tie || '').trim().toUpperCase() || null);

  const currentHistoryIds = new Set(asArray(currentHistory).map((record) => record?.id).filter(Boolean));
  const currentVesselIds = new Set(asArray(currentVessels).map((record) => record?.id || String(record?.tie || '').trim().toUpperCase()).filter(Boolean));

  return {
    ok: true,
    errors: [],
    history,
    vessels,
    importedHistoryCount: asArray(backup.history).filter((record) => record?.id && !currentHistoryIds.has(record.id)).length,
    importedVesselCount: asArray(backup.vessels).filter((record) => {
      const key = record?.id || String(record?.tie || '').trim().toUpperCase();
      return key && !currentVesselIds.has(key);
    }).length,
  };
};

export const getBackupHealth = ({ historyCount = 0, lastBackupAt = '', now = new Date(), staleAfterDays = 30 } = {}) => {
  if (!historyCount) return { status: 'empty', daysSinceBackup: null, message: 'Ainda não há inspeções concluídas para backup.' };
  const backupTime = Date.parse(lastBackupAt || '');
  if (!Number.isFinite(backupTime)) return { status: 'never', daysSinceBackup: null, message: 'Nenhum backup manual foi registrado neste dispositivo.' };
  const daysSinceBackup = Math.max(0, Math.floor((now.getTime() - backupTime) / 86400000));
  return daysSinceBackup >= staleAfterDays
    ? { status: 'stale', daysSinceBackup, message: `Último backup há ${daysSinceBackup} dia(s). Considere exportar uma cópia.` }
    : { status: 'current', daysSinceBackup, message: `Backup registrado há ${daysSinceBackup} dia(s).` };
};
