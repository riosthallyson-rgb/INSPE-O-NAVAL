import * as Crypto from 'expo-crypto';
import { NORMATIVE_CHUNKS, COMPASS_CORPUS_VERSION } from '../corpus/normativeCorpus';
import { normalizeCompassText } from '../index/compassIndex';
import { retrieveNormativeChunks } from '../retrieval/hybridRetrieval';
import { validateCitations } from '../citations/citationValidator';
import { classifyCompassIntent } from './queryIntentClassifier';

export const INSUFFICIENT_COMPASS_ANSWER = 'Não localizei fundamentação suficiente nas publicações disponíveis para responder com segurança.';

const extractQuestionContext = (question, inspection) => {
  const normalized = normalizeCompassText(question);
  const state = /navegando/.test(normalized) ? 'Navegando' : /atracad/.test(normalized) ? 'Atracada' : /fundeada/.test(normalized) ? 'Fundeada' : /na boia/.test(normalized) ? 'Na boia' : inspection?.context?.vesselOperationalState || '';
  const expired = /vencid|desatualizad/.test(normalized);
  const yearsMatch = normalized.match(/(?:ha|mais de)\s*(\d+)\s*anos?/);
  const expirationBand = /mais de 5|apos 5|6 anos|7 anos|8 anos|9 anos/.test(normalized) || (yearsMatch && Number(yearsMatch[1]) > 5) ? 'OVER_FIVE_YEARS' : /ate 5|[1-5] anos?/.test(normalized) ? 'UP_TO_FIVE_YEARS' : '';
  const driverStatus = /nao possui habilitacao|sem habilitacao|nao habilitad/.test(normalized) ? 'UNLICENSED' : /nao porta.*(?:cha|cir|habilit)|nao esta portando.*(?:cha|cir|habilit)/.test(normalized) ? 'LICENSE_NOT_CARRIED' : expired ? 'LICENSE_EXPIRED' : '';
  const vesselDocumentStatus = /nao porta.*(?:tie|prpm)|possui.*(?:tie|prpm).*nao.*port/.test(normalized) ? 'REGISTRATION_NOT_CARRIED' : /nao possui.*(?:tie|prpm)|sem (?:tie|prpm)/.test(normalized) ? 'UNREGISTERED' : '';
  const generalTopic = /diferenca.*inspecao.*vistoria|diferenca.*vistoria.*inspecao/.test(normalized) ? 'INSPECTION_SURVEY_DIFFERENCE' : /o que e.*inspecao naval|defina.*inspecao naval/.test(normalized) ? 'NAVAL_INSPECTION_DEFINITION' : /o que e.*vistoria|defina.*vistoria/.test(normalized) ? 'SURVEY_DEFINITION' : /o que e.*embarcacao|defina.*embarcacao/.test(normalized) ? 'VESSEL_DEFINITION' : /quando cabe apreens|hipoteses de apreens/.test(normalized) ? 'APPREHENSION' : /retirada de trafego/.test(normalized) ? 'TRAFFIC_WITHDRAWAL' : /impedimento de saida/.test(normalized) ? 'DEPARTURE_PREVENTION' : '';
  const equipmentTopic = /colete/.test(normalized) && /quantidade|lotacao|pessoa|quantos/.test(normalized) ? 'LIFEJACKETS' : /boia/.test(normalized) ? 'LIFEBUOYS' : /extintor/.test(normalized) ? 'EXTINGUISHER_DOTATION' : '';
  const operationalTopic = /transbordo.*(?:pessoal|passageir)|(?:pessoal|passageir).*transbordo/.test(normalized) ? 'PERSONNEL_TRANSFER' : /lista.*passageir|passageir.*lista/.test(normalized) && (/interior|hidrovia/.test(normalized) || inspection?.vessel?.navigationArea === 'Interior') ? 'INTERIOR_PASSENGER_LISTS' : /lotacao|excesso.*pessoa|capacidade.*(?:passageir|pessoa)/.test(normalized) && (/esporte|recreio/.test(normalized) || inspection?.vessel?.vesselUse === 'Esporte e recreio') ? 'RECREATIONAL_CAPACITY' : '';
  return { operationalState: state, driverStatus, vesselDocumentStatus, expirationBand, generalTopic, equipmentTopic, operationalTopic, inspectionId: inspection?.id || null, vesselName: inspection?.vessel?.name || '', vesselUse: inspection?.vessel?.vesselUse || '', navigationArea: inspection?.vessel?.navigationArea || '', inspectionLocation: inspection?.context?.inspectionLocation || null, jurisdictionId: inspection?.context?.jurisdictionConfirmedByUser ? inspection.context.jurisdictionId : '', regionalRuleStatus: inspection?.context?.regionalRuleStatus || '' };
};

