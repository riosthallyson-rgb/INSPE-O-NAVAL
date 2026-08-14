import { buildDynamicChecklist } from '../src/domain/inspection/dynamicChecklist';

describe('rastreabilidade dos checklists', () => {
  test('não apresenta referência genérica como se estivesse validada', () => {
    const items = buildDynamicChecklist({ checklistModules: ['identificacao', 'salvatagem', 'poluicao'] });
    expect(items.length).toBeGreaterThan(0);
    expect(items.every((item) => item.referenceStatus === 'pending')).toBe(true);
    expect(items.every((item) => item.reference.includes('não localizada'))).toBe(true);
  });

  test('referência verificada sempre contém fonte, versão, seção, página e chunk auditado', () => {
    const items = buildDynamicChecklist({ checklistModules: ['documentacao', 'condutor'], applicableNorms: ['normam-301'] });
    const verified = items.filter((item) => item.referenceStatus === 'verified');

    expect(verified.length).toBeGreaterThan(0);
    for (const item of verified) {
      expect(item.legalBasis).toEqual(expect.objectContaining({
        sourceId: expect.any(String),
        version: expect.any(String),
        section: expect.any(String),
        page: expect.any(Number),
        chunkId: expect.any(String),
        ruleId: expect.any(String),
      }));
      expect(item.reference).toContain('página PDF');
    }
  });
});
