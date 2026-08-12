export const REGIONAL_SOURCE_STATUSES = Object.freeze(['CURRENT_VERIFIED', 'OUTDATED', 'PENDING_VALIDATION', 'UNAVAILABLE']);

export const createRegionalRuleSet = ({ id, jurisdictionId, authorityName, title, version, portaria = '', publicationDate = '', effectiveDate = '', sourceUrl = '', localFile = '', sha256 = '', checkedAt = '', status = 'PENDING_VALIDATION', rules = [] }) => ({
  id, jurisdictionId, authorityName, title, version, portaria, publicationDate, effectiveDate, sourceUrl, localFile, sha256, checkedAt,
  status: REGIONAL_SOURCE_STATUSES.includes(status) ? status : 'PENDING_VALIDATION',
  rules,
});

export const findRegionalRuleSet = ({ jurisdictionId, ruleSets = [] }) => {
  const matches = ruleSets.filter((item) => item.jurisdictionId === jurisdictionId);
  if (!matches.length) return { status: 'UNAVAILABLE', ruleSet: null, message: 'Norma regional não disponível neste dispositivo.' };
  const current = matches.find((item) => item.status === 'CURRENT_VERIFIED' && item.sha256 && item.checkedAt && item.version);
  if (current) return { status: 'AVAILABLE', ruleSet: current, message: 'Regra regional disponível.' };
  const outdated = matches.find((item) => item.status === 'OUTDATED');
  if (outdated) return { status: 'OUTDATED', ruleSet: outdated, message: 'A norma regional instalada está marcada como desatualizada.' };
  return { status: 'PENDING_VALIDATION', ruleSet: matches[0], message: 'A norma regional instalada ainda não foi validada.' };
};

export const getApplicableRegionalChecklistItems = ({ ruleSet, vessel = {}, context = {} }) => {
  if (!ruleSet || ruleSet.status !== 'CURRENT_VERIFIED') return [];
  return (ruleSet.rules || []).filter((rule) => rule.validationStatus === 'PASS' && rule.source?.section && rule.source?.page && (!rule.applicableTo?.vesselTypes?.length || rule.applicableTo.vesselTypes.includes(vessel.type)) && (!rule.applicableTo?.activities?.length || rule.applicableTo.activities.includes(vessel.vesselUse)) && (!rule.applicableTo?.operationalStates?.length || rule.applicableTo.operationalStates.includes(context.vesselOperationalState))).map((rule) => ({ id: `regional-${rule.id}`, moduleId: 'regional', text: rule.checklistItem, status: 'nao verificado', notes: '', evidence: [], reference: `${ruleSet.title} · ${rule.source.section} · p. ${rule.source.page}`, referenceStatus: 'verified', sourceIds: [ruleSet.id], scope: 'REGIONAL', ruleId: rule.id, jurisdictionId: ruleSet.jurisdictionId }));
};

export const EMPTY_REGIONAL_RULE_SETS = Object.freeze([]);
