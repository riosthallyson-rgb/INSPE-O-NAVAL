import { answerNormativeCompass } from '../src/legal/compass/normativeCompassEngine';

const scenarios = [
  ['Sem habilitação, navegando', 'ANSWER'], ['Sem habilitação, atracada', 'ANSWER'], ['Condutor não habilitado, fundeada', 'ANSWER'], ['Condutor não possui habilitação, na boia', 'ANSWER'],
  ['CHA vencida há 2 anos, navegando', 'ANSWER'], ['CHA vencida há 2 anos, atracada', 'ANSWER'], ['CIR vencida há 5 anos, navegando', 'ANSWER'], ['CIR vencida há 3 anos, fundeada', 'ANSWER'],
  ['CHA vencida há 6 anos, navegando', 'ANSWER'], ['CHA vencida há 6 anos, atracada', 'ANSWER'], ['CIR vencida há 7 anos, fundeada', 'ANSWER'], ['CIR vencida há 8 anos, na boia', 'ANSWER'],
  ['Não porta CHA, navegando', 'ANSWER'], ['Não porta CIR, atracada', 'ANSWER'], ['Não porta TIE', 'ANSWER'], ['Possui PRPM mas não está portando', 'ANSWER'],
  ['Não possui TIE, navegando', 'ANSWER'], ['Sem PRPM, atracada', 'ANSWER'], ['Embarcação sem TIE, fundeada', 'ANSWER'], ['Embarcação sem PRPM, na boia', 'ANSWER'],
  ['CHA vencida', 'CLARIFICATION'], ['CHA vencida há 6 anos', 'CLARIFICATION'], ['Condutor sem habilitação', 'CLARIFICATION'], ['Embarcação sem TIE', 'CLARIFICATION'],
  ['Qual norma trata de aeronave?', 'REFUSAL'], ['Regra de pesca em outro país', 'REFUSAL'], ['Qual o valor da multa?', 'REFUSAL'], ['Qual colete devo comprar?', 'REFUSAL'], ['Previsão do tempo para amanhã', 'REFUSAL'], ['Aplique uma penalidade automaticamente', 'REFUSAL'],
];

describe('matriz de 30 cenários da Bússola', () => {
  test.each(scenarios)('%s', async (question, expected) => {
    const result = await answerNormativeCompass({ question });
    const actual = result.clarification ? 'CLARIFICATION' : result.insufficientEvidence ? 'REFUSAL' : 'ANSWER';
    expect(actual).toBe(expected);
    if (actual === 'ANSWER') expect(result.citations.length).toBeGreaterThan(0);
    if (actual === 'REFUSAL') expect(result.citations).toEqual([]);
  });
});
