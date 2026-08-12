import React, { useState } from 'react';
import { Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Button, Card, SectionHeader, StatusBadge } from '../../components';
import { INSPECTION_STEPS, validateVesselDocument } from '../../domain/inspection/inspectionModel';
import { getTheme } from '../../theme/tokens';
import { ProcedureCenter } from '../procedures/ProcedureCenter';
import { DocumentReviewPanel } from '../documents/DocumentReviewPanel';
import { getConfirmedDocumentValues } from '../../domain/documents/documentEvidence';
import { compareVesselDocument } from '../../domain/documents/vesselDocumentConsistencyEngine';
import { InspectionLocationCard } from '../map/InspectionLocationCard';
import { QrDocumentCamera } from '../documents/QrDocumentCamera';

const operationalStates = ['Navegando', 'Atracada', 'Fundeada', 'Na boia', 'Em terra', 'Outro'];
const operationOrigins = ['Fiscalização de rotina', 'Abordagem em operação', 'Denúncia', 'Operação especial', 'Fiscalização programada', 'Verificação posterior', 'Outro'];
const vesselUses = ['Esporte e recreio', 'Moto aquática', 'Transporte de passageiros', 'Transporte de carga', 'Pesca', 'Apoio', 'Rebocador', 'Navio mercante', 'Plataforma', 'Outro'];
const navigationAreas = ['Interior', 'Mar aberto', 'Ainda não identificado'];
const itemStatuses = [
  ['conforme', 'Conforme'],
  ['nao conforme', 'Não conforme'],
  ['nao se aplica', 'Não se aplica'],
  ['nao verificado', 'Não verificado'],
];
const documentStatuses = ['Apresentado e válido', 'Possível irregularidade', 'Não apresentado', 'Não possui', 'Não se aplica', 'Não foi possível confirmar'];

const Field = ({ label, darkMode, multiline = false, style, ...props }) => {
  const { colors, radii, spacing, typography } = getTheme(darkMode);
  return (
    <View style={[{ marginBottom: spacing.md }, style]}>
      <Text style={[typography.caption, { color: colors.textMuted, marginBottom: spacing.xs }]}>{label}</Text>
      <TextInput
        {...props}
        multiline={multiline}
        placeholderTextColor={colors.textMuted}
        style={[typography.body, { minHeight: multiline ? 92 : 48, padding: spacing.md, borderRadius: radii.control, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceElevated, color: colors.text, textAlignVertical: multiline ? 'top' : 'center' }]}
      />
    </View>
  );
};

