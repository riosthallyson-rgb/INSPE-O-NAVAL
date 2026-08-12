export const DOCUMENT_TYPES = Object.freeze(['TIE', 'TIEM', 'PRPM', 'CHA', 'CIR', 'CTS', 'OTHER', 'UNKNOWN']);
export const DOCUMENT_RECOGNITION_STATES = Object.freeze(['RECOGNIZED', 'PARTIALLY_RECOGNIZED', 'UNIDENTIFIED']);
export const OCR_QUALITY = Object.freeze(['EXCELLENT', 'GOOD', 'LOW', 'FAILED']);
export const QR_STATES = Object.freeze(['NO_QR', 'QR_DETECTED', 'QR_READABLE', 'QR_DATA_EXTRACTED', 'OFFICIAL_VALIDATION_AVAILABLE', 'OFFICIAL_VALIDATION_CONFIRMED', 'OFFICIAL_VALIDATION_FAILED', 'OFFICIAL_VALIDATION_UNAVAILABLE']);

export const createExtractedField = ({ field, value = null, confidence = 0, boundingBox = null, sourceImage = 'processedImage' }) => ({
  field,
  value: value === null || value === undefined || value === '' ? null : String(value),
  confidence: Math.max(0, Math.min(1, Number(confidence) || 0)),
  boundingBox,
  sourceImage,
  confirmedByUser: false,
});

export const createDocumentEvidence = ({ id, inspectionId, type = 'UNKNOWN', originalFile, processedFile = null, thumbnail = null, sha256, capturedAt = new Date().toISOString(), coordinates = null, extractedFields = [] }) => ({
  id,
  inspectionId,
  type: DOCUMENT_TYPES.includes(type) ? type : 'UNKNOWN',
  originalFile,
  processedFile,
  thumbnail,
  sha256,
  capturedAt,
  coordinates,
  extractedFields,
  recognitionState: 'UNIDENTIFIED',
  ocrQuality: 'FAILED',
  qrState: 'NO_QR',
  verificationState: 'OFFICIAL_VALIDATION_UNAVAILABLE',
  verificationProvider: null,
  verificationTimestamp: null,
  captureIncomplete: false,
});

export const confirmDocumentField = (evidence, fieldName, editedValue) => ({
  ...evidence,
  extractedFields: evidence.extractedFields.map((item) => item.field === fieldName ? { ...item, value: editedValue === undefined ? item.value : String(editedValue), confirmedByUser: true } : item),
});

export const getConfirmedDocumentValues = (evidence) => Object.fromEntries(
  evidence.extractedFields.filter((item) => item.confirmedByUser && item.value !== null).map((item) => [item.field, item.value]),
);

export const findDuplicateDocument = (documents, sha256) => documents.find((item) => Boolean(sha256) && item.sha256 === sha256) || null;
