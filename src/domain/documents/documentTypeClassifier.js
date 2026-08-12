import { DOCUMENT_TEMPLATES } from './documentTemplateRegistry';

const normalize = (value) => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();

export const classifyDocumentType = (text) => {
  const normalized = normalize(text);
  if (!normalized) return { type: 'UNKNOWN', recognitionState: 'UNIDENTIFIED', score: 0, candidates: [] };
  const candidates = DOCUMENT_TEMPLATES.map((item) => {
    const labels = [...item.expectedLabels, ...item.optionalLabels].map(normalize);
    const matches = labels.filter((label) => normalized.includes(label));
    const requiredMatches = item.expectedLabels.map(normalize).filter((label) => normalized.includes(label)).length;
    return { type: item.documentType, score: requiredMatches * 3 + matches.length, requiredMatches };
  }).filter((item) => item.score > 0).sort((a, b) => b.score - a.score);
  if (!candidates.length) return { type: 'UNKNOWN', recognitionState: 'UNIDENTIFIED', score: 0, candidates: [] };
  const best = candidates[0];
  return { type: best.type, recognitionState: best.requiredMatches >= 2 ? 'RECOGNIZED' : 'PARTIALLY_RECOGNIZED', score: best.score, candidates };
};