const ChoiceGroup = ({ label, options, value, darkMode, onChange }) => {
  const { colors, radii, spacing, typography } = getTheme(darkMode);
  return (
    <View style={{ marginBottom: spacing.lg }} accessibilityRole="radiogroup">
      <Text style={[typography.bodyStrong, { color: colors.text, marginBottom: spacing.sm }]}>{label}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        {options.map((option) => {
          const selected = value === option;
          return (
            <Pressable key={option} onPress={() => onChange(option)} accessibilityRole="radio" accessibilityState={{ selected }} style={{ minHeight: 48, justifyContent: 'center', paddingHorizontal: spacing.md, borderRadius: radii.control, borderWidth: selected ? 2 : 1, borderColor: selected ? colors.action : colors.border, backgroundColor: selected ? colors.infoSurface : colors.surfaceElevated }}>
              <Text style={[typography.caption, { color: selected ? colors.primary : colors.textMuted }]}>{option}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const StepHeader = ({ inspection, darkMode }) => {
  const { colors, radii, spacing, typography } = getTheme(darkMode);
  const progress = inspection.currentStep / INSPECTION_STEPS.length;
  return (
    <Card darkMode={darkMode} variant="elevated" accessibilityRole="summary">
      <Text style={[typography.label, { color: colors.action }]}>ETAPA {inspection.currentStep} DE {INSPECTION_STEPS.length}</Text>
      <Text style={[typography.sectionTitle, { color: colors.text, marginTop: spacing.xs }]}>{INSPECTION_STEPS[inspection.currentStep - 1]}</Text>
      <View style={{ height: 8, backgroundColor: colors.border, borderRadius: radii.pill, overflow: 'hidden', marginTop: spacing.md }}>
        <View style={{ width: `${Math.round(progress * 100)}%`, height: '100%', backgroundColor: colors.action }} />
      </View>
      {inspection.vessel.name ? <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.sm }]}>{inspection.vessel.name} · {inspection.context.vesselOperationalState || 'Situação não informada'} · {Math.round(progress * 100)}%</Text> : null}
    </Card>
  );
};

const ScenarioStep = ({ inspection, darkMode, updateSection, isCapturingLocation, onCaptureLocation, onConfirmManualLocation, onConfirmJurisdiction, onAskLocationRules }) => (
  <>
    <ChoiceGroup label="Situação da embarcação" options={operationalStates} value={inspection.context.vesselOperationalState} darkMode={darkMode} onChange={(vesselOperationalState) => updateSection('context', { vesselOperationalState })} />
    <ChoiceGroup label="Origem da inspeção" options={operationOrigins} value={inspection.context.operationOrigin} darkMode={darkMode} onChange={(operationOrigin) => updateSection('context', { operationOrigin })} />
    <Field label="Descrição do local" value={inspection.context.locationDescription} onChangeText={(locationDescription) => updateSection('context', { locationDescription })} darkMode={darkMode} placeholder="Rio, porto ou ponto de referência" />
    <Field label="Jurisdição informada (CP/DL/AG)" value={inspection.context.jurisdictionId || ''} onChangeText={(jurisdictionId) => updateSection('context', { jurisdictionId, jurisdictionConfirmedByUser: false, regionalRuleStatus: '' })} darkMode={darkMode} placeholder="Ex.: CPPI" autoCapitalize="characters" />
    <ChoiceGroup label="Associar localização confirmada às novas evidências?" options={['Sim', 'Não']} value={inspection.context.attachLocationToEvidence ? 'Sim' : 'Não'} darkMode={darkMode} onChange={(value) => updateSection('context', { attachLocationToEvidence: value === 'Sim' })} />
    <View style={{ flexDirection: 'row', gap: 8 }}>
      <Field style={{ flex: 1 }} label="Latitude" value={inspection.context.latitude} onChangeText={(latitude) => updateSection('context', { latitude })} darkMode={darkMode} keyboardType="numbers-and-punctuation" />
      <Field style={{ flex: 1 }} label="Longitude" value={inspection.context.longitude} onChangeText={(longitude) => updateSection('context', { longitude })} darkMode={darkMode} keyboardType="numbers-and-punctuation" />
    </View>
    <InspectionLocationCard inspection={inspection} darkMode={darkMode} isCapturing={isCapturingLocation} onCapture={onCaptureLocation} onConfirmManual={onConfirmManualLocation} onConfirmJurisdiction={onConfirmJurisdiction} onAskLocationRules={onAskLocationRules} />
  </>
);

const VesselStep = ({ inspection, darkMode, updateSection, vesselProfiles, onSelectVesselProfile, onCaptureTiePhoto, onSelectTiePhoto, onImportDocumentPdf, onReadDocumentQr, onChangeDocumentEvidence, onApplyConfirmedDocument, onRecalculateDocumentChecklist, onConfirmDocumentDivergence, isPickingTiePhoto }) => {
  const { colors, spacing, typography } = getTheme(darkMode);
  const vessel = inspection.vessel;
  const [qrCameraOpen, setQrCameraOpen] = useState(false);
  const divergences = vessel.documentEvidence ? compareVesselDocument({ confirmedDocumentValues: getConfirmedDocumentValues(vessel.documentEvidence), vessel, occupancy: inspection.occupancy }).filter((item) => !(vessel.documentEvidence.confirmedDivergences || []).some((confirmed) => confirmed.field === item.field)) : [];
  const update = (patch) => updateSection('vessel', patch);
  return (
    <>
      {vesselProfiles.length ? <><SectionHeader title="Embarcações salvas" description="Use um cadastro anterior como ponto de partida e confirme os dados observados." darkMode={darkMode} /><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm, paddingBottom: spacing.md }}>{vesselProfiles.map((profile) => <Pressable key={profile.id || `${profile.tie}-${profile.name}`} onPress={() => onSelectVesselProfile(profile)} style={{ minWidth: 184, padding: spacing.md, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceElevated }}><Text style={[typography.bodyStrong, { color: colors.text }]}>{profile.name}</Text><Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>{profile.tie || 'Inscrição não informada'}</Text></Pressable>)}</ScrollView></> : null}
      <Field label="Nome da embarcação" value={vessel.name} onChangeText={(name) => update({ name })} darkMode={darkMode} />
      <Field label="Número de inscrição" value={vessel.tie} onChangeText={(tie) => update({ tie })} darkMode={darkMode} />
      <ChoiceGroup label="Documento" options={['TIE', 'TIEM', 'PRPM', 'Outro']} value={vessel.documentType} onChange={(documentType) => update({ documentType })} darkMode={darkMode} />
      <Field label="Porto de inscrição" value={vessel.registrationPort} onChangeText={(registrationPort) => update({ registrationPort })} darkMode={darkMode} />
      <Field label="Proprietário" value={vessel.owner} onChangeText={(owner) => update({ owner })} darkMode={darkMode} />
      <Field label="Armador, se aplicável" value={vessel.armador} onChangeText={(armador) => update({ armador })} darkMode={darkMode} />
      <Field label="CPF/CNPJ" value={vessel.taxId} onChangeText={(taxId) => update({ taxId })} darkMode={darkMode} keyboardType="number-pad" />
      <ChoiceGroup label="Emprego principal" options={vesselUses} value={vessel.vesselUse} onChange={(vesselUse) => update({ vesselUse })} darkMode={darkMode} />
      <ChoiceGroup label="Navegação" options={navigationAreas} value={vessel.navigationArea} onChange={(navigationArea) => update({ navigationArea })} darkMode={darkMode} />
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Field style={{ flex: 1 }} label="Comprimento (m)" value={vessel.lengthMeters} onChangeText={(lengthMeters) => update({ lengthMeters })} darkMode={darkMode} keyboardType="decimal-pad" />
        <Field style={{ flex: 1 }} label="AB" value={vessel.grossTonnage} onChangeText={(grossTonnage) => update({ grossTonnage })} darkMode={darkMode} keyboardType="decimal-pad" />
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Field style={{ flex: 1 }} label="Ano" value={vessel.year} onChangeText={(year) => update({ year })} darkMode={darkMode} keyboardType="number-pad" />
        <Field style={{ flex: 1 }} label="Número de motores" value={vessel.engineCount} onChangeText={(engineCount) => update({ engineCount })} darkMode={darkMode} keyboardType="number-pad" />
      </View>
      <Field label="Material do casco" value={vessel.hullMaterial} onChangeText={(hullMaterial) => update({ hullMaterial })} darkMode={darkMode} />
      <Field label="Potência" value={vessel.enginePower} onChangeText={(enginePower) => update({ enginePower })} darkMode={darkMode} />
      <Field label="Propulsão" value={vessel.propulsion} onChangeText={(propulsion) => update({ propulsion })} darkMode={darkMode} />
      <Field label="Lotação autorizada" value={vessel.passengerCapacity} onChangeText={(passengerCapacity) => update({ passengerCapacity })} darkMode={darkMode} keyboardType="number-pad" />
      <Field label="Atividade observada" value={vessel.observedActivity} onChangeText={(observedActivity) => update({ observedActivity })} darkMode={darkMode} />
      <SectionHeader title="Imagem do documento" description="A imagem auxilia a conferência, mas não substitui a verificação do documento original." darkMode={darkMode} />
      <Card darkMode={darkMode} variant="outlined"><Text style={[typography.cardTitle, { color: colors.text }]}>Identificar embarcação</Text><Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>Posicione todo o documento dentro da moldura. A captura preserva a imagem original e não confirma autenticidade.</Text><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md }}><Button label="Escanear documento" variant="secondary" loading={isPickingTiePhoto} onPress={onCaptureTiePhoto} darkMode={darkMode} style={{ width: '48%' }} /><Button label="Importar foto" variant="secondary" disabled={isPickingTiePhoto} onPress={onSelectTiePhoto} darkMode={darkMode} style={{ width: '48%' }} /><Button label="Importar PDF" variant="secondary" disabled={isPickingTiePhoto} onPress={onImportDocumentPdf} darkMode={darkMode} style={{ width: '48%' }} /><Button label="Ler QR Code" variant="secondary" disabled={!vessel.documentEvidence} onPress={onReadDocumentQr} darkMode={darkMode} style={{ width: '48%' }} /></View></Card>
      <Button label="Ler QR ao vivo" variant="secondary" onPress={() => setQrCameraOpen(true)} darkMode={darkMode} style={{ marginBottom: spacing.md }} />
      <QrDocumentCamera visible={qrCameraOpen} darkMode={darkMode} onClose={() => setQrCameraOpen(false)} onScanned={(scan) => { setQrCameraOpen(false); onReadDocumentQr(scan); }} />
      {vessel.documentPhotoUri ? <Image source={{ uri: vessel.documentPhotoUri }} accessibilityLabel="Imagem original do documento da embarcação" resizeMode="contain" style={{ width: '100%', height: 210, borderRadius: 12, marginBottom: spacing.md, backgroundColor: colors.surfaceElevated }} /> : null}
      {vessel.documentEvidence ? <Card darkMode={darkMode} variant="outlined"><Text style={[typography.bodyStrong, { color: colors.text }]}>Documento detectado</Text><Text style={[typography.caption, { color: colors.conform, marginTop: spacing.xs }]}>Arquivo original preservado · integridade SHA-256 registrada</Text><Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>Dados extraídos: {vessel.documentEvidence.extractedFields?.length || 0}</Text><Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>Dados conferidos: {(vessel.documentEvidence.extractedFields || []).filter((item) => item.confirmedByUser).length}</Text><Text style={[typography.caption, { color: vessel.documentEvidence.qrState === 'QR_DATA_EXTRACTED' ? colors.conform : colors.textMuted, marginTop: spacing.xs }]}>QR Code: {vessel.documentEvidence.qrState === 'QR_DATA_EXTRACTED' ? 'detectado e lido' : 'não detectado ou ainda não analisado'}</Text><Text style={[typography.caption, { color: colors.pending, marginTop: spacing.xs }]}>Autenticidade: não verificada</Text></Card> : null}
      {vessel.documentEvidence ? <DocumentReviewPanel evidence={vessel.documentEvidence} darkMode={darkMode} onChange={onChangeDocumentEvidence} onApply={onApplyConfirmedDocument} /> : null}
      {inspection.checklistRecalculationPending ? <Card darkMode={darkMode} variant="warning"><Text style={[typography.bodyStrong, { color: colors.text }]}>Esta alteração pode modificar o checklist aplicável.</Text><Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>Revise a alteração antes de reiniciar os estados já registrados.</Text><Button label="Recalcular checklist" onPress={onRecalculateDocumentChecklist} darkMode={darkMode} style={{ marginTop: spacing.md }} /></Card> : null}
      {divergences.length ? <Card darkMode={darkMode} variant="warning"><Text style={[typography.cardTitle, { color: colors.text }]}>Possíveis divergências documentais</Text><Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>A comparação não produz conclusão jurídica nem cria Auto de Infração.</Text>{divergences.map((item) => <View key={item.field} style={{ marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border }}><Text style={[typography.bodyStrong, { color: colors.pending }]}>{item.status === 'POSSIBLE_CAPACITY_EXCESS' ? 'Possível excesso de lotação' : `Possível divergência — ${item.label}`}</Text><Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>Documento: {item.documented}</Text><Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>Observado: {item.observed}</Text><Button label="Confirmar divergência" variant="secondary" onPress={() => onConfirmDocumentDivergence(item)} darkMode={darkMode} style={{ marginTop: spacing.sm }} /></View>)}</Card> : null}
      <Field label="Observações" value={vessel.notes} onChangeText={(notes) => update({ notes })} darkMode={darkMode} multiline />
    </>
  );
};

