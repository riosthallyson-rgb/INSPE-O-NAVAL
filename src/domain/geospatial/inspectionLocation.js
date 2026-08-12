export const LOCATION_METHODS = Object.freeze(['GPS', 'MANUAL', 'MAP_SELECTION', 'DOCUMENT', 'OTHER']);

export const parseDecimalCoordinate = (value, kind) => {
  const normalized = String(value ?? '').trim().replace(',', '.');
  if (!/^-?\d+(?:\.\d+)?$/.test(normalized)) return null;
  const number = Number(normalized);
  const limit = kind === 'latitude' ? 90 : 180;
  return Number.isFinite(number) && number >= -limit && number <= limit ? number : null;
};

export const createInspectionLocation = ({ id, inspectionId, latitude, longitude, accuracy = null, altitude = null, heading = null, capturedAt = new Date().toISOString(), method, textualDescription = '', jurisdictionId = null, regionalRuleSetId = null, confirmedByUser = false }) => {
  const parsedLatitude = parseDecimalCoordinate(latitude, 'latitude');
  const parsedLongitude = parseDecimalCoordinate(longitude, 'longitude');
  if (parsedLatitude === null || parsedLongitude === null) throw new Error('Coordenadas inválidas. Use latitude entre -90 e 90 e longitude entre -180 e 180.');
  if (!LOCATION_METHODS.includes(method)) throw new Error('Método de localização inválido.');
  return { id, inspectionId, latitude: parsedLatitude, longitude: parsedLongitude, accuracy: Number.isFinite(Number(accuracy)) ? Number(accuracy) : null, altitude: Number.isFinite(Number(altitude)) ? Number(altitude) : null, heading: Number.isFinite(Number(heading)) ? Number(heading) : null, capturedAt, method, textualDescription, jurisdictionId, regionalRuleSetId, confirmedByUser };
};

export const confirmInspectionLocation = (location) => ({ ...location, confirmedByUser: true, confirmedAt: new Date().toISOString() });
export const isLowAccuracyLocation = (location, thresholdMeters = 100) => Number.isFinite(location?.accuracy) && location.accuracy > thresholdMeters;
