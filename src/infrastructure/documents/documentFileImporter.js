import { Platform } from 'react-native';
import * as Crypto from 'expo-crypto';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { createDocumentEvidence } from '../../domain/documents/documentEvidence';

const DIRECTORY = `${FileSystem.documentDirectory}document-evidence/`;

export const importDocumentPdf = async ({ inspectionId, now = new Date() }) => {
  const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf', copyToCacheDirectory: true, multiple: false });
  if (result.canceled || !result.assets?.[0]?.uri) return null;
  const id = `documento-${now.getTime()}`;
  let originalFile = result.assets[0].uri;
  if (Platform.OS !== 'web') {
    await FileSystem.makeDirectoryAsync(DIRECTORY, { intermediates: true });
    const destination = `${DIRECTORY}${id}-original.pdf`;
    await FileSystem.copyAsync({ from: originalFile, to: destination });
    originalFile = destination;
  }
  const content = Platform.OS === 'web' ? originalFile : await FileSystem.readAsStringAsync(originalFile, { encoding: FileSystem.EncodingType.Base64 });
  const sha256 = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, content);
  return createDocumentEvidence({ id, inspectionId, originalFile, sha256, capturedAt: now.toISOString() });
};
