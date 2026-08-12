import { getHistorySummary } from '../src/domain/historySummary';

describe('resumo do histórico', () => {
  const referenceDate = new Date('2026-08-08T12:00:00.000Z');

  test('resume somente inspeções dos últimos 30 dias', () => {
    const summary = getHistorySummary(
      [
        { completedAt: '2026-08-08T10:00:00.000Z', result: 'Conforme' },
        { completedAt: '2026-07-20T10:00:00.000Z', result: 'Não conforme' },
        { completedAt: '2026-07-01T10:00:00.000Z', result: 'Conforme' },
        { createdAt: '2026-08-07T10:00:00.000Z', result: 'Em andamento' },
      ],
      referenceDate
    );

    expect(summary).toEqual({
      periodDays: 30,
      total: 3,
      conforming: 1,
      nonConforming: 1,
      conformityRate: 50,
    });
  });

  test('retorna indicadores zerados para histórico vazio ou inválido', () => {
    expect(getHistorySummary([{ completedAt: 'data inválida', result: 'Conforme' }], referenceDate)).toEqual({
      periodDays: 30,
      total: 0,
      conforming: 0,
      nonConforming: 0,
      conformityRate: 0,
    });
  });
});
