import { searchPublications } from '../src/domain/normativeSearch';

const publications = [
  {
    id: 'norma-a',
    title: 'Norma A',
    source: 'norma-a.pdf',
    content: 'O colete deve ser verificado antes da saída.',
    verificationStatus: 'verified',
    locator: 'Seção 1, p. 2',
    keywords: ['colete', 'segurança'],
    searchable: true,
  },
];

describe('Bússola', () => {
  test('não pesquisa uma pergunta vazia', () => {
    expect(searchPublications(publications, '   ')).toEqual({
      answer: 'Digite sua dúvida para buscar na base de publicações.',
      summary: [],
      citations: [],
    });
  });

  test('retorna a publicação com termos correspondentes', () => {
    const result = searchPublications(publications, 'Como verificar o colete?');
    expect(result.summary[0].title).toBe('Norma A');
    expect(result.citations[0].source).toBe('norma-a.pdf');
    expect(result.answer).toContain('não constitui orientação normativa');
    expect(result.requiresPdfConfirmation).toBe(false);
  });

  test('só dispensa a confirmação quando a referência possui localização validada', () => {
    const result = searchPublications(publications, 'colete');

    expect(result.requiresPdfConfirmation).toBe(false);
    expect(result.citations[0].locator).toBe('Seção 1, p. 2');
  });

  test('não usa publicação pendente como fundamento', () => {
    const pending = [{ ...publications[0], verificationStatus: 'pending', locator: null }];
    const result = searchPublications(pending, 'colete');
    expect(result.summary).toEqual([]);
    expect(result.answer).toContain('Não encontrei fundamentação suficiente');
  });

  test('informa quando não há correspondência', () => {
    const result = searchPublications(publications, 'radar meteorológico');
    expect(result.summary).toEqual([]);
  });
});
