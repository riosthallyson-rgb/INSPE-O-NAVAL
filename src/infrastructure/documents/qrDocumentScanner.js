import { Camera } from 'expo-camera';
import { applyQrDetection } from './officialDocumentVerificationProvider';

export const scanQrFromDocumentImage = async (evidence) => {
  if (!evidence?.originalFile) return applyQrDetection(evidence || {}, { detected: false });
  const results = await Camera.scanFromURLAsync(evidence.originalFile, ['qr']);
  const qr = results.find((item) => item.type === 'qr');
  if (!qr) return applyQrDetection(evidence, { detected: false });
  return applyQrDetection(evidence, { detected: true, readable: Boolean(qr.data), data: qr.data || null });
};
