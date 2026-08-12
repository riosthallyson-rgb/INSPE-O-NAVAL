import { getCompassCorpusCoverage } from '../src/legal/corpus/corpusCoverage';
import { NORMATIVE_CHUNKS, VERIFIED_COMPASS_SOURCES } from '../src/legal/corpus/normativeCorpus';

describe('cobertura do corpus da Bússola', () => {
  test('informa fontes, chunks validados e erros de citação separadamente', () => {
    const coverage = getCompassCorpusCoverage({ sources: VERIFIED_COMPASS_SOURCES, chunks: NORMATIVE_CHUNKS });
    expect(coverage.sourceCount).toBe(2);
    expect(coverage.chunkCount).toBeGreaterThanOrEqual(16);
    expect(coverage.validatedChunkCount).toBe(coverage.chunkCount);
    expect(coverage.citationErrors).toBe(0);
    expect(coverage.sources.every((source) => source.indexedChunks > 0)).toBe(true);
  });
});
