import appConfig from '../../app.json';
import { emptyInspectorProfile } from './inspector';
import { getStatusLabel } from './inspection';

export const formatDate = (iso) => {
  if (!iso) return '-';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return String(iso);
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

export const getReportStatusPalette = (status) => {
  const normalized = String(status || '').toLowerCase();
  if (normalized === 'conforme') {
    return { background: '#E8F5EE', border: '#197149', text: '#145C3B' };
  }
  if (normalized === 'não conforme' || normalized === 'nao conforme') {
    return { background: '#FDECEA', border: '#B42318', text: '#8F1C13' };
  }
  if (normalized === 'não se aplica' || normalized === 'nao se aplica') {
    return { background: '#EDF1F4', border: '#526675', text: '#3E5261' };
  }
  return { background: '#FFF4DE', border: '#956000', text: '#754A00' };
};

const statusStyle = (status) => {
  const palette = getReportStatusPalette(status);
  return `background:${palette.background};border:1px solid ${palette.border};color:${palette.text};`;
};

const displayReference = (item) =>
  item.referenceStatus === 'verified'
    ? item.reference || '-'
    : 'Base normativa pendente de validação';

export const createReportHtml = (record) => {
  const inspectionDate = formatDate(record.completedAt || record.createdAt);
  const inspector = record.inspector || emptyInspectorProfile;
  const vessel = record.vessel || {};
  const checkItems = Array.isArray(record.checkItems) ? record.checkItems : [];
  const nonConformities = Array.isArray(record.nonConformities) ? record.nonConformities : [];
  const findings = Array.isArray(record.findings) ? record.findings : [];
  const auditLog = Array.isArray(record.auditLog) ? record.auditLog : [];
  const administrativeProcedures = Array.isArray(record.administrativeProcedures) ? record.administrativeProcedures : [];
  const context = record.context || {};
  const driver = record.driver || {};
  const occupancy = record.occupancy || {};
  const recordId = record.id || 'Sem identificador';
  const appVersion = appConfig.expo?.version || 'não informada';
  const result = record.result || 'Em andamento';

  const rows = checkItems
    .map((item, index) => {
      const statusLabel = getStatusLabel(item.status);
      return `
        <tr>
          <td class="index-cell">${index + 1}</td>
          <td><strong>${escapeHtml(item.text || '-')}</strong></td>
          <td><span class="status" style="${statusStyle(statusLabel)}">${escapeHtml(statusLabel)}</span></td>
          <td>${escapeHtml(item.notes || 'Sem observação')}</td>
          <td class="reference-cell">${escapeHtml(displayReference(item))}<br/>Evidências: ${(item.evidence || []).length}</td>
        </tr>`;
    })
    .join('');

  const nonConformityCards = nonConformities.length
    ? nonConformities
        .map(
          (item, index) => {
            const finding = findings.find((entry) => entry.itemId === item.id);
            return `
            <article class="non-conformity">
              <div class="non-conformity-number">${index + 1}</div>
              <div>
                <h3>${escapeHtml(item.text || 'Não conformidade')}</h3>
                <p>${escapeHtml(item.notes || 'Sem observação adicional.')}</p>
                <p><strong>Situação posterior:</strong> ${finding?.status === 'REGULARIZED' ? `Regularizado em ${escapeHtml(formatDate(finding.regularizedAt))}` : 'Não registrada como regularizada'}</p>
                <small>${escapeHtml(displayReference(item))}</small>
              </div>
            </article>`;
          }
        )
        .join('')
    : '<p class="empty-message">Sem não conformidades registradas.</p>';

  const procedureCards = administrativeProcedures.length
    ? administrativeProcedures.map((procedure) => `<article class="non-conformity" style="border-color:#174a7e;background:#f7fafc;"><div class="non-conformity-number" style="background:#174a7e;">${escapeHtml(procedure.type === 'INFRACTION_NOTICE' ? 'AI' : 'NC')}</div><div><h3 style="color:#174a7e;">${escapeHtml(procedure.type === 'INFRACTION_NOTICE' ? 'Auto de Infração' : 'Notificação para Comparecimento')}</h3><p><strong>Estado:</strong> ${escapeHtml(procedure.state)}</p><p><strong>Número oficial:</strong> ${escapeHtml(procedure.officialDocumentNumber || 'Pendente')}</p><small>Fonte: ${escapeHtml(procedure.source?.sourceTitle || procedure.source?.sourceId || '-')} · ${escapeHtml(procedure.source?.section || '-')} · página PDF ${escapeHtml(procedure.source?.page || '-')}</small></div></article>`).join('')
    : '<p class="empty-message">Nenhum procedimento administrativo decorrente registrado.</p>';

  return `<!doctype html>
  <html lang="pt-BR">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Relatório de Inspeção</title>
      <style>
        @page { margin: 18mm 14mm 20mm; }
        * { box-sizing: border-box; }
        body {
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
          color: #102a43;
          background: #ffffff;
          font-size: 12px;
          line-height: 1.45;
        }
        .report-header {
          border: 1px solid #cbd8e2;
          border-top: 6px solid #174a7e;
          border-radius: 10px;
          padding: 18px;
          margin-bottom: 18px;
          background: #f7fafc;
        }
        .eyebrow { color: #526675; font-size: 10px; font-weight: 700; letter-spacing: 1.2px; }
        h1 { margin: 4px 0 14px; color: #174a7e; font-size: 24px; }
        h2 { color: #174a7e; font-size: 15px; margin: 0 0 10px; }
        h3 { color: #8f1c13; font-size: 12px; margin: 0 0 4px; }
        p { margin: 0; }
        .header-grid, .detail-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px 18px;
        }
        .meta-label { color: #526675; display: block; font-size: 10px; margin-bottom: 2px; }
        .meta-value { color: #102a43; font-weight: 700; overflow-wrap: anywhere; }
        .section {
          border: 1px solid #d9e2e8;
          border-radius: 8px;
          padding: 14px;
          margin-bottom: 14px;
          break-inside: avoid;
        }
        .result-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
        .result-badge, .status {
          display: inline-block;
          border-radius: 999px;
          padding: 4px 9px;
          font-size: 10px;
          font-weight: 700;
          white-space: nowrap;
        }
        table { width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 10px; }
        thead { display: table-header-group; }
        tr { break-inside: avoid; }
        th { background: #174a7e; color: #ffffff; padding: 7px 6px; text-align: left; }
        td { border: 1px solid #d9e2e8; padding: 7px 6px; vertical-align: top; overflow-wrap: anywhere; }
        th:nth-child(1), .index-cell { width: 5%; text-align: center; }
        th:nth-child(2) { width: 29%; }
        th:nth-child(3) { width: 16%; }
        th:nth-child(4) { width: 25%; }
        th:nth-child(5) { width: 25%; }
        .reference-cell { color: #754a00; font-size: 9px; }
        .warning {
          padding: 10px 12px;
          margin-bottom: 10px;
          border: 1px solid #956000;
          border-radius: 7px;
          color: #754a00;
          background: #fff4de;
        }
        .non-conformity {
          display: grid;
          grid-template-columns: 26px 1fr;
          gap: 10px;
          padding: 10px;
          margin-bottom: 8px;
          border: 1px solid #b42318;
          border-radius: 7px;
          background: #fdecea;
          break-inside: avoid;
        }
        .non-conformity-number {
          width: 22px;
          height: 22px;
          border-radius: 11px;
          color: #ffffff;
          background: #b42318;
          text-align: center;
          line-height: 22px;
          font-weight: 700;
        }
        .non-conformity small { color: #754a00; display: block; margin-top: 5px; }
        .empty-message { color: #526675; }
        .signature { margin-top: 34px; padding-top: 12px; border-top: 1px solid #526675; width: 260px; text-align: center; }
        .footer {
          margin-top: 20px;
          padding-top: 10px;
          border-top: 1px solid #cbd8e2;
          color: #526675;
          font-size: 9px;
        }
      </style>
    </head>
    <body>
      <header class="report-header">
        <div class="eyebrow">DOCUMENTO DE APOIO</div>
        <h1>Relatório de Inspeção</h1>
        <div class="header-grid">
          <div><span class="meta-label">Identificador</span><span class="meta-value">${escapeHtml(recordId)}</span></div>
          <div><span class="meta-label">Data de conclusão</span><span class="meta-value">${escapeHtml(inspectionDate)}</span></div>
          <div><span class="meta-label">Versão do aplicativo</span><span class="meta-value">${escapeHtml(appVersion)}</span></div>
          <div><span class="meta-label">Fluxo registrado</span><span class="meta-value">${escapeHtml(record.stage || '-')}</span></div>
        </div>
      </header>

      <section class="section">
        <h2>Identificação</h2>
        <div class="detail-grid">
          <div><span class="meta-label">Inspetor</span><span class="meta-value">${escapeHtml(inspector.name || '-')}</span></div>
          <div><span class="meta-label">Posto ou graduação</span><span class="meta-value">${escapeHtml(inspector.rank || '-')}</span></div>
          <div><span class="meta-label">NIP</span><span class="meta-value">${escapeHtml(inspector.nip || '-')}</span></div>
          <div><span class="meta-label">Jurisdição</span><span class="meta-value">${escapeHtml(inspector.jurisdiction || '-')}</span></div>
          <div><span class="meta-label">Embarcação</span><span class="meta-value">${escapeHtml(vessel.name || '-')}</span></div>
          <div><span class="meta-label">TIE</span><span class="meta-value">${escapeHtml(vessel.tie || '-')}</span></div>
          <div><span class="meta-label">Armador ou proprietário</span><span class="meta-value">${escapeHtml(vessel.armador || '-')}</span></div>
          <div><span class="meta-label">Tipo</span><span class="meta-value">${escapeHtml(vessel.type || '-')}</span></div>
          <div><span class="meta-label">Situação operacional</span><span class="meta-value">${escapeHtml(context.vesselOperationalState || '-')}</span></div>
          <div><span class="meta-label">Origem da inspeção</span><span class="meta-value">${escapeHtml(context.operationOrigin || '-')}</span></div>
          <div><span class="meta-label">Local</span><span class="meta-value">${escapeHtml(context.locationDescription || '-')}</span></div>
          <div><span class="meta-label">Coordenadas</span><span class="meta-value">${escapeHtml(context.inspectionLocation?.latitude ?? context.latitude ?? '-')} / ${escapeHtml(context.inspectionLocation?.longitude ?? context.longitude ?? '-')}</span></div>
          <div><span class="meta-label">Precisão GPS</span><span class="meta-value">${context.inspectionLocation?.accuracy != null ? `± ${escapeHtml(context.inspectionLocation.accuracy)} m` : '-'}</span></div>
          <div><span class="meta-label">Método da localização</span><span class="meta-value">${escapeHtml(context.inspectionLocation?.method || '-')}</span></div>
          <div><span class="meta-label">Localização confirmada</span><span class="meta-value">${context.inspectionLocation?.confirmedByUser ? 'Sim' : 'Não'}</span></div>
          <div><span class="meta-label">Jurisdição da inspeção</span><span class="meta-value">${escapeHtml(context.jurisdictionConfirmedByUser ? context.jurisdictionId : '-')}</span></div>
          <div><span class="meta-label">Norma regional utilizada</span><span class="meta-value">${escapeHtml(context.regionalRuleSetId || 'Nenhuma norma regional validada')}</span></div>
          <div><span class="meta-label">Condutor</span><span class="meta-value">${escapeHtml(driver.name || '-')}</span></div>
          <div><span class="meta-label">Habilitação apresentada</span><span class="meta-value">${escapeHtml(driver.documentPresented || '-')}</span></div>
          <div><span class="meta-label">Lotação autorizada</span><span class="meta-value">${escapeHtml(vessel.passengerCapacity || '-')}</span></div>
          <div><span class="meta-label">Pessoas a bordo</span><span class="meta-value">${escapeHtml(occupancy.totalPersons ?? '-')}</span></div>
        </div>
      </section>

      <section class="section">
        <div class="result-row">
          <div>
            <h2>Resultado da inspeção naval</h2>
            <p>${escapeHtml(record.approachNotes || 'Sem observações gerais.')}</p>
          </div>
          <span class="result-badge" style="${statusStyle(result)}">${escapeHtml(result)}</span>
        </div>
      </section>

      <section>
        <h2>Itens avaliados</h2>
        <div class="warning">Referências pendentes não devem fundamentar uma ação sem conferência na publicação vigente.</div>
        <table>
          <thead>
            <tr><th>#</th><th>Item</th><th>Status</th><th>Observação</th><th>Referência</th></tr>
          </thead>
          <tbody>${rows || '<tr><td colspan="5">Nenhum item registrado.</td></tr>'}</tbody>
        </table>
      </section>

      <section class="section" style="margin-top:16px;">
        <h2>Não conformidades</h2>
        ${nonConformityCards}
      </section>

      <section class="section">
        <h2>Procedimentos decorrentes</h2>
        <div class="warning">Rascunhos gerados pelo aplicativo não equivalem a documentos emitidos pela autoridade competente.</div>
        ${procedureCards}
      </section>

      <section class="section">
        <h2>Trilha de alterações</h2>
        ${auditLog.length ? auditLog.map((event) => `<p>${escapeHtml(formatDate(event.occurredAt))} — ${escapeHtml(event.type)}</p>`).join('') : '<p class="empty-message">Nenhum evento disponível.</p>'}
      </section>

      <div class="signature">Assinatura do inspetor</div>
      <footer class="footer">
        Documento de apoio gerado localmente pelo aplicativo Inspetor Naval v${escapeHtml(appVersion)}.
        Confira os dados e as publicações vigentes antes de assinar ou utilizar este relatório.
        Registro: ${escapeHtml(recordId)}.
      </footer>
    </body>
  </html>`;
};
