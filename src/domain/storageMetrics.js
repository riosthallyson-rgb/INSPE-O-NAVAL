export const normalizeStorageBytes = (value) => {
  const bytes = Number(value);
  return Number.isFinite(bytes) && bytes > 0 ? Math.floor(bytes) : 0;
};

export const formatStorageBytes = (value) => {
  const bytes = normalizeStorageBytes(value);
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(bytes < 10 * 1024 ? 1 : 0)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(bytes < 10 * 1024 ** 2 ? 1 : 0)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
};

export const getStorageSafetySummary = ({ bytes = 0, backupHealth } = {}) => ({
  bytes: normalizeStorageBytes(bytes),
  formattedBytes: formatStorageBytes(bytes),
  backupStatus: backupHealth?.status || 'unknown',
  backupMessage: backupHealth?.message || 'Situação do backup não disponível.',
  attentionRequired: ['never', 'stale'].includes(backupHealth?.status),
});
