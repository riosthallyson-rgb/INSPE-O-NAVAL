const text = (value) => (typeof value === 'string' ? value : '');

export const createEmptyVesselProfile = (defaultType = '') => ({
  id: '',
  name: '',
  tie: '',
  armador: '',
  type: defaultType,
  activity: '',
  navigationArea: '',
  validUntil: '',
  lengthMeters: '',
  grossTonnage: '',
  hullMaterial: '',
  motors: '',
  documentPhotoUri: '',
  updatedAt: '',
});

export const normalizeTie = (value) => text(value).toUpperCase().replace(/[^A-Z0-9]/g, '');

export const migrateVesselProfile = (storedProfile) => {
  if (!storedProfile || typeof storedProfile !== 'object') return null;
  const empty = createEmptyVesselProfile();
  return Object.keys(empty).reduce(
    (profile, key) => ({ ...profile, [key]: text(storedProfile[key]) }),
    {}
  );
};

export const migrateVesselProfiles = (storedProfiles) =>
  (Array.isArray(storedProfiles) ? storedProfiles : [])
    .map(migrateVesselProfile)
    .filter(Boolean);

export const prepareVesselProfile = (draft, now = new Date()) => {
  const migrated = migrateVesselProfile(draft) || createEmptyVesselProfile();
  const normalizedTie = normalizeTie(migrated.tie);
  return {
    ...migrated,
    id: migrated.id || (normalizedTie ? `tie-${normalizedTie}` : `embarcacao-${now.getTime()}`),
    tie: migrated.tie.trim(),
    name: migrated.name.trim(),
    armador: migrated.armador.trim(),
    updatedAt: now.toISOString(),
  };
};

export const upsertVesselProfile = (profiles, profile) => [
  profile,
  ...(Array.isArray(profiles) ? profiles : []).filter(
    (item) => item.id !== profile.id && (!normalizeTie(profile.tie) || normalizeTie(item.tie) !== normalizeTie(profile.tie))
  ),
];
