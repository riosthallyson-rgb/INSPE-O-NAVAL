import { emptyInspectorProfile, migrateInspectorProfile } from './inspector';
import { migrateInspectionHistory, migrateInspectionRecord } from './inspection';
import { migrateVesselProfiles } from './vesselProfile';
import { migrateOperationalInspection } from './inspection/inspectionModel';

export const CURRENT_STORAGE_SCHEMA = 5;

export const migratePersistedState = (storedState) => {
  if (!storedState || typeof storedState !== 'object') return null;

  const currentInspection = migrateInspectionRecord(storedState.currentInspection);
  const currentInspector = currentInspection
    ? migrateInspectorProfile(currentInspection.inspector)
    : null;

  return {
    schemaVersion: CURRENT_STORAGE_SCHEMA,
    profile: migrateInspectorProfile(storedState.profile),
    vessels: migrateVesselProfiles(storedState.vessels),
    compassHistory: Array.isArray(storedState.compassHistory) ? storedState.compassHistory : [],
    history: migrateInspectionHistory(storedState.history).map((record) => {
      const inspector = migrateInspectorProfile(record.inspector);
      return migrateOperationalInspection({ ...record, inspector }, inspector);
    }),
    currentInspection: currentInspection
      ? migrateOperationalInspection({ ...currentInspection, inspector: currentInspector }, currentInspector)
      : null,
  };
};

export const createEmptyPersistedState = () => ({
  schemaVersion: CURRENT_STORAGE_SCHEMA,
  profile: emptyInspectorProfile,
  vessels: [],
  compassHistory: [],
  history: [],
  currentInspection: null,
});
