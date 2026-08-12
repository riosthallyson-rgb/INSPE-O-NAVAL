import { Platform } from 'react-native';
import * as Crypto from 'expo-crypto';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { createDocumentEvidence } from '../../domain/documents/documentEvidence';

const DIRECTORY = `${FileSystem.documentDirectory}document-evidence/`;
const readBase64 = (uri) => FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });

const persistOriginal = async (uri, id) => {
  if (Platform.OS === 'web') return uri;
  await FileSystem.makeDirectoryAsync(DIRECTORY, { intermediates: true });
  const extension = uri.toLowerCase().match(/\.(png|heic|heif|webp)(?:\?|$)/)?.[1] || 'jpg';
  const destination = `${DIRECTORY}${id}-original.${extension}`;
  await FileSystem.copyAsync({ from: uri, to: destination });
  return destination;
};

const hashOriginal = async (uri) => {
  const content = Platform.OS === 'web' ? uri : await readBase64(uri);
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, content);
};

const fromPickerResult = async (result, inspectionId, now = new Date()) => {
  if (result.canceled || !result.assets?.[0]?.uri) return null;
  const id = `documento-${now.getTime()}`;
  const originalFile = await persistOriginal(result.assets[0].uri, id);
  const sha256 = await hashOriginal(originalFile);
  return createDocumentEvidence({ id, inspectionId, originalFile, sha256, capturedAt: now.toISOString() });
};

export const captureDocument = async ({ inspectionId }) => {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) throw new Error('Permissão da câmera não concedida.');
  const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], allowsEditing: false, quality: 1 });
  return fromPickerResult(result, inspectionId);
};

export const importDocumentImage = async ({ inspectionId }) => fromPickerResult(await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: false, quality: 1 }), inspectionId);
