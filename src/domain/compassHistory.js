const MAX_COMPASS_HISTORY = 50;
const sanitizeQuestion = (question) => String(question || '').replace(/\b\d{11}\b|\b\d{14}\b/g, '[dado protegido]').trim().slice(0, 240);

export const createCompassHistoryEntry = (answer) => ({
  id: answer.queryId,
  createdAt: answer.generatedAt,
  title: answer.interpretedContext?.inspectionId ? `Consulta da inspeção ${answer.interpretedContext.inspectionId} — ${answer.interpretedIntent}` : sanitizeQuestion(answer.question),
  question: answer.interpretedContext?.inspectionId ? '' : sanitizeQuestion(answer.question),
  interpretedIntent: answer.interpretedIntent,
  inspectionContextId: answer.interpretedContext?.inspectionId || null,
  sourceIds: answer.citations.map((item) => item.sourceId),
  sourceVersions: answer.sourceVersions,
  chunkIds: answer.citations.map((item) => item.chunkId),
  answerHash: answer.answerHash || '',
  insufficientEvidence: answer.insufficientEvidence,
});

export const addCompassHistoryEntry = (history, entry) => [entry, ...(Array.isArray(history) ? history : []).filter((item) => item.id !== entry.id)].slice(0, MAX_COMPASS_HISTORY);
export const removeCompassHistoryEntry = (history, id) => (Array.isArray(history) ? history : []).filter((item) => item.id !== id);

