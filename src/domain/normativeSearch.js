const normalizeText = (text) =>
  String(text ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const splitSentences = (text) =>
  String(text ?? '')
    .replace(/\r\n?/g, '\n')
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

const buildExcerpt = (text, tokens) => {
  const sentences = splitSentences(text);
  const matches = sentences.filter((sentence) =>
    tokens.some((token) => normalizeText(sentence).includes(token))
  );
  if (matches.length) return matches.slice(0, 2).join(' ');

  return String(text ?? '')
    .split(/\n\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)[0] || '';
};

const buildCitationSnippet = (publication, tokens) => {
  const sourceText = publication.content || publication.summary || '';
  const matches = splitSentences(sourceText)
    .map((sentence) => ({
      sentence,
      score: tokens.reduce(
        (sum, token) => sum + (normalizeText(sentence).includes(token) ? 2 : 0),
        0
      ),
    }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score);

  if (matches.length) return matches[0].sentence.replace(/\s+/g, ' ').trim();
  return publication.summary || sourceText.replace(/\s+/g, ' ').trim().slice(0, 220);
};

const typeBoostKeywords = {
  geral: [],
  documentacao: ['documentacao', 'habilitacao', 'tripulacao', 'registro', 'certificacao'],
  seguranca: ['seguranca', 'colete', 'equipamento', 'salvatagem', 'emergencia'],
  inspecao: ['vistoria', 'inspecao', 'checklist', 'nao conforme', 'notificacao'],
  notificacao: ['notificacao', 'infracao', 'autuacao', 'fiscalizacao'],
  operacao: ['despacho', 'operacao', 'passageiros', 'navegacao', 'trafego'],
};

export const searchPublications = (publications, question, filters = {}) => {
  const query = normalizeText(question);
  if (!query) {
    return {
      answer: 'Digite sua dúvida para buscar na base de publicações.',
      summary: [],
      citations: [],
    };
  }

  const selectedDocument = filters.documentId || 'all';
  const questionType = filters.questionType || 'geral';
  const queryTokens = [...new Set(query.split(' ').filter(Boolean))];
  const searchable = publications.filter(
    (publication) =>
      publication.searchable !== false &&
      publication.verificationStatus === 'verified' &&
      Boolean(publication.locator)
  );
  const selected =
    selectedDocument === 'all'
      ? searchable
      : searchable.filter((publication) => publication.id === selectedDocument);
  const boostTokens = [...queryTokens, ...(typeBoostKeywords[questionType] || [])];

  const matches = selected.map((publication) => {
    const normalizedTitle = normalizeText(publication.title);
    const normalizedSource = normalizeText(publication.source);
    const sourceText = publication.content || publication.summary || '';
    const normalizedContent = normalizeText(sourceText);
    const contentTokens = new Set(normalizedContent.split(' ').filter(Boolean));
    const titleTokens = new Set(normalizedTitle.split(' ').filter(Boolean));
    const sourceTokens = new Set(normalizedSource.split(' ').filter(Boolean));
    const keywordHits = (publication.keywords || []).filter((keyword) =>
      boostTokens.some((token) => {
        const normalizedKeyword = normalizeText(keyword);
        return normalizedKeyword.includes(token) || token.includes(normalizedKeyword);
      })
    ).length;

    let score = keywordHits * 2.2;
    boostTokens.forEach((token) => {
      if (contentTokens.has(token)) score += 2.4;
      if (titleTokens.has(token)) score += 3.2;
      if (sourceTokens.has(token)) score += 1.6;
      if (normalizedContent.includes(token)) score += 0.4;
    });

    return {
      publication,
      score,
      excerpt: buildExcerpt(sourceText, boostTokens),
      citationSnippet: buildCitationSnippet(publication, boostTokens),
    };
  });

  const topMatches = matches
    .filter((match) => match.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 3);

  if (!topMatches.length) {
    return {
      answer: 'Não encontrei fundamentação suficiente nas publicações verificadas disponíveis. Consulte os PDFs oficiais.',
      summary: [],
      citations: [],
    };
  }

  const summary = topMatches.map((match) => ({
    id: match.publication.id,
    title: match.publication.title,
    source: match.publication.source,
    detail: match.excerpt,
    edition: match.publication.edition,
    verificationStatus: match.publication.verificationStatus,
    locator: match.publication.locator || null,
  }));
  const citations = topMatches.map((match) => ({
    id: match.publication.id,
    title: match.publication.title,
    source: match.publication.source,
    excerpt: match.citationSnippet,
    edition: match.publication.edition,
    verificationStatus: match.publication.verificationStatus,
    locator: match.publication.locator || null,
  }));

  return {
    answer:
      'Foram localizados materiais relacionados aos termos pesquisados. ' +
      'O resultado organiza textos cadastrados e não constitui orientação normativa. ' +
      'Abra o PDF e confirme o dispositivo aplicável antes de fundamentar uma ação.',
    summary,
    citations,
    requiresPdfConfirmation: citations.some(
      (citation) => citation.verificationStatus !== 'verified' || !citation.locator
    ),
  };
};
