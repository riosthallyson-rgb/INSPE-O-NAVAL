import React from 'react';
import { Text, View } from 'react-native';
import { Button, Card, StatusBadge } from '../../components';
import { isLowAccuracyLocation } from '../../domain/geospatial/inspectionLocation';
import { getTheme } from '../../theme/tokens';
import { InspectionPointMap } from './InspectionPointMap';

export const InspectionLocationCard = ({ inspection, darkMode, isCapturing, onCapture, onConfirmManual, onConfirmJurisdiction, onAskLocationRules }) => {
  const { colors, spacing, typography } = getTheme(darkMode);
  const location = inspection.context.inspectionLocation;
  const latitude = Number(location?.latitude ?? inspection.context.latitude);
  const longitude = Number(location?.longitude ?? inspection.context.longitude);
  const hasCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude) && latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
  const lowAccuracy = isLowAccuracyLocation(location);
  return <Card darkMode={darkMode} variant={lowAccuracy ? 'warning' : 'outlined'}>
    <Text style={[typography.cardTitle, { color: colors.text }]}>Local da inspeção</Text>
    <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>A localização é registrada uma única vez mediante sua ação. Não há rastreamento contínuo.</Text>
    {hasCoordinates ? <View style={{ marginTop: spacing.md }}>
      <Text style={[typography.bodyStrong, { color: colors.text }]}>{latitude.toFixed(6)}, {longitude.toFixed(6)}</Text>
      <Text style={[typography.caption, { color: lowAccuracy ? colors.pending : colors.textMuted, marginTop: spacing.xs }]}>Precisão aproximada: {Number.isFinite(location?.accuracy) ? `± ${Math.round(location.accuracy)} m` : 'não informada'}</Text>
      <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>Data/hora: {location?.capturedAt ? new Date(location.capturedAt).toLocaleString('pt-BR') : 'entrada manual ainda não confirmada'}</Text>
      <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>Jurisdição automática: não determinada</Text>
      {location?.confirmedByUser ? <StatusBadge status="conforme" darkMode={darkMode} /> : null}
      <InspectionPointMap latitude={latitude} longitude={longitude} darkMode={darkMode} />
    </View> : <Text style={[typography.caption, { color: colors.pending, marginTop: spacing.md }]}>Localização ainda não registrada.</Text>}
    <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}><Button label="Atualizar localização" loading={isCapturing} onPress={onCapture} darkMode={darkMode} style={{ flex: 1 }} /><Button label="Confirmar entrada manual" variant="secondary" onPress={onConfirmManual} darkMode={darkMode} style={{ flex: 1 }} /></View>
    {inspection.context.jurisdictionId ? <View style={{ marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border }}><Text style={[typography.bodyStrong, { color: colors.text }]}>Jurisdição informada: {inspection.context.jurisdictionId}</Text><Text style={[typography.caption, { color: inspection.context.regionalRuleStatus === 'AVAILABLE' ? colors.conform : colors.pending, marginTop: spacing.xs }]}>{inspection.context.regionalRuleMessage || 'Confirme a jurisdição para consultar a norma regional.'}</Text><Button label="Confirmar jurisdição" variant="secondary" onPress={onConfirmJurisdiction} darkMode={darkMode} style={{ marginTop: spacing.sm }} /></View> : null}
    <Button label="O que se aplica neste local?" variant="secondary" onPress={onAskLocationRules} darkMode={darkMode} style={{ marginTop: spacing.md }} />
    <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.md }]}>O mapa é uma ferramenta de apoio e não substitui cartas, publicações ou sistemas oficiais aplicáveis à navegação.</Text>
  </Card>;
};
