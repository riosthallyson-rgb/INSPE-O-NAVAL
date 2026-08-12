import React from 'react';
import { Text, View } from 'react-native';
import { getTheme } from '../theme/tokens';

const statusLabels = {
  conforme: 'Conforme',
  'nao conforme': 'Não conforme',
  pendente: 'Pendente',
  'nao se aplica': 'Não se aplica',
  'em andamento': 'Em andamento',
  verificado: 'Conteúdo verificado',
  'validacao pendente': 'Validação pendente',
  'ia fundamentada': 'IA fundamentada',
  'pesquisa local': 'Pesquisa local',
  válido: 'Válido',
  'vence em breve': 'Vence em breve',
  vencido: 'Vencido',
  incompleto: 'Incompleto',
  'data inválida': 'Data inválida',
  regularizado: 'Regularizado no local',
};

export const StatusBadge = ({ status, darkMode = false }) => {
  const { colors, radii, spacing, typography } = getTheme(darkMode);
  const normalizedStatus = String(status || '').toLowerCase();
  const colorByStatus = {
    conforme: colors.conform,
    'nao conforme': colors.nonConform,
    pendente: colors.pending,
    'nao se aplica': colors.notApplicable,
    'em andamento': colors.pending,
    verificado: colors.conform,
    'validacao pendente': colors.pending,
    'ia fundamentada': colors.conform,
    'pesquisa local': colors.notApplicable,
    válido: colors.conform,
    'vence em breve': colors.pending,
    vencido: colors.nonConform,
    incompleto: colors.pending,
    'data inválida': colors.nonConform,
    regularizado: colors.conform,
  };
  const color = colorByStatus[normalizedStatus] || colors.textMuted;
  const label = statusLabels[normalizedStatus] || status || 'Sem status';

  return (
    <View
      style={{
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        minHeight: 32,
        borderRadius: radii.pill,
        borderWidth: 1,
        borderColor: color,
      }}
      accessibilityLabel={`Status: ${label}`}
    >
      <View
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          marginRight: spacing.sm,
          backgroundColor: color,
        }}
      />
      <Text style={[typography.label, { color }]}>{label}</Text>
    </View>
  );
};
