import { confirmInspectionLocation, createInspectionLocation, isLowAccuracyLocation, parseDecimalCoordinate } from '../src/domain/geospatial/inspectionLocation';
import { createGeoDataset, createGeoNormativeRule } from '../src/domain/geospatial/geoDataset';
import { resolveJurisdiction } from '../src/domain/geospatial/jurisdictionResolver';

describe('georreferenciamento operacional', () => {
  test('aceita coordenadas decimais sem perder precisão', () => expect(parseDecimalCoordinate('-2.90531234', 'latitude')).toBe(-2.90531234));
  test('aceita vírgula decimal na entrada manual', () => expect(parseDecimalCoordinate('-41,7764', 'longitude')).toBe(-41.7764));
  test('rejeita latitude fora do intervalo', () => expect(parseDecimalCoordinate('91', 'latitude')).toBeNull());
  test('rejeita longitude fora do intervalo', () => expect(parseDecimalCoordinate('-181', 'longitude')).toBeNull());
  test('rejeita texto ambíguo', () => expect(parseDecimalCoordinate('2 graus sul', 'latitude')).toBeNull());
  test('cria localização GPS não confirmada', () => expect(createInspectionLocation({ id: 'l1', inspectionId: 'i1', latitude: -2, longitude: -41, accuracy: 8, method: 'GPS' })).toMatchObject({ method: 'GPS', confirmedByUser: false, accuracy: 8 }));
  test('confirma localização separadamente da captura', () => expect(confirmInspectionLocation(createInspectionLocation({ id: 'l1', inspectionId: 'i1', latitude: -2, longitude: -41, method: 'GPS' })).confirmedByUser).toBe(true));
  test('sinaliza precisão baixa', () => expect(isLowAccuracyLocation({ accuracy: 850 })).toBe(true));
  test('não inventa precisão ausente', () => expect(isLowAccuracyLocation({ accuracy: null })).toBe(false));
  test('rejeita método de captura desconhecido', () => expect(() => createInspectionLocation({ id: 'l1', inspectionId: 'i1', latitude: -2, longitude: -41, method: 'TRACKING' })).toThrow('Método'));
  test('não determina jurisdição sem geometria', () => expect(resolveJurisdiction({ location: { confirmedByUser: true }, datasets: [] })).toMatchObject({ status: 'UNDETERMINED', jurisdiction: null }));
  test('não usa localização não confirmada', () => expect(resolveJurisdiction({ location: { confirmedByUser: false }, datasets: [{ status: 'CURRENT_VERIFIED' }] }).status).toBe('UNDETERMINED'));
  test('dataset registra proveniência geométrica', () => expect(createGeoDataset({ id: 'g1', name: 'Teste', sourceId: 's1', sourceName: 'Fonte', sourceDate: '2026-01-01', sourceVersion: '1', geometryHash: 'abc', createdAt: '2026-01-01', featureCount: 1 })).toMatchObject({ coordinateSystem: 'WGS84', geometryHash: 'abc' }));
  test('regra sem geometria permanece apenas textual', () => expect(createGeoNormativeRule({ id: 'r1', sourceId: 's1', section: '1', page: 1, ruleType: 'TEXT', legalText: 'texto', effectiveDate: '2026-01-01' }).validationStatus).toBe('TEXT_ONLY'));
});
