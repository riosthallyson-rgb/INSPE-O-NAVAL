import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';

const measureNativePath = async (uri) => {
  try {
    const info = await FileSystem.getInfoAsync(uri, { size: true });
    if (!info.exists) return 0;
    if (!info.isDirectory) return Number(info.size) || 0;
    const children = await FileSystem.readDirectoryAsync(uri);
    const sizes = await Promise.all(children.map((name) => measureNativePath(`${uri}${uri.endsWith('/') ? '' : '/'}${name}`)));
    return sizes.reduce((sum, size) => sum + size, 0);
  } catch {
    return 0;
  }
};

const measureWebStorage = () => {
  if (typeof window === 'undefined' || !window.localStorage) return 0;
  let bytes = 0;
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (!key || !key.startsWith('inspetor_')) continue;
    const value = window.localStorage.getItem(key) || '';
    bytes += new TextEncoder().encode(`${key}${value}`).length;
  }
  return bytes;
};

export const measureLocalAppStorage = async () => {
  if (Platform.OS === 'web') return measureWebStorage();
  if (!FileSystem.documentDirectory) return 0;
  return measureNativePath(FileSystem.documentDirectory);
};
