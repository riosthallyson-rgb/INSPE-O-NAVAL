import { validateTieDocument } from '../tieDocumentValidation';
import { getMissingRequiredEvidence } from './dynamicChecklist';

export const INSPECTION_STEPS = [
  'Cenário',
  'Embarcação',
  'Condutor',
  'Tripulação',
  'Documentação',
  'Segurança',
  'Inspeção',
  'Não conformidades',
  'Revisão',
  'Conclusão',
];

export const createAuditEvent = (type, details = {}, occurredAt = new Date().toISOString()) => ({
  id: `evento-${occurredAt}-${type}`,
  type,
  occurredAt,
  details,
});

export const appendAuditEvent = (inspection, type, details = {}, occurredAt) => ({
  ...inspection,
  updatedAt: occurredAt || new Date().toISOString(),
  auditLog: [
    ...(Array.isArray(inspection.auditLog) ? inspection.auditLog : []),
    createAuditEvent(type, details, occurredAt),
  ],
});

export const createInspectionDraft = ({ inspector, defaultVesselType = '', now = new Date() }) => {
  const createdAt = now.toISOString();
  return {
    id: `inspecao-${now.getTime()}`,
    schemaVersion: 1,
    action: 'Inspeção Naval',
    stage: 'Cenário',
    currentStep: 1,
    createdAt,
    updatedAt: createdAt,
    inspector,
    context: {
      vesselOperationalState: '',
      operationOrigin: '',
      latitude: '',
      longitude: '',
      locationDescription: '',
      inspectionLocation: null,
      jurisdictionStatus: 'UNDETERMINED',
      jurisdictionId: '',
      jurisdictionConfirmedByUser: false,
      regionalRuleStatus: '',
      regionalRuleMessage: '',
      attachLocationToEvidence: false,
    },
    vessel: {
      id: '', name: '', tie: '', documentType: 'TIE', registrationPort: '', owner: '',
      armador: '', taxId: '', type: defaultVesselType, vesselUse: '', navigationArea: '',
      lengthMeters: '', grossTonnage: '', year: '', hullMaterial: '', engineCount: '',
      enginePower: '', propulsion: '', passengerCapacity: '', peopleOnBoard: '',
      observedActivity: '', validUntil: '', notes: '', documentPhotoUri: '', documentEvidence: null,
    },
    driver: {
      name: '', taxId: '', identityDocument: '', licenseType: 'CHA', category: '',
      licenseNumber: '', validUntil: '', documentPresented: '', apparentValidity: '',
      matchesDocument: '', notes: '',
    },
    crew: { ctsRequired: 'confirmar', ctsExists: '', ctsPresented: '', requiredCount: '', members: [] },
    occupancy: { authorized: '', crewCount: '', passengerCount: '', totalPersons: 0 },
    documents: [],
    applicability: { context: {}, applicableNorms: [], missingSources: [], checklistModules: [], warnings: [], additionalQuestions: [] },
    checkItems: [],
    findings: [],
    nonConformities: [],
    administrativeProcedures: [],
    vesselCustody: null,
    result: 'Em andamento',
    auditLog: [createAuditEvent('INSPECTION_CREATED', {}, createdAt)],
  };
};

export const calculateOccupancy = (crewCount, passengerCount) => {
  const crew = Number.parseInt(crewCount, 10) || 0;
  const passengers = Number.parseInt(passengerCount, 10) || 0;
  return { crewCount: String(crewCount || ''), passengerCount: String(passengerCount || ''), totalPersons: crew + passengers };
};

export const validateVesselDocument = (inspection, referenceDate = new Date()) => {
  if (inspection?.vessel?.documentType !== 'TIE') return null;
  const registration = inspection.documents?.find((document) => document.id === 'vessel-registration');
  return validateTieDocument({
    ...inspection.vessel,
    validUntil: registration?.validUntil || inspection.vessel.validUntil,
  }, referenceDate);
};

export const migrateOperationalInspection = (record, inspector) => {
  if (!record || typeof record !== 'object') return null;
  const createdAt = record.createdAt && !Number.isNaN(Date.parse(record.createdAt))
    ? new Date(record.createdAt)
    : new Date(0);
  const base = createInspectionDraft({ inspector, defaultVesselType: record.vessel?.type || '', now: createdAt });
  return {
    ...base,
    ...record,
    inspector: inspector || record.inspector || base.inspector,
    context: { ...base.context, ...(record.context || {}) },
    vessel: { ...base.vessel, ...(record.vessel || {}) },
    driver: { ...base.driver, ...(record.driver || {}) },
    crew: { ...base.crew, ...(record.crew || {}), members: Array.isArray(record.crew?.members) ? record.crew.members : [] },
    occupancy: { ...base.occupancy, ...(record.occupancy || {}) },
    documents: Array.isArray(record.documents) ? record.documents : [],
    applicability: { ...base.applicability, ...(record.applicability || {}) },
    checkItems: Array.isArray(record.checkItems) ? record.checkItems : [],
    findings: Array.isArray(record.findings) ? record.findings : [],
    nonConformities: Array.isArray(record.nonConformities) ? record.nonConformities : [],
    administrativeProcedures: Array.isArray(record.administrativeProcedures) ? record.administrativeProcedures : [],
    vesselCustody: record.vesselCustody || null,
    auditLog: Array.isArray(record.auditLog) ? record.auditLog : [],
    currentStep: Number.isInteger(record.currentStep) ? record.currentStep : record.completedAt ? 10 : 1,
  };
};

export const validateInspectionStep = (inspection) => {
  if (inspection.currentStep === 1 && (!inspection.context.vesselOperationalState || !inspection.context.operationOrigin)) return 'Informe a situação da embarcação e a origem da inspeção.';
  if (inspection.currentStep === 2 && (!inspection.vessel.name.trim() || !inspection.vessel.tie.trim() || !inspection.vessel.vesselUse || !inspection.vessel.navigationArea)) return 'Informe nome, número de inscrição, emprego e navegação.';
  if (inspection.currentStep === 3 && (!inspection.driver.name.trim() || !inspection.driver.documentPresented || !inspection.driver.apparentValidity)) return 'Registre o condutor e o estado do documento apresentado.';
  if (inspection.currentStep === 5 && inspection.documents.some((document) => !document.status)) return 'Avalie a situação de todos os documentos listados.';
  if (inspection.currentStep === 5) {
    const tieValidation = validateVesselDocument(inspection);
    if (tieValidation?.expirationStatus === 'missing') return 'Informe a validade do TIE.';
    if (tieValidation?.expirationStatus === 'invalid') return 'Informe uma data de validade real no formato DD/MM/AAAA ou AAAA-MM-DD.';
    if (tieValidation?.missingFields.length) return `Complete os campos obrigatórios do TIE: ${tieValidation.missingFields.join(', ')}.`;
  }
  if (inspection.currentStep === 7 && inspection.checkItems.some((item) => item.status === 'nao verificado')) return 'Avalie todos os itens antes de continuar.';
  if (inspection.currentStep === 7 && inspection.checkItems.some((item) => item.status === 'nao se aplica' && !String(item.notes || '').trim())) return 'Justifique os itens marcados como não aplicáveis.';
  if (inspection.currentStep === 7 && getMissingRequiredEvidence(inspection.checkItems).length) return 'Adicione as evidências fotográficas marcadas como obrigatórias antes de continuar.';
  if (inspection.currentStep === 8 && inspection.findings.some((finding) => !String(finding.observedDescription || '').trim())) return 'Descreva objetivamente todas as não conformidades.';
  return '';
};
