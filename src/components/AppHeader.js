import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { ErrorBanner } from './ErrorBanner';

export const AppHeader = ({
  darkMode,
  storageError,
  onDismissStorageError,
  onToggleTheme,
  styles,
}) => (
  <>
    {storageError ? (
      <ErrorBanner
        message={storageError}
        onDismiss={onDismissStorageError}
        darkMode={darkMode}
      />
    ) : null}
    <View style={[styles.heroCard, darkMode && styles.heroCardDark]}>
      <View style={styles.heroTopRow}>
        <View style={styles.heroBadge}>
          <Text style={styles.heroBadgeText}>IN</Text>
        </View>
        <TouchableOpacity
          style={[styles.togglePill, darkMode && styles.togglePillDark]}
          onPress={onToggleTheme}
          accessibilityRole="button"
          accessibilityLabel={darkMode ? 'Ativar modo claro' : 'Ativar modo escuro'}
        >
          <Text style={[styles.togglePillText, darkMode && styles.togglePillTextDark]}>
            {darkMode ? 'Modo claro' : 'Modo escuro'}
          </Text>
        </TouchableOpacity>
      </View>
      <Text style={[styles.title, darkMode && styles.titleDark]}>Inspetor Naval</Text>
      <Text style={[styles.subtitle, darkMode && styles.subtitleDark]}>
        Ferramenta de apoio à atividade de Inspeção Naval.
      </Text>
      <View style={styles.heroMetrics}>
        <View style={[styles.metricChip, darkMode && styles.metricChipDark]}>
          <Text style={[styles.metricValue, darkMode && styles.metricValueDark]}>7 PDFs</Text>
          <Text style={[styles.metricLabel, darkMode && styles.metricLabelDark]}>No dispositivo</Text>
        </View>
        <View style={[styles.metricChip, darkMode && styles.metricChipDark]}>
          <Text style={[styles.metricValue, darkMode && styles.metricValueDark]}>Offline</Text>
          <Text style={[styles.metricLabel, darkMode && styles.metricLabelDark]}>Histórico local</Text>
        </View>
      </View>
    </View>
  </>
);
