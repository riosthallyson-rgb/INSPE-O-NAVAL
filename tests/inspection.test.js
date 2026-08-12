import {
  countPendingItems,
  createChecklistItems,
  getInspectionStatus,
  getStatusLabel,
  migrateInspectionHistory,
  migrateInspectionRecord,
} from '../src/domain/inspection';

const templates = [
  {
    type: 'Lancha',
    items: [{ text: 'Colete', reference: 'Referência pendente de validação' }],
  },
];

describe('regras da inspeção', () => {
  test('cria checklist com estado inicial pendente', () => {
    expect(createChecklistItems(templates, 'Lancha')).toEqual([
      {
        id: 'Lancha-0',
        text: 'Colete',
        reference: 'Referência pendente de validação',
        status: 'pendente',
        notes: '',
      },
    ]);
  });

  test('mantém inspeção em andamento enquanto houver pendências', () => {
    const items = [{ status: 'conforme' }, { status: 'pendente' }];
    expect(countPendingItems(items)).toBe(1);
    expect(getInspectionStatus(items)).toBe('Em andamento');
  });

  test('não conformidade prevalece no resultado', () => {
    expect(getInspectionStatus([{ status: 'conforme' }, { status: 'nao conforme' }])).toBe(
      'Não conforme'
    );
  });

  test('conclui como conforme quando todos os itens foram avaliados', () => {
    expect(getInspectionStatus([{ status: 'conforme' }, { status: 'nao se aplica' }])).toBe(
      'Conforme'
    );
  });

  test('traduz o valor persistido para o rótulo exibido', () => {
    expect(getStatusLabel('nao conforme')).toBe('Não conforme');
  });

  test('normaliza uma inspeção antiga com campos ausentes', () => {
    expect(migrateInspectionRecord({ id: 'antiga', vessel: { name: 'Mar Azul' } })).toEqual({
      id: 'antiga',
      vessel: { name: 'Mar Azul', tie: '', armador: '', type: '' },
      checkItems: [],
      nonConformities: [],
      result: 'Em andamento',
    });
  });

  test('migra a terminologia operacional antiga sem alterar outros dados', () => {
    expect(migrateInspectionRecord({ stage: 'Vistoria', action: 'Vistoria' })).toMatchObject({
      stage: 'Inspeção',
      action: 'Inspeção Naval',
    });
  });

  test('descarta entradas inválidas do histórico persistido', () => {
    expect(migrateInspectionHistory([null, 'inválida', { vessel: null }])).toEqual([
      {
        vessel: { name: '', tie: '', armador: '', type: '' },
        checkItems: [],
        nonConformities: [],
        result: 'Em andamento',
      },
    ]);
  });
});
