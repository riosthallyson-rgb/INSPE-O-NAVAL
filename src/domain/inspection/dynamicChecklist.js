import { NORMATIVE_CHUNKS } from '../../legal/corpus/normativeCorpus';

const PENDING_REFERENCE = 'Fundamentação normativa não localizada.';

const moduleCatalog = Object.freeze({
  identificacao: [
    { text: 'Conferir nome, número de inscrição e marcações visíveis da embarcação', category: 'Identificação e casco' },
    { text: 'Registrar material, integridade aparente e alterações relevantes do casco', category: 'Identificação e casco', photoRecommended: true },
    { text: 'Conferir se os dados observados correspondem ao documento apresentado', category: 'Documentação e habilitação' },
  ],
  documentacao: [
    { text: 'Confirmar se a embarcação possui inscrição ou registro e distinguir ausência de registro de simples falta do documento a bordo', category: 'Documentação e habilitação', ruleId: 'N301_3_13_1' },
    { text: 'Confirmar se TIE ou PRPM é portado quando a embarcação está inscrita ou registrada', category: 'Documentação e habilitação', ruleId: 'N301_3_13_2' },
    { text: 'Conferir número, validade e porto de inscrição nos documentos apresentados', category: 'Documentação e habilitação' },
    { text: 'Registrar divergências entre documento, embarcação e lotação observada sem produzir enquadramento automático', category: 'Documentação e habilitação', photoRecommended: true },
  ],
  condutor: [
    { text: 'Confirmar se o condutor possui habilitação compatível antes de analisar qualquer medida', category: 'Documentação e habilitação', ruleId: 'N301_3_8_1' },
    { text: 'Confirmar se CHA ou CIR foi apresentada e distinguir não portar de não possuir habilitação', category: 'Documentação e habilitação', ruleId: 'N301_3_9_3' },
    { text: 'Conferir categoria, número, validade e correspondência entre condutor e documento apresentado', category: 'Documentação e habilitação' },
  ],
  salvatagem: [
    { text: 'Contar os coletes salva-vidas disponíveis e comparar com o total de pessoas a bordo', category: 'Segurança e emergência', photoRecommended: true, ruleId: 'N211_LIFEJACKETS', vesselUse: 'Esporte e recreio' },
    { text: 'Verificar estado aparente, tamanho e acessibilidade dos coletes salva-vidas', category: 'Segurança e emergência', ruleId: 'N211_LIFEJACKETS', vesselUse: 'Esporte e recreio' },
    { text: 'Verificar presença, estado e acesso às boias circulares exigidas para a embarcação', category: 'Segurança e emergência', photoRecommended: true, ruleId: 'N211_LIFEBUOYS', vesselUse: 'Esporte e recreio' },
    { text: 'Verificar presença e validade aparente dos sinalizadores pirotécnicos quando aplicáveis', category: 'Segurança e emergência', photoRecommended: true },
    { text: 'Verificar embarcação ou meio de sobrevivência quando exigido para o tipo e área de navegação', category: 'Segurança e emergência' },
  ],
  incendio: [
    { text: 'Contar os extintores disponíveis e registrar classe, capacidade e localização', category: 'Segurança e emergência', photoRecommended: true, ruleId: 'N201_EXTINGUISHERS_LOCATION', navigationArea: 'Mar aberto' },
    { text: 'Verificar validade, lacre, manômetro e estado aparente dos extintores', category: 'Segurança e emergência', photoRecommended: true },
    { text: 'Verificar acesso desobstruído aos equipamentos de combate a incêndio', category: 'Segurança e emergência' },
    { text: 'Registrar condição aparente de instalações de combustível, cozinha e fontes de ignição', category: 'Segurança e emergência', photoRecommended: true },
  ],
  navegacao: [
    { text: 'Verificar disponibilidade e condição aparente de compasso ou meio equivalente de orientação', category: 'Navegação e comunicação' },
    { text: 'Verificar cartas, publicações ou informações náuticas necessárias à navegação observada', category: 'Navegação e comunicação' },
    { text: 'Verificar funcionamento aparente de GPS e demais auxílios eletrônicos instalados', category: 'Navegação e comunicação' },
    { text: 'Registrar visibilidade do posto de governo e condição dos comandos de navegação', category: 'Navegação e comunicação', photoRecommended: true },
  ],
  radiocomunicacao: [
    { text: 'Verificar presença e funcionamento aparente do meio de radiocomunicação aplicável', category: 'Navegação e comunicação' },
    { text: 'Registrar canal, alimentação elétrica e condição aparente do equipamento VHF quando instalado', category: 'Navegação e comunicação' },
    { text: 'Verificar existência de fonte alternativa de energia quando aplicável ao equipamento instalado', category: 'Navegação e comunicação' },
  ],
  luzes: [
    { text: 'Verificar funcionamento aparente das luzes de navegação instaladas', category: 'Navegação e comunicação', photoRecommended: true },
    { text: 'Conferir disposição e visibilidade aparente das luzes em relação ao tipo e porte da embarcação', category: 'Navegação e comunicação' },
    { text: 'Verificar sinais sonoros e visuais disponíveis para as condições de operação observadas', category: 'Navegação e comunicação' },
  ],
  casco: [
    { text: 'Inspecionar visualmente casco, convés, borda e pontos de entrada de água', category: 'Identificação e casco', photoRecommended: true },
    { text: 'Verificar condição aparente de porões, tampas, escotilhas e meios de estanqueidade', category: 'Identificação e casco', photoRecommended: true },
    { text: 'Registrar condição aparente de propulsão, governo, hélice e proteções acessíveis', category: 'Identificação e casco', photoRecommended: true },
  ],
  poluicao: [
    { text: 'Verificar sinais visíveis de vazamento de óleo, combustível ou outros poluentes', category: 'Proteção ambiental', photoRecommended: true },
    { text: 'Verificar armazenamento e descarte aparente de resíduos produzidos a bordo', category: 'Proteção ambiental' },
    { text: 'Registrar recursos de contenção e limpeza disponíveis quando aplicáveis à operação', category: 'Proteção ambiental' },
  ],
  transporte: [
    { text: 'Comparar total de pessoas a bordo com a lotação autorizada informada no documento', category: 'Transporte de passageiros', photoRecommended: true },
    { text: 'Verificar condições aparentes de embarque, desembarque, circulação e permanência de passageiros', category: 'Transporte de passageiros' },
    { text: 'Conferir organização da relação ou lista de passageiros quando apresentada', category: 'Transporte de passageiros' },
  ],
  pesca: [
    { text: 'Registrar atividade de pesca observada e equipamentos que possam interferir na segurança da navegação', category: 'Atividade de pesca', photoRecommended: true },
    { text: 'Verificar organização do convés, acessos e riscos aparentes decorrentes do petrecho de pesca', category: 'Atividade de pesca', photoRecommended: true },
  ],
  esporte_recreio: [
    { text: 'Registrar finalidade recreativa observada e condições de embarque das pessoas a bordo', category: 'Esporte e recreio' },
    { text: 'Conferir a lotação observada com a lotação constante do TIE ou PRPM', category: 'Esporte e recreio', ruleId: 'N211_CAPACITY_LIMIT', vesselUse: 'Esporte e recreio', photoRecommended: true },
  ],
  moto_aquatica: [
    { text: 'Verificar estado aparente do colete e do dispositivo de segurança associado ao condutor', category: 'Moto aquática', photoRecommended: true },
    { text: 'Registrar identificação, condutor e condições operacionais observadas da moto aquática', category: 'Moto aquática', photoRecommended: true },
  ],
  regional: [
    { text: 'Conferir se existe exigência regional oficialmente obtida e validada para a jurisdição confirmada', category: 'Regras regionais' },
  ],
});

