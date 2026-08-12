import { evaluateAdministrativeProcedure } from '../src/legal/engines/administrativeProcedureEngine';

const source = { sourceId: 'rlesta', sourceVersion: 'vigente', section: 'Art. 11', page: 2 };

describe('motor de procedimentos administrativos', () => {
  test('não sugere documento sem enquadramento confirmado e fonte completa', () => {
    expect(evaluateAdministrativeProcedure({ finding: {} }).suggestions).toEqual([]);
    expect(evaluateAdministrativeProcedure({ finding: { confirmedLegalFramework: 'LESTA' } }).suggestions).toEqual([]);
  });

  test('separa Auto de Infração LESTA de Notificação para Comparecimento', () => {
    const auto = evaluateAdministrativeProcedure({ finding: { confirmedLegalFramework: 'LESTA', confirmedLegalBasis: { source } } });
    expect(auto.suggestions.map((item) => item.type)).toEqual(['INFRACTION_NOTICE']);
    const notice = evaluateAdministrativeProcedure({ finding: { confirmedLegalFramework: 'OTHER', confirmedLegalBasis: { source, requiresPriorNotification: true } } });
    expect(notice.suggestions.map((item) => item.type)).toEqual(['NOTICE_TO_APPEAR']);
  });

  test('não infere fluxo para outra fonte sem regra estruturada', () => {
    const result = evaluateAdministrativeProcedure({ finding: { confirmedLegalFramework: 'OTHER', confirmedLegalBasis: { source } } });
    expect(result.suggestions).toEqual([]);
  });
});

