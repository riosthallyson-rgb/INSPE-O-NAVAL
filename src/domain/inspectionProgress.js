export const getInspectionPendingSummary = (inspection) => {
  if (!inspection) return { checklist: 0, documents: 0, findings: 0, requiredEvidence: 0, total: 0 };
  const checkItems = Array.isArray(inspection.checkItems) ? inspection.checkItems : [];
  const documents = Array.isArray(inspection.documents) ? inspection.documents : [];
  const findings = Array.isArray(inspection.findings) ? inspection.findings : [];

  const checklist = checkItems.filter((item) => item.status === 'nao verificado').length;
  const documentPending = documents.filter((document) => !document.status).length;
  const findingPending = findings.filter((finding) => !String(finding.observedDescription || '').trim()).length;
  const requiredEvidence = checkItems.filter((item) => item.photoRequired && !(item.evidence || []).length).length;

  return {
    checklist,
    documents: documentPending,
    findings: findingPending,
    requiredEvidence,
    total: checklist + documentPending + findingPending + requiredEvidence,
  };
};
