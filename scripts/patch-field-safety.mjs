import fs from 'node:fs';

const replaceExact = (source, from, to, label) => {
  const count = source.split(from).length - 1;
  if (count !== 1) throw new Error(`${label}: esperado 1 trecho, encontrado ${count}`);
  return source.replace(from, to);
};

const replaceCount = (source, from, to, expected, label) => {
  const count = source.split(from).length - 1;
  if (count !== expected) throw new Error(`${label}: esperado ${expected} trecho(s), encontrado ${count}`);
  return source.split(from).join(to);
};

const appPath = 'src/App.js';
let app = fs.readFileSync(appPath, 'utf8');
app = replaceExact(
  app,
  "    saveVesselProfile,\n    storageStatus,",
  "    saveVesselProfile,\n    startInspection,\n    storageStatus,",
  'desestrutura startInspection',
);
app = replaceExact(
  app,
  "  const [globalSearchQuery, setGlobalSearchQuery] = useState('');",
  "  const [globalSearchQuery, setGlobalSearchQuery] = useState('');\n  const [isFinishingInspection, setIsFinishingInspection] = useState(false);",
  'estado de conclusão',
);
app = replaceExact(
  app,
  "    } catch {\n      return;\n    } finally {",
  "    } catch (error) {\n      Alert.alert('Perfil', error?.message || 'Não foi possível salvar o perfil neste dispositivo.');\n    } finally {",
  'erro de perfil',
);
app = replaceCount(
  app,
  'jurisdiction: current.inspector.jurisdiction',
  "jurisdiction: current.context.jurisdictionConfirmedByUser ? current.context.jurisdictionId : '', jurisdictionConfirmed: current.context.jurisdictionConfirmedByUser",
  2,
  'jurisdição confirmada na aplicabilidade',
);
app = replaceExact(
  app,
  "  const handleBeginAssistedInspection = () => {\n    if (!inspectorProfile.name.trim()) {\n      Alert.alert('Perfil obrigatório', 'Preencha os dados do inspetor antes de iniciar uma Inspeção Naval.');\n      setActiveTab('Início');\n      return;\n    }\n    setCurrentInspection(createInspectionDraft({ inspector: inspectorProfile, defaultVesselType: DEFAULT_VESSEL_TYPE }));\n  };",
  "  const handleBeginAssistedInspection = async () => {\n    if (!inspectorProfile.name.trim()) {\n      Alert.alert('Perfil obrigatório', 'Preencha os dados do inspetor antes de iniciar uma Inspeção Naval.');\n      setActiveTab('Início');\n      return;\n    }\n    const draft = createInspectionDraft({ inspector: inspectorProfile, defaultVesselType: DEFAULT_VESSEL_TYPE });\n    try {\n      await startInspection(null, draft);\n      setActiveTab('Inspeção');\n    } catch (error) {\n      Alert.alert('Nova inspeção', error?.message || 'Não foi possível criar e salvar o rascunho neste dispositivo.');\n    }\n  };",
  'persistência ao iniciar inspeção',
);
app = replaceExact(
  app,
  "  const finishAssistedInspection = () => {\n    const completedAt = new Date().toISOString();\n    const completed = appendAuditEvent(completeFindingReview(currentInspection, completedAt), 'INSPECTION_COMPLETED', {}, completedAt);\n    finalizeInspection(completed);\n  };",
  "  const finishAssistedInspection = async () => {\n    if (isFinishingInspection) return;\n    const completedAt = new Date().toISOString();\n    const completed = appendAuditEvent(completeFindingReview(currentInspection, completedAt), 'INSPECTION_COMPLETED', {}, completedAt);\n    setIsFinishingInspection(true);\n    try {\n      await finalizeInspection(completed);\n    } finally {\n      setIsFinishingInspection(false);\n    }\n  };",
  'bloqueio de conclusão duplicada',
);
app = replaceExact(
  app,
  "            lastSavedAt={lastSavedAt}\n            onRetrySave={() => retrySave().catch(() => {})}",
  "            lastSavedAt={lastSavedAt}\n            isFinishingInspection={isFinishingInspection}\n            onRetrySave={() => retrySave().catch((error) => Alert.alert('Salvar inspeção', error?.message || 'Não foi possível salvar a inspeção neste dispositivo.'))}",
  'retry visível e estado de conclusão',
);
app = replaceExact(
  app,
  "            onNewInspection={() => { setActiveTab('Inspeção'); handleBeginAssistedInspection(); }}",
  "            onNewInspection={handleBeginAssistedInspection}",
  'atalho de nova inspeção',
);
fs.writeFileSync(appPath, app);

const hookPath = 'src/features/inspections/usePersistedInspectionData.js';
let hook = fs.readFileSync(hookPath, 'utf8');
hook = replaceExact(
  hook,
  "  const startInspection = async (profile, inspection) => persistState(\n    (current) => ({\n      ...current,\n      vessels: upsertVesselProfile(current.vessels, profile),\n      currentInspection: inspection,\n    }),\n    'Não foi possível iniciar e salvar a inspeção neste dispositivo.',\n  );",
  "  const startInspection = async (profile, inspection) => {\n    const draft = inspection || profile;\n    const vesselProfile = inspection ? profile : null;\n    if (!draft) throw new Error('Rascunho de inspeção inválido.');\n    return persistState(\n      (current) => ({\n        ...current,\n        vessels: vesselProfile ? upsertVesselProfile(current.vessels, vesselProfile) : current.vessels,\n        currentInspection: draft,\n      }),\n      'Não foi possível iniciar e salvar a inspeção neste dispositivo.',\n    );\n  };",
  'startInspection sem cadastro vazio',
);
fs.writeFileSync(hookPath, hook);

const screenPath = 'src/features/inspections/AssistedInspectionScreen.js';
let screen = fs.readFileSync(screenPath, 'utf8');
screen = replaceExact(
  screen,
  'export const AssistedInspectionScreen = ({ currentInspection, vesselProfiles = [], isDarkMode, evidenceBusyItem, isPickingTiePhoto, isCapturingLocation, storageStatus, lastSavedAt, onRetrySave,',
  'export const AssistedInspectionScreen = ({ currentInspection, vesselProfiles = [], isDarkMode, evidenceBusyItem, isPickingTiePhoto, isCapturingLocation, storageStatus, lastSavedAt, isFinishingInspection = false, onRetrySave,',
  'prop de conclusão',
);
screen = replaceExact(
  screen,
  "<Button label={currentInspection.currentStep === 10 ? 'Concluir inspeção' : 'Continuar'} onPress={currentInspection.currentStep === 10 ? onFinish : onNext} darkMode={isDarkMode} style={{ flex: 1 }} />",
  "<Button label={currentInspection.currentStep === 10 ? 'Concluir inspeção' : 'Continuar'} loading={currentInspection.currentStep === 10 && isFinishingInspection} disabled={isFinishingInspection} onPress={currentInspection.currentStep === 10 ? onFinish : onNext} darkMode={isDarkMode} style={{ flex: 1 }} />",
  'botão de conclusão',
);
fs.writeFileSync(screenPath, screen);

console.log('Patch de segurança de campo aplicado com sucesso.');
