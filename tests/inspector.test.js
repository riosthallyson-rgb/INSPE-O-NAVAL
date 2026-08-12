import { emptyInspectorProfile, formatNipForDisplay, migrateInspectorProfile } from '../src/domain/inspector';

describe('migrateInspectorProfile', () => {
  test('preserva o NIP atual', () => {
    expect(migrateInspectorProfile({ name: 'Ana', nip: '1234' })).toEqual({
      ...emptyInspectorProfile,
      name: 'Ana',
      nip: '1234',
    });
  });

  test('migra o campo badge de perfis antigos', () => {
    expect(migrateInspectorProfile({ name: 'Bruno', badge: '5678' }).nip).toBe('5678');
  });

  test('protege o NIP no modo de visualização', () => {
    expect(formatNipForDisplay('12345678')).toBe('•••••678');
    expect(formatNipForDisplay('123')).toBe('123');
    expect(formatNipForDisplay('')).toBe('Não informado');
  });

  test('descarta valores com tipos inválidos', () => {
    expect(migrateInspectorProfile({ name: 10, nip: null })).toEqual(emptyInspectorProfile);
  });
});