const DriverStep = ({ inspection, darkMode, updateSection }) => {
  const driver = inspection.driver;
  const update = (patch) => updateSection('driver', patch);
  return <>
    <Field label="Nome do condutor" value={driver.name} onChangeText={(name) => update({ name })} darkMode={darkMode} />
    <Field label="CPF" value={driver.taxId} onChangeText={(taxId) => update({ taxId })} darkMode={darkMode} keyboardType="number-pad" />
    <Field label="Documento de identidade" value={driver.identityDocument} onChangeText={(identityDocument) => update({ identityDocument })} darkMode={darkMode} />
    <ChoiceGroup label="Tipo de habilitação" options={['CHA', 'CIR', 'Outro']} value={driver.licenseType} onChange={(licenseType) => update({ licenseType })} darkMode={darkMode} />
    <Field label="Categoria" value={driver.category} onChangeText={(category) => update({ category })} darkMode={darkMode} />
    <Field label="Número" value={driver.licenseNumber} onChangeText={(licenseNumber) => update({ licenseNumber })} darkMode={darkMode} />
    <Field label="Validade" value={driver.validUntil} onChangeText={(validUntil) => update({ validUntil })} darkMode={darkMode} placeholder="DD/MM/AAAA" />
    <ChoiceGroup label="Documento apresentado?" options={['Sim', 'Não']} value={driver.documentPresented} onChange={(documentPresented) => update({ documentPresented })} darkMode={darkMode} />
    <ChoiceGroup label="Documento aparentemente válido?" options={['Sim', 'Não', 'Necessita confirmação']} value={driver.apparentValidity} onChange={(apparentValidity) => update({ apparentValidity })} darkMode={darkMode} />
    <ChoiceGroup label="Condutor corresponde ao documento?" options={['Sim', 'Não', 'Não foi possível confirmar']} value={driver.matchesDocument} onChange={(matchesDocument) => update({ matchesDocument })} darkMode={darkMode} />
    <Field label="Observações" value={driver.notes} onChangeText={(notes) => update({ notes })} darkMode={darkMode} multiline />
  </>;
};

