export const normalizeCompassText = (value) => String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

export const COMPASS_ALIASES = Object.freeze({ cha: ['carteira de habilitacao de amador'], cir: ['caderneta de inscricao e registro'], cts: ['cartao de tripulacao de seguranca'], tie: ['titulo de inscricao de embarcacao'], emb: ['embarcacao'], cp: ['capitania dos portos'], dl: ['delegacia'], ag: ['agencia'] });

export const expandCompassQuery = (query) => {
  const normalized = normalizeCompassText(query);
  const aliasesUsed = [];
  const expanded = [normalized];
  Object.entries(COMPASS_ALIASES).forEach(([alias, values]) => { if (normalized.split(' ').includes(alias)) { aliasesUsed.push(alias); expanded.push(...values); } });
  return { normalized, expanded: [...new Set(expanded)], aliasesUsed };
};

export const buildCompassIndex = (chunks) => chunks.filter((item) => item.validationStatus === 'PASS' && ['VALIDATED', 'CURRENT_VERIFIED'].includes(item.source?.status)).map((item) => ({ ...item, searchText: normalizeCompassText([item.section, item.title, item.text, ...(item.keywords || []), ...(item.aliases || [])].join(' ')) }));

