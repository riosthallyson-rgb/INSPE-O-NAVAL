import { createDocumentEvidence, createExtractedField, confirmDocumentField, findDuplicateDocument, getConfirmedDocumentValues } from '../src/domain/documents/documentEvidence';
import { classifyDocumentType } from '../src/domain/documents/documentTypeClassifier';
import { parseBrazilianDate, parseCtsText, parseLicenseDocumentText, parseVesselDocumentText } from '../src/domain/documents/documentParsers';
import { compareVesselDocument } from '../src/domain/documents/vesselDocumentConsistencyEngine';
import { applyQrDetection, unavailableOfficialVerificationProvider } from '../src/infrastructure/documents/officialDocumentVerificationProvider';
import { buildVesselPatchFromConfirmedFields, confirmReliableDocumentFields, getDocumentReviewSummary, updateExtractedFieldValue } from '../src/domain/documents/documentReview';

const evidence = () => createDocumentEvidence({ id: 'd1', inspectionId: 'i1', originalFile: 'original.jpg', sha256: 'abc' });

describe('Documentos Inteligentes', () => {
  test('preserva identificador como string e zeros iniciais', () => expect(createExtractedField({ field: 'registrationNumber', value: '00123' }).value).toBe('00123'));
  test('limita confiança ao intervalo válido', () => expect(createExtractedField({ field: 'x', value: 'a', confidence: 2 }).confidence).toBe(1));
  test('cria evidência sem afirmar autenticidade', () => expect(evidence().verificationState).toBe('OFFICIAL_VALIDATION_UNAVAILABLE'));
  test('mantém original separado do processado', () => expect(evidence()).toMatchObject({ originalFile: 'original.jpg', processedFile: null }));
  test('confirma campo individualmente', () => {
    const item = { ...evidence(), extractedFields: [createExtractedField({ field: 'vesselName', value: 'NANA' })] };
    expect(confirmDocumentField(item, 'vesselName').extractedFields[0].confirmedByUser).toBe(true);
  });
  test('usa somente campos confirmados', () => {
    const item = { ...evidence(), extractedFields: [createExtractedField({ field: 'a', value: '1' }), { ...createExtractedField({ field: 'b', value: '2' }), confirmedByUser: true }] };
    expect(getConfirmedDocumentValues(item)).toEqual({ b: '2' });
  });
  test('detecta duplicidade por hash', () => expect(findDuplicateDocument([evidence()], 'abc').id).toBe('d1'));
  test('não acusa duplicidade sem hash', () => expect(findDuplicateDocument([evidence()], '')).toBeNull());

  test('classifica TIE por labels combinados', () => expect(classifyDocumentType('Título de Inscrição de Embarcação\nNúmero de inscrição: 001').type).toBe('TIE'));
  test('classifica CHA', () => expect(classifyDocumentType('Carteira de Habilitação de Amador\nCategoria: Mestre').type).toBe('CHA'));
  test('não inventa tipo sem evidência', () => expect(classifyDocumentType('imagem sem texto')).toMatchObject({ type: 'UNKNOWN', recognitionState: 'UNIDENTIFIED' }));

  test('aceita data brasileira real', () => expect(parseBrazilianDate('29/02/2024')).toBe('29/02/2024'));
  test('rejeita data brasileira impossível', () => expect(parseBrazilianDate('31/02/2024')).toBeNull());
  test('não converte data ambígua', () => expect(parseBrazilianDate('02/03/24')).toBeNull());
  test('extrai TIE sem remover zeros', () => expect(parseVesselDocumentText('Número de inscrição: 001234\nNome da embarcação: NANA').find((x) => x.field === 'registrationNumber').value).toBe('001234'));
  test('campo ausente permanece nulo', () => expect(parseVesselDocumentText('Nome da embarcação: NANA').find((x) => x.field === 'authorizedNavigationArea').value).toBeNull());
  test('extrai nome da embarcação', () => expect(parseVesselDocumentText('Nome da embarcação: NANA').find((x) => x.field === 'vesselName').value).toBe('NANA'));
  test('extrai habilitação sem afirmar aplicabilidade', () => expect(parseLicenseDocumentText('Nome: ANA\nNúmero: 009\nCategoria: ARRAIS\nValidade: 10/10/2030').map((x) => x.value)).toEqual(['ANA', '009', 'ARRAIS', '10/10/2030']));
  test('preserva colunas do CTS', () => expect(parseCtsText('Mestre | MOC | 1')[0]).toMatchObject({ role: 'Mestre', category: 'MOC', quantity: '1' }));
  test('quantidade CTS inválida fica nula', () => expect(parseCtsText('Mestre | MOC | um')[0].quantity).toBeNull());

  test('QR legível em formato desconhecido não autentica nem inventa dados', () => expect(applyQrDetection(evidence(), { detected: true, readable: true, data: 'conteúdo' })).toMatchObject({ qrState: 'QR_READABLE', qrPayloadStatus: 'unrecognized', verificationState: 'OFFICIAL_VALIDATION_UNAVAILABLE', extractedFields: [] }));
  test('QR estruturado extrai dados sem autenticar documento', () => expect(applyQrDetection(evidence(), { detected: true, readable: true, data: '{"registrationNumber":"00123"}' })).toMatchObject({ qrState: 'QR_DATA_EXTRACTED', qrPayloadStatus: 'parsed', verificationState: 'OFFICIAL_VALIDATION_UNAVAILABLE' }));
  test('provider ausente nunca confirma', async () => expect(await unavailableOfficialVerificationProvider.verifyDocument(evidence())).toMatchObject({ confirmed: false, state: 'OFFICIAL_VALIDATION_UNAVAILABLE' }));
  test('QR ausente permanece NO_QR', () => expect(applyQrDetection(evidence()).qrState).toBe('NO_QR'));

  test('sinaliza possível divergência sem conclusão jurídica', () => expect(compareVesselDocument({ confirmedDocumentValues: { vesselType: 'Lancha' }, vessel: { type: 'Bote' } })[0].status).toBe('POSSIBLE_DIVERGENCE'));
  test('sinaliza possível excesso de lotação', () => expect(compareVesselDocument({ confirmedDocumentValues: { authorizedCapacity: '6' }, occupancy: { totalPersons: 8 } })[0].status).toBe('POSSIBLE_CAPACITY_EXCESS'));
  test('não sinaliza lotação quando dado está ausente', () => expect(compareVesselDocument({ confirmedDocumentValues: {}, occupancy: { totalPersons: 8 } })).toEqual([]));

  test('confirma em lote somente campo confiável não crítico', () => {
    const item = { ...evidence(), extractedFields: [createExtractedField({ field: 'vesselName', value: 'NANA', confidence: 0.9 }), createExtractedField({ field: 'registrationNumber', value: '001', confidence: 0.99 })] };
    const reviewed = confirmReliableDocumentFields(item);
    expect(reviewed.extractedFields.map((field) => field.confirmedByUser)).toEqual([true, false]);
  });
  test('não confirma em lote campo de baixa confiança', () => {
    const item = { ...evidence(), extractedFields: [createExtractedField({ field: 'vesselName', value: 'NANA', confidence: 0.5 })] };
    expect(confirmReliableDocumentFields(item).extractedFields[0].confirmedByUser).toBe(false);
  });
  test('edição invalida confirmação anterior', () => {
    const item = { ...evidence(), extractedFields: [{ ...createExtractedField({ field: 'vesselName', value: 'NANA' }), confirmedByUser: true }] };
    expect(updateExtractedFieldValue(item, 'vesselName', 'MARIA').extractedFields[0]).toMatchObject({ value: 'MARIA', confirmedByUser: false, editedByUser: true });
  });
  test('aplica somente dados confirmados à embarcação', () => {
    const item = { ...evidence(), extractedFields: [{ ...createExtractedField({ field: 'registrationNumber', value: '001' }), confirmedByUser: true }, createExtractedField({ field: 'ownerName', value: 'ANA' })] };
    expect(buildVesselPatchFromConfirmedFields(item)).toEqual({ tie: '001' });
  });
  test('resumo impede aplicação sem confirmação humana', () => {
    const item = { ...evidence(), extractedFields: [createExtractedField({ field: 'registrationNumber', value: '001' })] };
    expect(getDocumentReviewSummary(item)).toMatchObject({ confirmed: 0, pending: 1, canApply: false, criticalPending: ['registrationNumber'] });
  });
});
