import { NORMAM_301_ADMIN_SOURCE } from '../sources/normam301Administrative';

export const ADMINISTRATIVE_DEADLINE_RULES = Object.freeze([
  { id: 'notice-appearance', procedureType: 'NOTICE_TO_APPEAR', eventType: 'NOTIFIED', deadlineBusinessDays: 8, deadlineCalendarDays: null, source: { ...NORMAM_301_ADMIN_SOURCE, section: '3.6.1(a)', page: 28 } },
  { id: 'infraction-defense', procedureType: 'INFRACTION_NOTICE', eventType: 'ACKNOWLEDGED', deadlineBusinessDays: 15, deadlineCalendarDays: null, source: { ...NORMAM_301_ADMIN_SOURCE, section: '3.6.3(a)', page: 28 } },
  { id: 'apprehension-regularization', procedureType: 'APPREHENSION_NOTICE', eventType: 'APPREHENDED', deadlineBusinessDays: null, deadlineCalendarDays: 90, source: { ...NORMAM_301_ADMIN_SOURCE, section: '3.22.3 e 3.23.1', page: 38 } },
  { id: 'withdrawal', procedureType: 'WITHDRAWAL_NOTICE', eventType: 'RECEIVED', deadlineBusinessDays: null, deadlineCalendarDays: 15, source: { ...NORMAM_301_ADMIN_SOURCE, section: 'Anexo 3-C', page: 48 } },
]);

const addBusinessDays = (date, days) => {
  const result = new Date(date);
  let remaining = days;
  while (remaining > 0) { result.setDate(result.getDate() + 1); if (![0, 6].includes(result.getDay())) remaining -= 1; }
  return result;
};

export const calculateAdministrativeDeadline = ({ rule, startAt }) => {
  if (!rule?.source?.sourceId || (!rule.deadlineBusinessDays && !rule.deadlineCalendarDays)) return null;
  const start = new Date(startAt);
  if (Number.isNaN(start.getTime())) return null;
  const estimated = rule.deadlineBusinessDays ? addBusinessDays(start, rule.deadlineBusinessDays) : new Date(start.getTime() + rule.deadlineCalendarDays * 86400000);
  return { ruleId: rule.id, startAt: start.toISOString(), estimatedDueAt: estimated.toISOString(), isEstimate: Boolean(rule.deadlineBusinessDays), warning: rule.deadlineBusinessDays ? 'Data estimada. Confira feriados e expediente da OM.' : '', source: { ...rule.source } };
};

