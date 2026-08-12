import {
  completeFindingReview,
  prepareInspectionCompletion,
} from '../src/domain/inspectionWorkflow';

const inspection = {
  id: 'inspecao-1',
  stage: 'Inspeção',
  checkItems: [],
  nonConformities: [],
};

describe('fluxo completo da inspeção naval', () => {
  test('bloqueia a conclusão enquanto houver item pendente', () => {
    const result = prepareInspectionCompletion(
      { ...inspection, checkItems: [{ status: 'pendente' }] },
      '2026-08-08T12:00:00.000Z'
    );
    expect(result).toEqual({ outcome: 'blocked', pendingCount: 1 });
  });

  test('encaminha não conformidades para revisão sem criar documento jurídico', () => {
    const item = { id: 'colete', status: 'nao conforme', notes: 'Ausente' };
    const result = prepareInspectionCompletion(
      { ...inspection, checkItems: [item] },
      '2026-08-08T12:00:00.000Z'
    );
    expect(result.outcome).toBe('review');
    expect(result.inspection.stage).toBe('Revisão');
    expect(result.inspection.nonConformities).toEqual([item]);
  });

  test('conclui uma inspeção conforme com data e resultado', () => {
    const result = prepareInspectionCompletion(
      { ...inspection, checkItems: [{ status: 'conforme' }] },
      '2026-08-08T12:00:00.000Z'
    );
    expect(result.inspection).toMatchObject({
      stage: 'Concluída',
      result: 'Conforme',
      completedAt: '2026-08-08T12:00:00.000Z',
    });
  });

  test('conclui a revisão preservando as não conformidades', () => {
    const result = completeFindingReview(
      { ...inspection, checkItems: [{ status: 'nao conforme' }], nonConformities: [{}] },
      '2026-08-08T12:00:00.000Z'
    );
    expect(result).toMatchObject({ stage: 'Concluída', result: 'Não conforme' });
    expect(result.nonConformities).toHaveLength(1);
  });
});