const buildRuleSelection = (context) => {
  if (context.driverStatus === 'UNLICENSED') return ['RLESTA_ART_11', 'N301_3_8_1', 'N301_3_8_NOTES', 'N301_3_8_2'];
  if (context.driverStatus === 'LICENSE_NOT_CARRIED') return ['RLESTA_ART_12_II', 'N301_3_9_3'];
  if (context.driverStatus === 'LICENSE_EXPIRED' && context.expirationBand === 'UP_TO_FIVE_YEARS') return ['RLESTA_ART_12_III', 'N301_3_9_1'];
  if (context.driverStatus === 'LICENSE_EXPIRED' && context.expirationBand === 'OVER_FIVE_YEARS') return ['RLESTA_ART_12_III', 'N301_3_9_2'];
  if (context.vesselDocumentStatus === 'REGISTRATION_NOT_CARRIED') return ['RLESTA_ART_16_II', 'N301_3_13_2'];
  if (context.vesselDocumentStatus === 'UNREGISTERED') return ['RLESTA_ART_16_I', 'N301_3_13_1'];
  if (context.generalTopic === 'INSPECTION_SURVEY_DIFFERENCE') return ['GLOSSARY_NAVAL_INSPECTION', 'GLOSSARY_SURVEY'];
  if (context.generalTopic === 'NAVAL_INSPECTION_DEFINITION') return ['GLOSSARY_NAVAL_INSPECTION'];
  if (context.generalTopic === 'SURVEY_DEFINITION') return ['GLOSSARY_SURVEY'];
  if (context.generalTopic === 'VESSEL_DEFINITION') return ['GLOSSARY_VESSEL'];
  if (context.generalTopic === 'APPREHENSION') return ['N301_3_8_1', 'N301_3_9_2', 'N301_3_13_1'];
  if (context.generalTopic === 'TRAFFIC_WITHDRAWAL') return ['N301_3_7_3'];
  if (context.generalTopic === 'DEPARTURE_PREVENTION') return ['N301_3_7_4'];
  if (context.equipmentTopic === 'LIFEJACKETS') return ['N211_LIFEJACKETS'];
  if (context.equipmentTopic === 'LIFEBUOYS') return ['N211_LIFEBUOYS'];
  if (context.equipmentTopic === 'EXTINGUISHER_DOTATION') return ['N201_EXTINGUISHERS_LOCATION', 'N201_EXTINGUISHERS_TABLE'];
  if (context.operationalTopic === 'RECREATIONAL_CAPACITY') return ['N211_CAPACITY_LIMIT'];
  if (context.operationalTopic === 'INTERIOR_PASSENGER_LISTS') return ['N204_INTERIOR_ARRIVAL_LISTS', 'N204_INTERIOR_DEPARTURE_LISTS'];
  if (context.operationalTopic === 'PERSONNEL_TRANSFER') return ['N204_PERSONNEL_TRANSFER'];
  return [];
};

const clarification = (context) => {
  if (context.driverStatus === 'LICENSE_EXPIRED' && !context.expirationBand) return { question: 'Há quanto tempo a CHA ou CIR está vencida?', options: ['Até 5 anos', 'Mais de 5 anos', 'Não sei'] };
  if (['UNLICENSED', 'LICENSE_EXPIRED'].includes(context.driverStatus) && !context.operationalState) return { question: 'Qual é a situação operacional da embarcação?', options: ['Navegando', 'Atracada', 'Fundeada', 'Na boia'] };
  if (context.vesselDocumentStatus === 'UNREGISTERED' && !context.operationalState) return { question: 'Qual é a situação operacional da embarcação?', options: ['Navegando', 'Atracada', 'Fundeada', 'Na boia'] };
  if (/^LICENSE_NOT_CARRIED$/.test(context.driverStatus) && !context.operationalState) return { question: 'A habilitação existe e está dentro da validade?', options: ['Sim', 'Está vencida', 'Não foi possível confirmar'] };
  return null;
};

