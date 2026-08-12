import { buildDynamicChecklist } from '../src/domain/inspection/dynamicChecklist';

describe('rastreabilidade dos checklists', () => {
  test('não apresenta referência genérica como se estivesse validada', () => {
    const items = buildDynamicChecklist({ checklistModules: ['identificacao', 'salvatagem', 'poluicao'] });
    expect(items.length).toBeGreaterThan(0);
    expect(items.every((item) => item.referenceStatus === 'pending')).toBe(true);
    expect(items.every((item) => item.reference.includes('não localizada'))).toBe(true);
  });
});
