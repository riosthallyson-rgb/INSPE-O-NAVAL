import React, { useEffect, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { useRouter } from 'expo-router';
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { publications } from './data/publications';
import { emptyInspectorProfile } from './domain/inspector';
import { InspectorHome } from './features/inspector/InspectorHome';
import { NormativeSearchScreen } from './features/normative/NormativeSearchScreen';
import { InspectionHistoryScreen } from './features/history/InspectionHistoryScreen';
import { PublicationsScreen } from './features/publications/PublicationsScreen';
import { AssistedInspectionScreen } from './features/inspections/AssistedInspectionScreen';
import { usePersistedInspectionData } from './features/inspections/usePersistedInspectionData';
import { createReportHtml } from './domain/report';
import { completeFindingReview } from './domain/inspectionWorkflow';
import { getHistorySummary } from './domain/historySummary';
import { askGroundedAssistant } from './infrastructure/groundedAssistant';
import { captureDocument, importDocumentImage } from './infrastructure/documents/documentScanner';
import { importDocumentPdf } from './infrastructure/documents/documentFileImporter';
import { scanQrFromDocumentImage } from './infrastructure/documents/qrDocumentScanner';
import { applyQrDetection } from './infrastructure/documents/officialDocumentVerificationProvider';
import { buildVesselPatchFromConfirmedFields } from './domain/documents/documentReview';
import { prepareVesselProfile } from './domain/vesselProfile';
import { INSPECTION_STEPS, appendAuditEvent, calculateOccupancy, createInspectionDraft, validateInspectionStep } from './domain/inspection/inspectionModel';
import { evaluateInspectionApplicability } from './domain/inspection/inspectionApplicabilityEngine';
import { buildDynamicChecklist, buildDynamicDocuments } from './domain/inspection/dynamicChecklist';
import { evaluateLegalFinding } from './legal/engines/legalFindingEngine';
import { captureInspectionEvidence } from './infrastructure/evidencePhoto';
import { createAdministrativeProcedure } from './domain/administrative/administrativeProcedureModel';
import { styles } from './theme/styles';
import { BottomTabBar } from './components/BottomTabBar';
import { AppHeader } from './components/AppHeader';
import { CompactAppBar } from './components/CompactAppBar';
import { createCompassHistoryEntry } from './domain/compassHistory';
import { captureCurrentInspectionLocation } from './infrastructure/geolocation/captureInspectionLocation';
import { confirmInspectionLocation, createInspectionLocation } from './domain/geospatial/inspectionLocation';
import { resolveJurisdiction } from './domain/geospatial/jurisdictionResolver';
import { EMPTY_REGIONAL_RULE_SETS, findRegionalRuleSet } from './domain/regional/regionalRulesManager';
import { searchOfflineData } from './domain/globalSearch';
import { GlobalSearchPanel } from './features/search/GlobalSearchPanel';

const inspectorInitial = emptyInspectorProfile;

const DEFAULT_VESSEL_TYPE = 'Embarcação não classificada';

export default function App() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Início');
  const screenTransition = useRef(new Animated.Value(1)).current;
  const scrollViewRef = useRef(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const {
    inspectorProfile,
    history,
    currentInspection,
    vessels,
    saveInspectorProfile,
    setCurrentInspection,
    archiveInspection,
    saveVesselProfile,
    startInspection,
    storageStatus,
    lastSavedAt,
    retrySave,
    compassHistory,
    addCompassHistory,
    removeCompassHistory,
    storageError,
    clearStorageError,
    storageNotice,
    clearStorageNotice,
    backupHealth,
    exportHistoryBackup,
    importHistoryBackup,
  } = usePersistedInspectionData();
  const [profileForm, setProfileForm] = useState(inspectorInitial);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState('');
  const [isPickingTiePhoto, setIsPickingTiePhoto] = useState(false);
  const [evidenceBusyItem, setEvidenceBusyItem] = useState('');
  const [isCapturingLocation, setIsCapturingLocation] = useState(false);
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState({ answer: '', summary: [], citations: [] });
  const [isAskingCompass, setIsAskingCompass] = useState(false);
  const [useCompassInspectionContext, setUseCompassInspectionContext] = useState(true);
  const [documentFilter, setDocumentFilter] = useState('');
  const [historyFilter, setHistoryFilter] = useState('');
  const [historyResultFilter, setHistoryResultFilter] = useState('Todos');
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [isFinishingInspection, setIsFinishingInspection] = useState(false);

  useEffect(() => {
    setProfileForm(inspectorProfile);
  }, [inspectorProfile]);

  useEffect(() => {
    screenTransition.setValue(0);
    Animated.timing(screenTransition, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [activeTab, screenTransition]);

  const filteredPublications = publications.filter((publication) => {
    const filter = documentFilter.toLowerCase().trim();
    if (!filter) return true;
    return (
      publication.title.toLowerCase().includes(filter) ||
      publication.source.toLowerCase().includes(filter) ||
      (publication.content || publication.summary || '').toLowerCase().includes(filter)
    );
  });

  const filteredHistoryItems = history.filter((record) => {
    const searchValue = `${historyFilter}`.toLowerCase().trim();
    const matchesText =
      !searchValue ||
      record.vessel.name.toLowerCase().includes(searchValue) ||
      record.vessel.tie.toLowerCase().includes(searchValue) ||
      record.vessel.armador.toLowerCase().includes(searchValue);
    const matchesResult = historyResultFilter === 'Todos' || record.result === historyResultFilter;
    return matchesText && matchesResult;
  });
  const historySummary = getHistorySummary(history);
  const globalSearchResults = searchOfflineData({ query: globalSearchQuery, history, publications, vessels });

  const handleSaveProfile = async () => {
    if (!profileForm.name.trim()) {
      Alert.alert('Perfil incompleto', 'Informe o nome do inspetor.');
      return;
    }
    setIsSavingProfile(true);
    setProfileFeedback('');
    try {
      await saveInspectorProfile(profileForm);
      setIsEditingProfile(false);
      setProfileFeedback('Perfil salvo neste dispositivo.');
      setActiveTab('Início');
    } catch (error) {
      Alert.alert('Perfil', error?.message || 'Não foi possível salvar o perfil neste dispositivo.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleTiePhoto = async (source) => {
    if (isPickingTiePhoto) return;
    setIsPickingTiePhoto(true);
    try {
      const documentEvidence = source === 'camera'
        ? await captureDocument({ inspectionId: currentInspection?.id })
        : await importDocumentImage({ inspectionId: currentInspection?.id });
      if (documentEvidence) setCurrentInspection((current) => appendAuditEvent({ ...current, vessel: { ...current.vessel, documentPhotoUri: documentEvidence.originalFile, documentEvidence } }, 'DOCUMENT_CAPTURED', { documentId: documentEvidence.id, source, sha256: documentEvidence.sha256 }, documentEvidence.capturedAt));
    } catch (error) {
      Alert.alert('Foto do TIE', error.message || 'Não foi possível anexar a foto do documento.');
    } finally {
      setIsPickingTiePhoto(false);
    }
  };

  const handleCaptureInspectionLocation = async () => {
    if (isCapturingLocation || !currentInspection) return;
    setIsCapturingLocation(true);
    setCurrentInspection((current) => appendAuditEvent(current, 'LOCATION_REQUESTED', { method: 'GPS' }));
    try {
      const captured = await captureCurrentInspectionLocation({ inspectionId: currentInspection.id });
      const jurisdiction = resolveJurisdiction({ location: captured, datasets: [] });
      setCurrentInspection((current) => appendAuditEvent({ ...current, context: { ...current.context, latitude: String(captured.latitude), longitude: String(captured.longitude), inspectionLocation: captured, jurisdictionStatus: jurisdiction.status } }, 'LOCATION_CAPTURED', { locationId: captured.id, method: captured.method, accuracyMeters: captured.accuracy }));
    } catch (error) {
      Alert.alert('Localização', `${error.message || 'Não foi possível obter a localização.'}\n\nVocê pode inserir as coordenadas manualmente ou continuar sem GPS.`);
    } finally {
      setIsCapturingLocation(false);
    }
  };

  const handleConfirmManualLocation = () => {
    try {
      const existing = currentInspection?.context?.inspectionLocation;
      const manual = createInspectionLocation({ id: existing?.id || `local-${Date.now()}`, inspectionId: currentInspection.id, latitude: currentInspection.context.latitude, longitude: currentInspection.context.longitude, method: existing?.method === 'GPS' ? 'GPS' : 'MANUAL', accuracy: existing?.accuracy, altitude: existing?.altitude, heading: existing?.heading, capturedAt: existing?.capturedAt || new Date().toISOString(), textualDescription: currentInspection.context.locationDescription });
      const confirmed = confirmInspectionLocation(manual);
      const jurisdiction = resolveJurisdiction({ location: confirmed, datasets: [] });
      setCurrentInspection((current) => appendAuditEvent({ ...current, context: { ...current.context, inspectionLocation: confirmed, jurisdictionStatus: jurisdiction.status } }, existing ? 'LOCATION_CONFIRMED' : 'LOCATION_MANUALLY_CHANGED', { locationId: confirmed.id, method: confirmed.method, jurisdictionStatus: jurisdiction.status }));
      Alert.alert('Localização confirmada', 'O ponto foi associado à inspeção. A jurisdição não foi determinada automaticamente porque não há geometria oficial instalada.');
    } catch (error) {
      Alert.alert('Coordenadas inválidas', error.message);
    }
  };

  const handleConfirmJurisdiction = () => {
    const jurisdictionId = String(currentInspection?.context?.jurisdictionId || '').trim().toUpperCase();
    if (!jurisdictionId) {
      Alert.alert('Jurisdição', 'Informe a CP, DL ou AG antes de confirmar.');
      return;
    }
    const regional = findRegionalRuleSet({ jurisdictionId, ruleSets: EMPTY_REGIONAL_RULE_SETS });
    const outsideDefault = Boolean(currentInspection.inspector?.jurisdiction && currentInspection.inspector.jurisdiction.trim().toUpperCase() !== jurisdictionId);
    setCurrentInspection((current) => {
      let next = { ...current, context: { ...current.context, jurisdictionId, jurisdictionConfirmedByUser: true, regionalRuleStatus: regional.status, regionalRuleMessage: regional.message, regionalRuleSetId: regional.ruleSet?.id || null } };
      next = appendAuditEvent(next, 'JURISDICTION_CONFIRMED', { jurisdictionId, method: 'MANUAL', regionalRuleStatus: regional.status, outsideProfileDefault: outsideDefault });
      return next;
    });
    Alert.alert('Jurisdição confirmada', `${outsideDefault ? 'Local fora da jurisdição padrão do perfil.\n\n' : ''}${regional.message} Você pode continuar com as normas nacionais.`);
  };

  const handleDocumentPdf = async () => {
    if (isPickingTiePhoto) return;
    setIsPickingTiePhoto(true);
    try {
      const documentEvidence = await importDocumentPdf({ inspectionId: currentInspection?.id });
      if (documentEvidence) setCurrentInspection((current) => appendAuditEvent({ ...current, vessel: { ...current.vessel, documentPhotoUri: '', documentEvidence } }, 'DOCUMENT_CAPTURED', { documentId: documentEvidence.id, source: 'pdf', sha256: documentEvidence.sha256 }, documentEvidence.capturedAt));
    } catch (error) {
      Alert.alert('Importar PDF', error.message || 'Não foi possível importar o documento.');
    } finally {
      setIsPickingTiePhoto(false);
    }
  };

  const handleDocumentQr = async (scanResult) => {
    const evidence = currentInspection?.vessel?.documentEvidence;
    if (!scanResult?.data && evidence?.originalFile?.toLowerCase().endsWith('.pdf')) {
      Alert.alert('Ler QR Code', 'A leitura direta de QR dentro de PDF ainda não é suportada no dispositivo. Use a câmera ao vivo ou importe uma imagem da página que contém o QR.');
      return;
    }
    if (!scanResult?.data && !evidence?.originalFile) {
      Alert.alert('Ler QR Code', 'Capture ou importe uma imagem do documento antes de procurar o QR Code.');
      return;
    }
    try {
      const baseEvidence = evidence || { id: `qr-${Date.now()}`, type: 'UNKNOWN', extractedFields: [], originalFile: null };
      const documentEvidence = scanResult?.data
        ? applyQrDetection(baseEvidence, { detected: true, readable: true, data: scanResult.data })
        : await scanQrFromDocumentImage(baseEvidence);
      setCurrentInspection((current) => {
        const updated = { ...current, vessel: { ...current.vessel, documentEvidence } };
        if (documentEvidence.qrState === 'QR_DATA_EXTRACTED') {
          return appendAuditEvent(updated, 'QR_DATA_EXTRACTED', { documentId: documentEvidence.id, readable: true, format: documentEvidence.qrPayloadFormat, fieldCount: documentEvidence.extractedFields?.length || 0 });
        }
        if (documentEvidence.qrState === 'QR_READABLE') {
          return appendAuditEvent(updated, 'QR_READ_UNRECOGNIZED', { documentId: documentEvidence.id, readable: true });
        }
        return updated;
      });
      if (documentEvidence.qrState === 'QR_DATA_EXTRACTED') {
        Alert.alert('QR Code lido', 'Os dados estruturados foram extraídos para conferência. Nenhum campo foi confirmado automaticamente e a autenticidade permanece não verificada.');
      } else if (documentEvidence.qrState === 'QR_READABLE') {
        Alert.alert('QR Code lido', 'O QR foi lido, mas o formato não é reconhecido para preenchimento automático. A autenticidade permanece não verificada.');
      } else {
        Alert.alert('QR Code', 'Nenhum QR Code legível foi localizado nesta imagem.');
      }
    } catch (error) {
      Alert.alert('QR Code', error.message || 'Não foi possível ler o QR Code. A autenticidade permanece não verificada.');
    }
  };

  const handleChangeDocumentEvidence = (documentEvidence) => {
    setCurrentInspection((current) => {
      if (!current) return current;
      const previous = current.vessel.documentEvidence?.extractedFields || [];
      const confirmedField = (documentEvidence.extractedFields || []).find((item) => item.confirmedByUser && !previous.find((old) => old.field === item.field)?.confirmedByUser);
      const editedField = (documentEvidence.extractedFields || []).find((item) => item.editedByUser && item.value !== previous.find((old) => old.field === item.field)?.value);
      let next = { ...current, vessel: { ...current.vessel, documentEvidence } };
      if (editedField) next = appendAuditEvent(next, 'FIELD_EDITED', { field: editedField.field });
      if (confirmedField) next = appendAuditEvent(next, 'FIELDS_CONFIRMED', { fields: [confirmedField.field], count: 1 });
      return next;
    });
  };

  const handleApplyConfirmedDocument = () => {
    const documentEvidence = currentInspection?.vessel?.documentEvidence;
    const patch = buildVesselPatchFromConfirmedFields(documentEvidence || {});
    if (!Object.keys(patch).length) {
      Alert.alert('Conferência do documento', 'Confirme pelo menos um dado antes de preencher a inspeção.');
      return;
    }
    setCurrentInspection((current) => {
      const linkedAt = new Date().toISOString();
      const vessel = { ...current.vessel, ...patch, documentEvidence: { ...documentEvidence, linkedToInspectionAt: linkedAt } };
      const applicability = evaluateInspectionApplicability({ vesselType: vessel.type, vesselUse: vessel.vesselUse, navigationArea: vessel.navigationArea, operationalState: current.context.vesselOperationalState, length: vessel.lengthMeters, grossTonnage: vessel.grossTonnage, propulsion: vessel.propulsion, passengerCapacity: vessel.passengerCapacity, peopleOnBoard: current.occupancy.totalPersons, jurisdiction: current.context.jurisdictionConfirmedByUser ? current.context.jurisdictionId : '', jurisdictionConfirmed: current.context.jurisdictionConfirmedByUser });
      let next = { ...current, vessel, applicability };
      if (current.checkItems.length) next = { ...next, checklistRecalculationPending: true };
      next = appendAuditEvent(next, 'FIELDS_CONFIRMED', { fields: Object.keys(patch), count: Object.keys(patch).length }, linkedAt);
      next = appendAuditEvent(next, 'DOCUMENT_LINKED_TO_INSPECTION', { documentId: documentEvidence.id, documentType: documentEvidence.type, checklistRecalculationPending: Boolean(current.checkItems.length) }, linkedAt);
      return next;
    });
    Alert.alert('Dados aplicados', 'Somente os campos conferidos foram usados. A autenticidade do documento permanece não verificada.');
  };

  const handleRecalculateDocumentChecklist = () => {
    Alert.alert('Recalcular checklist', 'Os estados já registrados no checklist serão reiniciados. Deseja continuar?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Recalcular', onPress: () => setCurrentInspection((current) => appendAuditEvent({ ...current, checkItems: buildDynamicChecklist(current.applicability), checklistRecalculationPending: false }, 'CHECKLIST_RECALCULATED_FROM_CONFIRMED_DOCUMENT', { documentId: current.vessel.documentEvidence?.id || null })) },
    ]);
  };

  const handleConfirmDocumentDivergence = (divergence) => {
    setCurrentInspection((current) => {
      const documentEvidence = current.vessel.documentEvidence;
      const confirmedDivergences = [...(documentEvidence.confirmedDivergences || []).filter((item) => item.field !== divergence.field), { ...divergence, confirmedByUser: true, confirmedAt: new Date().toISOString() }];
      return appendAuditEvent({ ...current, vessel: { ...current.vessel, documentEvidence: { ...documentEvidence, confirmedDivergences } } }, 'DOCUMENT_DIVERGENCE_CONFIRMED', { documentId: documentEvidence.id, field: divergence.field, status: divergence.status });
    });
    Alert.alert('Divergência registrada', 'A divergência foi registrada para análise. Nenhuma conclusão jurídica ou Auto foi criado.');
  };

  const finalizeInspection = async (finalRecord) => {
    try {
      await archiveInspection(finalRecord);
      setActiveTab('Histórico');
      Alert.alert('Inspeção salva', 'O relatório da inspeção foi salvo no histórico.');
    } catch (error) {
      Alert.alert('Falha ao salvar', error.message || 'A inspeção não foi arquivada. O rascunho foi mantido para nova tentativa.');
    }
  };

  const handleDiscardCurrentInspection = () => {
    Alert.alert('Descartar inspeção', 'Deseja descartar a inspeção atual?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Descartar', style: 'destructive', onPress: () => setCurrentInspection(null) },
    ]);
  };

  const handleBeginAssistedInspection = async () => {
    if (!inspectorProfile.name.trim()) {
      Alert.alert('Perfil obrigatório', 'Preencha os dados do inspetor antes de iniciar uma Inspeção Naval.');
      setActiveTab('Início');
      return;
    }
    const draft = createInspectionDraft({ inspector: inspectorProfile, defaultVesselType: DEFAULT_VESSEL_TYPE });
    try {
      await startInspection(null, draft);
      setActiveTab('Inspeção');
    } catch (error) {
      Alert.alert('Nova inspeção', error?.message || 'Não foi possível criar e salvar o rascunho neste dispositivo.');
    }
  };

  const updateInspectionSection = (section, patch) => {
    setCurrentInspection((current) => {
      if (!current) return current;
      const updatedAt = new Date().toISOString();
      if (section === 'crewMember') {
        return { ...current, updatedAt, crew: { ...current.crew, members: current.crew.members.map((member) => member.id === patch.id ? { ...member, ...patch } : member) } };
      }
      if (section === 'occupancy') {
        const nextOccupancy = calculateOccupancy(patch.crewCount ?? current.occupancy.crewCount, patch.passengerCount ?? current.occupancy.passengerCount);
        return { ...current, updatedAt, occupancy: { ...current.occupancy, ...nextOccupancy } };
      }
      return { ...current, updatedAt, [section]: { ...current[section], ...patch } };
    });
  };

  const addCrewMember = () => {
    setCurrentInspection((current) => ({
      ...current,
      updatedAt: new Date().toISOString(),
      crew: { ...current.crew, members: [...current.crew.members, { id: `tripulante-${Date.now()}`, name: '', cir: '', category: '', role: '', validUntil: '', status: '' }] },
    }));
  };

  const updateInspectionDocument = (documentId, patch) => {
    setCurrentInspection((current) => ({
      ...current,
      updatedAt: new Date().toISOString(),
      vessel: documentId === 'vessel-registration'
        ? { ...current.vessel, tie: patch.number ?? current.vessel.tie, validUntil: patch.validUntil ?? current.vessel.validUntil }
        : current.vessel,
      documents: current.documents.map((document) => document.id === documentId ? { ...document, ...patch } : document),
    }));
  };

  const updateAssistedChecklistItem = (itemId, patch) => {
    setCurrentInspection((current) => {
      const item = current.checkItems.find((entry) => entry.id === itemId);
      if (!item) return current;
      const nextItem = { ...item, ...patch };
      const nextItems = current.checkItems.map((entry) => entry.id === itemId ? nextItem : entry);
      let next = { ...current, checkItems: nextItems, updatedAt: new Date().toISOString() };
      const existingFinding = current.findings.find((finding) => finding.itemId === itemId);
      if (patch.status && patch.status !== item.status) next = appendAuditEvent(next, 'CHECKLIST_STATUS_CHANGED', { itemId, from: item.status, to: patch.status });
      if (Object.prototype.hasOwnProperty.call(patch, 'photoRequired') && patch.photoRequired !== item.photoRequired) {
        next = appendAuditEvent(next, 'CHECKLIST_EVIDENCE_REQUIREMENT_CHANGED', { itemId, photoRequired: Boolean(patch.photoRequired) });
      }
      if (patch.status === 'nao conforme') {
        if (!existingFinding) {
          const finding = { id: `finding-${itemId}`, itemId, itemText: item.text, type: itemId, observedDescription: nextItem.notes || '', status: 'OPEN', observedAt: new Date().toISOString(), regularizedAt: null, legalAnalysis: evaluateLegalFinding({ finding: { type: itemId }, rules: [] }) };
          next = appendAuditEvent({ ...next, findings: [...current.findings, finding], nonConformities: [...current.nonConformities.filter((entry) => entry.id !== itemId), { ...nextItem, status: 'nao conforme' }] }, 'FINDING_CREATED', { findingId: finding.id, itemId });
        } else if (existingFinding.status === 'RETRACTED') {
          next = appendAuditEvent({ ...next, findings: current.findings.map((finding) => finding.itemId === itemId ? { ...finding, status: 'OPEN', retractedAt: null, observedDescription: nextItem.notes || finding.observedDescription } : finding), nonConformities: [...current.nonConformities.filter((entry) => entry.id !== itemId), { ...nextItem, status: 'nao conforme' }] }, 'FINDING_REOPENED', { findingId: existingFinding.id, itemId });
        }
      } else if (patch.status && patch.status !== 'nao conforme' && existingFinding?.status === 'OPEN') {
        const retractedAt = new Date().toISOString();
        next = appendAuditEvent({
          ...next,
          findings: next.findings.map((finding) => finding.itemId === itemId ? { ...finding, status: 'RETRACTED', retractedAt } : finding),
          nonConformities: next.nonConformities.filter((entry) => entry.id !== itemId),
        }, 'FINDING_RETRACTED', { findingId: existingFinding.id, itemId, correctedStatus: patch.status }, retractedAt);
      }
      if (Object.prototype.hasOwnProperty.call(patch, 'notes')) {
        next.findings = next.findings.map((finding) => finding.itemId === itemId ? { ...finding, observedDescription: patch.notes } : finding);
        next.nonConformities = next.nonConformities.map((entry) => entry.id === itemId ? { ...entry, notes: patch.notes } : entry);
      }
      return next;
    });
  };

  const addInspectionEvidence = async (itemId, source) => {
    if (evidenceBusyItem) return;
    setEvidenceBusyItem(itemId);
    try {
      const evidence = await captureInspectionEvidence({ source, inspectionId: currentInspection.id, itemId, location: currentInspection.context.inspectionLocation, attachLocation: currentInspection.context.attachLocationToEvidence });
      if (!evidence) return;
      setCurrentInspection((current) => appendAuditEvent({ ...current, checkItems: current.checkItems.map((item) => item.id === itemId ? { ...item, evidence: [...(item.evidence || []), evidence] } : item) }, 'EVIDENCE_ADDED', { evidenceId: evidence.id, itemId, sha256: evidence.sha256, locationAssociated: evidence.locationAssociated }, evidence.capturedAt));
    } catch (error) {
      Alert.alert('Evidência', error.message || 'Não foi possível adicionar a fotografia.');
    } finally {
      setEvidenceBusyItem('');
    }
  };

  const updateInspectionFinding = (findingId, patch) => setCurrentInspection((current) => ({ ...current, updatedAt: new Date().toISOString(), findings: current.findings.map((finding) => finding.id === findingId ? { ...finding, ...patch } : finding), nonConformities: current.nonConformities.map((item) => `finding-${item.id}` === findingId ? { ...item, notes: patch.observedDescription ?? item.notes } : item) }));

  const regularizeInspectionFinding = (findingId) => {
    const occurredAt = new Date().toISOString();
    setCurrentInspection((current) => appendAuditEvent({ ...current, findings: current.findings.map((finding) => finding.id === findingId ? { ...finding, status: 'REGULARIZED', regularizedAt: occurredAt } : finding) }, 'FINDING_REGULARIZED', { findingId }, occurredAt));
  };

  const prepareAdministrativeProcedure = (finding, suggestion) => {
    try {
      const procedure = createAdministrativeProcedure({ inspectionId: currentInspection.id, findingId: finding.id, type: suggestion.type, source: suggestion.source, createdBy: inspectorProfile.nip });
      setCurrentInspection((current) => appendAuditEvent({ ...current, administrativeProcedures: [...(current.administrativeProcedures || []), procedure] }, 'ADMINISTRATIVE_PROCEDURE_PREPARED', { procedureId: procedure.id, findingId: finding.id, type: suggestion.type }));
    } catch (error) {
      Alert.alert('Procedimento', error.message);
    }
  };

  const advanceAssistedInspection = async () => {
    const validationError = validateInspectionStep(currentInspection);
    if (validationError) { Alert.alert('Etapa incompleta', validationError); return; }
    if (currentInspection.currentStep === 2) {
      const vessel = currentInspection.vessel;
      try {
        await saveVesselProfile(prepareVesselProfile({
          ...vessel,
          armador: vessel.armador || vessel.owner,
          activity: vessel.vesselUse,
          motors: [vessel.engineCount, vessel.enginePower, vessel.propulsion].filter(Boolean).join(' · '),
        }));
      } catch (error) {
        Alert.alert('Cadastro da embarcação', error.message || 'Não foi possível salvar o perfil reutilizável da embarcação. A inspeção atual continua disponível.');
        return;
      }
    }
    setCurrentInspection((current) => {
      let next = { ...current };
      if (current.currentStep === 4 && !current.documents.length) next.documents = buildDynamicDocuments(current);
      if (current.currentStep === 5) next.applicability = evaluateInspectionApplicability({ vesselType: current.vessel.type, vesselUse: current.vessel.vesselUse, navigationArea: current.vessel.navigationArea, operationalState: current.context.vesselOperationalState, length: current.vessel.lengthMeters, grossTonnage: current.vessel.grossTonnage, propulsion: current.vessel.propulsion, passengerCapacity: current.vessel.passengerCapacity, peopleOnBoard: current.occupancy.totalPersons, jurisdiction: current.context.jurisdictionConfirmedByUser ? current.context.jurisdictionId : '', jurisdictionConfirmed: current.context.jurisdictionConfirmedByUser });
      if (current.currentStep === 6 && !current.checkItems.length) next.checkItems = buildDynamicChecklist(current.applicability);
      next.currentStep = Math.min(10, current.currentStep + 1);
      next.stage = INSPECTION_STEPS[next.currentStep - 1];
      return appendAuditEvent(next, 'STEP_CHANGED', { from: current.currentStep, to: next.currentStep });
    });
  };

  const goBackAssistedInspection = () => setCurrentInspection((current) => appendAuditEvent({ ...current, currentStep: Math.max(1, current.currentStep - 1), stage: INSPECTION_STEPS[Math.max(1, current.currentStep - 1) - 1] }, 'STEP_CHANGED', { from: current.currentStep, to: Math.max(1, current.currentStep - 1) }));

  const finishAssistedInspection = async () => {
    if (isFinishingInspection) return;
    const completedAt = new Date().toISOString();
    const completed = appendAuditEvent(completeFindingReview(currentInspection, completedAt), 'INSPECTION_COMPLETED', {}, completedAt);
    setIsFinishingInspection(true);
    try {
      await finalizeInspection(completed);
    } finally {
      setIsFinishingInspection(false);
    }
  };

  const handleAsk = async (questionOverride = question) => {
    if (isAskingCompass) return;
    setIsAskingCompass(true);
    try {
      const nextResult = await askGroundedAssistant({ question: questionOverride, inspection: currentInspection, ignoreInspectionContext: !useCompassInspectionContext });
      setResult(nextResult);
      if (nextResult.queryId) addCompassHistory(createCompassHistoryEntry(nextResult));
    } catch (error) {
      Alert.alert('Bússola', error.message || 'Não foi possível concluir a consulta local.');
    } finally {
      setIsAskingCompass(false);
    }
  };

  const handleCompassSimulation = async (operationalState) => {
    if (isAskingCompass) return;
    setIsAskingCompass(true);
    try {
      const simulated = await askGroundedAssistant({ question, inspection: currentInspection, contextOverrides: { operationalState } });
      setResult({ ...simulated, isSimulation: true });
    } catch (error) {
      Alert.alert('Bússola', error?.message || 'Não foi possível simular o cenário localmente.');
    } finally {
      setIsAskingCompass(false);
    }
  };

  const handleAskLocationRules = () => {
    const locationQuestion = 'Quais regras podem se aplicar neste local?';
    setQuestion(locationQuestion);
    setActiveTab('Bússola');
    handleAsk(locationQuestion);
  };

  const handleShareReport = async (inspection) => {
    try {
      const html = createReportHtml(inspection);
      if (Platform.OS === 'web') {
        await Print.printAsync({ html });
      } else {
        const { uri } = await Print.printToFileAsync({ html });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: 'application/pdf',
            UTI: 'com.adobe.pdf',
            dialogTitle: `Relatório ${inspection.vessel.name}`,
          });
        } else {
          Alert.alert('Relatório gerado', `Arquivo salvo em: ${uri}`);
        }
      }
    } catch (error) {
      Alert.alert('Erro', `Não foi possível gerar o relatório: ${error.message}`);
    }
  };

  const handleExportBackup = async () => {
    try {
      const file = await exportHistoryBackup();
      Alert.alert('Backup exportado', file.shared ? 'A cópia local foi preparada para salvar ou compartilhar.' : `Backup gerado em ${file.uri || file.fileName}.`);
    } catch (error) {
      Alert.alert('Backup', error.message || 'Não foi possível exportar o histórico.');
    }
  };

  const handleImportBackup = async () => {
    try {
      const imported = await importHistoryBackup();
      if (imported.canceled) return;
      Alert.alert('Backup importado', `${imported.importedHistoryCount} inspeção(ões) e ${imported.importedVesselCount} embarcação(ões) novas foram incorporadas sem apagar os registros atuais.`);
    } catch (error) {
      Alert.alert('Importar backup', error.message || 'Não foi possível importar o arquivo selecionado.');
    }
  };

  const handleGlobalSearchResult = (item) => {
    if (item.type === 'publication') {
      router.push({ pathname: '/publication/[id]', params: { id: item.id, dark: isDarkMode ? '1' : '0' } });
      return;
    }
    if (item.type === 'inspection') {
      setHistoryFilter(item.record?.vessel?.name || item.record?.vessel?.tie || '');
      setActiveTab('Histórico');
      return;
    }
    if (item.type === 'vessel') {
      if (!currentInspection) {
        Alert.alert('Embarcação salva', 'Inicie uma nova inspeção para reutilizar este cadastro.');
        setActiveTab('Inspeção');
        return;
      }
      updateInspectionSection('vessel', item.record);
      setActiveTab('Inspeção');
    }
  };

  const quickQuestions = [
    'Condutor sem habilitação',
    'CHA/CIR vencida',
    'Não porta habilitação',
    'Quando cabe apreensão?',
    'Quando cabe retirada de tráfego?',
    'Qual a diferença entre não portar e não possuir habilitação?',
  ];

  const tabs = [
    { key: 'Início', label: 'Início' },
    { key: 'Inspeção', label: 'Inspeção' },
    { key: 'Bússola', label: 'Bússola' },
    { key: 'Publicações', label: 'Normas' },
    { key: 'Histórico', label: 'Histórico' },
  ];

  const appHeader = (
    <AppHeader
      darkMode={isDarkMode}
      storageError={storageError}
      storageNotice={storageNotice}
      onDismissStorageError={clearStorageError}
      onDismissStorageNotice={clearStorageNotice}
      onToggleTheme={() => setIsDarkMode((current) => !current)}
      styles={styles}
    />
  );
  const compactHeader = (title) => (
    <CompactAppBar title={title} darkMode={isDarkMode} storageError={storageError} storageNotice={storageNotice} onDismissStorageError={clearStorageError} onDismissStorageNotice={clearStorageNotice} onToggleTheme={() => setIsDarkMode((current) => !current)} />
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]} edges={['top', 'left', 'right', 'bottom']}>
        <StatusBar style={isDarkMode ? 'light' : 'dark'} />
        <KeyboardAvoidingView
          style={styles.keyboardArea}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {activeTab === 'Histórico' ? (
            <InspectionHistoryScreen
              history={filteredHistoryItems}
              summary={historySummary}
              hasStoredHistory={history.length > 0}
              search={historyFilter}
              resultFilter={historyResultFilter}
              isDarkMode={isDarkMode}
              header={compactHeader('Histórico')}
              onChangeSearch={setHistoryFilter}
              onChangeResultFilter={setHistoryResultFilter}
              onShareReport={handleShareReport}
              backupHealth={backupHealth}
              onExportBackup={handleExportBackup}
              onImportBackup={handleImportBackup}
            />
          ) : activeTab === 'Publicações' ? (
            <PublicationsScreen
              publications={filteredPublications}
              filter={documentFilter}
              isDarkMode={isDarkMode}
              header={compactHeader('Normas')}
              onChangeFilter={setDocumentFilter}
              onOpenPublication={(publication) =>
                router.push({
                  pathname: '/publication/[id]',
                  params: { id: publication.id, dark: isDarkMode ? '1' : '0' },
                })
              }
            />
          ) : (
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={[styles.scrollContent, isDarkMode && styles.scrollContentDark]}
            keyboardShouldPersistTaps="handled"
          >
        {activeTab === 'Início' ? appHeader : compactHeader(activeTab === 'Inspeção' ? 'Inspeção Naval' : activeTab)}
        <Animated.View
          style={{
            opacity: screenTransition,
            transform: [
              {
                translateY: screenTransition.interpolate({
                  inputRange: [0, 1],
                  outputRange: [8, 0],
                }),
              },
            ],
          }}
        >
        {activeTab === 'Início' && (
          <>
          <GlobalSearchPanel
            query={globalSearchQuery}
            results={globalSearchResults}
            darkMode={isDarkMode}
            onChangeQuery={setGlobalSearchQuery}
            onSelectResult={handleGlobalSearchResult}
          />
          <InspectorHome
            inspectorProfile={inspectorProfile}
            profileForm={profileForm}
            isEditingProfile={isEditingProfile}
            isDarkMode={isDarkMode}
            isSavingProfile={isSavingProfile}
            profileFeedback={profileFeedback}
            onChangeProfile={setProfileForm}
            onEditProfile={() => {
              setProfileFeedback('');
              setIsEditingProfile(true);
            }}
            onSaveProfile={handleSaveProfile}
            currentInspection={currentInspection}
            useInspectionContext={useCompassInspectionContext}
            onToggleInspectionContext={() => setUseCompassInspectionContext((current) => !current)}
            history={compassHistory}
            onReopenHistory={(entry) => { if (entry.question) { setQuestion(entry.question); handleAsk(entry.question); } }}
            onDeleteHistory={removeCompassHistory}
            onSimulate={handleCompassSimulation}
            onContinueInspection={() => setActiveTab('Inspeção')}
            onNewInspection={handleBeginAssistedInspection}
          />
          </>
        )}
        {activeTab === 'Inspeção' && (
          <AssistedInspectionScreen
            currentInspection={currentInspection}
            vesselProfiles={vessels}
            isDarkMode={isDarkMode}
            evidenceBusyItem={evidenceBusyItem}
            isPickingTiePhoto={isPickingTiePhoto}
            isCapturingLocation={isCapturingLocation}
            storageStatus={storageStatus}
            lastSavedAt={lastSavedAt}
            isFinishingInspection={isFinishingInspection}
            onRetrySave={() => retrySave().catch((error) => Alert.alert('Salvar inspeção', error?.message || 'Não foi possível salvar a inspeção neste dispositivo.'))}
            onBegin={handleBeginAssistedInspection}
            onSelectVesselProfile={(profile) => updateInspectionSection('vessel', profile)}
            onCaptureTiePhoto={() => handleTiePhoto('camera')}
            onSelectTiePhoto={() => handleTiePhoto('library')}
            onImportDocumentPdf={handleDocumentPdf}
            onReadDocumentQr={handleDocumentQr}
            onChangeDocumentEvidence={handleChangeDocumentEvidence}
            onApplyConfirmedDocument={handleApplyConfirmedDocument}
            onRecalculateDocumentChecklist={handleRecalculateDocumentChecklist}
            onConfirmDocumentDivergence={handleConfirmDocumentDivergence}
            onCaptureLocation={handleCaptureInspectionLocation}
            onConfirmManualLocation={handleConfirmManualLocation}
            onConfirmJurisdiction={handleConfirmJurisdiction}
            onAskLocationRules={handleAskLocationRules}
            onUpdateSection={updateInspectionSection}
            onAddCrewMember={addCrewMember}
            onUpdateDocument={updateInspectionDocument}
            onUpdateChecklistItem={updateAssistedChecklistItem}
            onAddEvidence={addInspectionEvidence}
            onUpdateFinding={updateInspectionFinding}
            onRegularizeFinding={regularizeInspectionFinding}
            onPrepareProcedure={prepareAdministrativeProcedure}
            onNext={advanceAssistedInspection}
            onBack={goBackAssistedInspection}
            onDiscard={handleDiscardCurrentInspection}
            onFinish={finishAssistedInspection}
          />
        )}
        {activeTab === 'Bússola' && (
          <NormativeSearchScreen
            question={question}
            result={result}
            isSearching={isAskingCompass}
            quickQuestions={quickQuestions}
            isDarkMode={isDarkMode}
            currentInspection={currentInspection}
            onChangeQuestion={setQuestion}
            onSearch={handleAsk}
            onQuickSearch={(quickQuestion) => {
              setQuestion(quickQuestion);
              handleAsk(quickQuestion);
            }}
            onOpenPublication={(publicationId, page) =>
              router.push({
                pathname: '/publication/[id]',
                params: { id: publicationId, dark: isDarkMode ? '1' : '0', page: page ? String(page) : undefined },
              })
            }
            styles={styles}
          />
        )}
        </Animated.View>
          </ScrollView>
          )}
        </KeyboardAvoidingView>
        <BottomTabBar
          tabs={tabs}
          activeTab={activeTab}
          darkMode={isDarkMode}
          onSelect={(tabKey) => {
            if (tabKey === activeTab) return;
            scrollViewRef.current?.scrollTo({ y: 0, animated: false });
            setActiveTab(tabKey);
          }}
          styles={styles}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
