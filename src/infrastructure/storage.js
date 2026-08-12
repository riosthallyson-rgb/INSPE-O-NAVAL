import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';

export const STORAGE_KEYS = {
  APP_STATE: 'inspetor_app_state',
  PROFILE: 'inspetor_profile',
  HISTORY: 'inspetor_history',
  CURRENT_INSPECTION: 'inspetor_current',
};

const writeQueues = new Map();

const readJsonFile = async (uri) => {
  const info = await FileSystem.getInfoAsync(uri);
  if (!info.exists) return undefined;

  const content = await FileSystem.readAsStringAsync(uri);
  return content ? JSON.parse(content) : undefined;
};

export const loadStoredData = async (key, fallback) => {
  try {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const value = window.localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    }

    const uri = `${FileSystem.documentDirectory}${key}.json`;
    try {
      const primary = await readJsonFile(uri);
      if (primary !== undefined) return primary;

      const backup = await readJsonFile(`${uri}.backup`);
      return backup ?? fallback;
    } catch (primaryError) {
      const backup = await readJsonFile(`${uri}.backup`);
      if (backup !== undefined) return backup;
      throw primaryError;
    }
  } catch (error) {
    console.warn(`Falha ao carregar ${key}`, error);
    return fallback;
  }
};

const writeStoredData = async (key, data) => {
  const serialized = JSON.stringify(data);

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.localStorage.setItem(key, serialized);
    return;
  }

  const uri = `${FileSystem.documentDirectory}${key}.json`;
  const temporaryUri = `${uri}.temporary`;
  const backupUri = `${uri}.backup`;

  await FileSystem.writeAsStringAsync(temporaryUri, serialized);
  JSON.parse(await FileSystem.readAsStringAsync(temporaryUri));

  const currentInfo = await FileSystem.getInfoAsync(uri);
  if (currentInfo.exists) {
    await FileSystem.deleteAsync(backupUri, { idempotent: true });
    await FileSystem.copyAsync({ from: uri, to: backupUri });
    await FileSystem.deleteAsync(uri, { idempotent: true });
  }

  await FileSystem.moveAsync({ from: temporaryUri, to: uri });
};

export const saveStoredData = (key, data) => {
  const previousWrite = writeQueues.get(key) || Promise.resolve();
  const nextWrite = previousWrite
    .catch(() => undefined)
    .then(() => writeStoredData(key, data))
    .finally(() => {
      if (writeQueues.get(key) === nextWrite) writeQueues.delete(key);
    });

  writeQueues.set(key, nextWrite);
  return nextWrite;
};
