import { searchOfflineData } from '../src/domain/globalSearch';

describe('busca global offline', () => {
  const history = [{ id: 'i1', vessel: { name: 'Mar Azul', tie: '123', armador: 'João' }, result: 'Conforme', context: { locationDescription: 'Fortaleza' } }];
  const vessels = [{ id: 'v1', name: 'Vento Sul', tie: '987', type: 'Pesca' }];
  const publications = [{ id: 'n301', title: 'NORMAM 301', officialTitle: 'Atividades de Inspeção Naval', summary: 'Fiscalização e inspeção', keywords: ['habilitação'] }];

  test('encontra histórico ignorando acentos e caixa', () => {
    expect(searchOfflineData({ query: 'mar azul', history, vessels, publications })[0]).toMatchObject({ type: 'inspection', id: 'i1' });
  });

  test('pesquisa embarcações e publicações na mesma consulta', () => {
    expect(searchOfflineData({ query: 'pesca', history, vessels, publications })).toEqual(expect.arrayContaining([expect.objectContaining({ type: 'vessel', id: 'v1' })]));
    expect(searchOfflineData({ query: 'habilitacao', history, vessels, publications })).toEqual(expect.arrayContaining([expect.objectContaining({ type: 'publication', id: 'n301' })]));
  });

  test('exige todos os termos e não retorna tudo para consulta vazia', () => {
    expect(searchOfflineData({ query: 'mar 123', history, vessels, publications })).toHaveLength(1);
    expect(searchOfflineData({ query: ' ', history, vessels, publications })).toEqual([]);
  });
});
