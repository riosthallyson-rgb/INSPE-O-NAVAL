import { Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { parseHistoryBackup } from '../domain/historyBackup';

const safeTimestamp = (value = new Date()) => value.toISOString().replace(/[:.]/g, '-');

export const serializeHistoryBackup = (payload) => JSON.stringify(payload, null, 2);

const downloadOnWeb = (text, fileName) => {
  if (typeof document === 'undefined' || typeof URL === 'undefined' || typeof Blob === 'undefined') {
    return { uri: null, fileName, shared: false };
  }
  const blob = new Blob([text], { type: 'application/json;charset=utf-8' });
  const uri = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = uri;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(uri);
  return { uri, fileName, shared: true };
};

export const exportHistoryBackupFile = async (payload, { now = new Date() } = {}) => {
  const fileName = `inspetor-naval-backup-${safeTimestamp(now)}.json`;
  const text = serializeHistoryBackup(payload);

  if (Platform.OS === 'web') return downloadOnWeb(text, fileName);

  const uri = `${FileSystem.cacheDirectory || FileSystem.documentDirectory}${fileName}`;
  await FileSystem.writeAsStringAsync(uri, text, { encoding: FileSystem.EncodingType.UTF8 });
  const sharingAvailable = await Sharing.isAvailableAsync();
  if (sharingAvailable) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/json',
      dialogTitle: 'Salvar backup do Inspetor Naval',
      UTI: 'public.json',
    });
  }
  return { uri, fileName, shared: sharingAvailable };
};

const readPickedAsset = async (asset) => {
  if (!asset) throw new Error('Nenhum arquivo selecionado.');
  if (Platform.OS === 'web' && asset.file?.text) return asset.file.text();
  if (!asset.uri) throw new Error('O arquivo selecionado não possui um endereço legível.');
  if (Platform.OS === 'web') {
    const response = await fetch(asset.uri);
    if (!response.ok) throw new Error('Não foi possível ler o arquivo selecionado.');
    return response.text();
  }
  return FileSystem.readAsStringAsync(asset.uri, { encoding: FileSystem.EncodingType.UTF8 });
};

export const pickHistoryBackupFile = async () => {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['application/json', 'text/json', 'text/plain'],
    copyToCacheDirectory: true,
    multiple: false,
  });
  if (result.canceled) return { canceled: true, payload: null, errors: [] };

  const text = await readPickedAsset(result.assets?.[0]);
  const parsed = parseHistoryBackup(text);
  return parsed.ok
    ? { canceled: false, payload: parsed.payload, errors: [] }
    : { canceled: false, payload: null, errors: parsed.errors };
};