const CrewStep = ({ inspection, darkMode, updateSection, addCrewMember }) => {
  const { colors, spacing, typography } = getTheme(darkMode);
  const crew = inspection.crew;
  const occupancy = inspection.occupancy;
  return <>
    <ChoiceGroup label="A embarcação exige CTS?" options={['sim', 'não', 'confirmar']} value={crew.ctsRequired} onChange={(ctsRequired) => updateSection('crew', { ctsRequired })} darkMode={darkMode} />
    {crew.ctsRequired !== 'não' ? <>
      <ChoiceGroup label="CTS existe?" options={['Sim', 'Não', 'A confirmar']} value={crew.ctsExists} onChange={(ctsExists) => updateSection('crew', { ctsExists })} darkMode={darkMode} />
      <ChoiceGroup label="CTS apresentado?" options={['Sim', 'Não', 'A confirmar']} value={crew.ctsPresented} onChange={(ctsPresented) => updateSection('crew', { ctsPresented })} darkMode={darkMode} />
      <Field label="Quantidade exigida" value={crew.requiredCount} onChangeText={(requiredCount) => updateSection('crew', { requiredCount })} darkMode={darkMode} keyboardType="number-pad" />
    </> : null}
    <View style={{ flexDirection: 'row', gap: spacing.sm }}>
      <Field style={{ flex: 1 }} label="Tripulação presente" value={occupancy.crewCount} onChangeText={(crewCount) => updateSection('occupancy', { crewCount })} darkMode={darkMode} keyboardType="number-pad" />
      <Field style={{ flex: 1 }} label="Passageiros" value={occupancy.passengerCount} onChangeText={(passengerCount) => updateSection('occupancy', { passengerCount })} darkMode={darkMode} keyboardType="number-pad" />
    </View>
    <Card darkMode={darkMode} variant="outlined"><Text style={[typography.bodyStrong, { color: colors.text }]}>Total a bordo: {occupancy.totalPersons}</Text><Text style={[typography.caption, { color: colors.textMuted }]}>Autorizado: {inspection.vessel.passengerCapacity || 'não informado'}</Text>{Number(inspection.vessel.passengerCapacity) > 0 && occupancy.totalPersons > Number(inspection.vessel.passengerCapacity) ? <Text style={[typography.caption, { color: colors.pending, marginTop: spacing.xs }]}>Possível excesso de lotação. Confirme a base aplicável antes de classificar.</Text> : null}</Card>
    {crew.members.map((member, index) => <Card key={member.id} darkMode={darkMode} variant="outlined"><Text style={[typography.cardTitle, { color: colors.text }]}>Tripulante {index + 1}</Text><Field label="Nome" value={member.name} onChangeText={(name) => updateSection('crewMember', { id: member.id, name })} darkMode={darkMode} /><Field label="CIR" value={member.cir} onChangeText={(cir) => updateSection('crewMember', { id: member.id, cir })} darkMode={darkMode} /><Field label="Categoria/função" value={member.role} onChangeText={(role) => updateSection('crewMember', { id: member.id, role })} darkMode={darkMode} /></Card>)}
    <Button label="Adicionar tripulante" variant="secondary" onPress={addCrewMember} darkMode={darkMode} />
  </>;
};

