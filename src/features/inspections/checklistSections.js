const categoryRules = [
  {
    title: 'Documentação e habilitação',
    terms: ['document', 'habilita', 'licença', 'registro', 'alvará', 'autorização', 'carta', 'relatório', 'treinamento', 'capacitação'],
  },
  {
    title: 'Segurança e emergência',
    terms: ['colete', 'extintor', 'emergência', 'salvamento', 'incêndio', 'sinalizador', 'evacuação'],
  },
  {
    title: 'Navegação e comunicação',
    terms: ['navegação', 'comunicação', 'vhf', 'sinalização', 'iluminação'],
  },
  {
    title: 'Proteção ambiental',
    terms: ['poluição', 'descarte'],
  },
];

const normalize = (value) =>
  String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

export const getOperationalCategory = (item) => {
  if (item.operationalCategory) return item.operationalCategory;
  const text = normalize(item.text);
  const rule = categoryRules.find(({ terms }) =>
    terms.some((term) => text.includes(normalize(term)))
  );
  return rule?.title || 'Estrutura e operação';
};

export const groupChecklistItems = (items) => {
  const groups = new Map();
  (Array.isArray(items) ? items : []).forEach((item, index) => {
    const title = getOperationalCategory(item);
    if (!groups.has(title)) groups.set(title, []);
    groups.get(title).push({ item, index });
  });
  return [...groups].map(([title, data]) => ({ title, data }));
};
