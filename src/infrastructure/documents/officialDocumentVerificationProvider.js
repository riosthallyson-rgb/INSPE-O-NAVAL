import { mergeQrExtractedFields, parseQrDocumentPayload } from '../../domain/documents/qrPayloadParser';

export const unavailableOfficialVerificationProvider = Object.freeze({
  id: 'unavailable',
  async verifyDocument() {
    return { state: 'OFFICIAL_VALIDATION_UNAVAILABLE', confirmed: false, provider: null, reference: null, timestamp: new Date().toISOString(), message: 'Autenticidade ainda não confirmada. Não há integração oficial documentada configurada.' };
  },
});

export const applyQrDetection = (evidence, { detected = false, readable = false, data = null } = {}) => {
  const payload = data ? parseQrDocumentPayload(data) : { status: detected ? 'unrecognized' : 'empty', format: null, extractedFields: [], raw: '' };
  const hasStructuredData = payload.status === 'parsed' && payload.extractedFields.length > 0;

  return {
    ...evidence,
    qrState: !detected
      ? 'NO_QR'
      : hasStructuredData
        ? 'QR_DATA_EXTRACTED'
        : readable || data
          ? 'QR_READABLE'
          : 'QR_DETECTED',
    qrData: data || null,
    qrPayloadStatus: payload.status,
    qrPayloadFormat: payload.format,
    extractedFields: hasStructuredData
      ? mergeQrExtractedFields(evidence?.extractedFields || [], payload.extractedFields)
      : evidence?.extractedFields || [],
    verificationState: 'OFFICIAL_VALIDATION_UNAVAILABLE',
  };
};
