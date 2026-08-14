import { mergeQrExtractedFields, parseQrDocumentPayload } from '../src/domain/documents/qrPayloadParser';
import { applyQrDetection } from '../src/infrastructure/documents/officialDocumentVerificationProvider';

describe('qrPayloadParser', () => {
  test('extrai payload JSON completo sem confirmar campos', () => {
    const result = parseQrDocumentPayload(JSON.stringify({
      registrationNumber: '123456789',
      vesselName: 'MAR AZUL',
      vesselType: 'Lancha',
      registrationPort: 'Fortaleza',
      authorizedNavigationArea: 'Mar aberto',
      authorizedCapacity: 8,
      lengthMeters: 7.5,
      grossTonnage: 4.2,
      ownerName: 'Pessoa Teste',
      ownerTaxId: '123.456.789-00',
      validUntil: '31/12/2027',
    }));

    expect(result.status).toBe('parsed');
    expect(result.format).toBe('json');
    expect(result.extractedFields).toHaveLength(11);
    expect(result.extractedFields.every((field) => field.confirmedByUser === false)).toBe(true);
    expect(result.extractedFields.every((field) => field.confidence === 0.95)).toBe(true);
  });

  test('aceita payload parcial em chave=valor com aliases e acentos', () => {
    const result = parseQrDocumentPayload('Inscrição=98765;Nome da embarcação=VENTO SUL;Área de navegação=Interior');

    expect(result.status).toBe('parsed');
    expect(Object.fromEntries(result.extractedFields.map((item) => [item.field, item.value]))).toMatchObject({
      registrationNumber: '98765',
      vesselName: 'VENTO SUL',
      authorizedNavigationArea: 'Interior',
    });
  });

  test('aceita formato posicional separado por barra vertical', () => {
    const result = parseQrDocumentPayload('321|JANGADA I|Pesca|Camocim|Interior|5|6.2|2.1|Armador Teste|00000000000|01/01/2028');

    expect(result.status).toBe('parsed');
    expect(result.format).toBe('positional');
    expect(result.extractedFields.find((item) => item.field === 'vesselName')?.value).toBe('JANGADA I');
  });

  test('payload corrompido retorna estado explícito sem lançar', () => {
    expect(() => parseQrDocumentPayload('{isto-nao-e-json')).not.toThrow();
    expect(parseQrDocumentPayload('{isto-nao-e-json')).toMatchObject({ status: 'unrecognized', extractedFields: [] });
  });

  test('mantém campo já confirmado ao mesclar nova leitura', () => {
    const current = [{ field: 'vesselName', value: 'CONFERIDO', confidence: 1, confirmedByUser: true }];
    const incoming = parseQrDocumentPayload('{"vesselName":"OUTRO NOME","registrationNumber":"123"}').extractedFields;
    const merged = mergeQrExtractedFields(current, incoming);

    expect(merged.find((item) => item.field === 'vesselName')?.value).toBe('CONFERIDO');
    expect(merged.find((item) => item.field === 'registrationNumber')?.confirmedByUser).toBe(false);
  });

  test('QR legível em formato desconhecido não é tratado como dados extraídos', () => {
    const evidence = { extractedFields: [], qrState: 'NO_QR' };
    const result = applyQrDetection(evidence, { detected: true, readable: true, data: 'https://exemplo.invalid/documento/123' });

    expect(result.qrState).toBe('QR_READABLE');
    expect(result.qrPayloadStatus).toBe('unrecognized');
    expect(result.extractedFields).toEqual([]);
    expect(result.verificationState).toBe('OFFICIAL_VALIDATION_UNAVAILABLE');
  });

  test('nenhum QR encontrado preserva estado seguro', () => {
    const result = applyQrDetection({ extractedFields: [] }, { detected: false });
    expect(result.qrState).toBe('NO_QR');
    expect(result.extractedFields).toEqual([]);
  });
});
