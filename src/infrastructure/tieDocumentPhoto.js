import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';

const PHOTO_DIRECTORY = `${FileSystem.documentDirectory}tie-documents/`;

const persistPhoto = async (sourceUri) => {
  if (Platform.OS === 'web') return sourceUri;
  await FileSystem.makeDirectoryAsync(PHOTO_DIRECTORY, { intermediates: true });
  const extension = sourceUri.toLowerCase().match(/\.(png|heic|heif|webp)(?:\?|$)/)?.[1] || 'jpg';
  const destination = `${PHOTO_DIRECTORY}tie-${Date.now()}.${extension}`;
  await FileSystem.copyAsync({ from: sourceUri, to: destination });
  return destination;
};

const handlePickerResult = async (result) => {
  if (result.canceled || !result.assets?.[0]?.uri) return null;
  return persistPhoto(result.assets[0].uri);
};

export const captureTieDocumentPhoto = async () => {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) throw new Error('Permissão da câmera não concedida.');
  return handlePickerResult(
    await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], allowsEditing: true, quality: 0.8 })
  );
};

export const selectTieDocumentPhoto = async () =>
  handlePickerResult(
    await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, quality: 0.8 })
  );
