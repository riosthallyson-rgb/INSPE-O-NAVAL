import { createRegionalRuleSet, findRegionalRuleSet, getApplicableRegionalChecklistItems } from '../src/domain/regional/regionalRulesManager';

const source = (patch = {}) => createRegionalRuleSet({ id: 'npcp-x', jurisdictionId: 'CPXX', authorityName: 'CPXX', title: 'NPCP-XX', version: '1', sha256: 'abc', checkedAt: '2026-08-08', status: 'CURRENT_VERIFIED', rules: [], ...patch });

describe('RegionalRulesManager', () => {
  test('informa ausência sem inventar norma', () => expect(findRegionalRuleSet({ jurisdictionId: 'CPXX', ruleSets: [] })).toMatchObject({ status: 'UNAVAILABLE', ruleSet: null }));
  test('localiza somente fonte corrente completa', () => expect(findRegionalRuleSet({ jurisdictionId: 'CPXX', ruleSets: [source()] }).status).toBe('AVAILABLE'));
  test('não trata fonte sem hash como validada', () => expect(findRegionalRuleSet({ jurisdictionId: 'CPXX', ruleSets: [source({ sha256: '' })] }).status).toBe('PENDING_VALIDATION'));
  test('alerta norma desatualizada', () => expect(findRegionalRuleSet({ jurisdictionId: 'CPXX', ruleSets: [source({ status: 'OUTDATED' })] }).status).toBe('OUTDATED'));
  test('não produz checklist de fonte pendente', () => expect(getApplicableRegionalChecklistItems({ ruleSet: source({ status: 'PENDING_VALIDATION' }) })).toEqual([]));
  test('não produz checklist sem item e página', () => expect(getApplicableRegionalChecklistItems({ ruleSet: source({ rules: [{ id: 'r1', validationStatus: 'PASS', checklistItem: 'Verificar', source: {} }] }) })).toEqual([]));
  test('produz item regional fundamentado e aplicável', () => {
    const ruleSet = source({ rules: [{ id: 'r1', validationStatus: 'PASS', checklistItem: 'Verificar condição regional', applicableTo: { vesselTypes: ['Lancha'], activities: [], operationalStates: [] }, source: { section: '2.1', page: 10 } }] });
    expect(getApplicableRegionalChecklistItems({ ruleSet, vessel: { type: 'Lancha' }, context: {} })[0]).toMatchObject({ scope: 'REGIONAL', referenceStatus: 'verified', jurisdictionId: 'CPXX' });
  });
  test('não aplica item a tipo de embarcação diferente', () => {
    const ruleSet = source({ rules: [{ id: 'r1', validationStatus: 'PASS', checklistItem: 'Verificar', applicableTo: { vesselTypes: ['Lancha'] }, source: { section: '2.1', page: 10 } }] });
    expect(getApplicableRegionalChecklistItems({ ruleSet, vessel: { type: 'Bote' }, context: {} })).toEqual([]);
  });
});
