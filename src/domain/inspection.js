export const inspectionStatusOptions = [
  { value: 'pendente', label: 'Pendente' },
  { value: 'conforme', label: 'Conforme' },
  { value: 'nao conforme', label: 'Não conforme' },
  { value: 'nao se aplica', label: 'Não se aplica' },
];

export const getStatusLabel = (value) =>
  inspectionStatusOptions.find((option) => option.value === value)?.label || 'Pendente';

export const createChecklistItems = (templates, vesselType) => {
  const template = templates.find((item) => item.type === vesselType)?.items || [];
  return template.map((item, index) => ({
    id: `${vesselType}-${index}`,
    ...item,
    status: 'pendente',
    notes: '',
  }));
};

export const getInspectionStatus = (items) => {
  if (!items || items.length === 0) return 'Em andamento';
  if (items.some((item) => item.status === 'nao conforme')) return 'Não conforme';
  if (items.every((item) => item.status === 'conforme' || item.status === 'nao se aplica')) {
    return 'Conforme';
  }
  return 'Em andamento';
};

export const countPendingItems = (items) =>
  (Array.isArray(items) ? items : []).filter((item) => item.status === 'pendente').length;

const normalizeText = (value) => (typeof value === 'string' ? value : '');

export const migrateInspectionRecord = (storedRecord) => {
  if (!storedRecord || typeof storedRecord !== 'object') return null;

  const vessel = storedRecord.vessel && typeof storedRecord.vessel === 'object'
    ? storedRecord.vessel
    : {};

  return {
    ...storedRecord,
    ...(storedRecord.action
      ? { action: storedRecord.action === 'Vistoria' ? 'Inspeção Naval' : normalizeText(storedRecord.action) }
      : {}),
    ...(storedRecord.stage
      ? { stage: storedRecord.stage === 'Vistoria' ? 'Inspeção' : normalizeText(storedRecord.stage) }
      : {}),
    vessel: {
      ...vessel,
      name: normalizeText(vessel.name),
      tie: normalizeText(vessel.tie),
      armador: normalizeText(vessel.armador),
      type: normalizeText(vessel.type),
    },
    checkItems: Array.isArray(storedRecord.checkItems) ? storedRecord.checkItems : [],
    nonConformities: Array.isArray(storedRecord.nonConformities)
      ? storedRecord.nonConformities
      : [],
    result: normalizeText(storedRecord.result) || 'Em andamento',
  };
};

export const migrateInspectionHistory = (storedHistory) =>
  (Array.isArray(storedHistory) ? storedHistory : [])
    .map(migrateInspectionRecord)
    .filter(Boolean);
