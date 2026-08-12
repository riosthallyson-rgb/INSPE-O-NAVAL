import { bufferToHex, buildEvidenceLocationMetadata } from '../src/infrastructure/evidencePhoto';

describe('integridade da evidência', () => {
  test('associa somente localização confirmada com opção habilitada', () => expect(buildEvidenceLocationMetadata({ latitude: -2, longitude: -41, accuracy: 8, method: 'GPS', confirmedByUser: true }, true)).toMatchObject({ locationAssociated: true, latitude: -2, longitude: -41, accuracy: 8 }));
  test('não associa localização não confirmada', () => expect(buildEvidenceLocationMetadata({ latitude: -2, longitude: -41, confirmedByUser: false }, true).locationAssociated).toBe(false));
  test('respeita opção desabilitada', () => expect(buildEvidenceLocationMetadata({ latitude: -2, longitude: -41, confirmedByUser: true }, false).latitude).toBe(''));
  test('converte o hash binário para hexadecimal preservando zeros', () => {
    expect(bufferToHex(new Uint8Array([0, 15, 16, 255]).buffer)).toBe('000f10ff');
  });
});
