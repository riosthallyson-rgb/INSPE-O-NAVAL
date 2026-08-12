import { parseTieDate, validateTieDocument } from '../src/domain/tieDocumentValidation';

const completeProfile = {
  name: 'Mar Azul',
  tie: '123',
  armador: 'Maria',
  type: 'Lancha',
  activity: 'Esporte e recreio',
  navigationArea: 'Interior',
  validUntil: '20/09/2026',
};

describe('verificação do documento TIE', () => {
  const referenceDate = new Date('2026-08-08T12:00:00-03:00');

  test('aceita datas reais nos formatos brasileiro e ISO', () => {
    expect(parseTieDate('29/02/2024')).not.toBeNull();
    expect(parseTieDate('2026-09-20')).not.toBeNull();
    expect(parseTieDate('31/02/2026')).toBeNull();
  });

  test('classifica documento com mais de 30 dias como válido', () => {
    const result = validateTieDocument(completeProfile, referenceDate);
    expect(result.complete).toBe(true);
    expect(result.expirationStatus).toBe('valid');
    expect(result.missingFields).toEqual([]);
  });

  test('avisa quando o documento vence em até 30 dias', () => {
    const result = validateTieDocument({ ...completeProfile, validUntil: '25/08/2026' }, referenceDate);
    expect(result.expirationStatus).toBe('expiring');
    expect(result.daysUntilExpiration).toBe(17);
  });

  test('identifica vencimento, data inválida e campos ausentes', () => {
    expect(validateTieDocument({ ...completeProfile, validUntil: '07/08/2026' }, referenceDate).expirationStatus).toBe('expired');
    expect(validateTieDocument({ ...completeProfile, validUntil: '31/02/2026' }, referenceDate).expirationStatus).toBe('invalid');
    const incomplete = validateTieDocument({ name: 'Barco' }, referenceDate);
    expect(incomplete.complete).toBe(false);
    expect(incomplete.missingFields).toContain('Número de inscrição (TIE)');
  });
});
