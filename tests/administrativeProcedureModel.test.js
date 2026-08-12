import { cancelAdministrativeProcedure, createAdministrativeDocument, createAdministrativeProcedure } from '../src/domain/administrative/administrativeProcedureModel';
import { getAdministrativeTemplate } from '../src/legal/sources/normam301Administrative';

describe('modelo administrativo', () => {
  const source = { sourceId: 'normam-301', sourceVersion: '2026', section: '3.6.1', page: 28 };
  const procedure = createAdministrativeProcedure({ inspectionId: 'i-1', findingId: 'f-1', type: 'INFRACTION_NOTICE', source, createdBy: 'nip-local', now: new Date('2026-08-08T14:00:00Z') });

  test('mantém identificador interno separado do número oficial', () => {
    const document = createAdministrativeDocument({ procedure, template: getAdministrativeTemplate('INFRACTION_NOTICE'), inspection: { inspector: { name: 'Ana', jurisdiction: 'CP' }, vessel: { name: 'NANA', tie: '123' }, context: { locationDescription: 'Rio' }, createdAt: '2026-08-08T14:00:00Z' }, createdBy: 'nip-local', now: new Date('2026-08-08T14:01:00Z') });
    expect(document.internalDocumentId).toContain('documento-');
    expect(document.officialDocumentNumber).toBe('');
    expect(document.state).toBe('DRAFT');
    expect(document.values.vesselName).toBe('NANA');
    expect(document.source.section).toBe('Anexo 3-B');
  });

  test('cancelamento preserva o procedimento e exige motivo', () => {
    expect(() => cancelAdministrativeProcedure(procedure, { reason: '' })).toThrow('motivo');
    const cancelled = cancelAdministrativeProcedure(procedure, { reason: 'Duplicidade confirmada', userId: 'nip-local', occurredAt: '2026-08-08T15:00:00Z' });
    expect(cancelled.state).toBe('CANCELLED');
    expect(cancelled.cancellation.reason).toBe('Duplicidade confirmada');
  });
});

