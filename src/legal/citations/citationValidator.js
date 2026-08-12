export const createValidatedCitation = (chunk) => {
  if (!chunk?.source?.sourceId || !chunk.source.version || !chunk.section || !Number.isInteger(chunk.pageStart) || chunk.pageStart < 1 || !String(chunk.text || '').trim() || !['VALIDATED', 'CURRENT_VERIFIED'].includes(chunk.source.status)) return null;
  return { id: chunk.id, chunkId: chunk.id, sourceId: chunk.sourceId, title: chunk.source.title, sourceVersion: chunk.source.version, section: chunk.section, page: chunk.pageStart, pageEnd: chunk.pageEnd, sourceExcerpt: chunk.text, officialText: chunk.officialText || null, localFile: chunk.source.localFile, verificationStatus: 'verified' };
};

export const validateCitations = (chunks) => chunks.map(createValidatedCitation).filter(Boolean);
