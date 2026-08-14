import { readFileSync, writeFileSync } from 'node:fs';

const path = 'src/App.js';
const source = readFileSync(path, 'utf8');
const before = `  const advanceAssistedInspection = () => {
    const validationError = validateInspectionStep(currentInspection);
    if (validationError) { Alert.alert('Etapa incompleta', validationError); return; }
    if (currentInspection.currentStep === 2) {
      const vessel = currentInspection.vessel;
      saveVesselProfile(prepareVesselProfile({
        ...vessel,
        armador: vessel.armador || vessel.owner,
        activity: vessel.vesselUse,
        motors: [vessel.engineCount, vessel.enginePower, vessel.propulsion].filter(Boolean).join(' · '),
      })).catch((error) => {
        Alert.alert('Cadastro da embarcação', error.message || 'Não foi possível salvar o perfil reutilizável da embarcação. A inspeção atual continua disponível.');
      });
    }
    setCurrentInspection((current) => {`;
const after = `  const advanceAssistedInspection = async () => {
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
    setCurrentInspection((current) => {`;

if (!source.includes(before)) throw new Error('Trecho esperado de advanceAssistedInspection não encontrado; correção não aplicada.');
writeFileSync(path, source.replace(before, after));