const DocumentsStep = ({ inspection, darkMode, updateDocument }) => {
  const { colors, spacing, typography } = getTheme(darkMode);
  const tieValidation = validateVesselDocument(inspection);
  const expirationCopy = tieValidation && {
    missing: 'Validade do TIE não informada.',
    invalid: 'Data inválida. Use DD/MM/AAAA ou AAAA-MM-DD.',
    expired: `TIE vencido há ${Math.abs(tieValidation.daysUntilExpiration)} dia(s). Confirme o documento original.`,
    expiring: `TIE vence em ${tieValidation.daysUntilExpiration} dia(s). Confirme o documento original.`,
    valid: `Validade informada: ${tieValidation.daysUntilExpiration} dia(s) restantes.`,
  }[tieValidation.expirationStatus];
  return <>
    {tieValidation ? <Card darkMode={darkMode} variant={['expired', 'expiring', 'invalid', 'missing'].includes(tieValidation.expirationStatus) ? 'warning' : 'outlined'}><Text style={[typography.bodyStrong, { color: colors.text }]}>Verificação automática do TIE</Text><Text style={[typography.caption, { color: tieValidation.expirationStatus === 'valid' ? colors.textMuted : colors.pending, marginTop: spacing.xs }]}>{expirationCopy}</Text>{tieValidation.missingFields.length ? <Text style={[typography.caption, { color: colors.pending, marginTop: spacing.sm }]}>Campos obrigatórios ausentes: {tieValidation.missingFields.join(', ')}.</Text> : null}<Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.sm }]}>Esta verificação avalia apenas consistência e prazo. Não autentica o documento.</Text></Card> : null}
    {inspection.documents.map((document) => <Card key={document.id} darkMode={darkMode} variant="outlined"><SectionHeader title={document.name} darkMode={darkMode} /><ChoiceGroup label="Situação" options={documentStatuses} value={document.status} onChange={(status) => updateDocument(document.id, { status })} darkMode={darkMode} /><Field label="Número" value={document.number} onChangeText={(number) => updateDocument(document.id, { number })} darkMode={darkMode} /><Field label="Validade" value={document.validUntil} onChangeText={(validUntil) => updateDocument(document.id, { validUntil })} darkMode={darkMode} placeholder="DD/MM/AAAA" /><Field label="Observação" value={document.notes} onChangeText={(notes) => updateDocument(document.id, { notes })} darkMode={darkMode} multiline /></Card>)}
  </>;
};

