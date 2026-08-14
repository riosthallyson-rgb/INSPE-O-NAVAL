const unique = (values) => [...new Set(values)];

const addMissingSource = (missingSources, warnings, sourceId, message) => {
  missingSources.push(sourceId);
  warnings.push(message);
};

export const evaluateInspectionApplicability = (input = {}) => {
  const applicableNorms = ['normam-301', 'normam-204'];
  const checklistModules = ['identificacao', 'documentacao', 'condutor', 'salvatagem', 'incendio', 'casco', 'poluicao'];
  const missingSources = [];
  const warnings = [];
  const additionalQuestions = [];

  if (input.vesselUse === 'Esporte e recreio') {
    applicableNorms.push('normam-211');
    checklistModules.push('esporte_recreio');
  }

  if (input.vesselUse === 'Moto aquática') {
    checklistModules.push('moto_aquatica');
    addMissingSource(
      missingSources,
      warnings,
      'normam-212',
      'A NORMAM-212 não está embarcada nesta versão. Os itens específicos de moto aquática permanecem observacionais e sem fundamentação validada.',
    );
  }

  if (input.vesselUse === 'Pesca') checklistModules.push('pesca');

  if (input.navigationArea === 'Mar aberto') {
    applicableNorms.push('normam-201');
    checklistModules.push('navegacao', 'radiocomunicacao', 'luzes');
  }

  if (input.navigationArea === 'Interior') {
    checklistModules.push('navegacao', 'luzes');
    addMissingSource(
      missingSources,
      warnings,
      'normam-202',
      'A NORMAM-202 não está embarcada nesta versão. Confirme a norma oficial aplicável à navegação interior antes de fundamentar qualquer conclusão.',
    );
  }

  if (input.vesselUse === 'Transporte de passageiros') {
    checklistModules.push('transporte');
  }

  const confirmedJurisdiction = input.jurisdictionConfirmed === true
    ? String(input.jurisdiction || '').trim().toUpperCase()
    : '';

  if (confirmedJurisdiction) {
    checklistModules.push('regional');
    addMissingSource(
      missingSources,
      warnings,
      'regional',
      'A jurisdição foi confirmada, mas a regra regional correspondente ainda não está cadastrada e validada neste dispositivo. Continue somente com as normas nacionais disponíveis.',
    );
  } else if (input.jurisdiction) {
    warnings.push('A jurisdição informada não foi usada para selecionar regra regional porque ainda não foi confirmada no contexto desta inspeção.');
  }

  if (!input.operationalState) additionalQuestions.push('Informe a situação operacional da embarcação.');
  if (!input.vesselUse) additionalQuestions.push('Informe o emprego principal da embarcação.');
  if (!input.navigationArea) additionalQuestions.push('Informe a área de navegação.');

  return {
    context: {
      operationalState: input.operationalState || '',
      vesselType: input.vesselType || '',
      vesselUse: input.vesselUse || '',
      navigationArea: input.navigationArea || '',
      length: input.length || '',
      grossTonnage: input.grossTonnage || '',
      propulsion: input.propulsion || '',
      passengerCapacity: input.passengerCapacity || '',
      peopleOnBoard: input.peopleOnBoard || 0,
      jurisdiction: confirmedJurisdiction,
      jurisdictionConfirmed: Boolean(confirmedJurisdiction),
    },
    applicableNorms: unique(applicableNorms),
    missingSources: unique(missingSources),
    checklistModules: unique(checklistModules),
    warnings: unique(warnings),
    additionalQuestions,
  };
};
