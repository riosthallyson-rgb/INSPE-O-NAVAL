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

const loadWebDataDetailed = (key, fallback) => {
  if (typeof window === 'undefined') return { data: fallback, status: 'fallback', error: null };
  const primaryValue = window.localStorage.getItem(key);
  const backupValue = window.localStorage.getItem(`${key}.backup`);

  if (primaryValue) {
    try {
      return { data: JSON.parse(primaryValue), status: 'primary', error: null };
    } catch (primaryError) {
      if (backupValue) {
        try {
          return { data: JSON.parse(backupValue), status: 'backup', error: primaryError };
        } catch (backupError) {
          return { data: fallback, status: 'fallback', error: backupError };
        }
      }
      return { data: fallback, status: 'fallback', error: primaryError };
    }
  }

  if (backupValue) {
    try {
      return { data: JSON.parse(backupValue), status: 'backup', error: null };
    } catch (error) {
      return { data: fallback, status: 'fallback', error };
    }
  }

  return { data: fallback, status: 'fallback', error: null };
};

const loadNativeDataDetailed = async (key, fallback) => {
  const uri = `${FileSystem.documentDirectory}${key}.json`;
  const backupUri = `${uri}.backup`;
  let primaryError = null;

  try {
    const primary = await readJsonFile(uri);
    if (primary !== undefined) return { data: primary, status: 'primary', error: null };
  } catch (error) {
    primaryError = error;
  }

  try {
    const backup = await readJsonFile(backupUri);
    if (backup !== undefined) return { data: backup, status: 'backup', error: primaryError };
  } catch (backupError) {
    return { data: fallback, status: 'fallback', error: backupError };
  }

  return { data: fallback, status: 'fallback', error: primaryError };
};

export const loadStoredDataDetailed = async (key, fallback) => {
  try {
    const result = Platform.OS === 'web'
      ? loadWebDataDetailed(key, fallback)
      : await loadNativeDataDetailed(key, fallback);
    if (result.error) console.warn(`Falha parcial ao carregar ${key}`, result.error);
    return result;
  } catch (error) {
    console.warn(`Falha ao carregar ${key}`, error);
    return { data: fallback, status: 'fallback', error };
  }
};

export const loadStoredData = async (key, fallback) => (await loadStoredDataDetailed(key, fallback)).data;

const writeStoredData = async (key, data) => {
  const serialized = JSON.stringify(data);
  JSON.parse(serialized);

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const current = window.localStorage.getItem(key);
    if (current) window.localStorage.setItem(`${key}.backup`, current);
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