const getVerifiedRule = (ruleId) => {
  if (!ruleId) return null;
  const chunk = NORMATIVE_CHUNKS.find((item) => item.ruleId === ruleId && item.validationStatus === 'PASS');
  if (!chunk?.source?.sourceId || !chunk?.source?.version || !chunk?.section || !Number.isFinite(chunk?.pageStart)) return null;
  return chunk;
};

const definitionMatchesContext = (definition, applicability) => {
  const context = applicability?.context || {};
  if (definition.vesselUse && context.vesselUse !== definition.vesselUse) return false;
  if (definition.navigationArea && context.navigationArea !== definition.navigationArea) return false;
  return true;
};

const createChecklistItem = ({ moduleId, definition, index, applicability }) => {
  const contextMatches = definitionMatchesContext(definition, applicability);
  const chunk = contextMatches ? getVerifiedRule(definition.ruleId) : null;
  const verified = Boolean(chunk);
  return {
    id: `${moduleId}-${index + 1}`,
    moduleId,
    operationalCategory: definition.category,
    text: definition.text,
    status: 'nao verificado',
    notes: '',
    evidence: [],
    photoRequired: false,
    photoRecommended: Boolean(definition.photoRecommended),
    reference: verified
      ? `${chunk.source.title} · ${chunk.section} · página PDF ${chunk.pageStart}`
      : PENDING_REFERENCE,
    referenceStatus: verified ? 'verified' : 'pending',
    sourceIds: verified ? [chunk.sourceId] : applicability?.applicableNorms || [],
    legalBasis: verified
      ? {
          sourceId: chunk.sourceId,
          version: chunk.source.version,
          section: chunk.section,
          page: chunk.pageStart,
          chunkId: chunk.id,
          ruleId: chunk.ruleId,
        }
      : null,
  };
};

export const buildDynamicChecklist = (applicability = {}) =>
  (applicability?.checklistModules || []).flatMap((moduleId) =>
    (moduleCatalog[moduleId] || []).map((definition, index) => createChecklistItem({
      moduleId,
      definition,
      index,
      applicability,
    }))
  );

export const setChecklistPhotoRequirement = (items, itemId, photoRequired) =>
  (Array.isArray(items) ? items : []).map((item) =>
    item.id === itemId ? { ...item, photoRequired: Boolean(photoRequired) } : item
  );

export const getMissingRequiredEvidence = (items) =>
  (Array.isArray(items) ? items : []).filter((item) => item.photoRequired && !(item.evidence || []).length);

export const buildDynamicDocuments = ({ vessel, driver, crew }) => {
  const documents = [
    { id: 'vessel-registration', name: vessel.documentType || 'Documento de inscrição', number: vessel.tie || '', validUntil: vessel.validUntil || '', status: '', notes: '', source: null, evidence: [] },
    { id: 'driver-license', name: driver.licenseType || 'Habilitação do condutor', number: driver.licenseNumber || '', validUntil: driver.validUntil || '', status: '', notes: '', source: null, evidence: [] },
  ];
  if (crew.ctsRequired !== 'não') documents.push({ id: 'cts', name: 'Cartão de Tripulação de Segurança (CTS)', number: '', validUntil: '', status: '', notes: '', source: null, evidence: [] });
  return documents;
};
