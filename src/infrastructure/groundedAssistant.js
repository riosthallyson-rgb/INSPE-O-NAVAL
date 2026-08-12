import { answerNormativeCompass } from '../legal/compass/normativeCompassEngine';

export const askGroundedAssistant = async ({ question, inspection, ignoreInspectionContext = false, contextOverrides = {} }) => {
  const result = await answerNormativeCompass({ question, inspection, ignoreInspectionContext, contextOverrides });
  return {
    ...result,
    mode: 'offline',
    assistantNotice: result.insufficientEvidence
      ? 'Fundamentação insuficiente ou contexto incompleto. Nenhum conhecimento externo foi utilizado.'
      : 'Resposta construída localmente somente com chunks normativos auditados.',
    summary: result.citations.map((citation) => ({ id: citation.sourceId, title: citation.title, source: citation.localFile, edition: citation.sourceVersion, detail: citation.officialText || citation.sourceExcerpt, verificationStatus: 'verified', locator: `${citation.section}, página PDF ${citation.page}` })),
  };
};
