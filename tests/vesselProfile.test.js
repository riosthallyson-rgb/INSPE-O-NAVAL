import {
  createEmptyVesselProfile,
  migrateVesselProfiles,
  normalizeTie,
  prepareVesselProfile,
  upsertVesselProfile,
} from '../src/domain/vesselProfile';

describe('perfil reutilizável de embarcação', () => {
  test('cria um formulário completo e revisável', () => {
    const profile = createEmptyVesselProfile('Lancha');
    expect(profile.type).toBe('Lancha');
    expect(profile.documentPhotoUri).toBe('');
    expect(profile.navigationArea).toBe('');
  });

  test('normaliza o TIE para identificar a embarcação sem alterar a exibição', () => {
    expect(normalizeTie(' 123-abc/9 ')).toBe('123ABC9');
    const profile = prepareVesselProfile(
      { ...createEmptyVesselProfile(), name: '  Mar Azul ', tie: ' 123-abc/9 ' },
      new Date('2026-08-08T12:00:00.000Z')
    );
    expect(profile.id).toBe('tie-123ABC9');
    expect(profile.name).toBe('Mar Azul');
    expect(profile.tie).toBe('123-abc/9');
  });

  test('atualiza um perfil existente sem duplicar o mesmo TIE', () => {
    const current = [{ ...createEmptyVesselProfile(), id: 'antigo', tie: '123', name: 'Antiga' }];
    const updated = { ...createEmptyVesselProfile(), id: 'novo', tie: '1-2-3', name: 'Atualizada' };
    expect(upsertVesselProfile(current, updated)).toEqual([updated]);
  });

  test('migra somente perfis válidos', () => {
    expect(migrateVesselProfiles([null, 'inválido', { name: 'Barco' }])).toHaveLength(1);
  });
});