const ApplicabilityStep = ({ inspection, darkMode }) => {
  const { colors, spacing, typography } = getTheme(darkMode);
  return <><Card darkMode={darkMode} variant="warning"><Text style={[typography.bodyStrong, { color: colors.pending }]}>Roteamento de fontes, não fundamentação</Text><Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>As fontes abaixo são candidatas pelo contexto informado. Somente versões verificadas com item e página podem fundamentar uma decisão.</Text></Card><SectionHeader title="Fontes candidatas" darkMode={darkMode} />{inspection.applicability.applicableNorms.map((norm) => <Card key={norm} darkMode={darkMode} variant="outlined"><Text style={[typography.bodyStrong, { color: colors.text }]}>{norm.toUpperCase()}</Text><StatusBadge status="validacao pendente" darkMode={darkMode} /></Card>)}<SectionHeader title="Módulos selecionados" darkMode={darkMode} /><Text style={[typography.body, { color: colors.textMuted, marginBottom: spacing.lg }]}>{inspection.applicability.checklistModules.join(' · ')}</Text>{inspection.applicability.warnings.map((warning) => <Text key={warning} style={[typography.caption, { color: colors.pending, marginBottom: spacing.sm }]}>{warning}</Text>)}</>;
};

const ChecklistStep = ({ inspection, darkMode, updateChecklistItem, addEvidence, evidenceBusyItem }) => {
  const { colors, spacing, typography } = getTheme(darkMode);
  return <>{inspection.checkItems.map((item) => <Card key={item.id} darkMode={darkMode} variant={item.status === 'nao verificado' ? 'warning' : 'outlined'}><Text style={[typography.label, { color: colors.textMuted }]}>{item.moduleId.toUpperCase()}</Text><Text style={[typography.bodyStrong, { color: colors.text, marginTop: spacing.xs }]}>{item.text}</Text><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md }}>{itemStatuses.map(([value, label]) => <Pressable key={value} onPress={() => updateChecklistItem(item.id, { status: value })} style={{ width: '48%', minHeight: 48, justifyContent: 'center', alignItems: 'center', borderRadius: 12, borderWidth: item.status === value ? 2 : 1, borderColor: item.status === value ? colors.action : colors.border, backgroundColor: item.status === value ? colors.infoSurface : colors.surfaceElevated }}><Text style={[typography.label, { color: item.status === value ? colors.primary : colors.textMuted }]}>{label}</Text></Pressable>)}</View><Field label={item.status === 'nao conforme' ? 'Descreva objetivamente o que foi observado' : item.status === 'nao se aplica' ? 'Justificativa obrigatória para N/A' : 'Observação'} value={item.notes} onChangeText={(notes) => updateChecklistItem(item.id, { notes })} darkMode={darkMode} multiline />{item.evidence?.length ? <ScrollView horizontal contentContainerStyle={{ gap: spacing.sm, marginBottom: spacing.md }}>{item.evidence.map((evidence) => <Image key={evidence.id} source={{ uri: evidence.uri }} accessibilityLabel="Evidência fotográfica" style={{ width: 88, height: 88, borderRadius: 10, backgroundColor: colors.surfaceElevated }} />)}</ScrollView> : null}<View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}><Button label="Fotografar" variant="secondary" loading={evidenceBusyItem === item.id} onPress={() => addEvidence(item.id, 'camera')} darkMode={darkMode} style={{ flex: 1 }} /><Button label="Galeria" variant="secondary" disabled={Boolean(evidenceBusyItem)} onPress={() => addEvidence(item.id, 'library')} darkMode={darkMode} style={{ flex: 1 }} /></View><Text style={[typography.caption, { color: colors.pending }]}>{item.reference}</Text></Card>)}</>;
};

