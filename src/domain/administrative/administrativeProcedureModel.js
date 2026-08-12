export const PROCEDURE_STATES = Object.freeze(['SUGGESTED', 'CONFIRMED', 'DRAFT', 'READY_FOR_REVIEW', 'ISSUED', 'CANCELLED', 'COMPLETED']);
export const DOCUMENT_STATES = Object.freeze(['DRAFT', 'READY_FOR_REVIEW', 'ISSUED', 'CANCELLED']);

const internalId = (prefix, now) => `${prefix}-${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`;

export const createProcedureEvent = ({ type, userId, inspectionId, procedureId, documentId = null, occurredAt = new Date().toISOString() }) => ({
  id: internalId('evento-adm', new Date(occurredAt)), type, occurredAt, userId: userId || '', inspectionId, procedureId, documentId,
});

export const createAdministrativeProcedure = ({ inspectionId, findingId, type, source, createdBy, now = new Date() }) => {
  if (!inspectionId || !findingId || !type || !source?.sourceId || !source?.sourceVersion || !source?.section || !source?.page) throw new Error('Procedimento exige inspeção, achado e fonte normativa completa.');
  const id = internalId('procedimento', now);
  const createdAt = now.toISOString();
  return { id, inspectionId, findingId, type, state: 'SUGGESTED', source: { ...source }, createdAt, updatedAt: createdAt, createdBy: createdBy || '', cancellation: null, documents: [], deadlines: [], auditLog: [createProcedureEvent({ type: 'PROCEDURE_CREATED', userId: createdBy, inspectionId, procedureId: id, occurredAt: createdAt })] };
};

export const createAdministrativeDocument = ({ procedure, template, inspection, createdBy, now = new Date() }) => {
  if (!procedure || !template?.source) throw new Error('Modelo administrativo verificado não localizado.');
  const createdAt = now.toISOString();
  const id = internalId('documento', now);
  const values = Object.fromEntries(template.fields.map((field) => [field, '']));
  Object.assign(values, {
    organization: inspection.inspector?.jurisdiction || '', vesselName: inspection.vessel?.name || '', registrationNumber: inspection.vessel?.tie || '',
    location: inspection.context?.locationDescription || '', occurredDate: inspection.createdAt?.slice(0, 10) || '', occurredTime: inspection.createdAt?.slice(11, 16) || '', inspector: inspection.inspector?.name || '',
  });
  return { internalDocumentId: id, officialDocumentNumber: '', procedureId: procedure.id, type: procedure.type, title: template.title, annex: template.annex, state: 'DRAFT', version: 1, values, source: { ...template.source }, reviewChecks: {}, createdAt, updatedAt: createdAt, createdBy: createdBy || '', finalizedAt: null, fileVersions: [] };
};

export const cancelAdministrativeProcedure = (procedure, { reason, userId, occurredAt = new Date().toISOString() }) => {
  if (!String(reason || '').trim()) throw new Error('Informe o motivo do cancelamento.');
  return { ...procedure, state: 'CANCELLED', updatedAt: occurredAt, cancellation: { reason: reason.trim(), userId: userId || '', occurredAt }, auditLog: [...procedure.auditLog, createProcedureEvent({ type: 'DOCUMENT_CANCELLED', userId, inspectionId: procedure.inspectionId, procedureId: procedure.id, occurredAt })] };
};

