import React from 'react';
import { Text, View } from 'react-native';
import { Button, Card, SectionHeader, StatusBadge } from '../../components';
import { evaluateAdministrativeProcedure } from '../../legal/engines/administrativeProcedureEngine';
import { getTheme } from '../../theme/tokens';

const stateLabels = { SUGGESTED: 'Sugerido', CONFIRMED: 'Confirmado', DRAFT: 'Rascunho', READY_FOR_REVIEW: 'Aguardando revisão', ISSUED: 'Emitido pelo usuário', CANCELLED: 'Cancelado', COMPLETED: 'Encerrado' };

export const ProcedureCenter = ({ inspection, darkMode, onPrepare }) => {
  const { colors, spacing, typography } = getTheme(darkMode);
  const analyses = inspection.findings.map((finding) => ({ finding, result: evaluateAdministrativeProcedure({ finding }) }));
  const suggestions = analyses.flatMap(({ finding, result }) => result.suggestions.map((suggestion) => ({ finding, suggestion })));
  const procedures = inspection.administrativeProcedures || [];
  return <View style={{ marginTop: spacing.xl }}>
    <SectionHeader title="Centro de Procedimentos" description="Organize medidas e documentos decorrentes somente depois da confirmação do enquadramento." darkMode={darkMode} />
    <Card darkMode={darkMode} variant="warning"><Text style={[typography.bodyStrong, { color: colors.pending }]}>Ferramenta de apoio</Text><Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>Preparar um rascunho não emite ato administrativo. Avaliação, confirmação, assinatura e adoção da medida permanecem humanas.</Text></Card>
    {procedures.map((procedure) => <Card key={procedure.id} darkMode={darkMode} variant="outlined"><Text style={[typography.bodyStrong, { color: colors.text }]}>{procedure.type === 'INFRACTION_NOTICE' ? 'Auto de Infração' : 'Notificação para Comparecimento'}</Text><StatusBadge status={procedure.state === 'DRAFT' ? 'pendente' : 'validacao pendente'} darkMode={darkMode} /><Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.sm }]}>Estado: {stateLabels[procedure.state] || procedure.state} · número oficial: Pendente</Text><Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>Fonte: {procedure.source.sourceTitle || procedure.source.sourceId}, {procedure.source.section}, página PDF {procedure.source.page}</Text></Card>)}
    {suggestions.map(({ finding, suggestion }) => {
      const exists = procedures.some((procedure) => procedure.findingId === finding.id && procedure.type === suggestion.type && procedure.state !== 'CANCELLED');
      return <Card key={`${finding.id}-${suggestion.type}`} darkMode={darkMode} variant="outlined"><Text style={[typography.label, { color: colors.action }]}>SUGESTÃO DO MOTOR NORMATIVO</Text><Text style={[typography.bodyStrong, { color: colors.text, marginTop: spacing.xs }]}>{suggestion.label}</Text><Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.sm }]}>{suggestion.reason}</Text><Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>Roteamento: NORMAM-301/DPC, item {suggestion.source.section}, página PDF {suggestion.source.page}.</Text><Button label={exists ? 'Procedimento já iniciado' : 'Preparar rascunho'} disabled={exists} onPress={() => onPrepare(finding, suggestion)} darkMode={darkMode} style={{ marginTop: spacing.md }} /></Card>;
    })}
    {!suggestions.length && !procedures.length ? <Card darkMode={darkMode} variant="outlined"><Text style={[typography.body, { color: colors.textMuted }]}>{inspection.findings.length ? 'Nenhum procedimento sugerido: os achados ainda não possuem enquadramento confirmado com fonte completa.' : 'Nenhuma não conformidade foi registrada nesta inspeção.'}</Text></Card> : null}
  </View>;
};

