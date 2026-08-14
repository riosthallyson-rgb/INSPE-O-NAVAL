import { buildDynamicChecklist, getMissingRequiredEvidence, setChecklistPhotoRequirement } from '../src/domain/inspection/dynamicChecklist';
import { evaluateInspectionApplicability } from '../src/domain/inspection/inspectionApplicabilityEngine';
import { evaluateLegalFinding } from '../src/legal/engines/legalFindingEngine';

describe('motores da inspeção assistida', () => {
  test('considera emprego, navegação, estado e jurisdição sem anunciar fonte ausente como instalada', () => {
    const result = evaluateInspectionApplicability({
      vesselUse: 'Esporte e recreio', navigationArea: 'Interior', operationalState: 'Navegando', jurisdiction: 'CPPI',
    });
    expect(result.applicableNorms).toEqual(expect.arrayContaining(['normam-211', 'normam-301', 'normam-204']));
    expect(result.applicableNorms).not.toContain('normam-202');
    expect(result.applicableNorms).not.toContain('regional');
    expect(result.missingSources).toEqual(expect.arrayContaining(['normam-202', 'regional']));
    expect(result.checklistModules).toEqual(expect.arrayContaining(['regional', 'esporte_recreio']));
  });

  test('gera itens operacionais granulares sem apresentar fundamento pendente como oficial', () => {
    const items = buildDynamicChecklist({ checklistModules: ['salvatagem'], applicableNorms: ['normam-211'] });
    expect(items.length).toBeGreaterThanOrEqual(4);
    expect(items.every((item) => item.referenceStatus === 'pending')).toBe(true);
    expect(items.every((item) => item.reference.includes('não localizada'))).toBe(true);
  });

  test('usa somente regra já auditada para marcar referência como verificada', () => {
    const items = buildDynamicChecklist({ checklistModules: ['documentacao'], applicableNorms: ['normam-301'] });
    const verified = items.filter((item) => item.referenceStatus === 'verified');
    expect(verified.length).toBeGreaterThan(0);
    expect(verified.every((item) => item.legalBasis?.sourceId && item.legalBasis?.version && item.legalBasis?.section && Number.isFinite(item.legalBasis?.page))).toBe(true);
  });

  test('permite configurar evidência fotográfica obrigatória sem alterar outros itens', () => {
    const items = buildDynamicChecklist({ checklistModules: ['casco'] });
    const configured = setChecklistPhotoRequirement(items, items[0].id, true);
    expect(configured[0].photoRequired).toBe(true);
    expect(getMissingRequiredEvidence(configured)).toHaveLength(1);
    const withEvidence = configured.map((item, index) => index === 0 ? { ...item, evidence: [{ id: 'foto-1' }] } : item);
    expect(getMissingRequiredEvidence(withEvidence)).toEqual([]);
  });

  test('motor legal recusa regra sem source completo', () => {
    const result = evaluateLegalFinding({ finding: { type: 'DOCUMENT_NOT_PRESENTED' }, rules: [{ findingType: 'DOCUMENT_NOT_PRESENTED', legalBasis: { sourceId: 'rlesta' } }] });
    expect(result.legalBasis).toEqual([]);
    expect(result.warnings).toContain('Fundamentação normativa não localizada.');
  });

  test('mesmo fato mantém o contexto operacional disponível para regras futuras', () => {
    const navigating = evaluateInspectionApplicability({ operationalState: 'Navegando', vesselUse: 'Pesca', navigationArea: 'Mar aberto' });
    const moored = evaluateInspectionApplicability({ operationalState: 'Atracada' });
    expect(navigating.context).toMatchObject({ operationalState: 'Navegando', vesselUse: 'Pesca', navigationArea: 'Mar aberto' });
    expect(navigating.checklistModules).toContain('pesca');
    expect(moored.context.operationalState).toBe('Atracada');
  });

  test('motor legal aplica condição operacional somente com fonte completa', () => {
    const rules = [{ findingType: 'TEST_FINDING', condition: { operationalState: 'Navegando' }, possibleViolation: 'Fixture de teste', legalBasis: { sourceId: 'fixture', version: '1', section: '1', page: 1 } }];
    expect(evaluateLegalFinding({ finding: { type: 'TEST_FINDING' }, operationalState: 'Navegando', rules }).legalBasis).toHaveLength(1);
    expect(evaluateLegalFinding({ finding: { type: 'TEST_FINDING' }, operationalState: 'Atracada', rules }).legalBasis).toEqual([]);
  });
});
