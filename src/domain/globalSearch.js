const normalize = (value) => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/\s+/g, ' ')
  .trim();

const tokensFor = (query) => normalize(query).split(' ').filter((token) => token.length >= 2);
const matches = (tokens, values) => {
  if (!tokens.length) return false;
  const haystack = normalize(values.filter(Boolean).join(' '));
  return tokens.every((token) => haystack.includes(token));
};

export const searchOfflineData = ({ query, history = [], publications = [], vessels = [], limit = 30 } = {}) => {
  const tokens = tokensFor(query);
  if (!tokens.length) return [];

  const historyResults = (Array.isArray(history) ? history : [])
    .filter((record) => matches(tokens, [record.vessel?.name, record.vessel?.tie, record.vessel?.armador, record.vessel?.owner, record.result, record.context?.locationDescription]))
    .map((record) => ({
      type: 'inspection',
      id: record.id,
      title: record.vessel?.name || 'Embarcação sem nome',
      subtitle: `Inspeção · ${record.vessel?.tie || 'sem inscrição'} · ${record.result || 'resultado não informado'}`,
      record,
    }));

  const vesselResults = (Array.isArray(vessels) ? vessels : [])
    .filter((vessel) => matches(tokens, [vessel.name, vessel.tie, vessel.armador, vessel.owner, vessel.type, vessel.activity, vessel.vesselUse]))
    .map((vessel) => ({
      type: 'vessel',
      id: vessel.id || vessel.tie,
      title: vessel.name || 'Embarcação sem nome',
      subtitle: `Embarcação salva · ${vessel.tie || 'sem inscrição'}`,
      record: vessel,
    }));

  const publicationResults = (Array.isArray(publications) ? publications : [])
    .filter((publication) => matches(tokens, [publication.title, publication.officialTitle, publication.source, publication.summary, publication.content, ...(publication.keywords || [])]))
    .map((publication) => ({
      type: 'publication',
      id: publication.id,
      title: publication.title,
      subtitle: `Norma · ${publication.edition || publication.source}`,
      record: publication,
    }));

  return [...historyResults, ...vesselResults, ...publicationResults].slice(0, Math.max(1, Number(limit) || 30));
};
