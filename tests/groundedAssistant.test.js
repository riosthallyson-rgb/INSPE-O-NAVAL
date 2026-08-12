import { askGroundedAssistant } from '../src/infrastructure/groundedAssistant';

describe('assistente fundamentado', () => {
  test('responde localmente quando existe regra auditada e contexto suficiente', async () => {
    const result = await askGroundedAssistant({ question: 'Condutor sem habilitação e embarcação navegando.' });
    expect(result.mode).toBe('offline');
    expect(result.citations.some((item) => item.section === '3.8.1')).toBe(true);
  });

  test('faz pergunta objetiva quando falta o período de vencimento', async () => {
    const result = await askGroundedAssistant({ question: 'CHA vencida. O que faço?' });
    expect(result.clarification.question).toContain('quanto tempo');
    expect(result.citations).toEqual([]);
  });

  test('recusa pergunta não coberta sem usar resposta genérica', async () => {
    const result = await askGroundedAssistant({ question: 'Qual a regra para uma aeronave em outro país?' });
    expect(result.mode).toBe('offline');
    expect(result.insufficientEvidence).toBe(true);
    expect(result.citations).toEqual([]);
  });
});