const FindingsStep = ({ inspection, darkMode, updateFinding, regularizeFinding }) => {
  const { colors, spacing, typography } = getTheme(darkMode);
  return inspection.findings.length ? <>{inspection.findings.map((finding, index) => <Card key={finding.id} darkMode={darkMode} variant="warning"><Text style={[typography.label, { color: colors.nonConform }]}>NÃO CONFORMIDADE {index + 1}</Text><Text style={[typography.bodyStrong, { color: colors.text, marginTop: spacing.xs }]}>{finding.itemText}</Text><Field label="Situação observada" value={finding.observedDescription} onChangeText={(observedDescription) => updateFinding(finding.id, { observedDescription })} darkMode={darkMode} multiline /><StatusBadge status={finding.status === 'REGULARIZED' ? 'regularizado' : 'validacao pendente'} darkMode={darkMode} /><Text style={[typography.caption, { color: colors.pending, marginTop: spacing.sm }]}>Fundamentação normativa não localizada.</Text>{finding.status !== 'REGULARIZED' ? <Button label="Regularizado durante a inspeção" variant="secondary" onPress={() => regularizeFinding(finding.id)} darkMode={darkMode} style={{ marginTop: spacing.md }} /> : null}</Card>)}</> : <Card darkMode={darkMode} variant="outlined"><Text style={[typography.body, { color: colors.textMuted }]}>Nenhuma não conformidade registrada.</Text></Card>;
};

const ReviewStep = ({ inspection, darkMode }) => {
  const { colors, spacing, typography } = getTheme(darkMode);
  const evaluated = inspection.checkItems.filter((item) => item.status !== 'nao verificado').length;
  const rows = [['Identificação', Boolean(inspection.vessel.name && inspection.vessel.tie)], ['Condutor', Boolean(inspection.driver.name)], ['Tripulação', true], ['Documentação', inspection.documents.every((item) => item.status)], ['Segurança', evaluated === inspection.checkItems.length], ['Não conformidades', inspection.findings.every((item) => item.observedDescription.trim())]];
  return <>{rows.map(([label, complete]) => <Card key={label} darkMode={darkMode} variant="outlined" style={{ marginBottom: spacing.sm }}><View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text style={[typography.bodyStrong, { color: colors.text }]}>{label}</Text><StatusBadge status={complete ? 'conforme' : 'pendente'} darkMode={darkMode} /></View></Card>)}<Card darkMode={darkMode} variant="warning"><Text style={[typography.bodyStrong, { color: colors.pending }]}>Enquadramentos confirmados: 0</Text><Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>Nenhum enquadramento é permitido enquanto não houver fonte normativa estruturada e validada.</Text></Card></>;
};

const ConclusionStep = ({ inspection, darkMode, prepareProcedure }) => {
  const { colors, spacing, typography } = getTheme(darkMode);
  return <><Card darkMode={darkMode} variant="elevated"><Text style={[typography.sectionTitle, { color: colors.text }]}>Pronta para conclusão</Text><Text style={[typography.body, { color: colors.textMuted, marginTop: spacing.sm }]}>{inspection.vessel.name || 'Embarcação'} · {inspection.checkItems.length} itens · {inspection.findings.length} não conformidades</Text><Text style={[typography.caption, { color: colors.pending, marginTop: spacing.md }]}>O encerramento gera somente um relatório de apoio. Nenhum enquadramento, medida ou documento jurídico será criado automaticamente.</Text></Card><ProcedureCenter inspection={inspection} darkMode={darkMode} onPrepare={prepareProcedure} /></>;
};

