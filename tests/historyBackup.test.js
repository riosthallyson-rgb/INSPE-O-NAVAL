import { createHistoryBackup, getBackupHealth, mergeHistoryBackup, parseHistoryBackup, validateHistoryBackup } from '../src/domain/historyBackup';

describe('backup local do histórico', () => {
  test('cria e valida backup versionado', () => {
    const backup = createHistoryBackup({ history: [{ id: 'i-1', completedAt: '2026-08-10T12:00:00.000Z' }], vessels: [{ id: 'v-1', tie: '123' }], schemaVersion: 5, createdAt: '2026-08-14T12:00:00.000Z' });
    expect(validateHistoryBackup(backup)).toEqual({ valid: true, errors: [] });
    expect(parseHistoryBackup(JSON.stringify(backup))).toMatchObject({ ok: true });
  });

  test('recusa arquivo que não é backup do app', () => {
    expect(parseHistoryBackup('{"history":[]}')).toMatchObject({ ok: false });
    expect(parseHistoryBackup('não-json')).toMatchObject({ ok: false });
  });

  test('mescla inspeções sem duplicar ids e preserva a versão mais nova', () => {
    const currentHistory = [{ id: 'i-1', updatedAt: '2026-08-10T10:00:00.000Z', vessel: { name: 'Antiga' } }];
    const backup = createHistoryBackup({
      history: [
        { id: 'i-1', updatedAt: '2026-08-11T10:00:00.000Z', vessel: { name: 'Mais nova' } },
        { id: 'i-2', updatedAt: '2026-08-12T10:00:00.000Z', vessel: { name: 'Importada' } },
      ],
      vessels: [],
      createdAt: '2026-08-14T12:00:00.000Z',
    });
    const result = mergeHistoryBackup({ currentHistory, backup });
    expect(result.ok).toBe(true);
    expect(result.history).toHaveLength(2);
    expect(result.history.find((item) => item.id === 'i-1')?.vessel?.name).toBe('Mais nova');
    expect(result.importedHistoryCount).toBe(1);
  });

  test('preserva o registro local quando a versão importada não é comprovadamente mais nova', () => {
    const currentHistory = [{ id: 'i-1', vessel: { name: 'Registro local' } }];
    const backup = createHistoryBackup({
      history: [{ id: 'i-1', vessel: { name: 'Importado sem data' } }],
      vessels: [{ id: 'v-1', name: 'Importado' }],
      createdAt: '2026-08-14T12:00:00.000Z',
    });
    const result = mergeHistoryBackup({ currentHistory, currentVessels: [{ id: 'v-1', name: 'Local' }], backup });
    expect(result.history[0].vessel.name).toBe('Registro local');
    expect(result.vessels[0].name).toBe('Local');
  });

  test('informa backup ausente, atual ou antigo', () => {
    const now = new Date('2026-08-14T12:00:00.000Z');
    expect(getBackupHealth({ historyCount: 3, now }).status).toBe('never');
    expect(getBackupHealth({ historyCount: 3, lastBackupAt: '2026-08-10T12:00:00.000Z', now }).status).toBe('current');
    expect(getBackupHealth({ historyCount: 3, lastBackupAt: '2026-06-01T12:00:00.000Z', now }).status).toBe('stale');
    expect(getBackupHealth({ historyCount: 0, now }).status).toBe('empty');
  });
});
