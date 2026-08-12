import { NORMAM_301_ADMIN_SOURCE } from '../sources/normam301Administrative';

const ROUTING_SOURCE = Object.freeze({ ...NORMAM_301_ADMIN_SOURCE, section: '3.6.1', page: 28 });

export const evaluateAdministrativeProcedure = ({ finding }) => {
  const framework = finding?.confirmedLegalFramework;
  const source = finding?.confirmedLegalBasis?.source;
  if (!framework || !source?.sourceId || !source?.sourceVersion || !source?.section || !source?.page) return { suggestions: [], warnings: ['Enquadramento confirmado com fonte completa não localizado.'], routingSource: ROUTING_SOURCE };
  if (framework === 'LESTA') return { suggestions: [{ type: 'INFRACTION_NOTICE', label: 'Auto de Infração', state: 'SUGGESTED', reason: 'Enquadramento LESTA confirmado pelo Inspetor.', source: ROUTING_SOURCE }], warnings: [], routingSource: ROUTING_SOURCE };
  if (finding.confirmedLegalBasis.requiresPriorNotification === true) return { suggestions: [{ type: 'NOTICE_TO_APPEAR', label: 'Notificação para Comparecimento', state: 'SUGGESTED', reason: 'A regra confirmada indica notificação prévia.', source: ROUTING_SOURCE }], warnings: [], routingSource: ROUTING_SOURCE };
  return { suggestions: [], warnings: ['A fonte confirmada não define um fluxo administrativo estruturado no aplicativo.'], routingSource: ROUTING_SOURCE };
};