export const AssistedInspectionScreen = ({ currentInspection, vesselProfiles = [], isDarkMode, evidenceBusyItem, isPickingTiePhoto, isCapturingLocation, storageStatus, lastSavedAt, onRetrySave, onBegin, onSelectVesselProfile, onCaptureTiePhoto, onSelectTiePhoto, onImportDocumentPdf, onReadDocumentQr, onChangeDocumentEvidence, onApplyConfirmedDocument, onRecalculateDocumentChecklist, onConfirmDocumentDivergence, onCaptureLocation, onConfirmManualLocation, onConfirmJurisdiction, onAskLocationRules, onUpdateSection, onAddCrewMember, onUpdateDocument, onUpdateChecklistItem, onAddEvidence, onUpdateFinding, onRegularizeFinding, onPrepareProcedure, onNext, onBack, onDiscard, onFinish }) => {
  const { colors, spacing, typography } = getTheme(isDarkMode);
  if (!currentInspection) return <View style={{ marginBottom: spacing.xl }}><SectionHeader title="Inspeção Naval" description="Registre o cenário da abordagem e avalie os itens aplicáveis." darkMode={isDarkMode} /><Card darkMode={isDarkMode} variant="elevated"><Button label="Nova Inspeção Naval" onPress={onBegin} darkMode={isDarkMode} /></Card></View>;
  const stepProps = { inspection: currentInspection, darkMode: isDarkMode, updateSection: onUpdateSection };
  const content = {
    1: <ScenarioStep {...stepProps} isCapturingLocation={isCapturingLocation} onCaptureLocation={onCaptureLocation} onConfirmManualLocation={onConfirmManualLocation} onConfirmJurisdiction={onConfirmJurisdiction} onAskLocationRules={onAskLocationRules} />,
    2: <VesselStep {...stepProps} vesselProfiles={vesselProfiles} onSelectVesselProfile={onSelectVesselProfile} onCaptureTiePhoto={onCaptureTiePhoto} onSelectTiePhoto={onSelectTiePhoto} onImportDocumentPdf={onImportDocumentPdf} onReadDocumentQr={onReadDocumentQr} onChangeDocumentEvidence={onChangeDocumentEvidence} onApplyConfirmedDocument={onApplyConfirmedDocument} onRecalculateDocumentChecklist={onRecalculateDocumentChecklist} onConfirmDocumentDivergence={onConfirmDocumentDivergence} isPickingTiePhoto={isPickingTiePhoto} />,
    3: <DriverStep {...stepProps} />,
    4: <CrewStep {...stepProps} addCrewMember={onAddCrewMember} />,
    5: <DocumentsStep inspection={currentInspection} darkMode={isDarkMode} updateDocument={onUpdateDocument} />,
    6: <ApplicabilityStep inspection={currentInspection} darkMode={isDarkMode} />,
    7: <ChecklistStep inspection={currentInspection} darkMode={isDarkMode} updateChecklistItem={onUpdateChecklistItem} addEvidence={onAddEvidence} evidenceBusyItem={evidenceBusyItem} />,
    8: <FindingsStep inspection={currentInspection} darkMode={isDarkMode} updateFinding={onUpdateFinding} regularizeFinding={onRegularizeFinding} />,
    9: <ReviewStep inspection={currentInspection} darkMode={isDarkMode} />,
    10: <ConclusionStep inspection={currentInspection} darkMode={isDarkMode} prepareProcedure={onPrepareProcedure} />,
  }[currentInspection.currentStep];
  const saveCopy = storageStatus === 'saving'
    ? 'Salvando neste dispositivo...'
    : storageStatus === 'error'
      ? 'Não foi possível salvar esta alteração.'
      : `Salvo neste dispositivo${lastSavedAt ? ` às ${new Date(lastSavedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` : ''}`;
  return <View style={{ marginBottom: spacing.xl }}><StepHeader inspection={currentInspection} darkMode={isDarkMode} /><View accessibilityLiveRegion="polite" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md, paddingHorizontal: spacing.xs }}><Text style={[typography.caption, { color: storageStatus === 'error' ? colors.nonConform : colors.textMuted, flex: 1 }]}>{saveCopy}</Text>{storageStatus === 'error' ? <Button label="Tentar novamente" variant="secondary" onPress={onRetrySave} darkMode={isDarkMode} /> : null}</View>{content}<View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg }}>{currentInspection.currentStep > 1 ? <Button label="Voltar" variant="secondary" onPress={onBack} darkMode={isDarkMode} style={{ flex: 1 }} /> : <Button label="Descartar" variant="danger" onPress={onDiscard} darkMode={isDarkMode} style={{ flex: 1 }} />}<Button label={currentInspection.currentStep === 10 ? 'Concluir inspeção' : 'Continuar'} onPress={currentInspection.currentStep === 10 ? onFinish : onNext} darkMode={isDarkMode} style={{ flex: 1 }} /></View></View>;
};
