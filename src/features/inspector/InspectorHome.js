import React from 'react';
import { Text, TextInput, View } from 'react-native';
import { Button, Card, SectionHeader } from '../../components';
import { formatNipForDisplay } from '../../domain/inspector';
import { getTheme } from '../../theme/tokens';

const ProfileField = ({ label, darkMode, ...props }) => {
  const { colors, radii, spacing, typography } = getTheme(darkMode);
  return (
    <View style={{ marginBottom: spacing.md }}>
      <Text style={[typography.caption, { color: colors.textMuted, marginBottom: spacing.xs }]}>{label}</Text>
      <TextInput
        {...props}
        placeholderTextColor={colors.textMuted}
        style={[
          typography.body,
          {
            minHeight: 48,
            paddingHorizontal: spacing.md,
            borderRadius: radii.control,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.surfaceElevated,
            color: colors.text,
          },
        ]}
      />
    </View>
  );
};

const ProfileValue = ({ label, value, darkMode, sensitive = false }) => {
  const { colors, spacing, typography } = getTheme(darkMode);
  return (
    <View style={{ marginBottom: spacing.md }}>
      <Text style={[typography.caption, { color: colors.textMuted }]}>{label}</Text>
      <Text
        style={[typography.bodyStrong, { color: colors.text, marginTop: spacing.xs }]}
        accessibilityLabel={`${label}: ${sensitive ? 'dado protegido' : value || 'não informado'}`}
      >
        {value || 'Não informado'}
      </Text>
    </View>
  );
};

export const InspectorHome = ({
  inspectorProfile,
  profileForm,
  isEditingProfile,
  isDarkMode,
  isSavingProfile,
  profileFeedback,
  onChangeProfile,
  onEditProfile,
  onSaveProfile,
  currentInspection,
  onContinueInspection,
  onNewInspection,
}) => {
  const { colors, spacing, typography } = getTheme(isDarkMode);
  const editing = !inspectorProfile.name || isEditingProfile;

  return (
    <View style={{ marginBottom: spacing.xl }}>
      <SectionHeader title="Painel operacional" description="Ferramenta de apoio à atividade de Inspeção Naval." darkMode={isDarkMode} />
      {currentInspection ? (
        <Card darkMode={isDarkMode} variant="elevated">
          <Text style={[typography.label, { color: colors.pending }]}>INSPEÇÃO NÃO CONCLUÍDA</Text>
          <Text style={[typography.sectionTitle, { color: colors.text, marginTop: spacing.xs }]}>{currentInspection.vessel?.name || 'Embarcação ainda não identificada'}</Text>
          <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>Etapa {currentInspection.currentStep || 1} de 10 · última alteração {new Date(currentInspection.updatedAt || currentInspection.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</Text>
          <Button label="Continuar inspeção" onPress={onContinueInspection} darkMode={isDarkMode} style={{ marginTop: spacing.lg }} />
        </Card>
      ) : (
        <Button label="Nova Inspeção Naval" onPress={onNewInspection} darkMode={isDarkMode} style={{ marginBottom: spacing.xl }} />
      )}
      <SectionHeader
        title="Perfil"
        description="Dados usados para identificar o inspetor nos registros e relatórios."
        darkMode={isDarkMode}
      />
      {profileFeedback ? (
        <Card darkMode={isDarkMode} variant="outlined" accessibilityRole="alert">
          <Text style={[typography.bodyStrong, { color: colors.conform }]} accessibilityLiveRegion="polite">
            {profileFeedback}
          </Text>
        </Card>
      ) : null}
      {editing ? (
        <Card darkMode={isDarkMode} variant="elevated">
          <Text style={[typography.cardTitle, { color: colors.text, marginBottom: spacing.lg }]}>Editar dados do inspetor</Text>
          <ProfileField label="Nome" darkMode={isDarkMode} value={profileForm.name} onChangeText={(name) => onChangeProfile({ ...profileForm, name })} accessibilityLabel="Nome do inspetor" />
          <ProfileField label="Posto ou graduação" darkMode={isDarkMode} value={profileForm.rank} onChangeText={(rank) => onChangeProfile({ ...profileForm, rank })} accessibilityLabel="Posto ou graduação" />
          <ProfileField label="NIP" darkMode={isDarkMode} value={profileForm.nip} onChangeText={(nip) => onChangeProfile({ ...profileForm, nip })} accessibilityLabel="NIP do inspetor" keyboardType="number-pad" />
          <ProfileField label="Capitania ou jurisdição" darkMode={isDarkMode} value={profileForm.jurisdiction} onChangeText={(jurisdiction) => onChangeProfile({ ...profileForm, jurisdiction })} accessibilityLabel="Capitania ou jurisdição" />
          <Button label="Salvar no dispositivo" onPress={onSaveProfile} darkMode={isDarkMode} loading={isSavingProfile} />
        </Card>
      ) : (
        <Card darkMode={isDarkMode} variant="outlined" accessibilityRole="summary">
          <Text style={[typography.cardTitle, { color: colors.text, marginBottom: spacing.lg }]}>Dados atuais</Text>
          <ProfileValue label="Nome" value={inspectorProfile.name} darkMode={isDarkMode} />
          <ProfileValue label="Posto ou graduação" value={inspectorProfile.rank} darkMode={isDarkMode} />
          <ProfileValue label="NIP" value={formatNipForDisplay(inspectorProfile.nip)} darkMode={isDarkMode} sensitive />
          <ProfileValue label="Capitania ou jurisdição" value={inspectorProfile.jurisdiction} darkMode={isDarkMode} />
          <Button label="Editar dados" variant="secondary" onPress={onEditProfile} darkMode={isDarkMode} />
        </Card>
      )}
      <Card darkMode={isDarkMode} variant="outlined">
        <Text style={[typography.cardTitle, { color: colors.text }]}>Armazenamento local</Text>
        <Text style={[typography.body, { color: colors.textMuted, marginTop: spacing.sm }]}>Perfil, rascunhos e histórico permanecem neste dispositivo e funcionam sem conexão.</Text>
      </Card>
    </View>
  );
};
