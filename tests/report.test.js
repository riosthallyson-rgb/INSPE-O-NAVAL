import { createReportHtml, escapeHtml, getReportStatusPalette } from '../src/domain/report';

const inspection = {
  createdAt: '2026-08-08T12:00:00.000Z',
  stage: 'Inspeção',
  result: 'Conforme',
  approachNotes: '<script>risco</script>',
  inspector: { name: 'Ana & Bruno', rank: 'SO', nip: '123', jurisdiction: 'CP' },
  vessel: { name: '<Lancha>', tie: '1', armador: 'Armador', type: 'Lancha' },
  context: { vesselOperationalState: 'Navegando', operationOrigin: 'Rotina', locationDescription: 'Rio', latitude: '-2', longitude: '-41' },
  driver: { name: 'Carlos', documentPresented: 'Sim' },
  occupancy: { totalPersons: 3 },
  checkItems: [{ text: 'Colete', status: 'conforme', notes: '', reference: 'Norma' }],
  nonConformities: [],
  id: 'inspecao-123',
  auditLog: [{ type: 'INSPECTION_CREATED', occurredAt: '2026-08-08T12:00:00.000Z' }],
};

describe('relatório de inspeção', () => {
  test('escapa conteúdo fornecido pelo usuário', () => {
    expect(escapeHtml('<a & b>')).toBe('&lt;a &amp; b&gt;');
    const html = createReportHtml(inspection);
    expect(html).toContain('&lt;Lancha&gt;');
    expect(html).toContain('&lt;script&gt;risco&lt;/script&gt;');
    expect(html).not.toContain('<script>risco</script>');
  });

  test('usa NIP no relatório', () => {
    expect(createReportHtml(inspection)).toContain(
      '<span class="meta-label">NIP</span><span class="meta-value">123</span>'
    );
  });

  test('inclui contexto operacional e trilha de alterações', () => {
    const html = createReportHtml(inspection);
    expect(html).toContain('Navegando');
    expect(html).toContain('Carlos');
    expect(html).toContain('INSPECTION_CREATED');
  });

  test('inclui metadados geográficos confirmados sem depender de mapa online', () => {
    const html = createReportHtml({ ...inspection, context: { ...inspection.context, inspectionLocation: { latitude: -2.9053, longitude: -41.7764, accuracy: 8, method: 'GPS', confirmedByUser: true }, jurisdictionId: 'CPPI', jurisdictionConfirmedByUser: true, regionalRuleSetId: null } });
    expect(html).toContain('-2.9053 / -41.7764');
    expect(html).toContain('± 8 m');
    expect(html).toContain('>GPS</span>');
    expect(html).toContain('>CPPI</span>');
    expect(html).toContain('Nenhuma norma regional validada');
  });

  test('inclui procedimentos decorrentes sem tratar rascunho como emissão', () => {
    const html = createReportHtml({ ...inspection, administrativeProcedures: [{ type: 'INFRACTION_NOTICE', state: 'SUGGESTED', officialDocumentNumber: '', source: { sourceId: 'normam-301', sourceTitle: 'NORMAM-301/DPC', section: '3.6.1', page: 28 } }] });
    expect(html).toContain('Procedimentos decorrentes');
    expect(html).toContain('Número oficial:</strong> Pendente');
    expect(html).toContain('não equivalem a documentos emitidos');
  });

  test('não apresenta referência pendente como fundamento validado', () => {
    const html = createReportHtml(inspection);
    expect(html).toContain('Base normativa pendente de validação');
    expect(html).not.toContain('>Norma</td>');
  });

  test('mantém no relatório uma referência explicitamente validada', () => {
    const verifiedInspection = {
      ...inspection,
      checkItems: [{ ...inspection.checkItems[0], referenceStatus: 'verified' }],
    };
    expect(createReportHtml(verifiedInspection)).toContain('>Norma<br/>Evidências: 0</td>');
  });

  test('inclui identificador, versão e classificação de documento de apoio', () => {
    const html = createReportHtml(inspection);
    expect(html).toContain('DOCUMENTO DE APOIO');
    expect(html).toContain('inspecao-123');
    expect(html).toContain('Versão do aplicativo');
    expect(html).toContain('Inspetor Naval v1.0.0');
  });

  test('usa paleta semântica fixa sem depender apenas do texto', () => {
    expect(getReportStatusPalette('Conforme').border).toBe('#197149');
    expect(getReportStatusPalette('Não conforme').border).toBe('#B42318');
    expect(getReportStatusPalette('Pendente').border).toBe('#956000');
  });
});
