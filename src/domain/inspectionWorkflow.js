import { countPendingItems, getInspectionStatus } from './inspection';

const completeRecord = (inspection, stage, completedAt) => ({
  ...inspection,
  stage,
  completedAt,
  result: getInspectionStatus(inspection.checkItems),
});

export const prepareInspectionCompletion = (inspection, completedAt) => {
  const pendingCount = countPendingItems(inspection?.checkItems);
  if (pendingCount > 0) return { outcome: 'blocked', pendingCount };

  const nonConformities = inspection.checkItems.filter(
    (item) => item.status === 'nao conforme'
  );
  if (nonConformities.length > 0) {
    return {
      outcome: 'review',
      inspection: { ...inspection, stage: 'Revisão', nonConformities },
    };
  }

  return {
    outcome: 'completed',
    inspection: completeRecord(inspection, 'Concluída', completedAt),
  };
};

export const completeFindingReview = (inspection, completedAt) =>
  completeRecord(inspection, 'Concluída', completedAt);