const directAnswer = (context) => {
  if (context.driverStatus === 'UNLICENSED') return context.operationalState === 'Navegando' ? 'Para o cenário registrado, a NORMAM-301 relaciona a condução sem habilitação à retirada de tráfego e à apreensão, ressalvada a apresentação de condutor habilitado durante a abordagem. A adoção da medida exige confirmação dos fatos pelo Inspetor.' : 'Para embarcação atracada, fundeada ou na boia, a regra exige confirmar que houve efetiva navegação antes da hipótese de apreensão. Confira também se foi apresentado condutor habilitado durante a abordagem.';
  if (context.driverStatus === 'LICENSE_NOT_CARRIED') return 'Não portar habilitação não equivale a não possuir habilitação. Confirme se o condutor é habilitado e se a CHA/CIR está válida, pois a NORMAM-301 separa essas situações.';
  if (context.driverStatus === 'LICENSE_EXPIRED' && context.expirationBand === 'UP_TO_FIVE_YEARS') return context.operationalState === 'Navegando' ? 'Para CHA/CIR vencida em até cinco anos e embarcação navegando, a regra auditada relaciona retirada de tráfego, ressalvada a apresentação de condutor habilitado durante a abordagem.' : 'A regra auditada para vencimento em até cinco anos prevê tratamento específico quando a embarcação está navegando. Analise o estado registrado e confirme os fatos.';
  if (context.driverStatus === 'LICENSE_EXPIRED' && context.expirationBand === 'OVER_FIVE_YEARS') return context.operationalState === 'Navegando' ? 'Para CHA/CIR vencida há mais de cinco anos e embarcação navegando, a regra auditada relaciona retirada de tráfego e apreensão, com as ressalvas previstas na fonte.' : 'Para CHA/CIR vencida há mais de cinco anos, embarcação atracada, fundeada ou na boia exige constatação de efetiva navegação antes da hipótese de apreensão.';
  if (context.vesselDocumentStatus === 'REGISTRATION_NOT_CARRIED') return 'Não portar TIE ou PRPM não equivale à ausência de inscrição da embarcação. Quando a inscrição ou registro é confirmado, o item auditado informa que não há medida administrativa liminar a adotar, sem prejuízo da análise do enquadramento.';
  if (context.vesselDocumentStatus === 'UNREGISTERED') return context.operationalState === 'Navegando' ? 'Para embarcação não inscrita ou registrada e navegando, o item auditado relaciona retirada de tráfego e apreensão. Confirme que realmente não existe registro, pois isso difere de apenas não portar o documento.' : 'Para embarcação não inscrita ou registrada, atracada, fundeada ou na boia, a hipótese auditada exige constatação de efetiva navegação antes da apreensão.';
  if (context.generalTopic === 'INSPECTION_SURVEY_DIFFERENCE') return 'A NORMAM-301 não trata os termos como sinônimos. Inspeção Naval é uma atividade administrativa de fiscalização do cumprimento das normas ligadas à salvaguarda da vida humana, à segurança da navegação e à prevenção da poluição. Vistoria é uma ação técnico-administrativa, eventual ou periódica, destinada a verificar requisitos normativos de prevenção da poluição, segurança e habitabilidade.';
  if (context.generalTopic === 'NAVAL_INSPECTION_DEFINITION') return 'Inspeção Naval é a atividade administrativa de fiscalização do cumprimento da LESTA, de suas normas e regulamentos e dos atos internacionais ratificados pelo Brasil, dentro do escopo de salvaguarda da vida humana, segurança da navegação e prevenção da poluição.';
  if (context.generalTopic === 'SURVEY_DEFINITION') return 'Vistoria é uma ação técnico-administrativa, eventual ou periódica, que verifica o cumprimento de requisitos nacionais e internacionais referentes à prevenção da poluição e às condições de segurança e habitabilidade de embarcações e plataformas.';
  if (context.generalTopic === 'VESSEL_DEFINITION') return 'A NORMAM-301 define embarcação como uma construção sujeita à inscrição na Autoridade Marítima, capaz de se locomover na água por meios próprios ou não e destinada ao transporte de pessoas ou cargas; a definição também contempla as plataformas nos termos expressos pela norma.';
  if (context.generalTopic === 'APPREHENSION') return 'O corpus auditado contém diferentes hipóteses de apreensão, entre elas condução sem habilitação, habilitação vencida há mais de cinco anos e embarcação não inscrita. A situação operacional e as ressalvas de cada item precisam ser analisadas; esta consulta geral não determina a medida para um caso concreto.';
  if (context.generalTopic === 'TRAFFIC_WITHDRAWAL') return 'A NORMAM-301 define retirada de tráfego como impedir a continuação da navegação, determinando prioritariamente atracação ou, alternativamente, fundeio em local definido pelo Inspetor. A hipótese de aplicação depende da regra específica do fato.';
  if (context.generalTopic === 'DEPARTURE_PREVENTION') return 'A NORMAM-301 relaciona impedimento de saída a inconformidade verificada em inspeção solicitada para saída, quando a embarcação está atracada, fundeada ou na boia. A adoção depende da hipótese normativa concreta.';
  if (context.equipmentTopic === 'LIFEJACKETS') return 'Na lista auditada de vistoria inicial da NORMAM-211 para embarcações de esporte e recreio, a quantidade de coletes é conferida em relação à lotação e também são observadas classe, pronta utilização, sinalização e fácil acesso. Confirme o tipo de embarcação e a área de navegação antes de concluir a exigência aplicável.';
  if (context.equipmentTopic === 'LIFEBUOYS') return 'A lista auditada de vistoria inicial da NORMAM-211 prevê conferência das boias salva-vidas, incluindo suporte e características das retinidas. Use o item citado para conferir o equipamento real; esta resposta não define quantidade fora do contexto da fonte.';
  if (context.equipmentTopic === 'EXTINGUISHER_DOTATION') return 'A NORMAM-201 auditada remete a dotação e a localização de extintores ao Anexo 4-F, que organiza os requisitos por área da embarcação e classe do extintor. A quantidade exata depende da configuração e da área; consulte a tabela citada em vez de inferir um número pela pergunta.';
  if (context.operationalTopic === 'RECREATIONAL_CAPACITY') return 'Para embarcação de esporte e recreio, o item auditado da NORMAM-211 proíbe exceder a lotação estabelecida e constante do TIE ou PRPM. Confirme no documento a lotação efetivamente autorizada antes de registrar possível excesso.';
  if (context.operationalTopic === 'INTERIOR_PASSENGER_LISTS') return 'Nos cenários auditados de navegação interior da NORMAM-204, as listas de tripulantes, passageiros e profissionais não-tripulantes devem permanecer atualizadas e disponíveis para apresentação à Inspeção Naval conforme o Aviso de Entrada ou de Saída aplicável.';
  if (context.operationalTopic === 'PERSONNEL_TRANSFER') return 'No trecho auditado da NORMAM-204 sobre transbordo de pessoal em águas não abrigadas, são previstos coletes para o pessoal diretamente envolvido, lista de passageiros em terra e a bordo e comunicação VHF entre as embarcações durante a operação.';
  return INSUFFICIENT_COMPASS_ANSWER;
};

