export const getCompassCorpusCoverage = ({ sources, chunks }) => ({
  sourceCount: sources.length,
  chunkCount: chunks.length,
  validatedChunkCount: chunks.filter((item) => item.validationStatus === 'PASS').length,
  citationErrors: chunks.filter((item) => !item.sourceId || !item.section || !Number.isInteger(item.pageStart) || !item.text).length,
  sources: sources.map((source) => ({ sourceId: source.sourceId, title: source.title, version: source.version, status: source.status, indexedChunks: chunks.filter((item) => item.sourceId === source.sourceId).length })),
});
