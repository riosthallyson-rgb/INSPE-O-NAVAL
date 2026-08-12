const REQUIRED_FIELDS = [
  [['name'], 'Nome da embarcação'],
  [['tie'], 'Número de inscrição (TIE)'],
  [['armador', 'owner'], 'Armador ou proprietário'],
  [['type'], 'Tipo da embarcação'],
  [['activity', 'vesselUse'], 'Atividade'],
  [['navigationArea'], 'Área de navegação'],
  [['validUntil'], 'Validade do TIE'],
];

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const toUtcDay = (year, month, day) => {
  const timestamp = Date.UTC(year, month - 1, day);
  const date = new Date(timestamp);
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
    ? timestamp
    : null;
};

export const parseTieDate = (value) => {
  const input = String(value || '').trim();
  const br = input.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (br) return toUtcDay(Number(br[3]), Number(br[2]), Number(br[1]));
  const iso = input.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return toUtcDay(Number(iso[1]), Number(iso[2]), Number(iso[3]));
  return null;
};

const referenceUtcDay = (referenceDate) =>
  Date.UTC(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate()
  );

export const validateTieDocument = (profile, referenceDate = new Date()) => {
  const safeProfile = profile && typeof profile === 'object' ? profile : {};
  const missingFields = REQUIRED_FIELDS
    .filter(([keys]) => !keys.some((key) => String(safeProfile[key] || '').trim()))
    .map(([, label]) => label);
  const hasValidity = Boolean(String(safeProfile.validUntil || '').trim());
  const expirationTimestamp = parseTieDate(safeProfile.validUntil);

  let expirationStatus = 'missing';
  let daysUntilExpiration = null;
  if (hasValidity && expirationTimestamp === null) {
    expirationStatus = 'invalid';
  } else if (expirationTimestamp !== null) {
    daysUntilExpiration = Math.round(
      (expirationTimestamp - referenceUtcDay(referenceDate)) / DAY_IN_MS
    );
    expirationStatus = daysUntilExpiration < 0
      ? 'expired'
      : daysUntilExpiration <= 30
        ? 'expiring'
        : 'valid';
  }

  return {
    complete: missingFields.length === 0 && expirationStatus !== 'invalid',
    missingFields,
    expirationStatus,
    daysUntilExpiration,
  };
};