export const answerNormativeCompass = async ({ question, inspection = null, ignoreInspectionContext = false, contextOverrides = {}, chunks = NORMATIVE_CHUNKS, now = new Date() }) => {
  const inspectionContext = ignoreInspectionContext ? null : inspection;
  const interpretedContext = { ...extractQuestionContext(question, inspectionContext), ...contextOverrides };
  const interpretedIntent = classifyCompassIntent(question);
  if (interpretedIntent === 'LOCATION_RULES') {
    const hasConfirmedLocation = Boolean(interpretedContext.inspectionLocation?.confirmedByUser);
    const jurisdiction = interpretedContext.jurisdictionId;
    if (!hasConfirmedLocation && !jurisdiction) return { question, interpretedContext, interpretedIntent, answer: 'Preciso de uma localização ou jurisdição confirmada antes de consultar regras relacionadas ao local.', verificationSteps: [], possibleViolations: [], possibleMeasures: [], requiredDocuments: [], citations: [], warnings: ['O GPS isoladamente não determina a regra aplicável.'], insufficientEvidence: true, clarification: { question: 'Como deseja informar o local?', options: ['Registrar localização na inspeção', 'Informar jurisdição manualmente'] }, generatedAt: now.toISOString(), corpusVersion: COMPASS_CORPUS_VERSION, sourceVersions: [], debug: { reason: 'missing-confirmed-location' } };
    const answer = jurisdiction ? `A jurisdição confirmada na inspeção é ${jurisdiction}, mas a norma regional correspondente não está disponível e validada neste dispositivo. Não é possível afirmar quais regras regionais se aplicam. Continue a análise pelas normas nacionais e confirme a NPCP/NPCF por fonte oficial.` : 'A localização foi confirmada, mas não existe geometria oficial instalada para determinar a jurisdição. Não é possível afirmar quais regras regionais se aplicam somente pelo ponto GPS.';
    return { queryId: `consulta-${now.getTime()}`, question, interpretedContext, interpretedIntent, answer, verificationSteps: ['Confirmar a jurisdição competente.', 'Obter a NPCP/NPCF em fonte oficial.', 'Verificar versão, vigência, item e página antes de aplicar uma regra regional.', 'Analisar tipo, atividade e situação da embarcação.'], possibleViolations: [], possibleMeasures: [], requiredDocuments: [], relatedQuestions: ['Qual é a jurisdição desta inspeção?', 'A norma regional está instalada?', 'Quais normas nacionais estão disponíveis?'], citations: [], warnings: ['Localização não substitui análise normativa.', 'Norma regional não disponível neste dispositivo.'], insufficientEvidence: true, clarification: null, generatedAt: now.toISOString(), corpusVersion: COMPASS_CORPUS_VERSION, sourceVersions: [], locationAssessment: { confirmedLocation: hasConfirmedLocation, jurisdictionId: jurisdiction || null, regionalRuleStatus: interpretedContext.regionalRuleStatus || 'UNAVAILABLE' }, debug: { reason: 'regional-source-unavailable', ruleIds: [] } };
  }
  const followUp = clarification(interpretedContext);
  if (followUp) return { question, interpretedContext, interpretedIntent, answer: 'Preciso de mais informações antes de aplicar a regra ao caso.', verificationSteps: [], possibleViolations: [], possibleMeasures: [], requiredDocuments: [], citations: [], warnings: ['A resposta normativa depende desta informação.'], insufficientEvidence: true, clarification: followUp, generatedAt: now.toISOString(), corpusVersion: COMPASS_CORPUS_VERSION, sourceVersions: [], debug: { reason: 'missing-context' } };
  const ruleIds = buildRuleSelection(interpretedContext);
  const retrieval = retrieveNormativeChunks({ chunks, query: question, ruleIds });
  const citations = ruleIds.length ? validateCitations(retrieval.results.filter((item) => ruleIds.includes(item.ruleId))) : [];
  const answer = ruleIds.length && citations.length ? directAnswer(interpretedContext) : INSUFFICIENT_COMPASS_ANSWER;
  const insufficientEvidence = answer === INSUFFICIENT_COMPASS_ANSWER;
  const answerHash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, JSON.stringify({ question: normalizeCompassText(question), answer, chunkIds: citations.map((item) => item.chunkId) }));
  const possibleViolations = citations.filter((item) => item.sourceId === 'decreto-2596').map((item) => `${item.title} · ${item.section}`);
  const possibleMeasures = citations.filter((item) => item.sourceId === 'normam-301').map((item) => `${item.title} · item ${item.section}`);
  const verificationSteps = interpretedContext.driverStatus ? ['Confirmar identidade e habilitação do condutor.', 'Confirmar validade e categoria do documento.', 'Confirmar a situação operacional da embarcação.', 'Verificar se outro condutor habilitado foi apresentado.'] : interpretedContext.vesselDocumentStatus ? ['Confirmar se a embarcação está inscrita ou registrada.', 'Distinguir inexistência do registro de simples ausência do documento a bordo.', 'Confirmar a situação operacional e eventual navegação anterior.'] : ['Identificar o fato concreto.', 'Confirmar a situação operacional.', 'Localizar a regra específica antes de analisar medida.'];
  const requiredDocuments = interpretedContext.driverStatus || interpretedContext.vesselDocumentStatus ? ['Auto de Infração, quando confirmado o enquadramento pelo Inspetor.', ...(interpretedContext.driverStatus === 'UNLICENSED' ? ['Auto de Apreensão, Tipo de Lacre e Termo de Fiel Depositário, quando a apreensão for confirmada.'] : [])] : [];
  const relatedQuestions = interpretedContext.driverStatus ? ['E se a embarcação estivesse atracada?', 'Qual documento está relacionado?', 'Quando a medida pode ser suspensa?'] : interpretedContext.vesselDocumentStatus ? ['Qual a diferença entre não portar e não possuir TIE?', 'E se a embarcação estivesse navegando?', 'Qual enquadramento foi localizado?'] : [];
  return { queryId: `consulta-${now.getTime()}`, question, interpretedContext, interpretedIntent, answer, verificationSteps: insufficientEvidence ? [] : verificationSteps, possibleViolations: insufficientEvidence ? [] : possibleViolations, possibleMeasures: insufficientEvidence ? [] : possibleMeasures, requiredDocuments: insufficientEvidence ? [] : requiredDocuments, relatedQuestions: insufficientEvidence ? [] : relatedQuestions.slice(0, 3), citations, warnings: ['Confirme os fatos e a publicação aplicável antes de adotar qualquer medida.'], insufficientEvidence, clarification: null, generatedAt: now.toISOString(), corpusVersion: COMPASS_CORPUS_VERSION, sourceVersions: [...new Set(citations.map((item) => `${item.sourceId}:${item.sourceVersion}`))], answerHash, debug: { ...retrieval.debug, ruleIds } };
};

export const simulateCompassScenario = ({ question, inspection, operationalState }) => answerNormativeCompass({ question, inspection, contextOverrides: { operationalState } });
