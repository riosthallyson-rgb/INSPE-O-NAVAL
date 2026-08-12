import { NORMAM_301_ADMIN_SOURCE } from '../../legal/sources/normam301Administrative';

export const VESSEL_CUSTODY_STATES = Object.freeze(['APPREHENDED', 'IN_CP_CUSTODY', 'WITH_CUSTODIAN', 'SEALED', 'PENDING_REGULARIZATION', 'REGULARIZATION_REVIEW', 'RELEASE_AUTHORIZED', 'RELEASED', 'ABANDONMENT_PROCEDURE']);

export const CUSTODY_STATE_LABELS = Object.freeze({ APPREHENDED: 'Apreendida', IN_CP_CUSTODY: 'Sob guarda da CP/DL/AG', WITH_CUSTODIAN: 'Com fiel depositário', SEALED: 'Lacrada', PENDING_REGULARIZATION: 'Aguardando regularização', REGULARIZATION_REVIEW: 'Regularização em conferência', RELEASE_AUTHORIZED: 'Liberação autorizada', RELEASED: 'Liberada', ABANDONMENT_PROCEDURE: 'Procedimento de abandono' });

const custodyEvent = (type, state, userId, occurredAt, details = {}) => ({ id: `custodia-${occurredAt}-${type}`, type, state, userId: userId || '', occurredAt, details });

export const createVesselCustody = ({ inspectionId, apprehensionProcedureId, userId, source, occurredAt = new Date().toISOString() }) => {
  if (!inspectionId || !apprehensionProcedureId || !source?.sourceId || !source?.section || !source?.page) throw new Error('A custódia exige apreensão confirmada e fonte completa.');
  return { id: `custodia-${inspectionId}`, inspectionId, apprehensionProcedureId, state: 'APPREHENDED', source: { ...source }, seal: null, custodian: null, createdAt: occurredAt, updatedAt: occurredAt, history: [custodyEvent('APPREHENSION_CONFIRMED', 'APPREHENDED', userId, occurredAt)] };
};

export const transitionVesselCustody = (custody, { state, type, userId, details = {}, occurredAt = new Date().toISOString() }) => {
  if (!VESSEL_CUSTODY_STATES.includes(state)) throw new Error('Estado de custódia inválido.');
  return { ...custody, state, updatedAt: occurredAt, history: [...custody.history, custodyEvent(type, state, userId, occurredAt, details)] };
};

export const applyVesselSeal = (custody, { sealNumber, existingCustodies = [], userId, occurredAt = new Date().toISOString() }) => {
  const normalized = String(sealNumber || '').trim().toUpperCase();
  if (!normalized) throw new Error('Informe o número do lacre.');
  if (existingCustodies.some((item) => item.id !== custody.id && item.seal?.normalizedNumber === normalized)) throw new Error('Este número de lacre já está registrado na base local.');
  const source = { ...NORMAM_301_ADMIN_SOURCE, section: '3.23.3 e Anexo 3-E', page: 52 };
  const next = transitionVesselCustody(custody, { state: 'SEALED', type: 'SEAL_APPLIED', userId, occurredAt, details: { sealNumber: normalized } });
  return { ...next, seal: { number: String(sealNumber).trim(), normalizedNumber: normalized, appliedAt: occurredAt, removedAt: null, removalAuthorization: null, source } };
};

export const authorizeSealRemoval = (custody, { authorizedBy, reason, occurredAt = new Date().toISOString() }) => {
  if (!custody.seal || !authorizedBy || !String(reason || '').trim()) throw new Error('Lacre, autoridade e motivo são obrigatórios.');
  const source = { ...NORMAM_301_ADMIN_SOURCE, section: '3.23.4 e Anexo 3-E', page: 52 };
  const next = transitionVesselCustody(custody, { state: 'RELEASE_AUTHORIZED', type: 'SEAL_REMOVAL_AUTHORIZED', userId: authorizedBy, occurredAt, details: { sealNumber: custody.seal.number } });
  return { ...next, seal: { ...custody.seal, removalAuthorization: { authorizedBy, reason: reason.trim(), occurredAt, source } } };
};

export const recordVesselRelease = (custody, { userId, occurredAt = new Date().toISOString() }) => {
  if (custody.state !== 'RELEASE_AUTHORIZED') throw new Error('A liberação exige autorização registrada.');
  const next = transitionVesselCustody(custody, { state: 'RELEASED', type: 'VESSEL_RELEASED', userId, occurredAt });
  return { ...next, seal: next.seal ? { ...next.seal, removedAt: occurredAt } : null };
};

