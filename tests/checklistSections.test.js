import {
  getOperationalCategory,
  groupChecklistItems,
} from '../src/features/inspections/checklistSections';

describe('agrupamento operacional do checklist', () => {
  test('agrupa itens sem atribuir uma referência normativa', () => {
    const sections = groupChecklistItems([
      { id: '1', text: 'Verificar documentação da embarcação' },
      { id: '2', text: 'Inspecionar coletes salva-vidas' },
      { id: '3', text: 'Avaliar casco e propulsão' },
    ]);

    expect(sections.map((section) => section.title)).toEqual([
      'Documentação e habilitação',
      'Segurança e emergência',
      'Estrutura e operação',
    ]);
    expect(sections.flatMap((section) => section.data).map(({ index }) => index)).toEqual([0, 1, 2]);
  });

  test('respeita uma categoria operacional cadastrada explicitamente', () => {
    expect(getOperationalCategory({ text: 'Item', operationalCategory: 'Operação de convés' })).toBe(
      'Operação de convés'
    );
  });
});
