export const resolveJurisdiction = ({ location, datasets = [] }) => {
  const trusted = datasets.filter((dataset) => dataset.status === 'CURRENT_VERIFIED' && dataset.sourceId && dataset.sourceName && dataset.sourceDate && dataset.sourceVersion && dataset.geometryHash && dataset.coordinateSystem === 'WGS84');
  if (!location?.confirmedByUser || !trusted.length) return { status: 'UNDETERMINED', jurisdiction: null, regionalNorm: null, confidence: null, source: null, message: 'Jurisdição não determinada automaticamente.' };
  return { status: 'UNDETERMINED', jurisdiction: null, regionalNorm: null, confidence: null, source: null, message: 'Nenhum resolvedor geométrico confiável está configurado.' };
};
