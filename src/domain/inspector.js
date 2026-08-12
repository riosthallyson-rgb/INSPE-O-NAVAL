export const emptyInspectorProfile = {
  name: '',
  rank: '',
  nip: '',
  jurisdiction: '',
};

export const migrateInspectorProfile = (storedProfile) => {
  if (!storedProfile || typeof storedProfile !== 'object') {
    return emptyInspectorProfile;
  }

  return {
    name: typeof storedProfile.name === 'string' ? storedProfile.name : '',
    rank: typeof storedProfile.rank === 'string' ? storedProfile.rank : '',
    nip:
      typeof storedProfile.nip === 'string'
        ? storedProfile.nip
        : typeof storedProfile.badge === 'string'
          ? storedProfile.badge
          : '',
    jurisdiction:
      typeof storedProfile.jurisdiction === 'string' ? storedProfile.jurisdiction : '',
  };
};

export const formatNipForDisplay = (nip) => {
  const value = typeof nip === 'string' ? nip.trim() : '';
  if (!value) return 'Não informado';
  if (value.length <= 3) return value;
  return `${'•'.repeat(Math.min(value.length - 3, 5))}${value.slice(-3)}`;
};
