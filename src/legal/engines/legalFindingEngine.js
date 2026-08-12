const hasCompleteSource = (basis) =>
  basis?.sourceId && basis?.version && basis?.section && Number.isFinite(basis?.page);

export const evaluateLegalFinding = ({ finding, operationalState, rules = [] } = {}) => {
  const matchedRules = rules.filter(
    (rule) =>
      rule?.findingType === finding?.type &&
      hasCompleteSource(rule.legalBasis) &&
      (!rule.condition?.operationalState || rule.condition.operationalState === operationalState)
  );
  if (!matchedRules.length) {
    return {
      possibleViolation: null,
      legalBasis: [],
      suggestedAdministrativeActions: [],
      requiredDocuments: [],
      warnings: ['Fundamentação normativa não localizada.'],
    };
  }
  return {
    possibleViolation: matchedRules[0].possibleViolation || null,
    legalBasis: matchedRules.map((rule) => rule.legalBasis),
    suggestedAdministrativeActions: matchedRules.flatMap((rule) => rule.suggestedAdministrativeActions || []),
    requiredDocuments: matchedRules.flatMap((rule) => rule.requiredDocuments || []),
    warnings: ['Confirme a fundamentação e o contexto antes de adotar qualquer medida.'],
  };
};
