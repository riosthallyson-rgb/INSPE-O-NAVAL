import { getInspectionPendingSummary } from '../src/domain/inspectionProgress';

describe('resumo de pendências da inspeção', () => {
  test('contabiliza checklist, documentos, descrição e foto obrigatória', () => {
    const result = getInspectionPendingSummary({
      checkItems: [
        { status: 'nao verificado', photoRequired: true, evidence: [] },
        { status: 'conforme', photoRequired: false, evidence: [] },
      ],
      documents: [{ status: '' }, { status: 'Apresentado e válido' }],
      findings: [{ observedDescription: '' }],
    });
    expect(result).toEqual({ checklist: 1, documents: 1, findings: 1, requiredEvidence: 1, total: 4 });
  });

  test('é seguro sem inspeção', () => {
    expect(getInspectionPendingSummary(null).total).toBe(0);
  });
});
