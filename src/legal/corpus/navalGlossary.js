import { NORMATIVE_CHUNKS } from './normativeCorpus';

const explanations = {
  GLOSSARY_VESSEL: 'Em linguagem simples: é uma construção capaz de se deslocar na água, com ou sem meios próprios, destinada ao transporte de pessoas ou cargas e sujeita à inscrição na Autoridade Marítima.',
  GLOSSARY_NAVAL_INSPECTION: 'Em linguagem simples: é a atividade administrativa de fiscalização do cumprimento das regras ligadas à segurança da navegação, à vida humana e à prevenção da poluição.',
  GLOSSARY_SURVEY: 'Em linguagem simples: é uma verificação técnico-administrativa, eventual ou periódica, dos requisitos aplicáveis à embarcação ou plataforma.',
};

export const NAVAL_GLOSSARY = Object.freeze(
  NORMATIVE_CHUNKS
    .filter((item) => item.ruleId.startsWith('GLOSSARY_'))
    .map((item) => Object.freeze({
      id: item.ruleId,
      term: item.ruleId === 'GLOSSARY_VESSEL' ? 'Embarcação' : item.ruleId === 'GLOSSARY_NAVAL_INSPECTION' ? 'Inspeção Naval' : 'Vistoria',
      officialText: item.officialText,
      plainLanguageExplanation: explanations[item.ruleId],
      sourceId: item.sourceId,
      sourceTitle: item.source.title,
      section: item.section,
      page: item.pageStart,
    })),
);
