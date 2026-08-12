import { useEffect, useRef, useState } from 'react';
import { createEmptyPersistedState, migratePersistedState } from '../../domain/persistedState';
import { loadStoredData, saveStoredData, STORAGE_KEYS } from '../../infrastructure/storage';
import { upsertVesselProfile } from '../../domain/vesselProfile';
import { addCompassHistoryEntry, removeCompassHistoryEntry } from '../../domain/compassHistory';

const resolveStateValue = (currentValue, nextValue) =>
  typeof nextValue === 'function' ? nextValue(currentValue) : nextValue;

export const usePersistedInspectionData = () => {
  const [inspectionData, setInspectionData] = useState(createEmptyPersistedState);
  const [storageHydrated, setStorageHydrated] = useState(false);
  const [storageError, setStorageError] = useState('');
  const [storageStatus, setStorageStatus] = useState('loading');
  const [lastSavedAt, setLastSavedAt] = useState('');
  const skipNextAutomaticWrite = useRef(false);
  const saveSequence = useRef(0);

  useEffect(() => {
    let active = true;

    const hydrate = async () => {
      const storedState = await loadStoredData(STORAGE_KEYS.APP_STATE, null);
      let migratedState = migratePersistedState(storedState);

      if (!migratedState) {
        const [profile, history, currentInspection] = await Promise.all([
          loadStoredData(STORAGE_KEYS.PROFILE, {}),
          loadStoredData(STORAGE_KEYS.HISTORY, []),
          loadStoredData(STORAGE_KEYS.CURRENT_INSPECTION, null),
        ]);
        migratedState = migratePersistedState({ profile, history, currentInspection });
      }

      if (active) {
        setInspectionData(migratedState || createEmptyPersistedState());
        setStorageHydrated(true);
        setStorageStatus('saved');
      }
    };

    hydrate().catch(() => {
      if (active) {
        setStorageError('Não foi possível recuperar os dados salvos neste dispositivo.');
        setStorageStatus('error');
        setStorageHydrated(true);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!storageHydrated) return;
    if (skipNextAutomaticWrite.current) {
      skipNextAutomaticWrite.current = false;
      return;
    }

    const sequence = ++saveSequence.current;
    setStorageStatus('saving');
    saveStoredData(STORAGE_KEYS.APP_STATE, inspectionData)
      .then(() => {
        if (sequence !== saveSequence.current) return;
        setStorageError('');
        setStorageStatus('saved');
        setLastSavedAt(new Date().toISOString());
      })
      .catch(() => {
        if (sequence !== saveSequence.current) return;
        setStorageError('Não foi possível salvar os dados da inspeção neste dispositivo.');
        setStorageStatus('error');
      });
  }, [inspectionData, storageHydrated]);

  const retrySave = async () => {
    setStorageStatus('saving');
    try {
      await saveStoredData(STORAGE_KEYS.APP_STATE, inspectionData);
      setStorageError('');
      setStorageStatus('saved');
      setLastSavedAt(new Date().toISOString());
    } catch (error) {
      setStorageError('Não foi possível salvar os dados da inspeção neste dispositivo.');
      setStorageStatus('error');
      throw error;
    }
  };

  const saveInspectorProfile = async (profile) => {
    const nextState = { ...inspectionData, profile };
    try {
      await saveStoredData(STORAGE_KEYS.APP_STATE, nextState);
      skipNextAutomaticWrite.current = true;
      setInspectionData(nextState);
      setStorageError('');
    } catch (error) {
      setStorageError('Não foi possível salvar o perfil neste dispositivo.');
      throw error;
    }
  };

  const setCurrentInspection = (nextInspection) => {
    setInspectionData((current) => ({
      ...current,
      currentInspection: resolveStateValue(current.currentInspection, nextInspection),
    }));
  };

  const archiveInspection = (completedInspection) => {
    setInspectionData((current) => ({
      ...current,
      history: [completedInspection, ...current.history],
      currentInspection: null,
    }));
  };

  const saveVesselProfile = (profile) => {
    setInspectionData((current) => ({
      ...current,
      vessels: upsertVesselProfile(current.vessels, profile),
    }));
    return Promise.resolve();
  };

  const startInspection = async (profile, inspection) => {
    const nextState = {
      ...inspectionData,
      vessels: upsertVesselProfile(inspectionData.vessels, profile),
      currentInspection: inspection,
    };
    try {
      await saveStoredData(STORAGE_KEYS.APP_STATE, nextState);
      skipNextAutomaticWrite.current = true;
      setInspectionData(nextState);
      setStorageError('');
    } catch (error) {
      setStorageError('Não foi possível iniciar e salvar a inspeção neste dispositivo.');
      throw error;
    }
  };

  const addCompassHistory = (entry) => setInspectionData((current) => ({ ...current, compassHistory: addCompassHistoryEntry(current.compassHistory, entry) }));
  const removeCompassHistory = (id) => setInspectionData((current) => ({ ...current, compassHistory: removeCompassHistoryEntry(current.compassHistory, id) }));

  return {
    inspectorProfile: inspectionData.profile,
    history: inspectionData.history,
    currentInspection: inspectionData.currentInspection,
    vessels: inspectionData.vessels,
    saveInspectorProfile,
    setCurrentInspection,
    archiveInspection,
    saveVesselProfile,
    startInspection,
    compassHistory: inspectionData.compassHistory,
    addCompassHistory,
    removeCompassHistory,
    storageStatus,
    lastSavedAt,
    retrySave,
    storageError,
    clearStorageError: () => setStorageError(''),
  };
};
