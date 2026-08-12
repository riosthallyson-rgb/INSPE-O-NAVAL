export const CRITICAL_DOCUMENT_FIELDS = Object.freeze([
  'registrationNumber',
  'ownerName',
  'ownerTaxId',
  'authorizedCapacity',
  'authorizedNavigationArea',
  'validUntil',
  'category',
]);

export const updateExtractedFieldValue = (evidence, fieldName, value) => ({
  ...evidence,
  extractedFields: (evidence.extractedFields || []).map((item) => item.field === fieldName ? { ...item, value: value === '' ? null : String(value), confirmedByUser: false, editedByUser: true } : item),
});

export const confirmReliableDocumentFields = (evidence, minimumConfidence = 0.85) => ({
  ...evidence,
  extractedFields: (evidence.extractedFields || []).map((item) => ({
    ...item,
    confirmedByUser: item.confirmedByUser || Boolean(item.value) && item.confidence >= minimumConfidence && !CRITICAL_DOCUMENT_FIELDS.includes(item.field),
  })),
});

const vesselMapping = Object.freeze({
  registrationNumber: 'tie',
  vesselName: 'name',
  vesselType: 'type',
  registrationPort: 'registrationPort',
  authorizedNavigationArea: 'navigationArea',
  authorizedCapacity: 'passengerCapacity',
  lengthMeters: 'lengthMeters',
  grossTonnage: 'grossTonnage',
  ownerName: 'owner',
  ownerTaxId: 'taxId',
  validUntil: 'validUntil',
});

export const buildVesselPatchFromConfirmedFields = (evidence) => Object.fromEntries(
  (evidence.extractedFields || [])
    .filter((item) => item.confirmedByUser && item.value !== null && vesselMapping[item.field])
    .map((item) => [vesselMapping[item.field], String(item.value)]),
);

export const getDocumentReviewSummary = (evidence) => {
  const fields = evidence?.extractedFields || [];
  return {
    total: fields.length,
    confirmed: fields.filter((item) => item.confirmedByUser).length,
    pending: fields.filter((item) => !item.confirmedByUser).length,
    criticalPending: fields.filter((item) => CRITICAL_DOCUMENT_FIELDS.includes(item.field) && !item.confirmedByUser).map((item) => item.field),
    canApply: fields.some((item) => item.confirmedByUser),
  };
};
