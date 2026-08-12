const unique = (values) => [...new Set(values)];

export const evaluateInspectionApplicability = (input = {}) => {
  const applicableNorms = ['normam-301', 'normam-204'];
  const checklistModules = ['identificacao', 'documentacao', 'condutor', 'salvatagem', 'incendio', 'casco', 'poluicao'];
  const warnings = [];
  const additionalQuestions = [];

  if (input.vesselUse === 'Esporte e recreio') applicableNorms.push('normam-211');
  if (input.vesselUse === 'Moto aquática') applicableNorms.push('normam-212');
  if (input.navigationArea === 'Mar aberto') {
    applicableNorms.push('normam-201');
    checklistModules.push('navegacao', 'radiocomunicacao', 'luzes');
  }
  if (input.navigationArea === 'Interior') {
    applicableNorms.push('normam-202');
    checklistModules.push('navegacao', 'luzes');
  }
  if (input.vesselUse === 'Transporte de passageiros') checklistModules.push('transporte');
  if (input.jurisdiction) {
    applicableNorms.push('regional');
    checklistModules.push('regional');
    warnings.push('A regra regional da jurisdição ainda precisa ser cadastrada e validada.');
  }
  if (!input.operationalState) additionalQuestions.push('Informe a situação operacional da embarcação.');
  if (!input.vesselUse) additionalQuestions.push('Informe o emprego principal da embarcação.');
  if (!input.navigationArea) additionalQuestions.push('Informe a área de navegação.');

  return {
    context: { operationalState: input.operationalState || '' },
    applicableNorms: unique(applicableNorms),
    checklistModules: unique(checklistModules),
    warnings,
    additionalQuestions,
  };
};
