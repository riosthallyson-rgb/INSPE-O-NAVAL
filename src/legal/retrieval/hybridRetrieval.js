import { buildCompassIndex, expandCompassQuery, normalizeCompassText } from '../index/compassIndex';

export const retrieveNormativeChunks = ({ chunks, query, ruleIds = [], limit = 6 }) => {
  const expansion = expandCompassQuery(query);
  const tokens = [...new Set(expansion.expanded.flatMap((value) => normalizeCompassText(value).split(' ')).filter((token) => token.length > 2))];
  const results = buildCompassIndex(chunks).map((item) => {
    let score = ruleIds.includes(item.ruleId) ? 20 : 0;
    tokens.forEach((token) => { if (item.searchText.includes(token)) score += 1; if (normalizeCompassText(item.section).includes(token)) score += 3; });
    return { ...item, score };
  }).filter((item) => item.score > 0).sort((a, b) => b.score - a.score).slice(0, limit);
  return { results, debug: { normalizedQuery: expansion.normalized, aliasesUsed: expansion.aliasesUsed, retrievedChunkIds: results.map((item) => item.id) } };
};

