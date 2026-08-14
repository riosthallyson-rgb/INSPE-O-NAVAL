import {
  CURRENT_STORAGE_SCHEMA,
  createEmptyPersistedState,
  migratePersistedState,
} from '../src/domain/persistedState';

describe('estado persistido da aplicação', () => {
  test('cria um estado vazio versionado', () => {
    expect(createEmptyPersistedState()).toEqual({
      schemaVersion: CURRENT_STORAGE_SCHEMA,
      profile: { name: '', rank: '', nip: '', jurisdiction: '' },
      vessels: [],
      compassHistory: [],
      history: [],
      currentInspection: null,
      backupMeta: { lastExportedAt: '', lastImportedAt: '' },
    });
  });

  test('migra perfil, histórico, inspeção atual e metadados para o esquema vigente', () => {
    const migrated = migratePersistedState({
      profile: { name: 'Ana', badge: '1234' },
      history: [{ vessel: { name: 'Navio Escola' }, inspector: { badge: '1234' } }],
      currentInspection: { vessel: null, inspector: { name: 'Ana' } },
      backupMeta: { lastExportedAt: '2026-08-10T12:00:00.000Z', lastImportedAt: 'inválida' },
    });

    expect(migrated.schemaVersion).toBe(CURRENT_STORAGE_SCHEMA);
    expect(migrated.profile.nip).toBe('1234');
    expect(migrated.vessels).toEqual([]);
    expect(migrated.history[0].vessel.tie).toBe('');
    expect(migrated.history[0].inspector.nip).toBe('1234');
    expect(migrated.currentInspection.checkItems).toEqual([]);
    expect(migrated.backupMeta).toEqual({ lastExportedAt: '2026-08-10T12:00:00.000Z', lastImportedAt: '' });
  });

  test('rejeita um documento persistido que não seja objeto', () => {
    expect(migratePersistedState(null)).toBeNull();
    expect(migratePersistedState('inválido')).toBeNull();
  });
});
