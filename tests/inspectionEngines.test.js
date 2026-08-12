import { buildDynamicChecklist } from '../src/domain/inspection/dynamicChecklist';
import { evaluateInspectionApplicability } from '../src/domain/inspection/inspectionApplicabilityEngine';
import { evaluateLegalFinding } from '../src/legal/engines/legalFindingEngine';

describe('motores da inspeção assistida', () => {
  test('considera emprego, navegação, estado e jurisdição sem produzir enquadramento', () => {
    const result = evaluateInspectionApplicability({
      vesselUse: 'Esporte e recreio', navigationArea: 'Interior', operationalState: 'Navegando', jurisdiction: 'CPPI',
    });
    expect(result.applicableNorms).toEqual(expect.arrayContaining(['normam-211', 'normam-202', 'normam-301', 'regional']));
    expect(result.checklistModules).toContain('regional');
  });

  test('gera itens operacionais sem apresentar fundamento pendente como oficial', () => {
    const items = buildDynamicChecklist({ checklistModules: ['salvatagem'], applicableNorms: ['normam-211'] });
    expect(items[0]).toMatchObject({ status: 'nao verificado', referenceStatus: 'pending' });
  });

  test('motor legal recusa regra sem source completo', () => {
    const result = evaluateLegalFinding({ finding: { type: 'DOCUMENT_NOT_PRESENTED' }, rules: [{ findingType: 'DOCUMENT_NOT_PRESENTED', legalBasis: { sourceId: 'rlesta' } }] });
    expect(result.legalBasis).toEqual([]);
    expect(result.warnings).toContain('Fundamentação normativa não localizada.');
  });

  test('mesmo fato mantém o estado operacional disponível para regras futuras', () => {
    const navigating = evaluateInspectionApplicability({ operationalState: 'Navegando' });
    const moored = evaluateInspectionApplicability({ operationalState: 'Atracada' });
    expect(navigating.context.operationalState).toBe('Navegando');
    expect(moored.context.operationalState).toBe('Atracada');
  });

  test('motor legal aplica condição operacional somente com fonte completa', () => {
    const rules = [{ findingType: 'TEST_FINDING', condition: { operationalState: 'Navegando' }, possibleViolation: 'Fixture de teste', legalBasis: { sourceId: 'fixture', version: '1', section: '1', page: 1 } }];
    expect(evaluateLegalFinding({ finding: { type: 'TEST_FINDING' }, operationalState: 'Navegando', rules }).legalBasis).toHaveLength(1);
    expect(evaluateLegalFinding({ finding: { type: 'TEST_FINDING' }, operationalState: 'Atracada', rules }).legalBasis).toEqual([]);
  });
});
