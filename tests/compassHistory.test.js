import { addCompassHistoryEntry, createCompassHistoryEntry, removeCompassHistoryEntry } from '../src/domain/compassHistory';

describe('histórico local da Bússola', () => {
  test('remove CPF da consulta geral', () => {
    const entry = createCompassHistoryEntry({ queryId: 'q1', generatedAt: '2026-08-08T12:00:00Z', question: 'CPF 12345678901 sem CHA', interpretedIntent: 'DRIVER_LICENSE', interpretedContext: {}, citations: [], sourceVersions: [], insufficientEvidence: true });
    expect(entry.question).not.toContain('12345678901');
  });
  test('não armazena o texto pessoal quando existe inspeção vinculada', () => {
    const entry = createCompassHistoryEntry({ queryId: 'q1', generatedAt: '2026-08-08T12:00:00Z', question: 'João sem CHA', interpretedIntent: 'DRIVER_LICENSE', interpretedContext: { inspectionId: 'i-1' }, citations: [], sourceVersions: [], insufficientEvidence: false });
    expect(entry.question).toBe('');
    expect(entry.title).toContain('i-1');
  });
  test('adiciona, limita e exclui registros localmente', () => {
    const history = Array.from({ length: 50 }, (_, index) => ({ id: `q${index}` }));
    const next = addCompassHistoryEntry(history, { id: 'novo' });
    expect(next).toHaveLength(50);
    expect(removeCompassHistoryEntry(next, 'novo').some((item) => item.id === 'novo')).toBe(false);
  });
});
