import { Platform } from 'react-native';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';

const loadPublicationAsset = async (publication) => {
  if (!publication?.file) throw new Error('PDF não disponível');

  const asset = Asset.fromModule(publication.file);
  await asset.downloadAsync();
  return asset;
};

export const getPublicationUri = async (publication) => {
  const asset = await loadPublicationAsset(publication);
  const localUri = asset.localUri || asset.uri;
  if (!localUri) throw new Error('URI do arquivo não encontrada');

  return Platform.OS === 'android'
    ? FileSystem.getContentUriAsync(localUri)
    : localUri;
};
