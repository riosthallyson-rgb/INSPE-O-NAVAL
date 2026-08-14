import { formatStorageBytes, getStorageSafetySummary, normalizeStorageBytes } from '../src/domain/storageMetrics';

describe('métricas de armazenamento local', () => {
  test('normaliza valores inválidos e formata unidades', () => {
    expect(normalizeStorageBytes(-5)).toBe(0);
    expect(formatStorageBytes(512)).toBe('512 B');
    expect(formatStorageBytes(1536)).toBe('1.5 KB');
    expect(formatStorageBytes(2 * 1024 * 1024)).toBe('2.0 MB');
  });

  test('destaca ausência ou atraso de backup', () => {
    expect(getStorageSafetySummary({ bytes: 1024, backupHealth: { status: 'never', message: 'Sem backup' } })).toMatchObject({ formattedBytes: '1.0 KB', attentionRequired: true });
    expect(getStorageSafetySummary({ bytes: 1024, backupHealth: { status: 'current', message: 'Atual' } }).attentionRequired).toBe(false);
  });
});
