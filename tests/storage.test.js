import * as FileSystem from 'expo-file-system/legacy';
import { loadStoredData, saveStoredData } from '../src/infrastructure/storage';

jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: 'file:///documents/',
  getInfoAsync: jest.fn(),
  readAsStringAsync: jest.fn(),
  writeAsStringAsync: jest.fn(),
  deleteAsync: jest.fn(),
  copyAsync: jest.fn(),
  moveAsync: jest.fn(),
}));

describe('armazenamento local', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('recupera o backup quando o arquivo principal está corrompido', async () => {
    FileSystem.getInfoAsync.mockResolvedValue({ exists: true });
    FileSystem.readAsStringAsync
      .mockResolvedValueOnce('{inválido')
      .mockResolvedValueOnce('{"name":"Recuperado"}');

    await expect(loadStoredData('perfil', {})).resolves.toEqual({ name: 'Recuperado' });
  });

  test('recupera o backup quando a promoção do arquivo foi interrompida', async () => {
    FileSystem.getInfoAsync
      .mockResolvedValueOnce({ exists: false })
      .mockResolvedValueOnce({ exists: true });
    FileSystem.readAsStringAsync.mockResolvedValueOnce('{"name":"Backup"}');

    await expect(loadStoredData('perfil', {})).resolves.toEqual({ name: 'Backup' });
  });

  test('valida o arquivo temporário antes de promovê-lo', async () => {
    FileSystem.writeAsStringAsync.mockResolvedValue();
    FileSystem.readAsStringAsync.mockResolvedValue('{"id":1}');
    FileSystem.getInfoAsync.mockResolvedValue({ exists: false });
    FileSystem.moveAsync.mockResolvedValue();

    await saveStoredData('inspecao', { id: 1 });

    expect(FileSystem.writeAsStringAsync).toHaveBeenCalledWith(
      'file:///documents/inspecao.json.temporary',
      '{"id":1}'
    );
    expect(FileSystem.moveAsync).toHaveBeenCalledWith({
      from: 'file:///documents/inspecao.json.temporary',
      to: 'file:///documents/inspecao.json',
    });
  });
});
