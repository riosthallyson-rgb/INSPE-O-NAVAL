import { ADMINISTRATIVE_DEADLINE_RULES, calculateAdministrativeDeadline } from '../src/legal/engines/deadlineEngine';

describe('motor de prazos administrativos', () => {
  test('calcula prazo corrido com fonte sem tratar como estimativa', () => {
    const rule = ADMINISTRATIVE_DEADLINE_RULES.find((item) => item.id === 'apprehension-regularization');
    const result = calculateAdministrativeDeadline({ rule, startAt: '2026-08-08T12:00:00Z' });
    expect(result.estimatedDueAt.slice(0, 10)).toBe('2026-11-06');
    expect(result.isEstimate).toBe(false);
    expect(result.source.section).toContain('3.22.3');
  });

  test('avisa que prazo útil depende de feriados e expediente', () => {
    const rule = ADMINISTRATIVE_DEADLINE_RULES.find((item) => item.id === 'infraction-defense');
    const result = calculateAdministrativeDeadline({ rule, startAt: '2026-08-07T12:00:00Z' });
    expect(result.isEstimate).toBe(true);
    expect(result.warning).toContain('feriados');
  });
});

