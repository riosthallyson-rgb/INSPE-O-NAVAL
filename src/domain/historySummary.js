const PERIOD_DAYS = 30;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

const getInspectionDate = (inspection) => {
  const value = inspection?.completedAt || inspection?.createdAt;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
};

export const getHistorySummary = (history, referenceDate = new Date()) => {
  const referenceTimestamp = referenceDate instanceof Date
    ? referenceDate.getTime()
    : Date.parse(referenceDate);
  const safeReferenceTimestamp = Number.isFinite(referenceTimestamp)
    ? referenceTimestamp
    : Date.now();
  const periodStart = safeReferenceTimestamp - PERIOD_DAYS * DAY_IN_MS;

  const inspectionsInPeriod = (Array.isArray(history) ? history : []).filter((inspection) => {
    const timestamp = getInspectionDate(inspection);
    return timestamp !== null && timestamp >= periodStart && timestamp <= safeReferenceTimestamp;
  });

  const conforming = inspectionsInPeriod.filter((inspection) => inspection.result === 'Conforme').length;
  const nonConforming = inspectionsInPeriod.filter(
    (inspection) => inspection.result === 'Não conforme'
  ).length;
  const completed = conforming + nonConforming;

  return {
    periodDays: PERIOD_DAYS,
    total: inspectionsInPeriod.length,
    conforming,
    nonConforming,
    conformityRate: completed ? Math.round((conforming / completed) * 100) : 0,
  };
};
