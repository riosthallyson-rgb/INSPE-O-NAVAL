import { useEffect, useMemo, useRef, useState } from 'react';
import { CURRENT_STORAGE_SCHEMA, createEmptyPersistedState, migratePersistedState } from '../../domain/persistedState';
import { createHistoryBackup, getBackupHealth, mergeHistoryBackup } from '../../domain/historyBackup';
import { loadStoredData, loadStoredDataDetailed, saveStoredData, STORAGE_KEYS } from '../../infrastructure/storage';
import { exportHistoryBackupFile, pickHistoryBackupFile } from '../../infrastructure/historyBackupFile';
import { upsertVesselProfile } from '../../domain/vesselProfile';
import { addCompassHistoryEntry, removeCompassHistoryEntry } from '../../domain/compassHistory';

const resolveStateValue = (currentValue, nextValue) =>
  typeof nextValue === 'function' ? nextValue(currentValue) : nextValue;

export const usePersistedInspectionData = () => {
  const [inspectionData, setInspectionData] = useState(createEmptyPersistedState);
  const inspectionDataRef = useRef(inspectionData);
  const [storageHydrated, setStorageHydrated] = useState(false);
  const [storageError, setStorageError] = useState('');
  const [storageNotice, setStorageNotice] = useState('');
  const [storageStatus, setStorageStatus] = useState('loading');
  const [lastSavedAt, setLastSavedAt] = useState('');
  const skipNextAutomaticWrite = useRef(false);
  const saveSequence = useRef(0);

  const replaceInspectionData = (nextState, { skipAutomaticWrite = false } = {}) => {
    inspectionDataRef.current = nextState;
    if (skipAutomaticWrite) skipNextAutomaticWrite.current = true;
    setInspectionData(nextState);
  };

  useEffect(() => {
    inspectionDataRef.current = inspectionData;
  }, [inspectionData]);

  useEffect(() => {
    let active = true;

    const hydrate = async () => {
      const mainResult = await loadStoredDataDetailed(STORAGE_KEYS.APP_STATE, null);
      let migratedState = migratePersistedState(mainResult.data);
      let notice = '';

      if (migratedState && mainResult.status === 'backup') {
        notice = 'O arquivo principal não pôde ser usado; os dados foram recuperados da cópia local de segurança.';
      }

      if (!migratedState) {
        const [profile, history, currentInspection] = await Promise.all([
          loadStoredData(STORAGE_KEYS.PROFILE, {}),
          loadStoredData(STORAGE_KEYS.HISTORY, []),
          loadStoredData(STORAGE_KEYS.CURRENT_INSPECTION, null),
        ]);
        migratedState = migratePersistedState({ profile, history, currentInspection });
        if (migratedState && (profile?.name || history?.length || currentInspection)) notice = 'Dados de uma versão anterior foram migrados para o formato atual.';
      }

      if (!active) return;
      const resolvedState = migratedState || createEmptyPersistedState();
      inspectionDataRef.current = resolvedState;
      setInspectionData(resolvedState);
      setStorageHydrated(true);
      setStorageStatus(mainResult.error && mainResult.status === 'fallback' ? 'error' : 'saved');
      setStorageError(mainResult.error && mainResult.status === 'fallback' ? 'Não foi possível recuperar os dados salvos neste dispositivo.' : '');
      setStorageNotice(notice);
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

  const persistState = async (updater, errorMessage) => {
    const current = inspectionDataRef.current;
    const candidate = typeof updater === 'function' ? updater(current) : updater;
    const nextState = migratePersistedState(candidate) || candidate;
    setStorageStatus('saving');
    try {
      await saveStoredData(STORAGE_KEYS.APP_STATE, nextState);
      replaceInspectionData(nextState, { skipAutomaticWrite: true });
      setStorageError('');
      setStorageStatus('saved');
      setLastSavedAt(new Date().toISOString());
      return nextState;
    } catch (error) {
      setStorageError(errorMessage);
      setStorageStatus('error');
      throw error;
    }
  };

  const retrySave = async () => {
    setStorageStatus('saving');
    try {
      await saveStoredData(STORAGE_KEYS.APP_STATE, inspectionDataRef.current);
      setStorageError('');
      setStorageStatus('saved');
      setLastSavedAt(new Date().toISOString());
    } catch (error) {
      setStorageError('Não foi possível salvar os dados da inspeção neste dispositivo.');
      setStorageStatus('error');
      throw error;
    }
  };

  const saveInspectorProfile = async (profile) => persistState(
    (current) => ({ ...current, profile }),
    'Não foi possível salvar o perfil neste dispositivo.',
  );

  const setCurrentInspection = (nextInspection) => {
    setInspectionData((current) => {
      const nextState = {
        ...current,
        currentInspection: resolveStateValue(current.currentInspection, nextInspection),
      };
      inspectionDataRef.current = nextState;
      return nextState;
    });
  };

  const archiveInspection = async (completedInspection) => persistState(
    (current) => ({
      ...current,
      history: [completedInspection, ...current.history.filter((record) => record.id !== completedInspection.id)],
      currentInspection: null,
    }),
    'Não foi possível arquivar a inspeção concluída neste dispositivo.',
  );

  const saveVesselProfile = async (profile) => persistState(
    (current) => ({
      ...current,
      vessels: upsertVesselProfile(current.vessels, profile),
    }),
    'Não foi possível salvar o cadastro da embarcação neste dispositivo.',
  );

  const startInspection = async (profile, inspection) => persistState(
    (current) => ({
      ...current,
      vessels: upsertVesselProfile(current.vessels, profile),
      currentInspection: inspection,
    }),
    'Não foi possível iniciar e salvar a inspeção neste dispositivo.',
  );

  const exportHistoryBackup = async () => {
    const current = inspectionDataRef.current;
    const createdAt = new Date().toISOString();
    const payload = createHistoryBackup({
      history: current.history,
      vessels: current.vessels,
      schemaVersion: CURRENT_STORAGE_SCHEMA,
      createdAt,
    });
    const file = await exportHistoryBackupFile(payload, { now: new Date(createdAt) });
    await persistState(
      (state) => ({ ...state, backupMeta: { ...(state.backupMeta || {}), lastExportedAt: createdAt } }),
      'O arquivo foi gerado, mas não foi possível registrar a data do backup no dispositivo.',
    );
    return file;
  };

  const importHistoryBackup = async () => {
    const picked = await pickHistoryBackupFile();
    if (picked.canceled) return { canceled: true, importedHistoryCount: 0, importedVesselCount: 0 };
    if (!picked.payload) throw new Error(picked.errors?.[0] || 'O backup selecionado não pôde ser importado.');

    const current = inspectionDataRef.current;
    const merged = mergeHistoryBackup({ currentHistory: current.history, currentVessels: current.vessels, backup: picked.payload });
    if (!merged.ok) throw new Error(merged.errors?.[0] || 'O backup selecionado é inválido.');
    const importedAt = new Date().toISOString();
    await persistState(
      (state) => ({
        ...state,
        history: merged.history,
        vessels: merged.vessels,
        backupMeta: { ...(state.backupMeta || {}), lastImportedAt: importedAt },
      }),
      'Não foi possível salvar os dados importados neste dispositivo.',
    );
    return { canceled: false, importedHistoryCount: merged.importedHistoryCount, importedVesselCount: merged.importedVesselCount };
  };

  const addCompassHistory = (entry) => setInspectionData((current) => {
    const next = { ...current, compassHistory: addCompassHistoryEntry(current.compassHistory, entry) };
    inspectionDataRef.current = next;
    return next;
  });
  const removeCompassHistory = (id) => setInspectionData((current) => {
    const next = { ...current, compassHistory: removeCompassHistoryEntry(current.compassHistory, id) };
    inspectionDataRef.current = next;
    return next;
  });

  const backupHealth = useMemo(() => getBackupHealth({
    historyCount: inspectionData.history.length,
    lastBackupAt: inspectionData.backupMeta?.lastExportedAt,
  }), [inspectionData.history.length, inspectionData.backupMeta?.lastExportedAt]);

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
    backupMeta: inspectionData.backupMeta,
    backupHealth,
    exportHistoryBackup,
    importHistoryBackup,
    storageStatus,
    lastSavedAt,
    retrySave,
    storageError,
    storageNotice,
    clearStorageError: () => setStorageError(''),
    clearStorageNotice: () => setStorageNotice(''),
  };
};
