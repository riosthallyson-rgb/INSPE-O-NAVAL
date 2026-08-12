import { Platform } from 'react-native';
import * as Crypto from 'expo-crypto';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';

const EVIDENCE_DIRECTORY = `${FileSystem.documentDirectory}inspection-evidence/`;

export const bufferToHex = (buffer) =>
  [...new Uint8Array(buffer)].map((value) => value.toString(16).padStart(2, '0')).join('');

const selectPhoto = async (source) => {
  if (source === 'camera') {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) throw new Error('Permissão da câmera não concedida.');
    return ImagePicker.launchCameraAsync({ mediaTypes: ['images'], allowsEditing: false, quality: 1 });
  }
  return ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: false, quality: 1 });
};

export const buildEvidenceLocationMetadata = (location, enabled) => enabled && location?.confirmedByUser ? { locationAssociated: true, latitude: location.latitude, longitude: location.longitude, accuracy: location.accuracy ?? null, locationCapturedAt: location.capturedAt || null, locationMethod: location.method || null } : { locationAssociated: false, latitude: '', longitude: '', accuracy: null, locationCapturedAt: null, locationMethod: null };

export const captureInspectionEvidence = async ({ source, inspectionId, itemId, location, attachLocation = false }) => {
  const result = await selectPhoto(source);
  if (result.canceled || !result.assets?.[0]?.uri) return null;
  const asset = result.assets[0];
  const capturedAt = new Date().toISOString();
  const extension = asset.fileName?.match(/\.([a-z0-9]+)$/i)?.[1] || asset.uri.match(/\.([a-z0-9]+)(?:\?|$)/i)?.[1] || 'jpg';
  let storedUri = asset.uri;
  if (Platform.OS !== 'web') {
    await FileSystem.makeDirectoryAsync(EVIDENCE_DIRECTORY, { intermediates: true });
    storedUri = `${EVIDENCE_DIRECTORY}${inspectionId}-${itemId}-${Date.now()}.${extension}`;
    await FileSystem.copyAsync({ from: asset.uri, to: storedUri });
  }
  const bytes = await (await fetch(storedUri)).arrayBuffer();
  const sha256 = bufferToHex(await Crypto.digest(Crypto.CryptoDigestAlgorithm.SHA256, bytes));
  return {
    id: `evidencia-${Date.now()}`,
    type: 'photo',
    uri: storedUri,
    originalFileName: asset.fileName || `original.${extension}`,
    sha256,
    capturedAt,
    inspectionId,
    itemId,
    ...buildEvidenceLocationMetadata(location, attachLocation),
  };
};
