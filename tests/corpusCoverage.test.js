import { getCompassCorpusCoverage } from '../src/legal/corpus/corpusCoverage';
import { NORMATIVE_CHUNKS, VERIFIED_COMPASS_SOURCES } from '../src/legal/corpus/normativeCorpus';

describe('cobertura do corpus da Bússola', () => {
  test('informa fontes, chunks validados e erros de citação separadamente', () => {
    const coverage = getCompassCorpusCoverage({ sources: VERIFIED_COMPASS_SOURCES, chunks: NORMATIVE_CHUNKS });
    expect(coverage.sourceCount).toBe(5);
    expect(coverage.chunkCount).toBeGreaterThanOrEqual(24);
    expect(coverage.validatedChunkCount).toBe(coverage.chunkCount);
    expect(coverage.citationErrors).toBe(0);
    expect(coverage.sources.every((source) => source.indexedChunks > 0)).toBe(true);
  });

  test('toda fonte auditada mantém hash SHA-256 e data de conferência', () => {
    VERIFIED_COMPASS_SOURCES.forEach((source) => {
      expect(source.sha256).toMatch(/^[a-f0-9]{64}$/);
      expect(Number.isFinite(Date.parse(source.checkedAt))).toBe(true);
      expect(source.status).toBe('CURRENT_VERIFIED');
    });
  });
});
