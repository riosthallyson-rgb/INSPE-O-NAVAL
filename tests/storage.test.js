import * as FileSystem from 'expo-file-system/legacy';
import { loadStoredData, loadStoredDataDetailed, saveStoredData } from '../src/infrastructure/storage';

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

  test('recupera o backup quando o arquivo principal está corrompido e expõe a recuperação', async () => {
    FileSystem.getInfoAsync.mockResolvedValue({ exists: true });
    FileSystem.readAsStringAsync
      .mockResolvedValueOnce('{inválido')
      .mockResolvedValueOnce('{"name":"Recuperado"}');

    const result = await loadStoredDataDetailed('perfil', {});
    expect(result.data).toEqual({ name: 'Recuperado' });
    expect(result.status).toBe('backup');
    expect(result.error).toBeTruthy();
  });

  test('mantém API simples para consumidores legados', async () => {
    FileSystem.getInfoAsync.mockResolvedValue({ exists: true });
    FileSystem.readAsStringAsync.mockResolvedValueOnce('{"name":"Principal"}');
    await expect(loadStoredData('perfil', {})).resolves.toEqual({ name: 'Principal' });
  });

  test('recupera o backup quando a promoção do arquivo foi interrompida', async () => {
    FileSystem.getInfoAsync
      .mockResolvedValueOnce({ exists: false })
      .mockResolvedValueOnce({ exists: true });
    FileSystem.readAsStringAsync.mockResolvedValueOnce('{"name":"Backup"}');

    const result = await loadStoredDataDetailed('perfil', {});
    expect(result).toMatchObject({ data: { name: 'Backup' }, status: 'backup' });
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
