export const unavailableOfficialVerificationProvider = Object.freeze({
  id: 'unavailable',
  async verifyDocument() {
    return { state: 'OFFICIAL_VALIDATION_UNAVAILABLE', confirmed: false, provider: null, reference: null, timestamp: new Date().toISOString(), message: 'Autenticidade ainda não confirmada. Não há integração oficial documentada configurada.' };
  },
});

export const applyQrDetection = (evidence, { detected = false, readable = false, data = null } = {}) => ({
  ...evidence,
  qrState: !detected ? 'NO_QR' : data ? 'QR_DATA_EXTRACTED' : readable ? 'QR_READABLE' : 'QR_DETECTED',
  qrData: data || null,
  verificationState: 'OFFICIAL_VALIDATION_UNAVAILABLE',
});
