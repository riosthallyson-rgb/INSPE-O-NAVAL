import {
  appendAuditEvent,
  calculateOccupancy,
  createInspectionDraft,
  migrateOperationalInspection,
  validateInspectionStep,
  validateVesselDocument,
} from '../src/domain/inspection/inspectionModel';

describe('modelo operacional da inspeção', () => {
  test('cria rascunho completo na primeira etapa', () => {
    const draft = createInspectionDraft({ inspector: { name: 'Ana' }, defaultVesselType: 'Lancha', now: new Date('2026-08-08T12:00:00.000Z') });
    expect(draft.currentStep).toBe(1);
    expect(draft.context.vesselOperationalState).toBe('');
    expect(draft.vessel.type).toBe('Lancha');
    expect(draft.auditLog[0].type).toBe('INSPECTION_CREATED');
  });

  test('mantém eventos anteriores ao acrescentar trilha', () => {
    const updated = appendAuditEvent({ auditLog: [] }, 'STEP_CHANGED', { step: 2 }, '2026-08-08T12:01:00.000Z');
    expect(updated.auditLog).toHaveLength(1);
    expect(updated.auditLog[0].details.step).toBe(2);
  });

  test('calcula pessoas a bordo sem inferir irregularidade', () => {
    expect(calculateOccupancy('2', '5')).toEqual({ crewCount: '2', passengerCount: '5', totalPersons: 7 });
  });

  test('migra rascunho antigo preenchendo os novos módulos', () => {
    const migrated = migrateOperationalInspection({ id: 'antiga', vessel: { name: 'NANA' } }, { name: 'Ana' });
    expect(migrated.vessel.name).toBe('NANA');
    expect(migrated.driver.licenseType).toBe('CHA');
    expect(migrated.findings).toEqual([]);
  });

  test('exige justificativa quando item aplicável é marcado N/A', () => {
    const draft = createInspectionDraft({ inspector: {}, now: new Date('2026-08-08T12:00:00.000Z') });
    draft.currentStep = 7;
    draft.checkItems = [{ status: 'nao se aplica', notes: '' }];
    expect(validateInspectionStep(draft)).toContain('Justifique');
    draft.checkItems[0].notes = 'Não instalado neste cenário; pendente de conferência normativa.';
    expect(validateInspectionStep(draft)).toBe('');
  });

  test('valida o prazo do TIE na etapa documental sem criar conclusão jurídica', () => {
    const draft = createInspectionDraft({ inspector: {}, now: new Date('2026-08-08T12:00:00.000Z') });
    draft.vessel = { ...draft.vessel, name: 'Mar Azul', tie: '123', owner: 'Maria', type: 'Lancha', vesselUse: 'Esporte e recreio', navigationArea: 'Interior' };
    draft.documents = [{ id: 'vessel-registration', validUntil: '07/08/2026', status: 'Possível irregularidade' }];
    expect(validateVesselDocument(draft, new Date('2026-08-08T12:00:00-03:00')).expirationStatus).toBe('expired');
    draft.currentStep = 5;
    expect(validateInspectionStep(draft)).toBe('');
    draft.documents[0].validUntil = '31/02/2026';
    expect(validateInspectionStep(draft)).toContain('data de validade real');
  });
});
