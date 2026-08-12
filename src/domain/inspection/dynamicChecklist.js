const moduleCatalog = {
  identificacao: ['Registrar identificação e marcações observadas na embarcação'],
  documentacao: ['Conferir os documentos apresentados e registrar o estado de cada um'],
  condutor: ['Registrar a habilitação apresentada pelo condutor e a conferência de identidade'],
  salvatagem: ['Registrar a condição dos equipamentos de salvatagem observados'],
  incendio: ['Registrar a condição dos recursos de combate a incêndio observados'],
  navegacao: ['Registrar a condição dos equipamentos de navegação observados'],
  radiocomunicacao: ['Registrar a condição dos meios de radiocomunicação observados'],
  luzes: ['Registrar a condição das luzes e dos sinais observados'],
  casco: ['Registrar a condição do casco, identificação e propulsão observadas'],
  poluicao: ['Registrar aspectos observados de prevenção da poluição'],
  transporte: ['Registrar lotação, passageiros e condições observadas de transporte'],
  regional: ['Conferir se há exigência regional validada aplicável ao local'],
};

export const buildDynamicChecklist = (applicability) =>
  (applicability?.checklistModules || []).flatMap((moduleId) =>
    (moduleCatalog[moduleId] || []).map((text, index) => ({
      id: `${moduleId}-${index + 1}`,
      moduleId,
      text,
      status: 'nao verificado',
      notes: '',
      evidence: [],
      reference: 'Fundamentação normativa não localizada.',
      referenceStatus: 'pending',
      sourceIds: applicability?.applicableNorms || [],
    }))
  );

export const buildDynamicDocuments = ({ vessel, driver, crew }) => {
  const documents = [
    { id: 'vessel-registration', name: vessel.documentType || 'Documento de inscrição', number: vessel.tie || '', validUntil: vessel.validUntil || '', status: '', notes: '', source: null, evidence: [] },
    { id: 'driver-license', name: driver.licenseType || 'Habilitação do condutor', number: driver.licenseNumber || '', validUntil: driver.validUntil || '', status: '', notes: '', source: null, evidence: [] },
  ];
  if (crew.ctsRequired !== 'não') documents.push({ id: 'cts', name: 'Cartão de Tripulação de Segurança (CTS)', number: '', validUntil: '', status: '', notes: '', source: null, evidence: [] });
  return documents;
};
