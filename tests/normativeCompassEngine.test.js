import { answerNormativeCompass, INSUFFICIENT_COMPASS_ANSWER, simulateCompassScenario } from '../src/legal/compass/normativeCompassEngine';

describe('Bússola Normativa 2.0', () => {
  test('não responde regras locais sem localização confirmada', async () => {
    const result = await answerNormativeCompass({ question: 'O que se aplica neste local?' });
    expect(result.interpretedIntent).toBe('LOCATION_RULES');
    expect(result.insufficientEvidence).toBe(true);
    expect(result.clarification).toBeTruthy();
  });

  test('não inventa regra regional quando existe somente jurisdição manual', async () => {
    const inspection = { id: 'i1', context: { jurisdictionId: 'CPPI', jurisdictionConfirmedByUser: true, regionalRuleStatus: 'UNAVAILABLE', inspectionLocation: { confirmedByUser: true } }, vessel: {} };
    const result = await answerNormativeCompass({ question: 'Quais regras podem se aplicar neste local?', inspection });
    expect(result.answer).toContain('norma regional correspondente não está disponível');
    expect(result.citations).toEqual([]);
    expect(result.locationAssessment.jurisdictionId).toBe('CPPI');
  });

  test('distingue Inspeção Naval de Vistoria com texto oficial citado', async () => {
    const result = await answerNormativeCompass({ question: 'Qual a diferença entre Inspeção Naval e Vistoria?' });
    expect(result.insufficientEvidence).toBe(false);
    expect(result.interpretedIntent).toBe('DEFINITION');
    expect(result.answer).toContain('não trata os termos como sinônimos');
    expect(result.citations).toHaveLength(2);
    expect(result.citations.every((citation) => citation.officialText && citation.page === 15)).toBe(true);
  });

  test.each([
    ['O que é Inspeção Naval?', 'GLOSSARY_NAVAL_INSPECTION'],
    ['O que é Vistoria?', 'GLOSSARY_SURVEY'],
    ['O que é embarcação?', 'GLOSSARY_VESSEL'],
  ])('responde definição auditada: %s', async (question, ruleId) => {
    const result = await answerNormativeCompass({ question });
    expect(result.insufficientEvidence).toBe(false);
    expect(result.debug.ruleIds).toContain(ruleId);
    expect(result.citations[0].officialText).toBeTruthy();
  });

  test('distingue não portar TIE de não possuir TIE', async () => {
    const notCarried = await answerNormativeCompass({ question: 'A embarcação não porta TIE.' });
    const unregistered = await answerNormativeCompass({ question: 'A embarcação navegando não possui TIE.' });
    expect(notCarried.answer).toContain('não equivale');
    expect(notCarried.citations.some((item) => item.section === '3.13.2')).toBe(true);
    expect(unregistered.answer).toContain('retirada de tráfego e apreensão');
    expect(unregistered.citations.some((item) => item.section === '3.13.1')).toBe(true);
  });

  test('pergunta período antes de analisar CHA vencida', async () => {
    const result = await answerNormativeCompass({ question: 'CHA vencida.' });
    expect(result.clarification.options).toContain('Mais de 5 anos');
  });

  test('pergunta situação operacional depois de obter o período', async () => {
    const result = await answerNormativeCompass({ question: 'CHA vencida há 6 anos.' });
    expect(result.clarification.question).toContain('situação operacional');
  });

  test('reutiliza contexto da inspeção ativa', async () => {
    const result = await answerNormativeCompass({ question: 'Condutor sem habilitação.', inspection: { id: 'i-1', context: { vesselOperationalState: 'Navegando' }, vessel: { name: 'NANA' } } });
    expect(result.interpretedContext.inspectionId).toBe('i-1');
    expect(result.answer).toContain('retirada de tráfego e');
  });

  test('simula outro estado sem modificar a inspeção real', async () => {
    const inspection = { id: 'i-1', context: { vesselOperationalState: 'Navegando' }, vessel: {} };
    const simulated = await simulateCompassScenario({ question: 'Condutor sem habilitação.', inspection, operationalState: 'Atracada' });
    expect(simulated.answer).toContain('efetiva navegação');
    expect(inspection.context.vesselOperationalState).toBe('Navegando');
  });

  test('descarta chunk sem fonte e página completas', async () => {
    const invalidChunk = { id: 'x', ruleId: 'RLESTA_ART_11', validationStatus: 'PASS', section: 'Art. 11', pageStart: null, text: 'texto', source: { status: 'CURRENT_VERIFIED' } };
    const result = await answerNormativeCompass({ question: 'Condutor sem habilitação navegando.', chunks: [invalidChunk] });
    expect(result.citations).toEqual([]);
    expect(result.answer).toBe(INSUFFICIENT_COMPASS_ANSWER);
  });

  test('recusa consulta fora do corpus', async () => {
    const result = await answerNormativeCompass({ question: 'Qual a regra para uma aeronave em Marte?' });
    expect(result.answer).toBe(INSUFFICIENT_COMPASS_ANSWER);
    expect(result.citations).toEqual([]);
  });

  test('responde consulta geral sem determinar medida para caso concreto', async () => {
    const apprehension = await answerNormativeCompass({ question: 'Quando cabe apreensão?' });
    expect(apprehension.answer).toContain('não determina a medida');
    expect(apprehension.citations.length).toBeGreaterThan(1);
    const withdrawal = await answerNormativeCompass({ question: 'O que é retirada de tráfego?' });
    expect(withdrawal.citations[0].section).toBe('3.7.3');
  });

  test('recusa quantidade de coletes quando o contexto de esporte e recreio não foi estabelecido', async () => {
    const result = await answerNormativeCompass({ question: 'Quantos coletes devem existir para a lotação da embarcação?' });
    expect(result.answer).toBe(INSUFFICIENT_COMPASS_ANSWER);
    expect(result.citations).toEqual([]);
  });

  test('responde quantidade de coletes somente no contexto auditado de esporte e recreio', async () => {
    const inspection = { id: 'recreio-coletes', context: {}, vessel: { vesselUse: 'Esporte e recreio' } };
    const result = await answerNormativeCompass({ question: 'Quantos coletes devem existir para a lotação da embarcação?', inspection });
    expect(result.insufficientEvidence).toBe(false);
    expect(result.debug.ruleIds).toEqual(['N211_LIFEJACKETS']);
    expect(result.citations[0]).toMatchObject({ sourceId: 'normam-211', section: 'Anexo 3-B, item 1(e) — Coletes', page: 206 });
    expect(result.answer).toContain('quantidade de coletes');
  });

  test('recusa extintores quando a área de navegação não foi estabelecida como mar aberto', async () => {
    const result = await answerNormativeCompass({ question: 'Qual a dotação de extintores da embarcação?' });
    expect(result.answer).toBe(INSUFFICIENT_COMPASS_ANSWER);
    expect(result.citations).toEqual([]);
  });

  test('não calcula número de extintores fora da tabela auditada mesmo com contexto de mar aberto', async () => {
    const inspection = { id: 'mar-aberto-1', context: {}, vessel: { navigationArea: 'Mar aberto' } };
    const result = await answerNormativeCompass({ question: 'Qual a dotação de extintores da embarcação?', inspection });
    expect(result.insufficientEvidence).toBe(false);
    expect(result.debug.ruleIds).toEqual(expect.arrayContaining(['N201_EXTINGUISHERS_LOCATION', 'N201_EXTINGUISHERS_TABLE']));
    expect(result.answer).toContain('quantidade exata depende');
    expect(result.citations.some((item) => item.page === 605)).toBe(true);
  });

  test('usa contexto de navegação interior para listas de passageiros', async () => {
    const inspection = { id: 'interior-1', context: {}, vessel: { navigationArea: 'Interior' } };
    const result = await answerNormativeCompass({ question: 'A lista de passageiros precisa estar atualizada?', inspection });
    expect(result.insufficientEvidence).toBe(false);
    expect(result.debug.ruleIds).toEqual(expect.arrayContaining(['N204_INTERIOR_ARRIVAL_LISTS', 'N204_INTERIOR_DEPARTURE_LISTS']));
    expect(result.citations.every((item) => item.sourceId === 'normam-204')).toBe(true);
  });

  test('recusa lista de passageiros genérica quando o contexto interior não foi estabelecido', async () => {
    const result = await answerNormativeCompass({ question: 'Como deve ser a lista de passageiros?' });
    expect(result.answer).toBe(INSUFFICIENT_COMPASS_ANSWER);
    expect(result.citations).toEqual([]);
  });

  test('responde limite de lotação para esporte e recreio usando TIE ou PRPM como referência', async () => {
    const inspection = { id: 'recreio-1', context: {}, vessel: { vesselUse: 'Esporte e recreio' } };
    const result = await answerNormativeCompass({ question: 'Posso exceder a lotação de pessoas?', inspection });
    expect(result.insufficientEvidence).toBe(false);
    expect(result.debug.ruleIds).toEqual(['N211_CAPACITY_LIMIT']);
    expect(result.answer).toContain('TIE ou PRPM');
  });
});
